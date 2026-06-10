(function () {
  'use strict';

  var LANG_KEY = 'subdesk_lang';

  var translations = {
    'zh-TW': {
      page: {
        title: '影片字幕校正工具',
        tagline: 'The Smoothest Way to Review Subtitles'
      },
      meta: {
        description: '影片字幕校正工具 — 支援 YouTube 與本機影片，輕鬆上傳 .srt / .vtt 字幕檔，即時編輯、同步校正，一鍵下載。'
      },
      og: { locale: 'zh_TW' },
      header: {
        reset: '清除',
        resetTitle: '清除所有資料並重置頁面',
        langToggle: 'EN',
        langTitle: 'Switch to English'
      },
      shortcuts: {
        playPause: '播放 / 暫停',
        skip5s: '跳 5 秒',
        prevNext: '上 / 下一句',
        speed: '降 / 升速率'
      },
      narrow: {
        label: '影片字幕校正工具',
        title: '建議在電腦上開啟',
        desc: '本工具專為寬螢幕桌面環境設計<br>在小螢幕裝置上操作會較為擁擠。',
        continue: '繼續使用'
      },
      video: {
        localVideo: '本機影片',
        urlPlaceholder: '請輸入YouTube影片網址 (如: https://www.youtube.com/watch?v=VIDEO_ID)',
        loadBtn: '載入影片',
        loadingBtn: '載入中...',
        reloadBtn: '重新載入',
        fileDropZone: '選擇或拖曳影片至此',
        notSupported: '您的瀏覽器不支援影片播放。'
      },
      controls: {
        play: '播放',
        pause: '暫停',
        backTitle: '後退5秒',
        forwardTitle: '前進5秒'
      },
      aria: {
        currentTime: '目前播放時間，可輸入時間跳轉',
        timeHour1: '小時十位',
        timeHour2: '小時個位',
        timeMin1: '分鐘十位',
        timeMin2: '分鐘個位',
        timeSec1: '秒數十位',
        timeSec2: '秒數個位'
      },
      subtitle: {
        title: '字幕列表',
        uploadBtn: '上傳字幕檔',
        formats: '支援 .srt, .vtt 格式',
        filterAll: '全部',
        filterModified: '已修改',
        emptyDefault: '請先載入影片<br>再點擊「上傳字幕檔」按鈕<br>或直接拖曳 .srt / .vtt 字幕檔至此',
        emptyLocalNotLoaded: '請先載入本機影片<br>再點擊「上傳字幕檔」按鈕<br>或直接拖曳 .srt / .vtt 字幕檔至此',
        emptyLocalLoaded: '本機影片不含自動字幕<br>請點擊「上傳字幕檔」按鈕<br>或直接拖曳 .srt / .vtt 字幕檔至此',
        emptyYouTube: '未偵測到字幕<br>請點擊「上傳字幕檔」按鈕<br>或直接拖曳 .srt / .vtt 字幕檔至此',
        seekTitle: function (time) { return '跳轉到 ' + time; }
      },
      output: {
        title: '校正後字幕輸出',
        copyBtn: '複製',
        downloadBtn: '下載整份',
        onlyModified: '僅顯示已修改字幕',
        showComparison: '顯示校正前後對比',
        placeholder: '載入影片後，這裡會自動產生整份校正後的字幕輸出'
      },
      drag: {
        overlay: '拖曳影片、音訊或字幕檔（.srt .vtt）至此'
      },
      msg: {
        invalidUrl: '請輸入有效的YouTube網址',
        loadVideoError: '載入影片時發生錯誤，請重試。',
        invalidFile: '請選擇有效的影片或音訊檔案',
        selectFile: '請選擇影片檔案',
        noSubtitlesPlayable: '無法獲取字幕，但影片仍可播放。',
        noYTSubtitles: '無法獲取YouTube字幕，將使用校正檔案的時間。',
        playerNotReady: '播放器未準備就緒，請稍候再試',
        seekFailed: '跳轉失敗，請重新載入影片',
        playerReady: '影片播放器已準備就緒',
        ytSubtitlesLoaded: function (n) { return 'YouTube字幕載入完成 (共 ' + n + ' 條)'; },
        subtitlesLoaded: function (n) { return '✅ 成功載入 ' + n + ' 條字幕'; },
        copied: '✓ 已複製',
        copyBtn: '複製',
        downloaded: function (ext) { return '⬇️ 已下載完整校正後字幕 .' + ext; },
        videoLoadSuccess: '影片載入成功！現在可以點擊字幕進行跳轉。',
        localVideoLoadSuccess: '本機影片載入成功！如果已上傳字幕檔案，字幕將自動顯示。',
        localVideoError: '載入本機影片時發生錯誤，請重試。',
        resetConfirm: '確定要重置頁面嗎？所有未下載的修改將會遺失。',
        restoredWithFile: function (n, f) { return '✅ 已還原 ' + n + ' 條字幕，請重新選取影片：' + f + '。'; },
        restored: function (n) { return '✅ 已還原上次編輯（' + n + ' 條字幕）'; },
        lastFile: function (f) { return '⚠️ 上次的影片：' + f + '，請重新選取。'; },
        fileRestored: function (f) { return f + '（請重新選取）'; },
        noCopy: '⚠️ 尚無內容可複製',
        noDownload: '⚠️ 尚無字幕可下載',
        copyFailed: '⚠️ 複製失敗，請手動複製',
        readFileFailed: '❌ 讀取檔案失敗',
        unsupportedFormat: '❌ 僅支援 .srt 和 .vtt 格式',
        fetchingSubtitles: '正在獲取YouTube字幕...',
        jumpedTo: function (t) { return '🎯 已跳轉到 ' + t; },
        playingFrom: function (t) { return '▶️ 從 ' + t + ' 開始播放'; },
        pausedAt: function (t) { return '⏸️ 在 ' + t + ' 暫停'; },
        rewindTo: function (t) { return '⏪ 後退到 ' + t; },
        forwardTo: function (t) { return '⏩ 前進到 ' + t; },
        speed: function (r) { return '播放速率：' + r + 'x'; },
        noLocalVideo: '本機影片未載入',
        loadVideoFirst: '請先載入影片',
        loadLocalFirst: '請先載入本機影片',
        videoDisabledEmbed: '此影片已停用嵌入播放，請直接在 YouTube 觀看',
        videoNotFound: '找不到此影片，可能已被刪除或設為私人',
        playerError: function (code) { return '影片播放器發生錯誤（代碼 ' + code + '）'; },
        parseSubtitleFailed: function (err) { return '❌ 解析字幕檔案失敗: ' + err; },
        progressLoadingVideo: '正在載入影片...',
        progressVideoParams: '設定影片參數...',
        progressUsingSaved: '使用已儲存的字幕',
        progressSubtitlesDone: '字幕載入完成',
        progressVideoDone: '影片載入完成！',
        progressLoadingLocal: '正在載入本機影片...',
        progressLocalParams: '設定影片參數...',
        progressLocalMeta: '影片載入完成',
        progressLocalDone: '本機影片載入完成！'
      }
    },

    'en': {
      page: {
        title: 'Video Subtitle Editor',
        tagline: 'The Smoothest Way to Review Subtitles'
      },
      meta: {
        description: 'SubDesk — Subtitle review tool for YouTube and local videos. Upload .srt / .vtt files, edit in real-time, and download corrected subtitles in one click.'
      },
      og: { locale: 'en_US' },
      header: {
        reset: 'Reset',
        resetTitle: 'Clear all data and reset the page',
        langToggle: '中文',
        langTitle: '切換為中文'
      },
      shortcuts: {
        playPause: 'Play / Pause',
        skip5s: 'Skip 5s',
        prevNext: 'Prev / Next',
        speed: 'Speed -/+'
      },
      narrow: {
        label: 'Video Subtitle Editor',
        title: 'Best Viewed on Desktop',
        desc: 'This tool is designed for widescreen desktop environments.<br>It may feel cramped on smaller screens.',
        continue: 'Continue Anyway'
      },
      video: {
        localVideo: 'Local Video',
        urlPlaceholder: 'Enter YouTube URL (e.g. https://www.youtube.com/watch?v=VIDEO_ID)',
        loadBtn: 'Load Video',
        loadingBtn: 'Loading...',
        reloadBtn: 'Reload',
        fileDropZone: 'Choose or drag a video here',
        notSupported: 'Your browser does not support video playback.'
      },
      controls: {
        play: 'Play',
        pause: 'Pause',
        backTitle: 'Back 5s',
        forwardTitle: 'Forward 5s'
      },
      aria: {
        currentTime: 'Current playback time, type to seek',
        timeHour1: 'Hour (tens)',
        timeHour2: 'Hour (ones)',
        timeMin1: 'Minute (tens)',
        timeMin2: 'Minute (ones)',
        timeSec1: 'Second (tens)',
        timeSec2: 'Second (ones)'
      },
      subtitle: {
        title: 'Subtitle List',
        uploadBtn: 'Upload Subtitle',
        formats: 'Supports .srt, .vtt',
        filterAll: 'All',
        filterModified: 'Modified',
        emptyDefault: 'Load a video first<br>then click "Upload Subtitle"<br>or drag and drop a .srt / .vtt file here',
        emptyLocalNotLoaded: 'Load a local video first<br>then click "Upload Subtitle"<br>or drag and drop a .srt / .vtt file here',
        emptyLocalLoaded: 'Local video has no auto-captions.<br>Click "Upload Subtitle"<br>or drag and drop a .srt / .vtt file here',
        emptyYouTube: 'No subtitles detected.<br>Click "Upload Subtitle"<br>or drag and drop a .srt / .vtt file here',
        seekTitle: function (time) { return 'Jump to ' + time; }
      },
      output: {
        title: 'Corrected Subtitle Output',
        copyBtn: 'Copy',
        downloadBtn: 'Download All',
        onlyModified: 'Show modified only',
        showComparison: 'Show before/after comparison',
        placeholder: 'After loading a video, the corrected subtitle output will appear here'
      },
      drag: {
        overlay: 'Drop video, audio or subtitle file (.srt .vtt) here'
      },
      msg: {
        invalidUrl: 'Please enter a valid YouTube URL',
        loadVideoError: 'Failed to load video, please try again.',
        invalidFile: 'Please select a valid video or audio file',
        selectFile: 'Please select a video file',
        noSubtitlesPlayable: 'Unable to fetch subtitles, but the video can still play.',
        noYTSubtitles: 'Unable to fetch YouTube subtitles. Subtitle timing will use the correction file.',
        playerNotReady: 'Player not ready, please try again',
        seekFailed: 'Seek failed, please reload the video',
        playerReady: 'Video player is ready',
        ytSubtitlesLoaded: function (n) { return 'YouTube subtitles loaded (' + n + ' lines)'; },
        subtitlesLoaded: function (n) { return '✅ Loaded ' + n + ' subtitles'; },
        copied: '✓ Copied',
        copyBtn: 'Copy',
        downloaded: function (ext) { return '⬇️ Downloaded full corrected subtitles .' + ext; },
        videoLoadSuccess: 'Video loaded! Click a subtitle to jump to it.',
        localVideoLoadSuccess: "Local video loaded! If you've uploaded subtitles, they will appear automatically.",
        localVideoError: 'Failed to load local video, please try again.',
        resetConfirm: 'Reset page? All unsaved changes will be lost.',
        restoredWithFile: function (n, f) { return '✅ Restored ' + n + ' subtitles. Please re-select the video: ' + f; },
        restored: function (n) { return '✅ Restored last session (' + n + ' subtitles)'; },
        lastFile: function (f) { return '⚠️ Last video: ' + f + ', please re-select.'; },
        fileRestored: function (f) { return f + ' (please re-select)'; },
        noCopy: '⚠️ Nothing to copy',
        noDownload: '⚠️ No subtitles to download',
        copyFailed: '⚠️ Copy failed, please copy manually',
        readFileFailed: '❌ Failed to read file',
        unsupportedFormat: '❌ Only .srt and .vtt formats are supported',
        fetchingSubtitles: 'Fetching YouTube subtitles...',
        jumpedTo: function (t) { return '🎯 Jumped to ' + t; },
        playingFrom: function (t) { return '▶️ Playing from ' + t; },
        pausedAt: function (t) { return '⏸️ Paused at ' + t; },
        rewindTo: function (t) { return '⏪ Rewound to ' + t; },
        forwardTo: function (t) { return '⏩ Fast-forwarded to ' + t; },
        speed: function (r) { return 'Speed: ' + r + 'x'; },
        noLocalVideo: 'No local video loaded',
        loadVideoFirst: 'Please load a video first',
        loadLocalFirst: 'Please load a local video first',
        videoDisabledEmbed: 'This video has embedding disabled. Please watch on YouTube directly.',
        videoNotFound: 'Video not found. It may have been deleted or set to private.',
        playerError: function (code) { return 'Player error (code ' + code + ')'; },
        parseSubtitleFailed: function (err) { return '❌ Failed to parse subtitle file: ' + err; },
        progressLoadingVideo: 'Loading video...',
        progressVideoParams: 'Configuring video...',
        progressUsingSaved: 'Using saved subtitles',
        progressSubtitlesDone: 'Subtitles loaded',
        progressVideoDone: 'Video loaded!',
        progressLoadingLocal: 'Loading local video...',
        progressLocalParams: 'Configuring video...',
        progressLocalMeta: 'Video loaded',
        progressLocalDone: 'Local video loaded!'
      }
    }
  };

  function detectLanguage() {
    try {
      var urlLang = new URLSearchParams(window.location.search).get('lang');
      if (urlLang && translations[urlLang]) return urlLang;
    } catch (e) {}
    try {
      var saved = localStorage.getItem(LANG_KEY);
      if (saved && translations[saved]) return saved;
    } catch (e) {}
    var langs = (navigator.languages || [navigator.language || '']).filter(Boolean);
    for (var i = 0; i < langs.length; i++) {
      var l = langs[i].toLowerCase();
      if (l.startsWith('zh')) return 'zh-TW';
      if (l.startsWith('en')) return 'en';
    }
    return 'zh-TW';
  }

  var currentLang = detectLanguage();

  function t(key) {
    var args = Array.prototype.slice.call(arguments, 1);
    var keys = key.split('.');
    var val = translations[currentLang];
    for (var i = 0; i < keys.length; i++) {
      if (val == null) { val = undefined; break; }
      val = val[keys[i]];
    }
    if (val === undefined) {
      val = translations['zh-TW'];
      for (var j = 0; j < keys.length; j++) {
        if (val == null) { val = undefined; break; }
        val = val[keys[j]];
      }
    }
    if (typeof val === 'function') return val.apply(null, args);
    return val !== undefined && val !== null ? String(val) : key;
  }

  function setMeta(selector, content) {
    var el = document.querySelector(selector);
    if (el) el.setAttribute('content', content);
  }

  function applyTranslations() {
    document.documentElement.lang = currentLang;
    document.title = t('page.title');

    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      el.innerHTML = t(el.getAttribute('data-i18n'));
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach(function (el) {
      el.placeholder = t(el.getAttribute('data-i18n-placeholder'));
    });
    document.querySelectorAll('[data-i18n-title]').forEach(function (el) {
      el.title = t(el.getAttribute('data-i18n-title'));
    });
    document.querySelectorAll('[data-i18n-aria]').forEach(function (el) {
      el.setAttribute('aria-label', t(el.getAttribute('data-i18n-aria')));
    });

    setMeta('meta[name="description"]', t('meta.description'));
    setMeta('meta[property="og:title"]', t('page.title'));
    setMeta('meta[property="og:description"]', t('meta.description'));
    setMeta('meta[property="og:locale"]', t('og.locale'));
    setMeta('meta[property="og:url"]', window.location.href);
    setMeta('meta[name="twitter:title"]', t('page.title'));
    setMeta('meta[name="twitter:description"]', t('meta.description'));

    var origin = window.location.origin;
    var path = window.location.pathname;
    var zhLink = document.getElementById('hreflang-zh');
    var enLink = document.getElementById('hreflang-en');
    var defLink = document.getElementById('hreflang-default');
    if (zhLink) zhLink.href = origin + path + '?lang=zh-TW';
    if (enLink) enLink.href = origin + path + '?lang=en';
    if (defLink) defLink.href = origin + path;

    var langBtn = document.getElementById('langToggleBtn');
    if (langBtn) {
      langBtn.textContent = t('header.langToggle');
      langBtn.title = t('header.langTitle');
    }
  }

  function setLanguage(lang) {
    if (!translations[lang]) return;
    currentLang = lang;
    try { localStorage.setItem(LANG_KEY, lang); } catch (e) {}
    try {
      var url = new URL(window.location.href);
      url.searchParams.set('lang', lang);
      window.history.replaceState(null, '', url.toString());
    } catch (e) {}
    applyTranslations();
    try { window.dispatchEvent(new CustomEvent('i18n:change', { detail: { lang: lang } })); } catch (e) {}
  }

  function toggleLanguage() {
    setLanguage(currentLang === 'zh-TW' ? 'en' : 'zh-TW');
  }

  window.t = t;
  window.setLanguage = setLanguage;
  window.toggleLanguage = toggleLanguage;
  window.getCurrentLang = function () { return currentLang; };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', applyTranslations);
  } else {
    applyTranslations();
  }
})();
