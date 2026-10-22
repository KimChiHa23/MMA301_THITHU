import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import {
  subscribeUserBooks,
  addBook,
  toggleFavorite,
} from '../services/bookService';
import { validateBookForm } from '../utils/validation';
import { sortBooksAlphabetical } from '../utils/sorting';
import { Dropdown } from '../components/Dropdown';
import { BookItem } from '../components/BookItem';
import { BookSummary } from '../components/BookSummary';
import { BookFilters } from '../components/BookFilters';
import { seedSampleBooks } from '../services/sampleData';

export const ListScreen = ({ navigation }) => {
  const { user, logout } = useAuth();

  // Danh sách sách từ Firestore (real-time)
  const [books, setBooks] = useState([]);
  const [loadingBooks, setLoadingBooks] = useState(true);

  // Trạng thái Form thêm sách
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [genre, setGenre] = useState('Choose genre');
  const [status, setStatus] = useState('Choose status');
  const [rating, setRating] = useState('');
  const [notes, setNotes] = useState('');

  // Trạng thái thông báo Add Book
  const [formErrors, setFormErrors] = useState({});
  const [bookSuccess, setBookSuccess] = useState('');
  const [bookError, setBookError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAddFormExpanded, setIsAddFormExpanded] = useState(true);

  // Trạng thái bộ lọc và tìm kiếm
  const [searchQuery, setSearchQuery] = useState('');
  const [genreFilter, setGenreFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [favoritesOnly, setFavoritesOnly] = useState(false);

  // Đăng ký realtime listener cho danh sách sách của user
  useEffect(() => {
    if (!user) {
      setBooks([]);
      setLoadingBooks(false);
      return;
    }

    setLoadingBooks(true);
    const unsubscribe = subscribeUserBooks(
      user.uid,
      (userBooks) => {
        setBooks(userBooks);
        setLoadingBooks(false);
      },
      (error) => {
        console.error('Lỗi khi lắng nghe danh sách sách:', error);
        setLoadingBooks(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  // Xử lý đăng xuất
  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      navigation.reset({
        index: 0,
        routes: [{ name: 'Home' }],
      });
    }
  };

  // Reset form thêm sách
  const resetForm = () => {
    setTitle('');
    setAuthor('');
    setGenre('Choose genre');
    setStatus('Choose status');
    setRating('');
    setNotes('');
    setFormErrors({});
  };

  // Xử lý submit thêm sách mới
  const handleAddBook = async () => {
    setBookSuccess('');
    setBookError('');

    const validation = validateBookForm({
      title,
      author,
      genre,
      status,
      rating,
      notes,
    });

    if (!validation.isValid) {
      setFormErrors(validation.errors);
      setBookError(validation.firstError || 'Please correct the errors in the form');
      return;
    }

    setFormErrors({});
    setIsSubmitting(true);

    try {
      await addBook({
        userId: user.uid,
        title,
        author,
        genre,
        status,
        rating,
        notes,
      });

      // Thêm thành công
      resetForm();
      setBookSuccess('Book added');
      // Tự tắt thông báo thành công sau 4 giây
      setTimeout(() => {
        setBookSuccess('');
      }, 4000);
    } catch (error) {
      setBookError(error.message || 'Failed to add book');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Xử lý toggle favorite trực tiếp
  const handleToggleFavorite = async (bookId, currentFavorite) => {
    try {
      await toggleFavorite(bookId, currentFavorite);
    } catch (error) {
      console.error('Lỗi khi cập nhật yêu thích:', error);
    }
  };

  // Nạp 10 cuốn sách mẫu trực tiếp vào Firestore
  const [isSeeding, setIsSeeding] = useState(false);
  const handleSeedSampleBooks = async () => {
    if (!user) return;
    setIsSeeding(true);
    setBookError('');
    try {
      const added = await seedSampleBooks(user.uid);
      setBookSuccess(`Successfully loaded ${added} sample books!`);
      setTimeout(() => setBookSuccess(''), 4000);
    } catch (err) {
      setBookError(err.message || 'Failed to seed sample books');
    } finally {
      setIsSeeding(false);
    }
  };

  // Xóa toàn bộ bộ lọc
  const handleClearFilters = () => {
    setSearchQuery('');
    setGenreFilter('All');
    setStatusFilter('All');
    setFavoritesOnly(false);
  };

  // Lọc và sắp xếp danh sách sách đang hiển thị
  const displayedBooks = useMemo(() => {
    // 1. Áp dụng 4 tiêu chí bộ lọc
    const filtered = books.filter((b) => {
      if (genreFilter !== 'All' && b.genre !== genreFilter) return false;
      if (statusFilter !== 'All' && b.status !== statusFilter) return false;
      if (favoritesOnly && !b.favorite) return false;

      if (searchQuery.trim() !== '') {
        const queryNorm = searchQuery.trim().toLowerCase();
        const titleMatch = (b.title || '').toLowerCase().includes(queryNorm);
        const authorMatch = (b.author || '').toLowerCase().includes(queryNorm);
        if (!titleMatch && !authorMatch) return false;
      }

      return true;
    });

    // 2. Sắp xếp mặc định: Alphabet theo title (case-insensitive), trùng title xếp tiếp theo author
    return sortBooksAlphabetical(filtered);
  }, [books, searchQuery, genreFilter, statusFilter, favoritesOnly]);

  const genreOptions = [
    { label: 'Choose genre', value: 'Choose genre' },
    { label: 'Fiction', value: 'Fiction' },
    { label: 'Non-Fiction', value: 'Non-Fiction' },
    { label: 'Academic', value: 'Academic' },
    { label: 'Other', value: 'Other' },
  ];

  const statusOptions = [
    { label: 'Choose status', value: 'Choose status' },
    { label: 'To Read', value: 'To Read' },
    { label: 'Reading', value: 'Reading' },
    { label: 'Finished', value: 'Finished' },
  ];

  return (
    <SafeAreaView testID="list-screen" style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerUserInfo}>
          <View style={styles.userAvatar}>
            <Ionicons name="person" size={18} color="#4F46E5" />
          </View>
          <View>
            <Text style={styles.welcomeLabel}>My Bookshelf</Text>
            <Text style={styles.userEmail} numberOfLines={1}>
              {user?.email || 'User'}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          testID="btn-logout"
          style={styles.logoutBtn}
          onPress={handleLogout}
        >
          <Ionicons name="log-out-outline" size={18} color="#EF4444" />
          <Text style={styles.logoutBtnText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* [Khối Add Book] testID="book-form" */}
          <View testID="book-form" style={styles.addBookCard}>
            <TouchableOpacity
              style={styles.accordionHeader}
              onPress={() => setIsAddFormExpanded(!isAddFormExpanded)}
              activeOpacity={0.7}
            >
              <View style={styles.accordionTitleRow}>
                <View style={styles.addIconCircle}>
                  <Ionicons name="add" size={20} color="#4F46E5" />
                </View>
                <Text style={styles.addBookTitle}>Add New Book</Text>
              </View>
              <Ionicons
                name={isAddFormExpanded ? 'chevron-up' : 'chevron-down'}
                size={22}
                color="#64748B"
              />
            </TouchableOpacity>

            {isAddFormExpanded && (
              <View style={styles.formContent}>
                {/* Thành công testID="book-success" */}
                {bookSuccess ? (
                  <View style={styles.successBanner}>
                    <Ionicons name="checkmark-circle" size={20} color="#15803D" />
                    <Text testID="book-success" style={styles.successBannerText}>
                      {bookSuccess}
                    </Text>
                  </View>
                ) : null}

                {/* Thất bại testID="error-book" */}
                {bookError ? (
                  <View style={styles.errorBanner}>
                    <Ionicons name="alert-circle" size={20} color="#DC2626" />
                    <Text testID="error-book" style={styles.errorBannerText}>
                      {bookError}
                    </Text>
                  </View>
                ) : null}

                {/* Title Input */}
                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>
                    Title <Text style={styles.requiredAsterisk}>*</Text>
                  </Text>
                  <TextInput
                    testID="input-book-title"
                    style={[
                      styles.textInput,
                      formErrors.title ? styles.textInputError : null,
                    ]}
                    placeholder="Enter book title"
                    placeholderTextColor="#94A3B8"
                    value={title}
                    onChangeText={(t) => {
                      setTitle(t);
                      if (formErrors.title) {
                        setFormErrors((prev) => ({ ...prev, title: undefined }));
                      }
                      if (bookError) setBookError('');
                    }}
                  />
                  {formErrors.title ? (
                    <Text style={styles.fieldErrorText}>{formErrors.title}</Text>
                  ) : null}
                </View>

                {/* Author Input */}
                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>
                    Author <Text style={styles.requiredAsterisk}>*</Text>
                  </Text>
                  <TextInput
                    testID="input-book-author"
                    style={[
                      styles.textInput,
                      formErrors.author ? styles.textInputError : null,
                    ]}
                    placeholder="Enter author name"
                    placeholderTextColor="#94A3B8"
                    value={author}
                    onChangeText={(t) => {
                      setAuthor(t);
                      if (formErrors.author) {
                        setFormErrors((prev) => ({ ...prev, author: undefined }));
                      }
                      if (bookError) setBookError('');
                    }}
                  />
                  {formErrors.author ? (
                    <Text style={styles.fieldErrorText}>{formErrors.author}</Text>
                  ) : null}
                </View>

                {/* Genre & Status Dropdowns */}
                <View style={styles.rowTwoCols}>
                  <View style={styles.col}>
                    <Dropdown
                      testID="select-genre"
                      label="Genre *"
                      value={genre}
                      options={genreOptions}
                      placeholder="Choose genre"
                      onSelect={(g) => {
                        setGenre(g);
                        if (formErrors.genre) {
                          setFormErrors((prev) => ({ ...prev, genre: undefined }));
                        }
                        if (bookError) setBookError('');
                      }}
                      error={formErrors.genre}
                    />
                  </View>

                  <View style={styles.col}>
                    <Dropdown
                      testID="select-status"
                      label="Status *"
                      value={status}
                      options={statusOptions}
                      placeholder="Choose status"
                      onSelect={(s) => {
                        setStatus(s);
                        if (formErrors.status) {
                          setFormErrors((prev) => ({ ...prev, status: undefined }));
                        }
                        if (bookError) setBookError('');
                      }}
                      error={formErrors.status}
                    />
                  </View>
                </View>

                {/* Rating Input (Optional) */}
                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Rating (0 - 5, optional)</Text>
                  <TextInput
                    testID="input-book-rating"
                    style={[
                      styles.textInput,
                      formErrors.rating ? styles.textInputError : null,
                    ]}
                    placeholder="e.g. 5"
                    placeholderTextColor="#94A3B8"
                    value={rating}
                    onChangeText={(r) => {
                      setRating(r);
                      if (formErrors.rating) {
                        setFormErrors((prev) => ({ ...prev, rating: undefined }));
                      }
                      if (bookError) setBookError('');
                    }}
                    keyboardType="numeric"
                  />
                  {formErrors.rating ? (
                    <Text style={styles.fieldErrorText}>{formErrors.rating}</Text>
                  ) : null}
                </View>

                {/* Notes Input (Optional) */}
                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Notes (optional, max 300 chars)</Text>
                  <TextInput
                    testID="input-book-notes"
                    style={[
                      styles.textInput,
                      styles.textArea,
                      formErrors.notes ? styles.textInputError : null,
                    ]}
                    placeholder="Enter your personal reading thoughts..."
                    placeholderTextColor="#94A3B8"
                    value={notes}
                    onChangeText={(n) => {
                      setNotes(n);
                      if (formErrors.notes) {
                        setFormErrors((prev) => ({ ...prev, notes: undefined }));
                      }
                      if (bookError) setBookError('');
                    }}
                    multiline
                    numberOfLines={3}
                  />
                  {formErrors.notes ? (
                    <Text style={styles.fieldErrorText}>{formErrors.notes}</Text>
                  ) : null}
                </View>

                {/* Add Button */}
                <TouchableOpacity
                  testID="btn-add-book"
                  style={[styles.addButton, isSubmitting && styles.addButtonDisabled]}
                  onPress={handleAddBook}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <>
                      <Ionicons name="add-circle-outline" size={20} color="#FFFFFF" />
                      <Text style={styles.addButtonText}>Add Book</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* [Khối Filter, Search & Summary] */}
          <BookFilters
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            genreFilter={genreFilter}
            setGenreFilter={setGenreFilter}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            favoritesOnly={favoritesOnly}
            setFavoritesOnly={setFavoritesOnly}
            onClear={handleClearFilters}
          />

          <BookSummary displayedBooks={displayedBooks} />

          {/* [Khối Danh Sách] */}
          <View style={styles.listSection}>
            <View style={styles.listSectionHeader}>
              <Text style={styles.listSectionTitle}>Book Collection</Text>
              <Text style={styles.listSectionSubtitle}>
                Sorted alphabetically by title
              </Text>
            </View>

            {loadingBooks ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#4F46E5" />
                <Text style={styles.loadingText}>Loading your bookshelf...</Text>
              </View>
            ) : displayedBooks.length === 0 ? (
              /* testID="books-empty" với text "No books found" */
              <View testID="books-empty" style={styles.emptyContainer}>
                <Ionicons name="book-outline" size={48} color="#CBD5E1" />
                <Text style={styles.emptyText}>No books found</Text>
                <Text style={styles.emptySubText}>
                  Try clearing your filters or add a new book to your collection.
                </Text>

                <TouchableOpacity
                  testID="btn-seed-sample"
                  style={[styles.seedButton, isSeeding && styles.seedButtonDisabled]}
                  onPress={handleSeedSampleBooks}
                  disabled={isSeeding}
                >
                  {isSeeding ? (
                    <ActivityIndicator size="small" color="#4F46E5" />
                  ) : (
                    <>
                      <Ionicons name="sparkles" size={16} color="#4F46E5" />
                      <Text style={styles.seedButtonText}>Seed 10 Sample Books</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            ) : (
              displayedBooks.map((book) => (
                <BookItem
                  key={book.id}
                  book={book}
                  onToggleFavorite={handleToggleFavorite}
                  onPressDetail={(b) => navigation.navigate('Detail', { bookId: b.id })}
                />
              ))
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  headerUserInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
    marginRight: 12,
  },
  userAvatar: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  welcomeLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
    textTransform: 'uppercase',
  },
  userEmail: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#FEF2F2',
    gap: 6,
  },
  logoutBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#EF4444',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  addBookCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  accordionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  accordionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  addIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addBookTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  formContent: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  successBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    borderWidth: 1,
    borderColor: '#86EFAC',
    borderRadius: 12,
    padding: 12,
    marginBottom: 14,
    gap: 8,
  },
  successBannerText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#15803D',
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    borderRadius: 12,
    padding: 12,
    marginBottom: 14,
    gap: 8,
  },
  errorBannerText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    color: '#DC2626',
  },
  formGroup: {
    marginBottom: 14,
  },
  formLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 6,
  },
  requiredAsterisk: {
    color: '#EF4444',
  },
  textInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: '#0F172A',
  },
  textInputError: {
    borderColor: '#EF4444',
    backgroundColor: '#FEF2F2',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  fieldErrorText: {
    color: '#EF4444',
    fontSize: 12,
    marginTop: 4,
    fontWeight: '500',
  },
  rowTwoCols: {
    flexDirection: 'row',
    gap: 12,
  },
  col: {
    flex: 1,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4F46E5',
    borderRadius: 12,
    paddingVertical: 14,
    marginTop: 6,
    gap: 8,
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  addButtonDisabled: {
    opacity: 0.7,
  },
  addButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  listSection: {
    marginTop: 8,
  },
  listSectionHeader: {
    marginBottom: 12,
  },
  listSectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  listSectionSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 40,
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: '#64748B',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 36,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginTop: 8,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#475569',
    marginTop: 12,
    marginBottom: 6,
  },
  emptySubText: {
    fontSize: 13,
    color: '#94A3B8',
    textAlign: 'center',
    maxWidth: 260,
    lineHeight: 18,
  },
  seedButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEF2FF',
    borderWidth: 1.5,
    borderColor: '#C7D2FE',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 18,
    marginTop: 18,
    gap: 8,
  },
  seedButtonDisabled: {
    opacity: 0.6,
  },
  seedButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#4F46E5',
  },
});
