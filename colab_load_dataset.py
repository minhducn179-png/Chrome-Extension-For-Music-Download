# =============================================================
#  Google Colab — Giải nén + Load dataset từ các file ZIP đơn lẻ
#  Mỗi file ZIP chứa: baihat.mp3 + baihat.lrc + info.json
# =============================================================

# CELL 1: Mount Google Drive
from google.colab import drive
drive.mount('/content/drive')

# CELL 2: Giải nén tất cả ZIP trong thư mục dataset_music
import os, glob, zipfile, json, re

DRIVE_DIR  = '/content/drive/MyDrive/dataset_music'   # Thư mục ZIP trên Drive
LOCAL_DIR  = '/content/dataset_music'                  # Thư mục đích trên Colab
os.makedirs(LOCAL_DIR, exist_ok=True)

zip_files = sorted(glob.glob(os.path.join(DRIVE_DIR, '*.zip')))
print(f"📦 Tìm thấy {len(zip_files)} file ZIP\n")

song_list = []

for zf_path in zip_files:
    try:
        with zipfile.ZipFile(zf_path, 'r') as zf:
            names = zf.namelist()
            # Tìm file audio, lrc, info
            audio_file = next((n for n in names if n.endswith(('.mp3','.m4a','.flac','.aac'))), None)
            lrc_file   = next((n for n in names if n.endswith('.lrc')), None)
            info_file  = next((n for n in names if n == 'info.json'), None)

            # Đọc metadata
            info = {}
            if info_file:
                info = json.loads(zf.read(info_file).decode('utf-8'))

            title  = info.get('title', os.path.splitext(os.path.basename(zf_path))[0])
            source = info.get('source', '?')
            artist = info.get('artist', '')
            base_filename = f"{title} - {artist}" if artist else title
            safe_base = re.sub(r'[/\\?%*:|"<>]', '', base_filename).strip()

            # Giải nén audio
            if audio_file:
                ext = os.path.splitext(audio_file)[1]
                dst_audio = os.path.join(LOCAL_DIR, f"{safe_base}{ext}")
                with open(dst_audio, 'wb') as out:
                    out.write(zf.read(audio_file))

            # Giải nén LRC
            if lrc_file:
                dst_lrc = os.path.join(LOCAL_DIR, f"{safe_base}.lrc")
                with open(dst_lrc, 'wb') as out:
                    out.write(zf.read(lrc_file))

            song_list.append({
                'title': title,
                'source': source,
                'artist': info.get('artist', ''),
                'audio_path': dst_audio if audio_file else None,
                'lrc_path': dst_lrc if lrc_file else None
            })
            print(f"  ✅ {title}  [{source}]")

    except Exception as e:
        print(f"  ❌ Lỗi giải nén {os.path.basename(zf_path)}: {e}")

print(f"\n{'='*50}")
print(f"✅ Tổng cộng: {len(song_list)} bài đã giải nén vào {LOCAL_DIR}")
print(f"   Có audio: {sum(1 for s in song_list if s['audio_path'])}")
print(f"   Có lyric: {sum(1 for s in song_list if s['lrc_path'])}")


# CELL 3: Hàm parse LRC và load dataset
def parse_lrc(lrc_path):
    """Đọc file .lrc → list of {time_sec, text}"""
    pattern = re.compile(r'\[(\d{2}):(\d{2}(?:\.\d+)?)\]\s*(.*)')
    lyrics = []
    with open(lrc_path, 'r', encoding='utf-8') as f:
        for line in f:
            m = pattern.match(line.strip())
            if m:
                text = m.group(3).strip()
                if text:
                    lyrics.append({
                        'time_sec': int(m.group(1)) * 60 + float(m.group(2)),
                        'text': text
                    })
    return lyrics

# Load tất cả thành dataset
dataset = []
for song in song_list:
    if song['audio_path'] and song['lrc_path']:
        entry = {
            'title':  song['title'],
            'source': song['source'],
            'artist': song['artist'],
            'audio_path': song['audio_path'],
            'lyrics': parse_lrc(song['lrc_path'])
        }
        dataset.append(entry)

print(f"\n🎯 Dataset sẵn sàng: {len(dataset)} bài có đủ audio + lyrics")
if dataset:
    demo = dataset[0]
    print(f"\n📌 Demo: {demo['title']} ({demo['source']})")
    for line in demo['lyrics'][:3]:
        m, s = int(line['time_sec']//60), line['time_sec']%60
        print(f"   [{m:02d}:{s:05.2f}] {line['text']}")
