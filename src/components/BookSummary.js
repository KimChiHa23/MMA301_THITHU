import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getStatusBreakdown } from '../utils/sorting';

/**
 * Component hiển thị thông tin thống kê tóm tắt (Summary & Breakdown)
 * @param {{ displayedBooks: Array }} props
 */
export const BookSummary = ({ displayedBooks = [] }) => {
  const totalCount = displayedBooks.length;
  const favoriteCount = displayedBooks.filter((b) => b.favorite).length;
  const breakdown = getStatusBreakdown(displayedBooks);

  return (
    <View style={styles.container}>
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <View style={[styles.statIconContainer, { backgroundColor: '#EEF2FF' }]}>
            <Ionicons name="book" size={20} color="#4F46E5" />
          </View>
          <View>
            <Text style={styles.statLabel}>Total Books</Text>
            <Text testID="book-count" style={styles.statValue}>
              {totalCount}
            </Text>
          </View>
        </View>

        <View style={styles.statCard}>
          <View style={[styles.statIconContainer, { backgroundColor: '#FEF3C7' }]}>
            <Ionicons name="star" size={20} color="#D97706" />
          </View>
          <View>
            <Text style={styles.statLabel}>Favorites</Text>
            <Text testID="favorite-count" style={styles.statValue}>
              {favoriteCount}
            </Text>
          </View>
        </View>
      </View>

      {breakdown.length > 0 && (
        <View style={styles.breakdownSection}>
          <Text style={styles.breakdownHeader}>Status Breakdown</Text>
          <View style={styles.breakdownList}>
            {breakdown.map((item) => (
              <View
                key={item.status}
                testID={`breakdown-${item.status.replace(/\s+/g, '-').toLowerCase()}`}
                style={styles.breakdownItem}
              >
                <Text style={styles.breakdownStatusText}>{item.status}:</Text>
                <Text style={styles.breakdownCountText}>{item.count}</Text>
              </View>
            ))}
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
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
  statsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  statIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
    textTransform: 'uppercase',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
  },
  breakdownSection: {
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  breakdownHeader: {
    fontSize: 13,
    fontWeight: '700',
    color: '#475569',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  breakdownList: {
    flexDirection: 'column',
    gap: 6,
  },
  breakdownItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  breakdownStatusText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#334155',
  },
  breakdownCountText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#4F46E5',
  },
});
