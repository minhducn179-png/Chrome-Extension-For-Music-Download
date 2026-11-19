// =====================================================
//  Popup Logic v2.1 — Cho phép người dùng nhập & đổi tên trực tiếp
// =====================================================

document.addEventListener("DOMContentLoaded", () => {
  // === DOM refs ===
  const audioBadge   = document.getElementById("audio-badge");
  const lyricBadge   = document.getElementById("lyric-badge");
  const sourceBadge  = document.getElementById("source-badge");
  const inputTitle   = document.getElementById("input-title");
  const inputArtist  = document.getElementById("input-artist");
  const previewPath  = document.getElementById("preview-path");
  const btnScan      = document.getElementById("btn-scan");
  const btnDownload  = document.getElementById("btn-download");
  const btnClear     = document.getElementById("btn-clear");
  const progressWrap = document.getElementById("progress-wrap");
  const progressFill = document.getElementById("progress-fill");
  const progressText = document.getElementById("progress-text");
  const historySection = document.getElementById("history-section");
  const historyList  = document.getElementById("history-list");

  // Settings
  const settingFolder = document.getElementById("setting-folder");
  const settingSaveAs = document.getElementById("setting-saveas");
  const settingFormat = document.getElementById("setting-format");
  const btnSaveSettings = document.getElementById("btn-save-settings");

  // Tabs
  document.querySelectorAll(".tab-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
      document.querySelectorAll(".tab-panel").forEach(p => p.classList.remove("active"));
      btn.classList.add("active");
      document.getElementById(btn.dataset.tab).classList.add("active");
    });
  });

  let songData = {};
  let settings = {
    folder: "dataset_music",
    saveAs: false,
    format: "{title} - {artist}"
  };

  // ——— Load settings ———
  function loadSettings() {
    chrome.storage.local.get(["collectorSettings"], (res) => {
      if (res.collectorSettings) {
        settings = { ...settings, ...res.collectorSettings };
      }
      settingFolder.value = settings.folder || "dataset_music";
      settingSaveAs.checked = !!settings.saveAs;
      settingFormat.value = settings.format || "{title} - {artist}";
    });
  }
  loadSettings();

  // ——— Save settings ———
  btnSaveSettings.addEventListener("click", () => {
    settings.folder = settingFolder.value.trim() || "dataset_music";
    settings.saveAs = settingSaveAs.checked;
    settings.format = settingFormat.value.trim() || "{title} - {artist}";

    chrome.storage.local.set({ collectorSettings: settings }, () => {
      btnSaveSettings.textContent = "✅ Đã lưu!";
      setTimeout(() => { btnSaveSettings.textContent = "💾 Lưu cài đặt"; }, 1500);
      updateFilePreview();
    });
  });

  // ——— Sanitize filename ———
  function safeName(str) {
    return (str || "").replace(/[/\\?%*:|"<>]/g, "").replace(/\s+/g, " ").trim();
  }

  // ——— Lấy Tên bài hát & Tác giả hiện tại từ ô nhập ———
  function getCurrentTitle() {
    const fromInput = inputTitle ? inputTitle.value.trim() : "";
    return fromInput || songData.title || "";
  }

  function getCurrentArtist() {
    const fromInput = inputArtist ? inputArtist.value.trim() : "";
    return fromInput || songData.artist || "";
  }

  // ——— Build filename từ format template ———
  function buildFilename(ext) {
    const title  = safeName(getCurrentTitle());
    const artist = safeName(getCurrentArtist());
    const source = safeName(songData.source || "web");

    // Nếu để trống cả hai
    if (!title && !artist) {
      return "bai_hat_chua_dat_ten" + ext;
    }

    let defaultName = "";
    if (title && artist) {
      defaultName = `${title} - ${artist}`;
    } else if (title) {
      defaultName = title;
    } else {
      defaultName = artist;
    }

    let formatTpl = settings.format || "{title} - {artist}";
    let name = formatTpl
      .replace(/\{title\}/gi, title)
      .replace(/\{artist\}/gi, artist)
      .replace(/\{source\}/gi, source);

    // Dọn dẹp dấu gạch nối thừa nếu 1 trong 2 trường bị rỗng
    name = name.replace(/\s*-\s*-+\s*/g, " - ").replace(/^\s*-\s*|\s*-\s*$/g, "").trim();
    name = safeName(name);

    if (!name) name = defaultName;

    return name + ext;
  }

  // ——— Build full path (cho preview & tải) ———
  function buildFullPath(ext) {
    const folder = (settings.folder || "dataset_music").replace(/\\/g, "/").replace(/^\/+|\/+$/g, "");
    const filename = buildFilename(ext);
    return folder ? `${folder}/${filename}` : filename;
  }

  // ——— Update file preview ———
  function updateFilePreview() {
    const title = getCurrentTitle();
    const artist = getCurrentArtist();

    if (title || artist) {
      const filename = buildFilename(".zip");
      if (settings.saveAs) {
        previewPath.textContent = `${filename} (Sẽ hỏi thư mục)`;
      } else {
        const fullPath = buildFullPath(".zip");
        previewPath.textContent = `Downloads/${fullPath}`;
      }
    } else if (songData.audioUrl) {
      previewPath.textContent = "Nhập tên bài hát ở ô trên hoặc bấm Quét...";
    } else {
      previewPath.textContent = "Chưa có thông tin... Mở bài hát và bấm Quét.";
    }
  }

  // ——— Lắng nghe sự kiện người dùng tự gõ/sửa tên trực tiếp ———
  inputTitle.addEventListener("input", () => {
    songData.title = inputTitle.value;
    chrome.storage.local.set({ currentSongData: songData });
    updateFilePreview();
  });

  inputArtist.addEventListener("input", () => {
    songData.artist = inputArtist.value;
    chrome.storage.local.set({ currentSongData: songData });
    updateFilePreview();
  });

  // ——— UI Update ———
  function updateUI() {
    chrome.storage.local.get(["currentSongData", "downloadHistory", "collectorSettings"], (res) => {
      songData = res.currentSongData || {};
      if (res.collectorSettings) settings = { ...settings, ...res.collectorSettings };

      // Audio
      if (songData.audioUrl) {
        audioBadge.textContent = "✓ Sẵn sàng";
        audioBadge.className = "badge badge-ok";
      } else {
        audioBadge.textContent = "Chưa bắt";
        audioBadge.className = "badge badge-no";
      }

      // Lyric
      if (songData.lyricUrl) {
        lyricBadge.textContent = "✓ Sẵn sàng";
        lyricBadge.className = "badge badge-ok";
      } else {
        lyricBadge.textContent = "Chưa bắt";
        lyricBadge.className = "badge badge-no";
      }

      // Source
      if (songData.source) {
        sourceBadge.textContent = songData.source;
        sourceBadge.className = "badge badge-source";
      } else {
        sourceBadge.textContent = "—";
        sourceBadge.className = "badge badge-no";
      }

      // Chỉ cập nhật input nếu người dùng không đang trực tiếp gõ vào ô đó
      if (document.activeElement !== inputTitle) {
        inputTitle.value = songData.title || "";
      }
      if (document.activeElement !== inputArtist) {
        inputArtist.value = songData.artist || "";
      }

      // Nút tải mở khi đã có link audio
      btnDownload.disabled = !songData.audioUrl;

      // File preview
      updateFilePreview();

      // History
      const history = res.downloadHistory || [];
      if (history.length > 0) {
        historySection.style.display = "block";
        historyList.innerHTML = "";
        history.slice(-8).reverse().forEach(item => {
          const div = document.createElement("div");
          div.className = "history-item";
          div.innerHTML = `<span class="h-name">${item.filename || item.title}</span>
                           <span class="h-source">${item.source}</span>`;
          historyList.appendChild(div);
        });
      }
    });
  }

  updateUI();

  // ——— Progress helpers ———
  function showProgress(text, percent) {
    progressWrap.style.display = "block";
    progressText.textContent = text;
    progressFill.style.width = percent + "%";
  }
  function hideProgress() {
    progressWrap.style.display = "none";
    progressFill.style.width = "0%";
  }

  // ——— Quét DOM trang hiện tại ———
  btnScan.addEventListener("click", async () => {
    btnScan.textContent = "⏳ Đang quét...";
    btnScan.disabled = true;

    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

      songData.sourceUrl = tab.url || "";
      if (!songData.source) {
        try {
          const host = new URL(tab.url).hostname;
          if (host.includes("zingmp3")) songData.source = "Zing MP3";
          else if (host.includes("nhaccuatui") || host.includes("nct")) songData.source = "Nhaccuatui";
          else if (host.includes("chiasenhac")) songData.source = "Chiasenhac";
          else if (host.includes("youtube")) songData.source = "YouTube";
          else if (host.includes("spotify")) songData.source = "Spotify";
          else songData.source = host;
        } catch {}
      }

      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => {
          let title = "";
          let artist = "";

          // --- Zing MP3 ---
          const zmT = document.querySelector(".player_song-info .player_song-info-title")
                   || document.querySelector(".zm-player-song-info .song-title-item")
                   || document.querySelector("h1.title");
          if (zmT) title = zmT.textContent.trim();

          const zmA = document.querySelector(".player_song-info .player_song-info-artist")
                   || document.querySelector(".zm-player-song-info .artist");
          if (zmA) artist = zmA.textContent.trim();

          // --- Nhaccuatui ---
          if (!title) {
            const nT = document.querySelector(".name_title .title_song")
                    || document.querySelector(".detail_title h1")
                    || document.querySelector(".songname")
                    || document.querySelector("h1");
            if (nT) title = nT.textContent.trim();
          }
          if (!artist) {
            const nA = document.querySelector(".name_title .singer_title")
                    || document.querySelector(".detail_artist")
                    || document.querySelector(".singer a");
            if (nA) artist = nA.textContent.trim();
          }

          // --- Fallback document.title ---
          if (!title) {
            const parts = document.title.split(/[-–|]/);
            title = parts[0].trim();
            if (parts.length > 1 && !artist) artist = parts[1].trim();
          }

          return { title: title || "", artist: artist || "" };
        }
      }, (results) => {
        if (results && results[0]?.result) {
          const resTitle = results[0].result.title;
          const resArtist = results[0].result.artist;

          // Cập nhật cả songData và input hiển thị
          if (resTitle) {
            songData.title = resTitle;
            inputTitle.value = resTitle;
          }
          if (resArtist) {
            songData.artist = resArtist;
            inputArtist.value = resArtist;
          }

          chrome.storage.local.set({ currentSongData: songData });
        }
        btnScan.textContent = "🔍 Quét trang tự động";
        btnScan.disabled = false;
        updateUI();
      });
    } catch (err) {
      console.error("Scan error:", err);
      btnScan.textContent = "🔍 Quét trang tự động";
      btnScan.disabled = false;
    }
  });

  // ——— Fetch helpers (qua background tránh CORS) ———
  function fetchBinary(url) {
    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage({ action: "fetchBinary", url }, (res) => {
        if (res && res.ok) resolve(new Uint8Array(res.data));
        else reject(new Error(res?.error || "Fetch binary failed"));
      });
    });
  }

  function fetchTextVia(url) {
    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage({ action: "fetchText", url }, (res) => {
        if (res && res.ok) resolve(res.data);
        else reject(new Error(res?.error || "Fetch text failed"));
      });
    });
  }

  // ——— JSON Lyric → LRC ———
  function jsonToLrc(raw) {
    try {
      const data = JSON.parse(raw);
      if (data?.data?.sentences) {
        let lrc = "";
        data.data.sentences.forEach(s => {
          if (!s.words || !s.words.length) return;
          const ms = s.words[0].startTime;
          const m = Math.floor(ms / 60000);
          const sec = ((ms % 60000) / 1000).toFixed(2);
          const txt = s.words.map(w => w.data).join(" ");
          lrc += `[${String(m).padStart(2,"0")}:${sec.padStart(5,"0")}] ${txt}\n`;
        });
        return lrc;
      }
      if (data?.data?.content) return data.data.content;
      if (data?.lyrics) return data.lyrics;
      if (data?.lyric) return data.lyric;
      return JSON.stringify(data, null, 2);
    } catch {
      return raw;
    }
  }

  // ——— Tải trọn gói ZIP ———
  btnDownload.addEventListener("click", async () => {
    btnDownload.disabled = true;
    btnDownload.textContent = "⏳ Đang đóng gói...";

    // Lấy tên và tác giả thực tế từ ô nhập tại thời điểm bấm tải
    const currentTitle = getCurrentTitle();
    const currentArtist = getCurrentArtist();
    const baseName = buildFilename("");  // Ví dụ: "Tên Bài Hát - Tác Giả"
    const zip = new SimpleZip();

    try {
      // 1. Fetch Audio
      showProgress("Đang tải file nhạc...", 10);
      let audioData = null;
      let audioExt = "mp3";
      if (songData.audioUrl) {
        try {
          audioData = await fetchBinary(songData.audioUrl);
          showProgress("Đã tải nhạc ✓", 50);
          if (songData.audioUrl.includes(".m4a")) audioExt = "m4a";
          else if (songData.audioUrl.includes(".flac")) audioExt = "flac";
          else if (songData.audioUrl.includes(".aac")) audioExt = "aac";
        } catch (err) {
          console.warn("Audio fetch failed:", err);
        }
      }

      // 2. Fetch Lyric
      showProgress("Đang tải lời bài hát...", 60);
      let lrcContent = "";
      if (songData.lyricUrl) {
        try {
          const raw = await fetchTextVia(songData.lyricUrl);
          lrcContent = jsonToLrc(raw);
          showProgress("Đã tải lời ✓", 75);
        } catch (err) {
          console.warn("Lyric fetch failed:", err);
          lrcContent = `[Không tải được lyric từ: ${songData.lyricUrl}]`;
        }
      } else {
        lrcContent = "[Không tìm thấy link lyric cho bài này]";
      }

      // 3. Info metadata
      showProgress("Đang đóng gói ZIP...", 85);
      const info = {
        title: currentTitle || "Chưa rõ tên",
        artist: currentArtist || "Chưa rõ tác giả",
        source: songData.source || "",
        sourceUrl: songData.sourceUrl || "",
        audioUrl: songData.audioUrl || "",
        lyricUrl: songData.lyricUrl || "",
        audioFormat: audioExt,
        downloadDate: new Date().toISOString()
      };

      // 4. Add to ZIP — tên file bên trong đúng theo tên đã nhập
      if (audioData) {
        zip.addFile(`${baseName}.${audioExt}`, audioData);
      }
      zip.addFile(`${baseName}.lrc`, lrcContent);
      zip.addFile("info.json", JSON.stringify(info, null, 2));

      // 5. Download
      showProgress("Đang lưu file...", 95);
      const blob = zip.toBlob();
      const blobUrl = URL.createObjectURL(blob);

      const downloadOptions = {
        url: blobUrl,
        saveAs: settings.saveAs
      };

      if (!settings.saveAs) {
        downloadOptions.filename = buildFullPath(".zip");
      } else {
        downloadOptions.filename = buildFilename(".zip");
      }

      chrome.downloads.download(downloadOptions, (downloadId) => {
        if (chrome.runtime.lastError) {
          console.error("Download error:", chrome.runtime.lastError.message);
          showProgress("❌ Lỗi: " + chrome.runtime.lastError.message, 0);
        } else {
          const fname = buildFilename(".zip");
          showProgress(`✅ Đã lưu: ${fname}`, 100);

          // Nếu audio fetch qua blob thất bại thì tải link trực tiếp
          if (!audioData && songData.audioUrl) {
            const mp3Opts = {
              url: songData.audioUrl,
              saveAs: settings.saveAs
            };
            if (!settings.saveAs) {
              const folder = (settings.folder || "dataset_music").replace(/\\/g, "/").replace(/^\/+|\/+$/g, "");
              mp3Opts.filename = folder ? `${folder}/${baseName}.${audioExt}` : `${baseName}.${audioExt}`;
            }
            chrome.downloads.download(mp3Opts);
            progressText.textContent += " (MP3 tải riêng)";
          }

          // Lưu lịch sử tải
          chrome.storage.local.get(["downloadHistory"], (res) => {
            const history = res.downloadHistory || [];
            history.push({
              title: currentTitle || "Chưa rõ tên",
              artist: currentArtist || "",
              source: songData.source || "",
              filename: fname,
              date: new Date().toISOString()
            });
            if (history.length > 50) history.splice(0, history.length - 50);
            chrome.storage.local.set({ downloadHistory: history });
            updateUI();
          });
        }

        setTimeout(() => {
          hideProgress();
          btnDownload.textContent = "📦 Tải trọn gói (1 file ZIP)";
          btnDownload.disabled = false;
        }, 2500);
      });

    } catch (err) {
      console.error("ZIP error:", err);
      showProgress("❌ Lỗi: " + err.message, 0);
      btnDownload.textContent = "📦 Tải trọn gói (1 file ZIP)";
      btnDownload.disabled = false;
    }
  });

  // ——— Reset & Bắt bài mới ———
  btnClear.addEventListener("click", () => {
    chrome.storage.local.remove("currentSongData", () => {
      songData = {};
      inputTitle.value = "";
      inputArtist.value = "";
      audioBadge.textContent = "Chưa bắt";
      audioBadge.className = "badge badge-no";
      lyricBadge.textContent = "Chưa bắt";
      lyricBadge.className = "badge badge-no";
      sourceBadge.textContent = "—";
      sourceBadge.className = "badge badge-no";
      btnDownload.disabled = true;
      hideProgress();
      updateFilePreview();
    });
  });
});
