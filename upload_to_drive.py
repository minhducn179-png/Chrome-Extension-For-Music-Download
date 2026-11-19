"""
Script Upload Dataset len Google Drive
Tu dong tim kiem file trong data/dataset_music va ho tro:
1. Copy thang vao Google Drive Desktop (neu co o dia G: hoac thu muc Google Drive)
2. Hoac nen thanh 1 file ZIP va mo Google Drive tren trinh duyet de keo tha
"""

import os
import sys
import shutil
import glob
import zipfile
import webbrowser

CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))

# 1. Tim thu muc dataset
possible_dirs = [
    os.path.join(CURRENT_DIR, "data", "dataset_music"),
    os.path.join(os.path.expanduser("~"), "Downloads", "dataset_music"),
    os.path.join(CURRENT_DIR, "dataset_music")
]

dataset_dir = None
for d in possible_dirs:
    if os.path.isdir(d):
        dataset_dir = d
        break

if not dataset_dir:
    print("❌ Không tìm thấy thư mục dataset_music!")
    print("   Vui lòng kiểm tra lại nơi bạn đã lưu các file nhạc.")
    input("\nBấm Enter để thoát...")
    sys.exit(1)

print(f"📁 Thư mục dataset: {dataset_dir}")
files = [f for f in glob.glob(os.path.join(dataset_dir, "*")) if not f.endswith("all.zip")]
print(f"   Tìm thấy {len(files)} mục (file/thư mục bài hát).\n")

# 2. Đóng gói toàn bộ thành dataset_music_all.zip
zip_path = os.path.join(CURRENT_DIR, "dataset_music_all.zip")
print("📦 Đang đóng gói dataset thành 'dataset_music_all.zip'...")
with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zf:
    for root, dirs, fnames in os.walk(dataset_dir):
        for fname in fnames:
            full_path = os.path.join(root, fname)
            rel_path = os.path.relpath(full_path, dataset_dir)
            zf.write(full_path, os.path.join("dataset_music", rel_path))

size_mb = os.path.getsize(zip_path) / (1024 * 1024)
print(f"✅ Đã tạo file: dataset_music_all.zip ({size_mb:.2f} MB)\n")

# 3. Kiểm tra Google Drive Desktop
gdrive_paths = [
    r"G:\My Drive\dataset_music",
    os.path.join(os.path.expanduser("~"), "Google Drive", "dataset_music")
]

copied = False
for g_path in gdrive_paths:
    parent = os.path.dirname(g_path)
    if os.path.exists(parent):
        print(f"🚀 Phát hiện Google Drive Desktop tại: {parent}")
        os.makedirs(g_path, exist_ok=True)
        # Copy file zip sang
        dest_zip = os.path.join(g_path, "dataset_music_all.zip")
        shutil.copy2(zip_path, dest_zip)
        print(f"✅ Đã sao chép vào: {dest_zip}")
        print("   Google Drive Desktop sẽ tự động đồng bộ lên cloud.")
        copied = True
        break

if not copied:
    print("🌐 Mở Google Drive trên trình duyệt...")
    webbrowser.open("https://drive.google.com/drive/my-drive")
    
    # Mở thư mục trên máy để kéo thả
    if sys.platform == "win32":
        os.system(f'explorer /select,"{zip_path}"')
    
    print("\n" + "="*55)
    print(" HƯỚNG DẪN:")
    print(" 1. Trình duyệt đã mở Google Drive.")
    print(" 2. File Explorer đã mở sẵn và chọn file 'dataset_music_all.zip'.")
    print(" 3. Bạn chỉ cần KÉO THẢ file này vào cửa sổ Google Drive!")
    print("="*55)

input("\nBấm Enter để hoàn tất...")
