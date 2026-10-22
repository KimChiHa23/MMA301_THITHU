import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  getDocs,
  onSnapshot,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../config/firebase';

const COLLECTION_NAME = 'books';

/**
 * Kiểm tra trùng lặp cặp (title + author) cho cùng 1 userId (không phân biệt hoa/thường)
 * @param {string} userId
 * @param {string} title
 * @param {string} author
 * @param {string | null} excludeBookId - Bỏ qua ID sách này (dùng khi edit)
 * @returns {Promise<boolean>} - true nếu đã tồn tại, false nếu không trùng
 */
export const checkBookDuplicate = async (userId, title, author, excludeBookId = null) => {
  if (!userId || !title || !author) return false;

  const q = query(
    collection(db, COLLECTION_NAME),
    where('userId', '==', userId)
  );

  const snapshot = await getDocs(q);
  const normalizedTitle = title.trim().toLowerCase();
  const normalizedAuthor = author.trim().toLowerCase();

  for (const docSnap of snapshot.docs) {
    if (excludeBookId && docSnap.id === excludeBookId) {
      continue;
    }
    const data = docSnap.data();
    const existingTitle = (data.title || '').trim().toLowerCase();
    const existingAuthor = (data.author || '').trim().toLowerCase();

    if (existingTitle === normalizedTitle && existingAuthor === normalizedAuthor) {
      return true;
    }
  }

  return false;
};

/**
 * Đăng ký lắng nghe thời gian thực (real-time) danh sách sách của user
 * @param {string} userId
 * @param {(books: Array) => void} onUpdate
 * @param {(error: Error) => void} onError
 * @returns {import('firebase/firestore').Unsubscribe}
 */
export const subscribeUserBooks = (userId, onUpdate, onError) => {
  if (!userId) {
    onUpdate([]);
    return () => {};
  }

  const q = query(
    collection(db, COLLECTION_NAME),
    where('userId', '==', userId)
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const books = [];
      snapshot.forEach((docSnap) => {
        books.push({
          id: docSnap.id,
          ...docSnap.data(),
        });
      });
      onUpdate(books);
    },
    (error) => {
      if (onError) onError(error);
    }
  );
};

/**
 * Thêm một cuốn sách mới vào Firestore
 * @param {Object} bookData
 * @returns {Promise<string>} docId
 */
export const addBook = async (bookData) => {
  const { userId, title, author, genre, status, rating, notes } = bookData;

  // Kiểm tra trùng lặp trước khi thêm
  const isDuplicate = await checkBookDuplicate(userId, title, author);
  if (isDuplicate) {
    const error = new Error('A book with this title and author already exists');
    error.code = 'DUPLICATE_BOOK';
    throw error;
  }

  const newDocData = {
    userId,
    title: title.trim(),
    author: author.trim(),
    genre,
    status,
    favorite: false,
    createdAt: serverTimestamp(),
  };

  if (rating !== undefined && rating !== null && String(rating).trim() !== '') {
    newDocData.rating = parseInt(String(rating).trim(), 10);
  }

  if (notes !== undefined && notes !== null && String(notes).trim() !== '') {
    newDocData.notes = notes.trim();
  }

  const docRef = await addDoc(collection(db, COLLECTION_NAME), newDocData);
  return docRef.id;
};

/**
 * Cập nhật thông tin một cuốn sách
 * @param {string} bookId
 * @param {Object} bookData
 * @returns {Promise<void>}
 */
export const updateBook = async (bookId, bookData) => {
  const { userId, title, author, genre, status, rating, notes, favorite } = bookData;

  // Kiểm tra trùng lặp trước khi sửa (bỏ qua chính sách đang sửa)
  const isDuplicate = await checkBookDuplicate(userId, title, author, bookId);
  if (isDuplicate) {
    const error = new Error('A book with this title and author already exists');
    error.code = 'DUPLICATE_BOOK';
    throw error;
  }

  const updateData = {
    title: title.trim(),
    author: author.trim(),
    genre,
    status,
  };

  if (favorite !== undefined) {
    updateData.favorite = Boolean(favorite);
  }

  if (rating !== undefined && rating !== null && String(rating).trim() !== '') {
    updateData.rating = parseInt(String(rating).trim(), 10);
  } else {
    updateData.rating = null;
  }

  if (notes !== undefined && notes !== null && String(notes).trim() !== '') {
    updateData.notes = notes.trim();
  } else {
    updateData.notes = '';
  }

  const docRef = doc(db, COLLECTION_NAME, bookId);
  await updateDoc(docRef, updateData);
};

/**
 * Toggle trạng thái yêu thích của cuốn sách
 * @param {string} bookId
 * @param {boolean} currentFavorite
 * @returns {Promise<void>}
 */
export const toggleFavorite = async (bookId, currentFavorite) => {
  const docRef = doc(db, COLLECTION_NAME, bookId);
  await updateDoc(docRef, {
    favorite: !currentFavorite,
  });
};

/**
 * Xóa một cuốn sách khỏi Firestore
 * @param {string} bookId
 * @returns {Promise<void>}
 */
export const deleteBook = async (bookId) => {
  const docRef = doc(db, COLLECTION_NAME, bookId);
  await deleteDoc(docRef);
};
