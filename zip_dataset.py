"""
Script nén thư mục dataset_music thành file .zip
để upload nhanh lên Google Drive hoặc trực tiếp lên Colab.

Chạy trên máy tính (PowerShell hoặc double-click):
  python zip_dataset.py
"""
import os
import zipfile
import glob

# Thư mục mặc định chứa file MP3 + LRC (Downloads/dataset_music)
DOWNLOADS = os.path.join(os.path.expanduser("~"), "Downloads", "dataset_music")

# Nếu không tìm thấy, thử thư mục hiện tại
if not os.path.isdir(DOWNLOADS):
    DOWNLOADS = os.path.join(os.getcwd(), "dataset_music")

if not os.path.isdir(DOWNLOADS):
    print("❌ Không tìm thấy thư mục dataset_music!")
    print("   Hãy chắc chắn bạn đã tải file từ Chrome Extension.")
    print(f"   Đã tìm ở: {os.path.join(os.path.expanduser('~'), 'Downloads', 'dataset_music')}")
    exit(1)

mp3s = glob.glob(os.path.join(DOWNLOADS, "*.mp3"))
lrcs = glob.glob(os.path.join(DOWNLOADS, "*.lrc"))
zips = [f for f in glob.glob(os.path.join(DOWNLOADS, "*.zip")) if not f.endswith("dataset_music.zip")]

print(f"📁 Thư mục: {DOWNLOADS}")
print(f"   ZIP bài hát: {len(zips)} file")
print(f"   MP3 rời: {len(mp3s)} file")
print(f"   LRC rời: {len(lrcs)} file")

# Nén
zip_path = os.path.join(os.path.dirname(DOWNLOADS), "dataset_music_all.zip")
with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zf:
    for f in sorted(zips + mp3s + lrcs):
        arcname = os.path.join("dataset_music", os.path.basename(f))
        zf.write(f, arcname)
        print(f"   + {os.path.basename(f)}")

size_mb = os.path.getsize(zip_path) / (1024 * 1024)
print(f"\n✅ Đã tạo: {zip_path}")
print(f"   Kích thước: {size_mb:.1f} MB")
print(f"\n👉 Upload file này lên Google Drive hoặc dùng nút Upload trên Colab.")
