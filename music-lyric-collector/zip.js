// =====================================================
//  ZIP Creator — Tạo file ZIP thuần JavaScript
//  Không cần thư viện bên ngoài
// =====================================================

// Bảng CRC-32 (chuẩn ISO 3309)
const CRC_TABLE = new Uint32Array(256);
for (let i = 0; i < 256; i++) {
  let c = i;
  for (let j = 0; j < 8; j++) {
    c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
  }
  CRC_TABLE[i] = c;
}

function crc32(data) {
  let crc = 0xFFFFFFFF;
  for (let i = 0; i < data.length; i++) {
    crc = CRC_TABLE[(crc ^ data[i]) & 0xFF] ^ (crc >>> 8);
  }
  return (crc ^ 0xFFFFFFFF) >>> 0;
}

class SimpleZip {
  constructor() {
    this.entries = [];
  }

  /**
   * Thêm file vào ZIP
   * @param {string} name - Đường dẫn file trong ZIP (vd: "baihat.mp3")
   * @param {Uint8Array|ArrayBuffer|string} data - Nội dung file
   */
  addFile(name, data) {
    if (typeof data === "string") {
      data = new TextEncoder().encode(data);
    }
    if (data instanceof ArrayBuffer) {
      data = new Uint8Array(data);
    }
    this.entries.push({
      name: name,
      data: data,
      crc: crc32(data)
    });
  }

  /**
   * Tạo file ZIP dạng Blob
   * @returns {Blob}
   */
  toBlob() {
    const parts = [];           // Mảng các chunk để ghép
    const centralRecords = [];  // Central directory entries
    let offset = 0;

    // --- Local file headers + data ---
    for (const entry of this.entries) {
      const nameBytes = new TextEncoder().encode(entry.name);
      const header = new ArrayBuffer(30);
      const hv = new DataView(header);

      hv.setUint32(0, 0x04034b50, true);          // Local file header signature
      hv.setUint16(4, 20, true);                   // Version needed (2.0)
      hv.setUint16(6, 0x0800, true);               // Flags: bit 11 = UTF-8 filenames
      hv.setUint16(8, 0, true);                    // Compression: Store (không nén)
      hv.setUint16(10, 0, true);                   // Mod time
      hv.setUint16(12, 0x0021, true);              // Mod date (mã hóa tối thiểu)
      hv.setUint32(14, entry.crc, true);           // CRC-32
      hv.setUint32(18, entry.data.length, true);   // Compressed size
      hv.setUint32(22, entry.data.length, true);   // Uncompressed size
      hv.setUint16(26, nameBytes.length, true);    // Filename length
      hv.setUint16(28, 0, true);                   // Extra field length

      const localHeader = new Uint8Array(30 + nameBytes.length);
      localHeader.set(new Uint8Array(header), 0);
      localHeader.set(nameBytes, 30);

      parts.push(localHeader);
      parts.push(entry.data);

      // Lưu info cho central directory
      centralRecords.push({
        nameBytes,
        crc: entry.crc,
        size: entry.data.length,
        localOffset: offset
      });

      offset += localHeader.length + entry.data.length;
    }

    // --- Central directory ---
    const centralStart = offset;
    let centralSize = 0;

    for (const rec of centralRecords) {
      const ch = new ArrayBuffer(46);
      const cv = new DataView(ch);

      cv.setUint32(0, 0x02014b50, true);        // Central dir signature
      cv.setUint16(4, 20, true);                 // Version made by
      cv.setUint16(6, 20, true);                 // Version needed
      cv.setUint16(8, 0x0800, true);             // Flags: UTF-8
      cv.setUint16(10, 0, true);                 // Compression
      cv.setUint16(12, 0, true);                 // Mod time
      cv.setUint16(14, 0x0021, true);            // Mod date
      cv.setUint32(16, rec.crc, true);           // CRC-32
      cv.setUint32(20, rec.size, true);          // Compressed size
      cv.setUint32(24, rec.size, true);          // Uncompressed size
      cv.setUint16(28, rec.nameBytes.length, true);
      cv.setUint16(30, 0, true);                 // Extra field length
      cv.setUint16(32, 0, true);                 // Comment length
      cv.setUint16(34, 0, true);                 // Disk number
      cv.setUint16(36, 0, true);                 // Internal attrs
      cv.setUint32(38, 0, true);                 // External attrs
      cv.setUint32(42, rec.localOffset, true);   // Offset of local header

      const centralEntry = new Uint8Array(46 + rec.nameBytes.length);
      centralEntry.set(new Uint8Array(ch), 0);
      centralEntry.set(rec.nameBytes, 46);

      parts.push(centralEntry);
      centralSize += centralEntry.length;
    }

    // --- End of central directory ---
    const eocd = new ArrayBuffer(22);
    const ev = new DataView(eocd);

    ev.setUint32(0, 0x06054b50, true);                   // EOCD signature
    ev.setUint16(4, 0, true);                             // Disk number
    ev.setUint16(6, 0, true);                             // Disk with central dir
    ev.setUint16(8, this.entries.length, true);            // Entries on this disk
    ev.setUint16(10, this.entries.length, true);           // Total entries
    ev.setUint32(12, centralSize, true);                  // Central dir size
    ev.setUint32(16, centralStart, true);                 // Central dir offset
    ev.setUint16(20, 0, true);                            // Comment length

    parts.push(new Uint8Array(eocd));

    return new Blob(parts, { type: "application/zip" });
  }
}
