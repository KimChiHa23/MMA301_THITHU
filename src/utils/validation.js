/**
 * Validation utilities cho Authentication và Book CRUD
 * Đảm bảo 100% khớp với Exact Error Messages theo yêu cầu đề bài.
 */

// Regex kiểm tra định dạng email tiêu chuẩn
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Validate form đăng nhập
 * @param {string} email
 * @param {string} password
 * @returns {{ isValid: boolean, errors: { email?: string, password?: string } }}
 */
export const validateLoginForm = (email, password) => {
  const errors = {};

  if (!email || !email.trim()) {
    errors.email = 'Email is required';
  } else if (!EMAIL_REGEX.test(email.trim())) {
    errors.email = 'Please enter a valid email address';
  }

  if (!password) {
    errors.password = 'Password is required';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

/**
 * Validate form đăng ký
 * @param {string} email
 * @param {string} password
 * @param {string} confirmPassword
 * @returns {{ isValid: boolean, errors: { email?: string, password?: string, confirmPassword?: string } }}
 */
export const validateRegisterForm = (email, password, confirmPassword) => {
  const errors = {};

  if (!email || !email.trim()) {
    errors.email = 'Email is required';
  } else if (!EMAIL_REGEX.test(email.trim())) {
    errors.email = 'Please enter a valid email address';
  }

  if (!password) {
    errors.password = 'Password is required';
  } else if (password.length < 6) {
    errors.password = 'Password must be at least 6 characters';
  }

  if (!confirmPassword) {
    errors.confirmPassword = 'Confirm password is required';
  } else if (password && confirmPassword && password !== confirmPassword) {
    errors.confirmPassword = 'Passwords do not match';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

/**
 * Validate form Sách (dùng cho cả Add và Edit)
 * @param {{ title: string, author: string, genre: string, status: string, rating?: any, notes?: string }} form
 * @returns {{ isValid: boolean, errors: { title?: string, author?: string, genre?: string, status?: string, rating?: string, notes?: string }, firstError?: string }}
 */
export const validateBookForm = ({ title, author, genre, status, rating, notes }) => {
  const errors = {};

  // 1. Title validation
  const trimmedTitle = typeof title === 'string' ? title.trim() : '';
  if (!trimmedTitle) {
    errors.title = 'Title is required';
  } else if (title.length > 100) {
    errors.title = 'Title must be at most 100 characters';
  }

  // 2. Author validation
  const trimmedAuthor = typeof author === 'string' ? author.trim() : '';
  if (!trimmedAuthor) {
    errors.author = 'Author is required';
  } else if (author.length > 60) {
    errors.author = 'Author must be at most 60 characters';
  }

  // 3. Genre validation
  const validGenres = ['Fiction', 'Non-Fiction', 'Academic', 'Other'];
  if (!genre || genre === 'Choose genre' || !validGenres.includes(genre)) {
    errors.genre = 'Please choose a genre';
  }

  // 4. Status validation
  const validStatuses = ['To Read', 'Reading', 'Finished'];
  if (!status || status === 'Choose status' || !validStatuses.includes(status)) {
    errors.status = 'Please choose a status';
  }

  // 5. Rating validation (tùy chọn)
  if (rating !== undefined && rating !== null && String(rating).trim() !== '') {
    const rawRatingStr = String(rating).trim();
    const numRating = Number(rawRatingStr);
    const isWholeNumber =
      !isNaN(numRating) &&
      Number.isInteger(numRating) &&
      !rawRatingStr.includes('.') &&
      numRating >= 0 &&
      numRating <= 5;

    if (!isWholeNumber) {
      errors.rating = 'Rating must be a whole number from 0 to 5';
    }
  }

  // 6. Notes validation (tùy chọn)
  if (notes && typeof notes === 'string' && notes.length > 300) {
    errors.notes = 'Notes must be at most 300 characters';
  }

  // Lấy lỗi đầu tiên xuất hiện theo thứ tự trường nhập để hiển thị tập trung tại testID="error-book"
  const orderedFields = ['title', 'author', 'genre', 'status', 'rating', 'notes'];
  let firstError = '';
  for (const field of orderedFields) {
    if (errors[field]) {
      firstError = errors[field];
      break;
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    firstError,
  };
};

/**
 * Ánh xạ mã lỗi từ Firebase Auth sang thông báo hiển thị cho người dùng
 * @param {any} error
 * @returns {string}
 */
export const mapFirebaseAuthError = (error) => {
  if (!error) return 'An error occurred';
  const code = error.code || '';

  switch (code) {
    case 'auth/email-already-in-use':
      return 'Email is already in use. Please use a different email or log in.';
    case 'auth/invalid-email':
      return 'Please enter a valid email address';
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'Invalid email or password. Please try again.';
    case 'auth/weak-password':
      return 'Password must be at least 6 characters';
    case 'auth/too-many-requests':
      return 'Too many failed login attempts. Please try again later.';
    case 'auth/network-request-failed':
      return 'Network error. Please check your internet connection.';
    default:
      return error.message || 'Authentication error. Please try again.';
  }
};
