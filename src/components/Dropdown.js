import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  FlatList,
  StyleSheet,
  TouchableWithoutFeedback,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

/**
 * Dropdown Component linh hoạt cho Mobile và Web
 * @param {{
 *   label?: string,
 *   value: string,
 *   options: Array<{ label: string, value: string } | string>,
 *   placeholder?: string,
 *   onSelect: (value: string) => void,
 *   error?: string,
 *   testID?: string
 * }} props
 */
export const Dropdown = ({
  label,
  value,
  options = [],
  placeholder = 'Select an option',
  onSelect,
  error,
  testID,
}) => {
  const [modalVisible, setModalVisible] = useState(false);

  // Chuẩn hóa options thành dạng { label, value }
  const normalizedOptions = options.map((opt) => {
    if (typeof opt === 'string') {
      return { label: opt, value: opt };
    }
    return opt;
  });

  const selectedItem = normalizedOptions.find((opt) => opt.value === value);
  const displayText = selectedItem ? selectedItem.label : placeholder;
  const isPlaceholder = !selectedItem || value === '' || value === placeholder;

  const handleSelect = (itemValue) => {
    onSelect(itemValue);
    setModalVisible(false);
  };

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}

      <TouchableOpacity
        testID={testID}
        style={[
          styles.selector,
          error ? styles.selectorError : null,
        ]}
        onPress={() => setModalVisible(true)}
        activeOpacity={0.7}
      >
        <Text
          style={[
            styles.selectorText,
            isPlaceholder ? styles.placeholderText : styles.selectedText,
          ]}
          numberOfLines={1}
        >
          {displayText}
        </Text>
        <Ionicons name="chevron-down" size={20} color="#64748B" />
      </TouchableOpacity>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>{label || 'Select option'}</Text>
                  <TouchableOpacity
                    onPress={() => setModalVisible(false)}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <Ionicons name="close" size={22} color="#64748B" />
                  </TouchableOpacity>
                </View>

                <FlatList
                  data={normalizedOptions}
                  keyExtractor={(item) => item.value}
                  renderItem={({ item }) => {
                    const isSelected = item.value === value;
                    return (
                      <TouchableOpacity
                        testID={`${testID}-option-${item.value}`}
                        style={[
                          styles.optionItem,
                          isSelected && styles.optionItemSelected,
                        ]}
                        onPress={() => handleSelect(item.value)}
                      >
                        <Text
                          style={[
                            styles.optionText,
                            isSelected && styles.optionTextSelected,
                          ]}
                        >
                          {item.label}
                        </Text>
                        {isSelected && (
                          <Ionicons name="checkmark" size={18} color="#4F46E5" />
                        )}
                      </TouchableOpacity>
                    );
                  }}
                />
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 6,
  },
  selector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  selectorError: {
    borderColor: '#EF4444',
    backgroundColor: '#FEF2F2',
  },
  selectorText: {
    fontSize: 15,
    flex: 1,
  },
  placeholderText: {
    color: '#94A3B8',
  },
  selectedText: {
    color: '#0F172A',
    fontWeight: '500',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 12,
    marginTop: 4,
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    width: '100%',
    maxWidth: 400,
    maxHeight: '60%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 0.5,
    borderBottomColor: '#F8FAFC',
  },
  optionItemSelected: {
    backgroundColor: '#EEF2FF',
  },
  optionText: {
    fontSize: 15,
    color: '#334155',
  },
  optionTextSelected: {
    color: '#4F46E5',
    fontWeight: '600',
  },
});
