/**
 * Tiện ích sắp xếp và tính toán Summary / Breakdown cho sách
 */

/**
 * Sắp xếp mặc định: Alphabet theo title (case-insensitive), trùng title xếp tiếp theo author.
 * @param {Array} books
 * @returns {Array} Mảng sách đã được sắp xếp
 */
export const sortBooksAlphabetical = (books) => {
  if (!Array.isArray(books)) return [];
  return [...books].sort((a, b) => {
    const titleA = (a.title || '').trim().toLowerCase();
    const titleB = (b.title || '').trim().toLowerCase();
    const titleComparison = titleA.localeCompare(titleB);
    if (titleComparison !== 0) {
      return titleComparison;
    }
    const authorA = (a.author || '').trim().toLowerCase();
    const authorB = (b.author || '').trim().toLowerCase();
    return authorA.localeCompare(authorB);
  });
};

/**
 * Tính toán breakdown theo trạng thái cho các sách đang hiển thị:
 * - Chỉ các trạng thái đang có sách hiển thị (> 0).
 * - Xếp theo trạng thái có nhiều sách nhất lên trước.
 * - Nếu số lượng bằng nhau: ưu tiên thứ tự: To Read -> Reading -> Finished.
 * @param {Array} displayedBooks
 * @returns {Array<{ status: string, count: number }>}
 */
export const getStatusBreakdown = (displayedBooks) => {
  if (!Array.isArray(displayedBooks)) return [];

  const counts = {
    'To Read': 0,
    'Reading': 0,
    'Finished': 0,
  };

  displayedBooks.forEach((book) => {
    if (book && book.status && Object.prototype.hasOwnProperty.call(counts, book.status)) {
      counts[book.status]++;
    }
  });

  const priorityOrder = {
    'To Read': 1,
    'Reading': 2,
    'Finished': 3,
  };

  const activeBreakdown = Object.keys(counts)
    .filter((status) => counts[status] > 0)
    .map((status) => ({
      status,
      count: counts[status],
    }));

  activeBreakdown.sort((a, b) => {
    if (b.count !== a.count) {
      return b.count - a.count; // Trạng thái có nhiều sách hơn lên trước
    }
    return (priorityOrder[a.status] || 99) - (priorityOrder[b.status] || 99);
  });

  return activeBreakdown;
};
