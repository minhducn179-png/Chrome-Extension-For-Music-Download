# Hướng Dẫn Sử Dụng Extension: Music & Lyric Collector v2

Tiện ích mở rộng đã được nâng cấp với các tính năng:
1. **Tự động đặt tên theo cú pháp:** `Tên bài hát - Tên tác giả` (hoặc tùy chỉnh trong cài đặt).
2. **Lưu vào thư mục chỉ định** hoặc **Hỏi vị trí lưu mỗi lần tải (Save As)**.
3. **Mỗi bài đóng gói thành 1 file ZIP duy nhất** chứa file MP3/M4A, file lời .LRC kèm timestamp và metadata `info.json`.

---

## 1. Cài đặt vào Trình duyệt (Chrome / Cốc Cốc / Edge / Brave)

1. Mở trình duyệt và truy cập: `chrome://extensions/`
2. Bật công tắc **Chế độ dành cho nhà phát triển** (Developer Mode) ở góc trên bên phải.
3. Bấm **Tải tiện ích đã giải nén** (Load unpacked).
4. Chọn thư mục:
   ```
   C:\tìm data\music-lyric-collector
   ```
5. Ghim tiện ích lên thanh công cụ của trình duyệt để dễ sử dụng.

*(Nếu bạn đã cài bản cũ trước đó, chỉ cần bấm nút icon **Reload 🔄** tại ô tiện ích trong trang `chrome://extensions/`)*.

---

## 2. Thiết lập thư mục lưu và tên file

Bấm vào icon tiện ích trên thanh công cụ → Chọn tab **⚙️ Cài đặt**:

- **📂 Thư mục lưu file:**
  - Nhập tên thư mục con bạn muốn trong `Downloads`.
  - Mặc định: `dataset_music` → file sẽ lưu vào `Downloads/dataset_music/`.
  - Có thể đặt sâu hơn: ví dụ `Nhac/VietNam` → `Downloads/Nhac/VietNam/`.
- **💬 Hỏi vị trí lưu mỗi lần tải (Save As):**
  - **Bật:** Khi bấm tải, trình duyệt sẽ mở cửa sổ chọn thư mục bất kỳ trên máy tính của bạn (ổ C, ổ D, Desktop...).
  - **Tắt:** File tự động tải thẳng vào thư mục bạn đã chỉ định mà không hỏi lại.
- **📝 Định dạng tên file:**
  - Mặc định: `{title} - {artist}` (ví dụ: `Em Của Ngày Hôm Qua - Sơn Tùng M-TP.zip`).
  - Hỗ trợ các biến: `{title}` (Tên bài), `{artist}` (Nghệ sĩ/Tác giả), `{source}` (Nguồn Zing/NCT).
- Bấm **💾 Lưu cài đặt**.

---

## 3. Cách thu thập bài hát & Đổi tên tùy ý

1. Mở bài hát trên **Zing MP3** hoặc **NhacCuaTui (NCT)** và bấm **Play**.
2. Bấm vào icon tiện ích:
   - Thấy đèn **Audio** và **Lyric** chuyển màu xanh `✓ Sẵn sàng`.
   - Bấm nút **🔍 Quét trang tự động** để tiện ích tự điền tên bài hát và nghệ sĩ.
3. **Đổi tên hoặc nhập tên thủ công (nếu không rõ tên):**
   - Tại ô **🏷️ Tên bài hát**: bạn có thể click vào và gõ bất kỳ tên nào bạn muốn.
   - Tại ô **🎤 Tác giả / Ca sĩ**: bạn có thể nhập hoặc để trống.
   - Nhìn ngay dòng **📁 Tên file sẽ lưu** phía dưới để xem trước tên file thực tế sẽ tải về (tên tự động cập nhật ngay khi bạn gõ).
4. Bấm nút **📦 Tải trọn gói (1 file ZIP)**.
5. Muốn thu thập tiếp bài khác:
   - Bấm **🗑️ Xóa & Bắt bài mới** rồi lặp lại các bước trên.

---

## 4. Cấu trúc bên trong mỗi file ZIP tải về

Ví dụ tải bài hát sẽ được file `Em Của Ngày Hôm Qua - Sơn Tùng M-TP.zip` gồm:
```text
Em Của Ngày Hôm Qua - Sơn Tùng M-TP.zip
├── Em Của Ngày Hôm Qua - Sơn Tùng M-TP.mp3   (hoặc .m4a)
├── Em Của Ngày Hôm Qua - Sơn Tùng M-TP.lrc   (timestamp chuẩn [mm:ss.xx])
└── info.json                                 (Tên, ca sĩ, link nguồn, ngày tải)
```

---

## 5. Đưa lên Google Colab (GPU T4)

1. Tải các file `.zip` này lên Google Drive vào thư mục `dataset_music`.
2. Mở file [colab_load_dataset.py](file:///c:/tìm data/colab_load_dataset.py), copy các ô code vào Google Colab và bấm Run:
   - Tự động mount Google Drive.
   - Tự động giải nén tất cả file zip vào môi trường GPU local `/content/dataset_music/`.
   - Tự động parse timestamps và lời bài hát thành dictionary / tensor phục vụ huấn luyện mô hình.
