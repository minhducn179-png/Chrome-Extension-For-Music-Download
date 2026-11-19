// =====================================================
//  Background Service Worker — Bắt link Audio & Lyric
//  Lưu kèm nguồn (source) từ initiator domain
// =====================================================

let currentSongData = {
  title: "",
  audioUrl: null,
  lyricUrl: null,
  source: "",       // Tên nguồn: "Zing MP3", "Nhaccuatui", ...
  sourceUrl: "",    // URL trang đang phát
  pageTabId: null
};

// Khởi tạo lại từ storage khi service worker restart (MV3)
chrome.storage.local.get(["currentSongData"], (res) => {
  if (res.currentSongData) currentSongData = res.currentSongData;
});

// Nhận diện nguồn từ domain
function detectSource(url) {
  if (!url) return { name: "Không rõ", domain: "" };
  try {
    const hostname = new URL(url).hostname;
    if (hostname.includes("zingmp3") || hostname.includes("zmdcdn"))
      return { name: "Zing MP3", domain: hostname };
    if (hostname.includes("nhaccuatui") || hostname.includes("nct.vn"))
      return { name: "Nhaccuatui", domain: hostname };
    if (hostname.includes("chiasenhac"))
      return { name: "Chiasenhac", domain: hostname };
    if (hostname.includes("keeng"))
      return { name: "Keeng", domain: hostname };
    if (hostname.includes("spotify"))
      return { name: "Spotify", domain: hostname };
    if (hostname.includes("youtube") || hostname.includes("googlevideo"))
      return { name: "YouTube", domain: hostname };
    return { name: hostname, domain: hostname };
  } catch {
    return { name: "Không rõ", domain: "" };
  }
}

// Lắng nghe request network
chrome.webRequest.onBeforeRequest.addListener(
  (details) => {
    const url = details.url;

    // Bỏ qua resource không liên quan
    if (url.endsWith(".js") || url.endsWith(".css") || url.endsWith(".png") ||
        url.endsWith(".jpg") || url.endsWith(".svg") || url.endsWith(".woff2")) {
      return;
    }

    // === Bắt link Audio ===
    const isAudio = url.includes(".mp3") || url.includes(".m4a") ||
                    url.includes("/stream/") || url.includes("audio_file") ||
                    url.includes("/media/") || url.match(/\.(mp3|m4a|aac|flac)\?/i);

    if (isAudio && !url.includes("tracking") && !url.includes("analytics")) {
      currentSongData.audioUrl = url;
      currentSongData.pageTabId = details.tabId;

      // Xác định nguồn từ initiator (trang gốc gửi request)
      const src = detectSource(details.initiator || details.documentUrl || url);
      currentSongData.source = src.name;

      chrome.storage.local.set({ currentSongData });
      console.log(`[Collector] 🎧 Audio từ ${src.name}:`, url.substring(0, 120));
    }

    // === Bắt link Lyric ===
    const isLyric = url.includes("/lyric") || url.includes("get-lyric") ||
                    url.includes(".lrc") || url.includes("lyric.nct") ||
                    url.includes("/lyrics") || url.includes("get_lyric");

    if (isLyric) {
      currentSongData.lyricUrl = url;
      chrome.storage.local.set({ currentSongData });
      console.log("[Collector] 📝 Lyric:", url.substring(0, 120));
    }
  },
  { urls: ["<all_urls>"] }
);

// Lắng nghe message từ popup (fetch file rồi trả về)
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.action === "fetchBinary") {
    fetch(msg.url)
      .then(r => r.arrayBuffer())
      .then(buf => {
        // Chuyển ArrayBuffer thành mảng số để truyền qua message
        const arr = Array.from(new Uint8Array(buf));
        sendResponse({ ok: true, data: arr });
      })
      .catch(err => sendResponse({ ok: false, error: err.message }));
    return true; // async response
  }

  if (msg.action === "fetchText") {
    fetch(msg.url)
      .then(r => r.text())
      .then(text => sendResponse({ ok: true, data: text }))
      .catch(err => sendResponse({ ok: false, error: err.message }));
    return true;
  }
});
