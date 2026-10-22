import { initializeApp } from 'firebase/app';
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from 'firebase/auth';
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  query,
  where,
  serverTimestamp,
} from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBY7KThfjBXvKTE4EupBdEsAvwO2fwuYEs",
  authDomain: "mma301thithu.firebaseapp.com",
  projectId: "mma301thithu",
  storageBucket: "mma301thithu.firebasestorage.app",
  messagingSenderId: "660445993594",
  appId: "1:660445993594:web:f1b5442734592faac5b9c3",
  measurementId: "G-0ZEVQZEFC4"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Tài khoản mẫu dùng để đăng nhập và lưu trữ sách
const DEMO_USER = {
  email: 'student@bookshelf.com',
  password: 'password123',
};

// 10 cuốn sách mẫu chuẩn 100% đề thi (đủ 4 genres, đủ 3 statuses, ratings 0-5, favorites, notes <= 300 ký tự)
const SAMPLE_BOOKS = [
  {
    title: 'Clean Code',
    author: 'Robert C. Martin',
    genre: 'Academic',
    status: 'Finished',
    rating: 5,
    favorite: true,
    notes: 'A Handbook of Agile Software Craftsmanship. Cuốn sách nền tảng cho mọi lập trình viên.',
  },
  {
    title: 'Atomic Habits',
    author: 'James Clear',
    genre: 'Non-Fiction',
    status: 'Finished',
    rating: 5,
    favorite: true,
    notes: 'Thay đổi tí hon, hiệu quả bất ngờ. Hướng dẫn xây dựng thói quen tốt và loại bỏ thói quen xấu.',
  },
  {
    title: 'Design Patterns',
    author: 'Erich Gamma',
    genre: 'Academic',
    status: 'Finished',
    rating: 5,
    favorite: true,
    notes: '23 mẫu thiết kế phần mềm hướng đối tượng kinh điển của Gang of Four.',
  },
  {
    title: 'The Great Gatsby',
    author: 'F. Scott Fitzgerald',
    genre: 'Fiction',
    status: 'Reading',
    rating: 4,
    favorite: true,
    notes: 'Bức tranh sống động về Thời đại nhạc Jazz và giấc mơ Mỹ tan vỡ.',
  },
  {
    title: 'To Kill a Mockingbird',
    author: 'Harper Lee',
    genre: 'Fiction',
    status: 'Reading',
    rating: 5,
    favorite: true,
    notes: 'Tác phẩm đoạt giải Pulitzer về bài học nhân văn, công lý và sự thấu cảm sâu sắc.',
  },
  {
    title: 'Sapiens: A Brief History of Humankind',
    author: 'Yuval Noah Harari',
    genre: 'Non-Fiction',
    status: 'Reading',
    rating: 5,
    favorite: false,
    notes: 'Lược sử loài người từ thời kỳ đồ đá cho đến các cuộc cách mạng nhận thức và khoa học.',
  },
  {
    title: 'Atomic Habits',
    author: 'Alan Watts',
    genre: 'Other',
    status: 'Reading',
    rating: 4,
    favorite: false,
    notes: 'Cuốn sách cùng tên để kiểm thử sắp xếp ưu tiên theo author khi trùng tên sách (case-insensitive).',
  },
  {
    title: 'Introduction to Algorithms',
    author: 'Thomas H. Cormen',
    genre: 'Academic',
    status: 'To Read',
    rating: 0,
    favorite: false,
    notes: 'Giáo trình CLRS kinh điển và toàn diện nhất về thuật toán và cấu trúc dữ liệu.',
  },
  {
    title: 'Thinking, Fast and Slow',
    author: 'Daniel Kahneman',
    genre: 'Non-Fiction',
    status: 'To Read',
    rating: 3,
    favorite: false,
    notes: 'Khám phá hai hệ thống tư duy chi phối nhận thức và quyết định của con người.',
  },
  {
    title: '1984',
    author: 'George Orwell',
    genre: 'Fiction',
    status: 'To Read',
    rating: 4,
    favorite: true,
    notes: 'Tác phẩm phản địa đàng kinh điển về sự kiểm soát thông tin và tự do cá nhân.',
  },
];

async function seedData() {
  console.log('🚀 Bắt đầu quá trình nạp dữ liệu lên Firebase...');

  // 1. Đăng ký hoặc Đăng nhập tài khoản
  let user;
  try {
    console.log(`🔑 Đang thử đăng nhập với tài khoản: ${DEMO_USER.email}`);
    const credential = await signInWithEmailAndPassword(auth, DEMO_USER.email, DEMO_USER.password);
    user = credential.user;
    console.log(`✅ Đăng nhập thành công! User UID: ${user.uid}`);
  } catch (err) {
    if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
      console.log(`ℹ️ Tài khoản chưa tồn tại. Đang tiến hành tạo mới...`);
      const credential = await createUserWithEmailAndPassword(auth, DEMO_USER.email, DEMO_USER.password);
      user = credential.user;
      console.log(`✅ Tạo tài khoản thành công! User UID: ${user.uid}`);
    } else {
      throw err;
    }
  }

  // 2. Lấy danh sách sách hiện có của user trên Firestore để tránh trùng lặp
  const q = query(collection(db, 'books'), where('userId', '==', user.uid));
  const existingDocs = await getDocs(q);
  const existingKeys = new Set();

  existingDocs.forEach((docSnap) => {
    const data = docSnap.data();
    const key = `${(data.title || '').trim().toLowerCase()}:::${(data.author || '').trim().toLowerCase()}`;
    existingKeys.add(key);
  });

  console.log(`📚 Đang có ${existingDocs.size} cuốn sách trên Firestore của tài khoản này.`);

  // 3. Nạp danh sách sách mẫu
  let addedCount = 0;
  for (const book of SAMPLE_BOOKS) {
    const key = `${book.title.trim().toLowerCase()}:::${book.author.trim().toLowerCase()}`;
    if (existingKeys.has(key)) {
      console.log(`⏭️ Bỏ qua cuốn đã tồn tại: "${book.title}" - ${book.author}`);
      continue;
    }

    const docRef = await addDoc(collection(db, 'books'), {
      userId: user.uid,
      title: book.title.trim(),
      author: book.author.trim(),
      genre: book.genre,
      status: book.status,
      rating: book.rating,
      favorite: book.favorite,
      notes: book.notes,
      createdAt: serverTimestamp(),
    });

    console.log(`➕ Đã thêm: "${book.title}" (${book.status}, ${book.genre}) [ID: ${docRef.id}]`);
    existingKeys.add(key);
    addedCount++;
  }

  console.log('\n======================================================');
  console.log(`🎉 NẠP DỮ LIỆU THÀNH CÔNG! Đã thêm ${addedCount} cuốn sách mới.`);
  console.log(`📧 Tài khoản kiểm thử: ${DEMO_USER.email}`);
  console.log(`🔑 Mật khẩu: ${DEMO_USER.password}`);
  console.log('======================================================\n');
  process.exit(0);
}

seedData().catch((error) => {
  console.error('❌ Lỗi khi nạp dữ liệu Firebase:', error);
  process.exit(1);
});
