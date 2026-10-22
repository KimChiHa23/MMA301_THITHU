import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebase';
import { checkBookDuplicate } from './bookService';

/**
 * Danh sách sách mẫu chuẩn đề thi bao quát toàn bộ thể loại, trạng thái, đánh giá và trường hợp kiểm thử đặc biệt
 */
export const SAMPLE_BOOKS = [
  {
    title: 'Atomic Habits',
    author: 'Alan Watts',
    genre: 'Other',
    status: 'Reading',
    rating: 4,
    favorite: false,
    notes: 'Trùng title với cuốn của James Clear để kiểm thử sắp xếp ưu tiên author khi trùng title.',
  },
  {
    title: 'Atomic Habits',
    author: 'James Clear',
    genre: 'Non-Fiction',
    status: 'Finished',
    rating: 5,
    favorite: true,
    notes: 'Tiny changes, remarkable results. Xây dựng thói quen tốt và từ bỏ thói quen xấu.',
  },
  {
    title: 'Clean Code',
    author: 'Robert C. Martin',
    genre: 'Academic',
    status: 'Finished',
    rating: 5,
    favorite: true,
    notes: 'A Handbook of Agile Software Craftsmanship. Cẩm nang viết code sạch cho lập trình viên.',
  },
  {
    title: 'The Great Gatsby',
    author: 'F. Scott Fitzgerald',
    genre: 'Fiction',
    status: 'Reading',
    rating: 4,
    favorite: true,
    notes: 'Bức tranh sinh động về thời đại Jazz và giấc mơ Mỹ thế kỷ 20.',
  },
  {
    title: 'To Kill a Mockingbird',
    author: 'Harper Lee',
    genre: 'Fiction',
    status: 'Reading',
    rating: 5,
    favorite: true,
    notes: 'Tác phẩm đoạt giải Pulitzer về lòng nhân ái, công lý và sự thấu cảm.',
  },
  {
    title: 'Sapiens: A Brief History of Humankind',
    author: 'Yuval Noah Harari',
    genre: 'Non-Fiction',
    status: 'Reading',
    rating: 5,
    favorite: false,
    notes: 'Khám phá lịch sử tiến hóa và các cuộc cách mạng của loài người.',
  },
  {
    title: 'Introduction to Algorithms',
    author: 'Thomas H. Cormen',
    genre: 'Academic',
    status: 'To Read',
    rating: 0,
    favorite: false,
    notes: 'Giáo trình kinh điển CLRS về cấu trúc dữ liệu và giải thuật nâng cao.',
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
    notes: 'Tiểu thuyết kinh điển về thế giới phản địa đàng và sự giám sát toàn năng.',
  },
  {
    title: 'Design Patterns',
    author: 'Erich Gamma',
    genre: 'Academic',
    status: 'Finished',
    rating: 5,
    favorite: true,
    notes: '23 mẫu thiết kế hướng đối tượng kinh điển của Gang of Four.',
  },
];

/**
 * Nạp dữ liệu sách mẫu vào Firestore cho một user cụ thể
 * @param {string} userId
 * @returns {Promise<number>} Số lượng sách được thêm thành công
 */
export const seedSampleBooks = async (userId) => {
  if (!userId) {
    throw new Error('UserId is required to seed sample books');
  }

  let addedCount = 0;
  for (const book of SAMPLE_BOOKS) {
    // Kiểm tra nếu sách đã tồn tại thì bỏ qua tránh trùng lặp
    const isDup = await checkBookDuplicate(userId, book.title, book.author);
    if (!isDup) {
      await addDoc(collection(db, 'books'), {
        userId,
        title: book.title.trim(),
        author: book.author.trim(),
        genre: book.genre,
        status: book.status,
        rating: book.rating,
        favorite: Boolean(book.favorite),
        notes: book.notes || '',
        createdAt: serverTimestamp(),
      });
      addedCount++;
    }
  }

  return addedCount;
};
