# A UNIVERSE MADE FOR BỐNG 🌙
Website sinh nhật 3D: HTML + CSS + JavaScript thuần (ES Modules), Three.js 0.160, GSAP 3.12 (tải qua CDN, không cần build).

## Chạy thử
1. Cài VS Code + extension **Live Server**.
2. Mở thư mục `birthday-bong` trong VS Code → chuột phải `index.html` → **Open with Live Server**.
   (Không mở trực tiếp bằng cách double-click file: ES Modules cần chạy qua http.) Cần có Internet để tải Three.js, GSAP và font.

## Thay ảnh
Bỏ 8 ảnh (JPG/PNG/WebP) vào `assets/images/`, rồi sửa `src` và `caption` trong `js/config.js` → `gallery.items`. Ảnh thiếu sẽ hiện placeholder.
## Thay nhạc
Bỏ file `.mp3` vào `assets/music/` (dùng nhạc của bạn hoặc nhạc có giấy phép), sửa `music.tracks` trong `config.js`. Nhạc chỉ bắt đầu sau lần chạm/nhấn đầu tiên.
## Sửa lời chúc / ngày sinh / thời gian
Tất cả nằm trong `js/config.js` (`letter`, `password.birthday`, `timing`, số lần thử...).

## Đăng lên GitHub Pages
1. Tạo repo mới → upload toàn bộ nội dung thư mục `birthday-bong` (đặt `index.html` ở gốc repo).
2. Settings → Pages → Source: **Deploy from a branch** → `main` / `(root)` → Save.
3. Sau ~1 phút mở `https://<tên-github>.github.io/<tên-repo>/`.

## ⚠️ Giới hạn bảo mật (quan trọng)
Đây là website tĩnh: mật khẩu (ngày sinh) nằm trong `config.js` chạy trên trình duyệt, ai biết mở DevTools/xem source đều đọc được.
Vì vậy màn hình khóa chỉ là **"cánh cửa cho vui"**, KHÔNG phải xác thực an toàn. Mật khẩu không lưu trong localStorage/cookie, có giới hạn số lần thử, nhưng các giới hạn này cũng chỉ ở phía client.
Muốn bảo vệ thật: kiểm tra ngày sinh bằng serverless function (Cloudflare Workers/Netlify/Vercel), lưu giá trị đúng trong biến môi trường và không gửi xuống trình duyệt.
