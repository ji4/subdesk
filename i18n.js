(function () {
  'use strict';

  var LANG_KEY = 'subdesk_lang';

  // Key-first: each key maps { 'zh-TW': ..., 'en': ... } — easy to compare translations side by side
  var translations = {
    'page.title':    { 'zh-TW': '影片字幕校正工具',               'en': 'Video Subtitle Editor' },
    'page.tagline':  { 'zh-TW': 'The Smoothest Way to Review Subtitles', 'en': 'The Smoothest Way to Review Subtitles' },

    'meta.description': {
      'zh-TW': '影片字幕校正工具 — 支援 YouTube 與本機影片，輕鬆上傳 .srt / .vtt 字幕檔，即時編輯、同步校正，一鍵下載。',
      'en':    'SubDesk — Subtitle review tool for YouTube and local videos. Upload .srt / .vtt files, edit in real-time, and download corrected subtitles in one click.'
    },
    'og.locale': { 'zh-TW': 'zh_TW', 'en': 'en_US' },

    'header.reset':      { 'zh-TW': '清除',               'en': 'Reset' },
    'header.resetTitle': { 'zh-TW': '清除所有資料並重置頁面', 'en': 'Clear all data and reset the page' },

    'shortcuts.playPause': { 'zh-TW': '播放 / 暫停', 'en': 'Play / Pause' },
    'shortcuts.skip5s':    { 'zh-TW': '跳 5 秒',     'en': 'Skip 5s' },
    'shortcuts.prevNext':  { 'zh-TW': '上 / 下一句', 'en': 'Prev / Next' },
    'shortcuts.speed':     { 'zh-TW': '降 / 升速率', 'en': 'Speed -/+' },

    // ----- 自訂快捷鍵設定面板 -----
    'keys.settingsTitle': { 'zh-TW': '自訂快捷鍵', 'en': 'Customize shortcuts' },
    'keys.title':         { 'zh-TW': '自訂快捷鍵', 'en': 'Customize Shortcuts' },
    'keys.desc': {
      'zh-TW': '預設按鍵若與你的輸入法或瀏覽器快捷鍵衝突，可在此改鍵。編輯文字時請搭配 Alt 使用；設定只儲存在這個瀏覽器。',
      'en': 'Rebind these keys if the defaults conflict with your input method or browser shortcuts. Combine with Alt while editing text. Saved in this browser only.'
    },
    'keys.prevSub':   { 'zh-TW': '上一句', 'en': 'Previous line' },
    'keys.nextSub':   { 'zh-TW': '下一句', 'en': 'Next line' },
    'keys.speedDown': { 'zh-TW': '降低速率', 'en': 'Slow down' },
    'keys.speedUp':   { 'zh-TW': '提高速率', 'en': 'Speed up' },
    'keys.pressKey':  { 'zh-TW': '請按新按鍵', 'en': 'Press new key' },
    'keys.directEditing': { 'zh-TW': '編輯文字時不需 Alt', 'en': 'No Alt needed while editing' },
    'keys.directOnNote': {
      'zh-TW': '已啟用：編輯字幕時，單獨按快捷鍵即可觸發功能；若該鍵原本會輸入字元，啟用後不會輸入。',
      'en': 'Enabled: while editing, shortcut keys trigger their action directly; keys that would normally type a character will not.'
    },
    'keys.directOffNote': {
      'zh-TW': '未啟用：編輯字幕時，快捷鍵需搭配 Alt 觸發。',
      'en': 'Disabled: while editing, hold Alt with a shortcut key to trigger it.'
    },
    'keys.undoTitle': { 'zh-TW': '回復預設按鍵', 'en': 'Restore default key' },
    'keys.reserved': {
      'zh-TW': function (k) { return '「' + k + '」為固定功能鍵，無法使用'; },
      'en':    function (k) { return '"' + k + '" is reserved and cannot be used'; }
    },
    'keys.conflict': {
      'zh-TW': function (k) { return '「' + k + '」已被其他快捷鍵使用'; },
      'en':    function (k) { return '"' + k + '" is already assigned to another shortcut'; }
    },

    'narrow.label':    { 'zh-TW': '影片字幕校正工具', 'en': 'Video Subtitle Editor' },
    'narrow.title':    { 'zh-TW': '建議在電腦上開啟', 'en': 'Best Viewed on Desktop' },
    'narrow.desc':     { 'zh-TW': '本工具專為寬螢幕桌面環境設計<br>在小螢幕裝置上操作會較為擁擠。', 'en': 'This tool is designed for widescreen desktop environments.<br>It may feel cramped on smaller screens.' },
    'narrow.continue': { 'zh-TW': '繼續使用', 'en': 'Continue Anyway' },

    'video.localVideo':     { 'zh-TW': '本機影片',   'en': 'Local Video' },
    'video.urlPlaceholder': { 'zh-TW': '請輸入YouTube影片網址 (如: https://www.youtube.com/watch?v=VIDEO_ID)', 'en': 'Enter YouTube URL (e.g. https://www.youtube.com/watch?v=VIDEO_ID)' },
    'video.loadBtn':        { 'zh-TW': '載入影片',  'en': 'Load Video' },
    'video.loadingBtn':     { 'zh-TW': '載入中...', 'en': 'Loading...' },
    'video.fileDropZone':   { 'zh-TW': '選擇或拖曳影片至此', 'en': 'Choose or drag a video here' },
    'video.notSupported':   { 'zh-TW': '您的瀏覽器不支援影片播放。', 'en': 'Your browser does not support video playback.' },

    'controls.play':         { 'zh-TW': '播放',    'en': 'Play' },
    'controls.pause':        { 'zh-TW': '暫停',    'en': 'Pause' },
    'controls.backTitle':    { 'zh-TW': '後退5秒', 'en': 'Back 5s' },
    'controls.forwardTitle': { 'zh-TW': '前進5秒', 'en': 'Forward 5s' },

    'aria.currentTime': { 'zh-TW': '目前播放時間，可輸入時間跳轉', 'en': 'Current playback time, type to seek' },
    'aria.speedSlider': { 'zh-TW': '播放速率', 'en': 'Playback speed' },
    'aria.timeHour1':   { 'zh-TW': '小時十位', 'en': 'Hour (tens)' },
    'aria.timeHour2':   { 'zh-TW': '小時個位', 'en': 'Hour (ones)' },
    'aria.timeMin1':    { 'zh-TW': '分鐘十位', 'en': 'Minute (tens)' },
    'aria.timeMin2':    { 'zh-TW': '分鐘個位', 'en': 'Minute (ones)' },
    'aria.timeSec1':    { 'zh-TW': '秒數十位', 'en': 'Second (tens)' },
    'aria.timeSec2':    { 'zh-TW': '秒數個位', 'en': 'Second (ones)' },

    'subtitle.title':              { 'zh-TW': '字幕列表',   'en': 'Subtitle List' },
    'subtitle.uploadBtn':          { 'zh-TW': '上傳字幕檔', 'en': 'Upload Subtitle' },
    'subtitle.formats':            { 'zh-TW': '支援 .srt, .vtt 格式', 'en': 'Supports .srt, .vtt' },
    'subtitle.filterAll':          { 'zh-TW': '全部',   'en': 'All' },
    'subtitle.filterModified':     { 'zh-TW': '已修改', 'en': 'Modified' },
    'subtitle.emptyDefault':       { 'zh-TW': '請先載入影片<br>再點擊「上傳字幕檔」按鈕<br>或直接拖曳 .srt / .vtt 字幕檔至此', 'en': 'Load a video first<br>then click "Upload Subtitle"<br>or drag and drop a .srt / .vtt file here' },
    'subtitle.emptyLocalNotLoaded':{ 'zh-TW': '請先載入本機影片<br>再點擊「上傳字幕檔」按鈕<br>或直接拖曳 .srt / .vtt 字幕檔至此', 'en': 'Load a local video first<br>then click "Upload Subtitle"<br>or drag and drop a .srt / .vtt file here' },
    'subtitle.emptyLocalLoaded':   { 'zh-TW': '本機影片不含自動字幕<br>請點擊「上傳字幕檔」按鈕<br>或直接拖曳 .srt / .vtt 字幕檔至此', 'en': 'Local video has no auto-captions.<br>Click "Upload Subtitle"<br>or drag and drop a .srt / .vtt file here' },
    'subtitle.emptyYouTube':       { 'zh-TW': '未偵測到字幕<br>請點擊「上傳字幕檔」按鈕<br>或直接拖曳 .srt / .vtt 字幕檔至此', 'en': 'No subtitles detected.<br>Click "Upload Subtitle"<br>or drag and drop a .srt / .vtt file here' },
    'subtitle.seekTitle': {
      'zh-TW': function (time) { return '跳轉到 ' + time; },
      'en':    function (time) { return 'Jump to ' + time; }
    },

    'output.title':          { 'zh-TW': '校正後字幕輸出',   'en': 'Corrected Subtitle Output' },
    'output.copyBtn':        { 'zh-TW': '複製',             'en': 'Copy' },
    'output.downloadBtn':    { 'zh-TW': '下載整份',         'en': 'Download All' },
    'output.onlyModified':   { 'zh-TW': '僅顯示已修改字幕', 'en': 'Show modified only' },
    'output.showComparison': { 'zh-TW': '顯示校正前後對比', 'en': 'Show before/after comparison' },
    'output.placeholder':    { 'zh-TW': '載入影片後，這裡會自動產生整份校正後的字幕輸出', 'en': 'After loading a video, the corrected subtitle output will appear here' },

    'drag.overlay': { 'zh-TW': '拖曳影片、音訊或字幕檔（.srt .vtt）至此', 'en': 'Drop video, audio or subtitle file (.srt .vtt) here' },

    'msg.invalidUrl':          { 'zh-TW': '請輸入有效的YouTube網址',           'en': 'Please enter a valid YouTube URL' },
    'msg.loadVideoError':      { 'zh-TW': '載入影片時發生錯誤，請重試。',       'en': 'Failed to load video, please try again.' },
    'msg.invalidFile':         { 'zh-TW': '請選擇有效的影片或音訊檔案',         'en': 'Please select a valid video or audio file' },
    'msg.selectFile':          { 'zh-TW': '請選擇影片檔案',                    'en': 'Please select a video file' },
    'msg.noSubtitlesPlayable': { 'zh-TW': '無法獲取字幕，但影片仍可播放。',     'en': 'Unable to fetch subtitles, but the video can still play.' },
    'msg.noYTSubtitles':       { 'zh-TW': '無法獲取YouTube字幕，將使用校正檔案的時間。', 'en': 'Unable to fetch YouTube subtitles. Subtitle timing will use the correction file.' },
    'msg.playerNotReady':      { 'zh-TW': '播放器未準備就緒，請稍候再試',       'en': 'Player not ready, please try again' },
    'msg.seekFailed':          { 'zh-TW': '跳轉失敗，請重新載入影片',           'en': 'Seek failed, please reload the video' },
    'msg.playerReady':         { 'zh-TW': '影片播放器已準備就緒',               'en': 'Video player is ready' },
    'msg.ytSubtitlesLoaded': {
      'zh-TW': function (n) { return 'YouTube字幕載入完成 (共 ' + n + ' 條)'; },
      'en':    function (n) { return 'YouTube subtitles loaded (' + n + ' lines)'; }
    },
    'msg.subtitlesLoaded': {
      'zh-TW': function (n) { return '✅ 成功載入 ' + n + ' 條字幕'; },
      'en':    function (n) { return '✅ Loaded ' + n + ' subtitles'; }
    },
    'msg.copied':    { 'zh-TW': '✓ 已複製', 'en': '✓ Copied' },
    'msg.copyBtn':   { 'zh-TW': '複製',     'en': 'Copy' },
    'msg.downloaded': {
      'zh-TW': function (ext) { return '⬇️ 已下載完整校正後字幕 .' + ext; },
      'en':    function (ext) { return '⬇️ Downloaded full corrected subtitles .' + ext; }
    },
    'msg.videoLoadSuccess':      { 'zh-TW': '影片載入成功！現在可以點擊字幕進行跳轉。', 'en': 'Video loaded! Click a subtitle to jump to it.' },
    'msg.localVideoLoadSuccess': { 'zh-TW': '本機影片載入成功！如果已上傳字幕檔案，字幕將自動顯示。', 'en': "Local video loaded! If you've uploaded subtitles, they will appear automatically." },
    'msg.localVideoError':       { 'zh-TW': '載入本機影片時發生錯誤，請重試。', 'en': 'Failed to load local video, please try again.' },
    'msg.resetConfirm':          { 'zh-TW': '確定要重置頁面嗎？所有未下載的修改將會遺失。', 'en': 'Reset page? All unsaved changes will be lost.' },
    'msg.overwriteConfirm':      { 'zh-TW': '目前有已修改的字幕，載入新字幕將會覆蓋這些修改。確定要繼續嗎？', 'en': 'You have modified subtitles. Loading new subtitles will overwrite them. Continue?' },
    'msg.restoredWithFile': {
      'zh-TW': function (n, f) { return '✅ 已還原 ' + n + ' 條字幕，請重新選取影片：' + f + '。'; },
      'en':    function (n, f) { return '✅ Restored ' + n + ' subtitles. Please re-select the video: ' + f; }
    },
    'msg.restored': {
      'zh-TW': function (n) { return '✅ 已還原上次編輯（' + n + ' 條字幕）'; },
      'en':    function (n) { return '✅ Restored last session (' + n + ' subtitles)'; }
    },
    'msg.lastFile': {
      'zh-TW': function (f) { return '⚠️ 上次的影片：' + f + '，請重新選取。'; },
      'en':    function (f) { return '⚠️ Last video: ' + f + ', please re-select.'; }
    },
    'msg.fileRestored': {
      'zh-TW': function (f) { return f + '（請重新選取）'; },
      'en':    function (f) { return f + ' (please re-select)'; }
    },
    'msg.noCopy':            { 'zh-TW': '⚠️ 尚無內容可複製',          'en': '⚠️ Nothing to copy' },
    'msg.noDownload':        { 'zh-TW': '⚠️ 尚無字幕可下載',          'en': '⚠️ No subtitles to download' },
    'msg.copyFailed':        { 'zh-TW': '⚠️ 複製失敗，請手動複製',    'en': '⚠️ Copy failed, please copy manually' },
    'msg.readFileFailed':    { 'zh-TW': '❌ 讀取檔案失敗',             'en': '❌ Failed to read file' },
    'msg.unsupportedFormat': { 'zh-TW': '❌ 僅支援 .srt 和 .vtt 格式', 'en': '❌ Only .srt and .vtt formats are supported' },
    'msg.fetchingSubtitles': { 'zh-TW': '正在獲取YouTube字幕...',      'en': 'Fetching YouTube subtitles...' },
    'msg.jumpedTo': {
      'zh-TW': function (t) { return '🎯 已跳轉到 ' + t; },
      'en':    function (t) { return '🎯 Jumped to ' + t; }
    },
    'msg.playingFrom': {
      'zh-TW': function (t) { return '▶️ 從 ' + t + ' 開始播放'; },
      'en':    function (t) { return '▶️ Playing from ' + t; }
    },
    'msg.pausedAt': {
      'zh-TW': function (t) { return '⏸️ 在 ' + t + ' 暫停'; },
      'en':    function (t) { return '⏸️ Paused at ' + t; }
    },
    'msg.rewindTo': {
      'zh-TW': function (t) { return '⏪ 後退到 ' + t; },
      'en':    function (t) { return '⏪ Rewound to ' + t; }
    },
    'msg.forwardTo': {
      'zh-TW': function (t) { return '⏩ 前進到 ' + t; },
      'en':    function (t) { return '⏩ Fast-forwarded to ' + t; }
    },
    'msg.speed': {
      'zh-TW': function (r) { return '播放速率：' + r + 'x'; },
      'en':    function (r) { return 'Speed: ' + r + 'x'; }
    },
    'msg.noLocalVideo':       { 'zh-TW': '本機影片未載入',                    'en': 'No local video loaded' },
    'msg.loadVideoFirst':     { 'zh-TW': '請先載入影片',                      'en': 'Please load a video first' },
    'msg.loadLocalFirst':     { 'zh-TW': '請先載入本機影片',                  'en': 'Please load a local video first' },
    'msg.videoDisabledEmbed': { 'zh-TW': '此影片已停用嵌入播放，請直接在 YouTube 觀看', 'en': 'This video has embedding disabled. Please watch on YouTube directly.' },
    'msg.videoNotFound':      { 'zh-TW': '找不到此影片，可能已被刪除或設為私人', 'en': 'Video not found. It may have been deleted or set to private.' },
    'msg.playerError': {
      'zh-TW': function (code) { return '影片播放器發生錯誤（代碼 ' + code + '）'; },
      'en':    function (code) { return 'Player error (code ' + code + ')'; }
    },
    'msg.parseSubtitleFailed': {
      'zh-TW': function (err) { return '❌ 解析字幕檔案失敗: ' + err; },
      'en':    function (err) { return '❌ Failed to parse subtitle file: ' + err; }
    },
    'msg.progressLoadingVideo':  { 'zh-TW': '正在載入影片...',    'en': 'Loading video...' },
    'msg.progressVideoParams':   { 'zh-TW': '設定影片參數...',    'en': 'Configuring video...' },
    'msg.progressUsingSaved':    { 'zh-TW': '使用已儲存的字幕',  'en': 'Using saved subtitles' },
    'msg.progressSubtitlesDone': { 'zh-TW': '字幕載入完成',      'en': 'Subtitles loaded' },
    'msg.progressVideoDone':     { 'zh-TW': '影片載入完成！',    'en': 'Video loaded!' },
    'msg.progressLoadingLocal':  { 'zh-TW': '正在載入本機影片...', 'en': 'Loading local video...' },
    'msg.progressLocalParams':   { 'zh-TW': '設定影片參數...',    'en': 'Configuring video...' },
    'msg.progressLocalMeta':     { 'zh-TW': '影片載入完成',       'en': 'Video loaded' },
    'msg.progressLocalDone':     { 'zh-TW': '本機影片載入完成！', 'en': 'Local video loaded!' }
  };

  function detectLanguage() {
    try {
      var urlLang = new URLSearchParams(window.location.search).get('lang');
      if (urlLang && translations['page.title'][urlLang]) return urlLang;
    } catch (e) {}
    try {
      var saved = localStorage.getItem(LANG_KEY);
      if (saved && translations['page.title'][saved]) return saved;
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
    var entry = translations[key];
    if (!entry) return key;
    var val = (currentLang in entry) ? entry[currentLang] : entry['zh-TW'];
    if (typeof val === 'function') return val.apply(null, args);
    return (val !== undefined && val !== null) ? String(val) : key;
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

    // Update dropdown: current language label + active option
    var labelEl = document.getElementById('langCurrentLabel');
    if (labelEl) labelEl.textContent = currentLang === 'zh-TW' ? '中文' : 'EN';

    document.querySelectorAll('.lang-option[data-lang]').forEach(function (opt) {
      opt.classList.toggle('active', opt.getAttribute('data-lang') === currentLang);
    });
  }

  function setLanguage(lang) {
    if (!(lang in (translations['page.title'] || {}))) return;
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

  function toggleLangDropdown() {
    var sel = document.getElementById('langSelector');
    if (sel) sel.classList.toggle('open');
  }

  function selectLang(lang) {
    var sel = document.getElementById('langSelector');
    if (sel) sel.classList.remove('open');
    setLanguage(lang);
  }

  function initDropdownClickOutside() {
    document.addEventListener('click', function (e) {
      var sel = document.getElementById('langSelector');
      if (sel && !sel.contains(e.target)) sel.classList.remove('open');
    });
  }

  window.t = t;
  window.setLanguage = setLanguage;
  window.toggleLanguage = toggleLanguage;
  window.toggleLangDropdown = toggleLangDropdown;
  window.selectLang = selectLang;
  window.getCurrentLang = function () { return currentLang; };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      applyTranslations();
      initDropdownClickOutside();
    });
  } else {
    applyTranslations();
    initDropdownClickOutside();
  }
})();
