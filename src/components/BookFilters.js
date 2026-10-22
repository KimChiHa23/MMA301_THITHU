import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Switch,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Dropdown } from './Dropdown';

/**
 * Khối Filter, Search & Reset cho danh sách sách
 * @param {{
 *   searchQuery: string,
 *   setSearchQuery: (query: string) => void,
 *   genreFilter: string,
 *   setGenreFilter: (genre: string) => void,
 *   statusFilter: string,
 *   setStatusFilter: (status: string) => void,
 *   favoritesOnly: boolean,
 *   setFavoritesOnly: (favOnly: boolean) => void,
 *   onClear: () => void
 * }} props
 */
export const BookFilters = ({
  searchQuery,
  setSearchQuery,
  genreFilter,
  setGenreFilter,
  statusFilter,
  setStatusFilter,
  favoritesOnly,
  setFavoritesOnly,
  onClear,
}) => {
  const genreOptions = [
    { label: 'All Genres', value: 'All' },
    { label: 'Fiction', value: 'Fiction' },
    { label: 'Non-Fiction', value: 'Non-Fiction' },
    { label: 'Academic', value: 'Academic' },
    { label: 'Other', value: 'Other' },
  ];

  const statusOptions = [
    { label: 'All Statuses', value: 'All' },
    { label: 'To Read', value: 'To Read' },
    { label: 'Reading', value: 'Reading' },
    { label: 'Finished', value: 'Finished' },
  ];

  const hasActiveFilters =
    searchQuery.trim() !== '' ||
    genreFilter !== 'All' ||
    statusFilter !== 'All' ||
    favoritesOnly;

  return (
    <View style={styles.container}>
      {/* Search Box */}
      <View style={styles.searchBar}>
        <Ionicons name="search" size={20} color="#94A3B8" style={styles.searchIcon} />
        <TextInput
          testID="input-search"
          style={styles.searchInput}
          placeholder="Search by title or author..."
          placeholderTextColor="#94A3B8"
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoCapitalize="none"
          autoCorrect={false}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={18} color="#94A3B8" />
          </TouchableOpacity>
        )}
      </View>

      {/* Filter Row: Genre & Status Dropdowns */}
      <View style={styles.dropdownRow}>
        <View style={styles.dropdownCol}>
          <Dropdown
            testID="select-filter-genre"
            label="Genre"
            value={genreFilter}
            options={genreOptions}
            onSelect={setGenreFilter}
          />
        </View>

        <View style={styles.dropdownCol}>
          <Dropdown
            testID="select-filter-status"
            label="Status"
            value={statusFilter}
            options={statusOptions}
            onSelect={setStatusFilter}
          />
        </View>
      </View>

      {/* Bottom Row: Favorites Only Switch & Clear Button */}
      <View style={styles.bottomRow}>
        <View style={styles.switchContainer}>
          <Switch
            testID="switch-favorites-only"
            value={favoritesOnly}
            onValueChange={setFavoritesOnly}
            trackColor={{ false: '#CBD5E1', true: '#818CF8' }}
            thumbColor={favoritesOnly ? '#4F46E5' : '#F8FAFC'}
          />
          <Text style={styles.switchLabel}>Favorites only</Text>
        </View>

        <TouchableOpacity
          testID="btn-clear-filters"
          style={[styles.clearButton, !hasActiveFilters && styles.clearButtonDisabled]}
          onPress={onClear}
          disabled={!hasActiveFilters}
        >
          <Ionicons
            name="refresh"
            size={16}
            color={hasActiveFilters ? '#EF4444' : '#94A3B8'}
          />
          <Text
            style={[
              styles.clearButtonText,
              !hasActiveFilters && styles.clearButtonTextDisabled,
            ]}
          >
            Clear
          </Text>
        </TouchableOpacity>
      </View>
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
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    paddingHorizontal: 12,
    marginBottom: 14,
    height: 48,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#0F172A',
    height: '100%',
  },
  dropdownRow: {
    flexDirection: 'row',
    gap: 12,
  },
  dropdownCol: {
    flex: 1,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  switchLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#334155',
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#FEF2F2',
    gap: 4,
  },
  clearButtonDisabled: {
    backgroundColor: '#F1F5F9',
  },
  clearButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#EF4444',
  },
  clearButtonTextDisabled: {
    color: '#94A3B8',
  },
});
