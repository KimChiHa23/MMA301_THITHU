# BookShelf - React Native Expo & Firebase

Ứng dụng quản lý thư viện sách cá nhân **BookShelf** được xây dựng chuẩn theo đề thi thực hành MMA301.

---

## 🚀 Tính năng nổi bật

1. **Authentication (Xác thực người dùng)**:
   - Đăng ký tài khoản với validation chặt chẽ (email hợp lệ, mật khẩu tối thiểu 6 ký tự, kiểm tra trùng khớp mật khẩu).
   - Đăng nhập an toàn với Firebase Auth, phiên đăng nhập được duy trì liên tục (Auth persistence).
   - Bảo vệ route (Route Protection) với AuthContext, chống chớp nháy (zero UI flashing) khi khởi động.

2. **Quản lý sách (Firestore CRUD & Real-time Sync)**:
   - Thêm sách mới với validation toàn diện: Title, Author, Genre (dropdown), Status (dropdown), Rating (0-5), Reading notes.
   - Kiểm tra ràng buộc trùng lặp cặp `title + author` (case-insensitive) của cùng 1 user trước khi thêm/sửa.
   - Đổi trạng thái yêu thích (Favorite) tức thời bằng một chạm, đồng bộ trực tiếp lên Firestore.
   - Xem chi tiết và chỉnh sửa đầy đủ thông tin sách.
   - Xóa sách an toàn với hộp thoại xác nhận (Confirmation Dialog).

3. **Bộ lọc, Tìm kiếm & Thống kê thời gian thực**:
   - Tìm kiếm theo `title` hoặc `author` (tự động trim khoảng trắng và không phân biệt hoa thường).
   - Lọc kết hợp đa chiều: Thể loại (Genre), Trạng thái (Status), và Chỉ sách yêu thích (Favorites only).
   - Nút **Clear** tiện lợi để đặt lại toàn bộ điều kiện lọc.
   - Thống kê tổng số sách (`book-count`), tổng số sách yêu thích (`favorite-count`).
   - Phân tích trạng thái (Status Breakdown) sắp xếp ưu tiên theo số lượng giảm dần và thứ tự chuẩn: `To Read` -> `Reading` -> `Finished`.

---

## 🛠 Cấu trúc dự án

```
Thi_Thu_PE_MMA/
├── src/
│   ├── config/
│   │   └── firebase.js          # Khởi tạo Firebase App, Auth & Firestore
│   ├── context/
│   │   └── AuthContext.js       # Quản lý phiên đăng nhập và route protection
│   ├── services/
│   │   ├── authService.js       # Firebase Auth API
│   │   └── bookService.js       # Firestore CRUD, duplicate check & real-time sync
│   ├── utils/
│   │   ├── validation.js        # Exact error messages & form validation
│   │   └── sorting.js           # Sắp xếp alphabet & status breakdown
│   ├── components/
│   │   ├── Dropdown.js          # Dropdown tùy biến đa nền tảng
│   │   ├── FeatureCard.js       # Thẻ tính năng trang Home
│   │   ├── BookItem.js          # Thẻ hiển thị từng cuốn sách trong danh sách
│   │   ├── BookSummary.js       # Khối thống kê số lượng và breakdown
│   │   ├── BookFilters.js       # Bộ tìm kiếm, lọc thể loại, trạng thái & favorite
│   │   └── ConfirmModal.js      # Modal xác nhận xóa sách
│   ├── screens/
│   │   ├── HomeScreen.js        # Màn hình giới thiệu (Public)
│   │   ├── LoginScreen.js       # Màn hình đăng nhập
│   │   ├── RegisterScreen.js    # Màn hình đăng ký
│   │   ├── ListScreen.js        # Màn hình danh sách sách (Protected)
│   │   └── DetailScreen.js      # Màn hình chi tiết & chỉnh sửa sách (Protected)
│   └── navigation/
│       └── AppNavigator.js      # Điều hướng React Navigation & loading chống flash
├── App.js                       # Entry point bao bọc Context Providers
├── app.json                     # Cấu hình Expo app
├── firestore.rules              # Quy tắc bảo mật Firestore
├── .env                         # Biến môi trường kết nối Firebase
├── .env.example                 # Biến môi trường mẫu
└── package.json
```

---

## 📋 Hướng dẫn cài đặt & khởi chạy

