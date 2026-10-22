import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';
import { auth } from '../config/firebase';

/**
 * Đăng ký tài khoản người dùng mới
 * @param {string} email
 * @param {string} password
 * @returns {Promise<import('firebase/auth').UserCredential>}
 */
export const registerUser = async (email, password) => {
  return await createUserWithEmailAndPassword(auth, email.trim(), password);
};

/**
 * Đăng nhập tài khoản người dùng
 * @param {string} email
 * @param {string} password
 * @returns {Promise<import('firebase/auth').UserCredential>}
 */
export const loginUser = async (email, password) => {
  return await signInWithEmailAndPassword(auth, email.trim(), password);
};

/**
 * Đăng xuất khỏi hệ thống
 * @returns {Promise<void>}
 */
export const logoutUser = async () => {
  return await signOut(auth);
};

/**
 * Đăng ký lắng nghe sự thay đổi trạng thái phiên đăng nhập
 * @param {(user: import('firebase/auth').User | null) => void} callback
 * @returns {import('firebase/auth').Unsubscribe}
 */
export const subscribeAuthState = (callback) => {
  return onAuthStateChanged(auth, callback);
};
