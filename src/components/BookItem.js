import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

/**
 * Component hiển thị thông tin từng cuốn sách trong danh sách
 * @param {{
 *   book: {
 *     id: string,
 *     title: string,
 *     author: string,
 *     genre: string,
 *     status: string,
 *     rating?: number,
 *     favorite?: boolean
 *   },
 *   onToggleFavorite: (bookId: string, currentFavorite: boolean) => void,
 *   onPressDetail: (book: any) => void
 * }} props
 */
export const BookItem = ({ book, onToggleFavorite, onPressDetail }) => {
  const isFavorite = Boolean(book.favorite);

  const getStatusBadgeStyle = (status) => {
    switch (status) {
      case 'Reading':
        return { backgroundColor: '#DBEAFE', color: '#1D4ED8' };
      case 'Finished':
        return { backgroundColor: '#DCFCE7', color: '#15803D' };
      case 'To Read':
      default:
        return { backgroundColor: '#FEF3C7', color: '#B45309' };
    }
  };

  const statusStyle = getStatusBadgeStyle(book.status);

  return (
    <View testID="book-item" style={styles.card}>
      <TouchableOpacity
        style={styles.mainContent}
        onPress={() => onPressDetail(book)}
        activeOpacity={0.7}
      >
        <View style={styles.headerRow}>
          <Text style={styles.title} numberOfLines={2}>
            {book.title}
          </Text>
        </View>

        <Text style={styles.author} numberOfLines={1}>
          by {book.author}
        </Text>

        <View style={styles.metaRow}>
          <View style={styles.genreBadge}>
            <Text style={styles.genreText}>{book.genre}</Text>
          </View>

          <View style={[styles.statusBadge, { backgroundColor: statusStyle.backgroundColor }]}>
            <Text style={[styles.statusText, { color: statusStyle.color }]}>
              {book.status}
            </Text>
          </View>

          {book.rating !== undefined && book.rating !== null && book.rating !== '' ? (
            <View style={styles.ratingBadge}>
              <Ionicons name="star" size={13} color="#F59E0B" />
              <Text style={styles.ratingText}>{book.rating}/5</Text>
            </View>
          ) : null}
        </View>
      </TouchableOpacity>

      <View style={styles.actionColumn}>
        <TouchableOpacity
          testID={`favorite-btn-${book.id}`}
          style={styles.favoriteButton}
          onPress={() => onToggleFavorite(book.id, isFavorite)}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Ionicons
            name={isFavorite ? 'star' : 'star-outline'}
            size={24}
            color={isFavorite ? '#F59E0B' : '#94A3B8'}
          />
        </TouchableOpacity>

        <TouchableOpacity
          testID={`detail-btn-${book.id}`}
          style={styles.detailButton}
          onPress={() => onPressDetail(book)}
        >
          <Ionicons name="chevron-forward" size={20} color="#4F46E5" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  mainContent: {
    flex: 1,
    paddingRight: 12,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    flex: 1,
  },
  author: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 10,
    fontStyle: 'italic',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  genreBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  genreText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFBEB',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#B45309',
  },
  actionColumn: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingLeft: 4,
    gap: 12,
  },
  favoriteButton: {
    padding: 6,
  },
  detailButton: {
    padding: 6,
  },
});
