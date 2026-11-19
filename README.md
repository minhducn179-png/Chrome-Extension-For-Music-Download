# 🎵 Chrome Extension For Music & Lyric Collector

Tiện ích mở rộng Chrome (Manifest V3) tự động bắt luồng âm thanh (MP3, M4A) và phụ đề thời gian thực (LRC, TTML, JSON) từ các nền tảng âm nhạc lớn như **Zing MP3**, **Nhaccuatui (NCT)**...

## ✨ Tính năng nổi bật

- **Tự động bắt gói tin:** Lắng nghe ngầm link stream Audio (MP3/M4A) và API Lyric khi người dùng nghe nhạc trên web.
- **Tùy chỉnh tên bài hát & tác giả:**
  - Tự động quét từ DOM bài hát.
  - Cho phép người dùng nhập hoặc chỉnh sửa trực tiếp trên giao diện popup theo định dạng `{title} - {artist}`.
  - Xem trước tên file theo thời gian thực (Real-time Preview).
- **Đóng gói trọn gói (All-in-one ZIP):**
  - Mỗi bài hát tải về thành 1 file ZIP duy nhất chứa:
    - File nhạc (`.mp3` hoặc `.m4a`)
    - File lời bài hát timestamp chuẩn (`.lrc` dạng `[mm:ss.xx]`)
    - File metadata (`info.json` lưu tên bài, tác giả, nguồn, link gốc)
- **Tùy chọn vị trí lưu:**
  - Tải tự động vào thư mục chỉ định trong `Downloads/`.
  - Hoặc bật chế độ "Save As" để hỏi vị trí lưu trên máy tính mỗi lần tải.
- **Tích hợp sẵn công cụ:**
  - Script nén và tải lên Google Drive tự động (`upload_to_drive.bat` / `upload_to_drive.py`).
  - Notebook Google Colab GPU T4 đọc dataset và parse timestamps (`colab_load_dataset.py`).
  - Script đồng bộ mã nguồn với GitHub (`push_to_github.bat`).

---

## 🚀 Cài đặt vào Chrome / Edge / Cốc Cốc

1. Tải repository này về máy tính hoặc clone bằng lệnh:
   ```bash
   git clone https://github.com/minhducn179-png/Chrome-Extension-For-Music-Download.git
   ```
2. Mở trình duyệt và truy cập `chrome://extensions/`.
3. Bật **Developer mode** (Chế độ cho nhà phát triển) ở góc trên bên phải.
4. Bấm **Load unpacked** (Tải tiện ích đã giải nén) và chọn thư mục `music-lyric-collector`.
5. Ghim tiện ích lên thanh công cụ trình duyệt để sử dụng.

---

## 📁 Cấu trúc thư mục

```text
├── music-lyric-collector/        # Mã nguồn tiện ích mở rộng
│   ├── manifest.json             # Khai báo quyền Manifest V3
│   ├── background.js             # Service worker bắt link MP3 & Lyric
│   ├── zip.js                    # Thư viện tạo file ZIP thuần JS
│   ├── popup.html                # Giao diện điều khiển
│   └── popup.js                  # Logic quét DOM, đổi tên và đóng gói
├── colab_load_dataset.py         # Code chạy trên Google Colab GPU T4
├── upload_to_drive.bat           # 1-click đóng gói và tải lên Google Drive
├── upload_to_drive.py            # Bản Python hỗ trợ upload Google Drive
├── push_to_github.bat            # Script tự động đẩy code lên GitHub
├── HD_SU_DUNG.md                 # Hướng dẫn sử dụng chi tiết
└── README.md
```

---

## 📜 Giấy phép
Dự án được phát triển phục vụ mục đích học tập, nghiên cứu và xây dựng bộ dữ liệu âm thanh AI.
