import React, { useState, useEffect } from 'react';
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
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../context/AuthContext';
import {
  updateBook,
  deleteBook,
  toggleFavorite,
} from '../services/bookService';
import { validateBookForm } from '../utils/validation';
import { Dropdown } from '../components/Dropdown';
import { ConfirmModal } from '../components/ConfirmModal';

export const DetailScreen = ({ route, navigation }) => {
  const { bookId } = route.params || {};
  const { user } = useAuth();

  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);

  // Chế độ View / Edit
  const [isEditing, setIsEditing] = useState(false);

  // Trạng thái form Edit
  const [editTitle, setEditTitle] = useState('');
  const [editAuthor, setEditAuthor] = useState('');
  const [editGenre, setEditGenre] = useState('');
  const [editStatus, setEditStatus] = useState('');
  const [editRating, setEditRating] = useState('');
  const [editNotes, setEditNotes] = useState('');

  const [formErrors, setFormErrors] = useState({});
  const [errorBook, setErrorBook] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Hộp thoại xác nhận xóa
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Lắng nghe dữ liệu sách realtime
  useEffect(() => {
    if (!bookId) {
      navigation.goBack();
      return;
    }

    const docRef = doc(db, 'books', bookId);
    const unsubscribe = onSnapshot(
      docRef,
      (docSnap) => {
        if (docSnap.exists()) {
          const data = { id: docSnap.id, ...docSnap.data() };
          setBook(data);
          // Nạp dữ liệu vào form edit nếu chưa đang edit
          if (!isEditing) {
            populateForm(data);
          }
          setLoading(false);
        } else {
          // Document đã bị xóa
          setLoading(false);
        }
      },
      (error) => {
        console.error('Lỗi khi tải chi tiết sách:', error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [bookId]);

  const populateForm = (data) => {
    setEditTitle(data.title || '');
    setEditAuthor(data.author || '');
    setEditGenre(data.genre || 'Choose genre');
    setEditStatus(data.status || 'Choose status');
    setEditRating(
      data.rating !== undefined && data.rating !== null ? String(data.rating) : ''
    );
    setEditNotes(data.notes || '');
    setFormErrors({});
    setErrorBook('');
  };

  const handleStartEdit = () => {
    if (book) {
      populateForm(book);
    }
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    if (book) {
      populateForm(book);
    }
    setIsEditing(false);
    setErrorBook('');
    setFormErrors({});
  };

  const handleSaveEdit = async () => {
    setErrorBook('');
    const validation = validateBookForm({
      title: editTitle,
      author: editAuthor,
      genre: editGenre,
      status: editStatus,
      rating: editRating,
      notes: editNotes,
    });

    if (!validation.isValid) {
      setFormErrors(validation.errors);
      setErrorBook(validation.firstError || 'Please correct the errors in the form');
      return;
    }

    setFormErrors({});
    setIsSaving(true);

    try {
      await updateBook(bookId, {
        userId: user.uid,
        title: editTitle,
        author: editAuthor,
        genre: editGenre,
        status: editStatus,
        rating: editRating,
        notes: editNotes,
        favorite: book?.favorite || false,
      });

      setIsEditing(false);
    } catch (error) {
      setErrorBook(error.message || 'Failed to update book');
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleFavorite = async () => {
    if (!book) return;
    try {
      await toggleFavorite(book.id, Boolean(book.favorite));
    } catch (error) {
      console.error('Lỗi khi đổi trạng thái favorite:', error);
    }
  };

  const handleConfirmDelete = async () => {
    setShowDeleteModal(false);
    setIsDeleting(true);
    try {
      await deleteBook(bookId);
      navigation.navigate('List');
    } catch (error) {
      console.error('Lỗi khi xóa sách:', error);
      setIsDeleting(false);
    }
  };

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

  if (loading) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#4F46E5" />
        <Text style={styles.loadingText}>Loading book details...</Text>
      </SafeAreaView>
    );
  }

  if (!book && !isDeleting) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <Ionicons name="alert-circle-outline" size={48} color="#94A3B8" />
        <Text style={styles.notFoundText}>Book not found</Text>
        <TouchableOpacity
          style={styles.backToListBtn}
          onPress={() => navigation.navigate('List')}
        >
          <Text style={styles.backToListText}>Back to BookShelf</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.navigate('List')}
          hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
        >
          <Ionicons name="arrow-back" size={24} color="#1E293B" />
        </TouchableOpacity>

        <Text style={styles.headerTitle} numberOfLines={1}>
          {isEditing ? 'Edit Book' : 'Book Details'}
        </Text>

        <View style={styles.headerRightSpacer} />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {isEditing ? (
            /* [EDIT MODE] */
            <View style={styles.card}>
              <Text style={styles.cardSectionTitle}>Edit Book Information</Text>

              {/* Lỗi testID="error-book" */}
              {errorBook ? (
                <View style={styles.errorBanner}>
                  <Ionicons name="alert-circle" size={20} color="#DC2626" />
                  <Text testID="error-book" style={styles.errorBannerText}>
                    {errorBook}
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
                  value={editTitle}
                  onChangeText={(t) => {
                    setEditTitle(t);
                    if (formErrors.title) {
                      setFormErrors((prev) => ({ ...prev, title: undefined }));
                    }
                    if (errorBook) setErrorBook('');
                  }}
                  placeholder="Enter book title"
                  placeholderTextColor="#94A3B8"
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
                  value={editAuthor}
                  onChangeText={(a) => {
                    setEditAuthor(a);
                    if (formErrors.author) {
                      setFormErrors((prev) => ({ ...prev, author: undefined }));
                    }
                    if (errorBook) setErrorBook('');
                  }}
                  placeholder="Enter author name"
                  placeholderTextColor="#94A3B8"
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
                    value={editGenre}
                    options={genreOptions}
                    placeholder="Choose genre"
                    onSelect={(g) => {
                      setEditGenre(g);
                      if (formErrors.genre) {
                        setFormErrors((prev) => ({ ...prev, genre: undefined }));
                      }
                      if (errorBook) setErrorBook('');
                    }}
                    error={formErrors.genre}
                  />
                </View>

                <View style={styles.col}>
                  <Dropdown
                    testID="select-status"
                    label="Status *"
                    value={editStatus}
                    options={statusOptions}
                    placeholder="Choose status"
                    onSelect={(s) => {
                      setEditStatus(s);
                      if (formErrors.status) {
                        setFormErrors((prev) => ({ ...prev, status: undefined }));
                      }
                      if (errorBook) setErrorBook('');
                    }}
                    error={formErrors.status}
                  />
                </View>
              </View>

              {/* Rating Input */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Rating (0 - 5, optional)</Text>
                <TextInput
                  testID="input-book-rating"
                  style={[
                    styles.textInput,
                    formErrors.rating ? styles.textInputError : null,
                  ]}
                  value={editRating}
                  onChangeText={(r) => {
                    setEditRating(r);
                    if (formErrors.rating) {
                      setFormErrors((prev) => ({ ...prev, rating: undefined }));
                    }
                    if (errorBook) setErrorBook('');
                  }}
                  placeholder="e.g. 4"
                  placeholderTextColor="#94A3B8"
                  keyboardType="numeric"
                />
                {formErrors.rating ? (
                  <Text style={styles.fieldErrorText}>{formErrors.rating}</Text>
                ) : null}
              </View>

              {/* Notes Input */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Notes (optional, max 300 chars)</Text>
                <TextInput
                  testID="input-book-notes"
                  style={[
                    styles.textInput,
                    styles.textArea,
                    formErrors.notes ? styles.textInputError : null,
                  ]}
                  value={editNotes}
                  onChangeText={(n) => {
                    setEditNotes(n);
                    if (formErrors.notes) {
                      setFormErrors((prev) => ({ ...prev, notes: undefined }));
                    }
                    if (errorBook) setErrorBook('');
                  }}
                  placeholder="Enter your personal reading notes..."
                  placeholderTextColor="#94A3B8"
                  multiline
                  numberOfLines={4}
                />
                {formErrors.notes ? (
                  <Text style={styles.fieldErrorText}>{formErrors.notes}</Text>
                ) : null}
              </View>

              {/* Action Buttons: Save & Cancel */}
              <View style={styles.editActionRow}>
                <TouchableOpacity
                  testID="btn-cancel-edit"
                  style={styles.cancelEditBtn}
                  onPress={handleCancelEdit}
                  disabled={isSaving}
                >
                  <Text style={styles.cancelEditBtnText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  testID="btn-save-book"
                  style={[styles.saveEditBtn, isSaving && styles.saveEditBtnDisabled]}
                  onPress={handleSaveEdit}
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <Text style={styles.saveEditBtnText}>Save Changes</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            /* [VIEW MODE] */
            <View style={styles.card}>
              <View style={styles.viewHeaderRow}>
                <View style={styles.viewHeaderTitles}>
                  <Text style={styles.viewTitle}>{book?.title}</Text>
                  <Text style={styles.viewAuthor}>by {book?.author}</Text>
                </View>

                {/* Favorite Toggle Button */}
                <TouchableOpacity
                  testID="btn-favorite-toggle"
                  style={styles.favoriteCircle}
                  onPress={handleToggleFavorite}
                  hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                >
                  <Ionicons
                    name={book?.favorite ? 'star' : 'star-outline'}
                    size={28}
                    color={book?.favorite ? '#F59E0B' : '#94A3B8'}
                  />
                </TouchableOpacity>
              </View>

              <View style={styles.divider} />

              {/* Metadata Details */}
              <View style={styles.detailList}>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Genre</Text>
                  <View style={styles.genreTag}>
                    <Text style={styles.genreTagText}>{book?.genre}</Text>
                  </View>
                </View>

                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Status</Text>
                  <View
                    style={[
                      styles.statusTag,
                      book?.status === 'Finished'
                        ? styles.statusFinished
                        : book?.status === 'Reading'
                        ? styles.statusReading
                        : styles.statusToRead,
                    ]}
                  >
                    <Text style={styles.statusTagText}>{book?.status}</Text>
                  </View>
                </View>

                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Rating</Text>
                  {book?.rating !== undefined &&
                  book?.rating !== null &&
                  book?.rating !== '' ? (
                    <View style={styles.ratingContainer}>
                      <Ionicons name="star" size={16} color="#F59E0B" />
                      <Text style={styles.ratingValueText}>{book?.rating} / 5</Text>
                    </View>
                  ) : (
                    <Text style={styles.unratedText}>Not rated yet</Text>
                  )}
                </View>

                <View style={styles.notesSection}>
                  <Text style={styles.detailLabel}>Reading Notes</Text>
                  <View style={styles.notesBox}>
                    <Text style={styles.notesText}>
                      {book?.notes ? book.notes : 'No notes provided for this book.'}
                    </Text>
                  </View>
                </View>

                {/* Bottom Action Buttons (Edit & Delete) */}
                <View style={styles.viewActionButtonsRow}>
                  <TouchableOpacity
                    testID="btn-edit-book"
                    style={styles.bottomEditBtn}
                    onPress={handleStartEdit}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="pencil" size={18} color="#FFFFFF" />
                    <Text style={styles.bottomEditBtnText}>Edit Book</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    testID="btn-delete-book"
                    style={styles.bottomDeleteBtn}
                    onPress={() => setShowDeleteModal(true)}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="trash-outline" size={18} color="#EF4444" />
                    <Text style={styles.bottomDeleteBtnText}>Delete Book</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Confirmation Dialog for Delete */}
      <ConfirmModal
        visible={showDeleteModal}
        title="Delete Book"
        message={`Are you sure you want to delete "${book?.title}"? This cannot be undone.`}
        onConfirm={handleConfirmDelete}
        onCancel={() => setShowDeleteModal(false)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#F8FAFC',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#64748B',
  },
  notFoundText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#334155',
    marginTop: 12,
  },
  backToListBtn: {
    marginTop: 16,
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#4F46E5',
    borderRadius: 10,
  },
  backToListText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  backButton: {
    padding: 6,
  },
  headerTitle: {
    flex: 1,
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
    textAlign: 'center',
    marginHorizontal: 10,
  },
  headerRightSpacer: {
    width: 36,
  },
  viewActionButtonsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  bottomEditBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4F46E5',
    borderRadius: 12,
    paddingVertical: 14,
    gap: 8,
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  bottomEditBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  bottomDeleteBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEF2F2',
    borderWidth: 1.5,
    borderColor: '#FECACA',
    borderRadius: 12,
    paddingVertical: 14,
    gap: 8,
  },
  bottomDeleteBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#EF4444',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  viewHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  viewHeaderTitles: {
    flex: 1,
    paddingRight: 16,
  },
  viewTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
    lineHeight: 28,
    marginBottom: 6,
  },
  viewAuthor: {
    fontSize: 16,
    color: '#64748B',
    fontStyle: 'italic',
  },
  favoriteCircle: {
    padding: 4,
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 18,
  },
  detailList: {
    gap: 14,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
  },
  genreTag: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 8,
  },
  genreTagText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
  },
  statusTag: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 8,
  },
  statusToRead: {
    backgroundColor: '#FEF3C7',
  },
  statusReading: {
    backgroundColor: '#DBEAFE',
  },
  statusFinished: {
    backgroundColor: '#DCFCE7',
  },
  statusTagText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E293B',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  ratingValueText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#B45309',
  },
  unratedText: {
    fontSize: 13,
    color: '#94A3B8',
    fontStyle: 'italic',
  },
  notesSection: {
    marginTop: 8,
  },
  notesBox: {
    marginTop: 8,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  notesText: {
    fontSize: 14,
    color: '#334155',
    lineHeight: 22,
  },
  cardSectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 16,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
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
    height: 90,
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
  editActionRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 10,
  },
  cancelEditBtn: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelEditBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#475569',
  },
  saveEditBtn: {
    flex: 1,
    backgroundColor: '#4F46E5',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  saveEditBtnDisabled: {
    opacity: 0.7,
  },
  saveEditBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