### 1. Cài đặt thư viện
```bash
npm install
```

### 2. Cấu hình biến môi trường
File `.env` đã được cấu hình sẵn với thông tin Firebase của dự án. Nếu cần cấu hình trên môi trường mới, tạo file `.env` từ `.env.example`:
```env
EXPO_PUBLIC_FIREBASE_API_KEY=AIzaSyBY7KThfjBXvKTE4EupBdEsAvwO2fwuYEs
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=mma301thithu.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=mma301thithu
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=mma301thithu.firebasestorage.app
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=660445993594
EXPO_PUBLIC_FIREBASE_APP_ID=1:660445993594:web:f1b5442734592faac5b9c3
EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID=G-0ZEVQZEFC4
```

### 3. Khởi chạy ứng dụng

- Chạy trên Mobile / Expo Go:
  ```bash
  npx expo start
  ```

- Chạy trực tiếp trên Web:
  ```bash
  npm run web
  # hoặc
  npx expo start --web
  ```

- Chẩn đoán cấu hình Expo:
  ```bash
  npx expo-doctor
  ```

---

## 🔒 Quy tắc bảo mật Firestore (`firestore.rules`)
Tập tin [firestore.rules](file:///d:/Thi_Thu_PE_MMA/firestore.rules) được cấu hình tại thư mục gốc và đáp ứng đầy đủ yêu cầu:
- Chỉ cho phép người dùng đã đăng nhập thao tác với document của chính mình (`request.auth.uid == resource.data.userId`).
- Validation đầy đủ: `title` (1-100 ký tự), `author` (1-60 ký tự), `genre` (Fiction, Non-Fiction, Academic, Other), `status` (To Read, Reading, Finished), `rating` (0-5 nếu có), `notes` (tối đa 300 ký tự).
- Cấm hoàn toàn mọi truy cập trái phép khi chưa đăng nhập.

---

## 🏷️ Bảng đối chiếu TestID & Exact Texts

| TestID | Mục đích & Exact Text yêu cầu | Vị trí màn hình |
|---|---|---|
| `home-title` | Text chính xác 100%: `"BookShelf"` | [HomeScreen.js](file:///d:/Thi_Thu_PE_MMA/src/screens/HomeScreen.js) |
| `form-success` | Text chính xác 100%: `"Registration successful"` | [RegisterScreen.js](file:///d:/Thi_Thu_PE_MMA/src/screens/RegisterScreen.js) |
| `error-auth` | Hiển thị thông báo lỗi từ Firebase Authentication | [LoginScreen.js](file:///d:/Thi_Thu_PE_MMA/src/screens/LoginScreen.js) & [RegisterScreen.js](file:///d:/Thi_Thu_PE_MMA/src/screens/RegisterScreen.js) |
| `list-screen` | Định danh màn hình danh sách đã bảo vệ | [ListScreen.js](file:///d:/Thi_Thu_PE_MMA/src/screens/ListScreen.js) |
| `book-form` | Khối Form thêm sách | [ListScreen.js](file:///d:/Thi_Thu_PE_MMA/src/screens/ListScreen.js) |
| `book-success` | Text chính xác 100%: `"Book added"` | [ListScreen.js](file:///d:/Thi_Thu_PE_MMA/src/screens/ListScreen.js) |
| `error-book` | Hiển thị lỗi form hoặc trùng lặp `title + author` | [ListScreen.js](file:///d:/Thi_Thu_PE_MMA/src/screens/ListScreen.js) & [DetailScreen.js](file:///d:/Thi_Thu_PE_MMA/src/screens/DetailScreen.js) |
| `book-item` | Định danh từng thẻ sách trong danh sách | [BookItem.js](file:///d:/Thi_Thu_PE_MMA/src/components/BookItem.js) |
| `books-empty` | Text chính xác 100%: `"No books found"` | [ListScreen.js](file:///d:/Thi_Thu_PE_MMA/src/screens/ListScreen.js) |
| `book-count` | Số lượng sách đang hiển thị (plain integer) | [BookSummary.js](file:///d:/Thi_Thu_PE_MMA/src/components/BookSummary.js) |
| `favorite-count` | Số lượng sách yêu thích đang hiển thị (plain integer) | [BookSummary.js](file:///d:/Thi_Thu_PE_MMA/src/components/BookSummary.js) |
