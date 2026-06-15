        // ── GA 事件輔助 ──
        let _appInitializing = true;
        function gaEvent(name, params) {
            if (typeof gtag === 'function') gtag('event', name, params);
        }

        // ── 小螢幕警告介面 ──
        const NARROW_DISMISSED_KEY = 'subdesk_narrow_dismissed';
        const NARROW_THRESHOLD = 1024;

        function checkNarrowScreen() {
            const gate = document.getElementById('narrowScreenGate');
            if (!gate) return;
            const dismissed = sessionStorage.getItem(NARROW_DISMISSED_KEY);
            if (!dismissed && window.innerWidth < NARROW_THRESHOLD) {
                gate.classList.add('is-visible');
            } else {
                gate.classList.remove('is-visible');
            }
        }

        function dismissNarrowScreenGate() {
            sessionStorage.setItem(NARROW_DISMISSED_KEY, '1');
            const gate = document.getElementById('narrowScreenGate');
            if (gate) gate.classList.remove('is-visible');
        }

        window.dismissNarrowScreenGate = dismissNarrowScreenGate;

        document.addEventListener('DOMContentLoaded', checkNarrowScreen);
        window.addEventListener('resize', checkNarrowScreen);

        // localStorage 持久化
        const LS_KEYS = {
            subtitles:        'yte_subtitles',
            youtubeUrl:       'yte_youtubeUrl',
            isLocalVideo:     'yte_isLocalVideo',
            fileName:         'yte_fileName',
            outputFormat:     'yte_outputFormat',
            panelFilter:      'yte_panelFilter',
            showOnlyModified: 'yte_showOnlyModified',
            showComparison:   'yte_showComparison',
            dividerCols:      'yte_dividerCols',
            outputHeight:     'yte_outputHeight',
            cwHeight:         'yte_cwHeight',
            keyBindings:      'yte_keyBindings',
            aiTutorialSeen:   'yte_aiTutorialSeen'
        };

        const DEFAULT_API_BASE_URL = 'https://subdesk-jy-projects12.vercel.app';
        const configuredApiBase = (window.SUBDESK_API_BASE || '').replace(/\/$/, '');
        const _hn = window.location.hostname;
        const isLocalHost = ['localhost', '127.0.0.1', '::1'].includes(_hn)
            || /^(10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.)/.test(_hn);
        const API_BASE_URL = isLocalHost ? '' : (configuredApiBase || DEFAULT_API_BASE_URL);

        function apiUrl(path) {
            return `${API_BASE_URL}${path}`;
        }

        let _saveStateTimer = null;
        function debouncedSaveState() {
            clearTimeout(_saveStateTimer);
            _saveStateTimer = setTimeout(saveState, 600);
        }

        let _isRestoringState = false;
        function saveState() {
            // 還原過程中（字幕尚未載回）禁止寫入，避免誤清已儲存的字幕
            if (_isRestoringState) return;
            try {
                if (youtubeSubtitles && youtubeSubtitles.length > 0) {
                    localStorage.setItem(LS_KEYS.subtitles, JSON.stringify(youtubeSubtitles));
                } else {
                    localStorage.removeItem(LS_KEYS.subtitles);
                }
                // 只在 YouTube 模式下儲存 URL；本機模式時主動清除，避免重整時誤載入 YouTube
                if (!isLocalVideo) {
                    const urlInput = document.getElementById('youtubeUrl');
                    if (urlInput && urlInput.value.trim()) {
                        localStorage.setItem(LS_KEYS.youtubeUrl, urlInput.value.trim());
                    } else {
                        localStorage.removeItem(LS_KEYS.youtubeUrl);
                    }
                } else {
                    localStorage.removeItem(LS_KEYS.youtubeUrl);
                }
                localStorage.setItem(LS_KEYS.isLocalVideo, String(isLocalVideo));
                localStorage.setItem(LS_KEYS.fileName, currentFileName);
                localStorage.setItem(LS_KEYS.outputFormat, currentOutputFormat);
                localStorage.setItem(LS_KEYS.panelFilter, subtitlePanelFilter);
                localStorage.setItem(LS_KEYS.showOnlyModified, String(showOnlyModified));
                localStorage.setItem(LS_KEYS.showComparison, String(showComparison));
                const wrapper = document.getElementById('contentWrapper');
                if (wrapper && wrapper.style.gridTemplateColumns) {
                    localStorage.setItem(LS_KEYS.dividerCols, wrapper.style.gridTemplateColumns);
                }
                if (wrapper && wrapper.style.height) {
                    localStorage.setItem(LS_KEYS.cwHeight, wrapper.style.height);
                }
            } catch (e) {
                console.warn('localStorage 儲存失敗:', e);
            }
        }

        function loadState() {
            _isRestoringState = true;
            try {
                const savedSubtitles        = localStorage.getItem(LS_KEYS.subtitles);
                const savedUrl              = localStorage.getItem(LS_KEYS.youtubeUrl);
                const savedIsLocal          = localStorage.getItem(LS_KEYS.isLocalVideo);
                const savedFileName         = localStorage.getItem(LS_KEYS.fileName);
                const savedFormat           = localStorage.getItem(LS_KEYS.outputFormat);
                const savedPanelFilter      = localStorage.getItem(LS_KEYS.panelFilter);
                const savedShowOnlyModified = localStorage.getItem(LS_KEYS.showOnlyModified);
                const savedShowComparison   = localStorage.getItem(LS_KEYS.showComparison);
                const savedDividerCols      = localStorage.getItem(LS_KEYS.dividerCols);

                const hasLocalFile = savedIsLocal === 'true' && !!savedFileName;
                if (!savedSubtitles && !savedUrl && !hasLocalFile) return;

                if (savedIsLocal === 'true') {
                    document.getElementById('localVideoBtn').click();
                    if (savedFileName) {
                        const display = document.getElementById('fileNameDisplay');
                        if (display) display.textContent = t('msg.fileRestored', savedFileName);
                    }
                }
                if (savedUrl && savedIsLocal !== 'true') {
                    document.getElementById('youtubeUrl').value = savedUrl;
                    _pendingAutoLoad = true;
                    _autoLoadSkipSubtitles = !!savedSubtitles;
                }
                if (savedFileName) {
                    currentFileName = savedFileName;
                }
                if (savedFormat) {
                    switchOutputFormat(savedFormat);
                }
                if (savedPanelFilter) {
                    subtitlePanelFilter = savedPanelFilter;
                    ['all', 'modified'].forEach(m => {
                        const btn = document.getElementById(`filter${m.charAt(0).toUpperCase() + m.slice(1)}`);
                        if (btn) btn.classList.toggle('active', m === savedPanelFilter);
                    });
                }
                if (savedShowOnlyModified === 'true') {
                    showOnlyModified = true;
                    const chk = document.getElementById('chkOnlyModified');
                    if (chk) chk.checked = true;
                    const label = document.getElementById('chkComparisonLabel');
                    if (label) label.style.display = 'inline-flex';
                }
                if (savedShowComparison === 'true' && showOnlyModified) {
                    showComparison = true;
                    const chk = document.getElementById('chkComparison');
                    if (chk) chk.checked = true;
                }
                const wrapper = document.getElementById('contentWrapper');
                if (savedDividerCols && wrapper) {
                    wrapper.style.gridTemplateColumns = savedDividerCols;
                }
                const savedCwHeight = localStorage.getItem(LS_KEYS.cwHeight);
                if (savedCwHeight && wrapper) {
                    wrapper.style.height = savedCwHeight;
                }
                if (savedSubtitles) {
                    const parsed = JSON.parse(savedSubtitles);
                    if (Array.isArray(parsed) && parsed.length > 0) {
                        youtubeSubtitles = parsed;
                        updateYouTubeSubtitlesDisplay();
                        const msg = isLocalVideo && currentFileName
                            ? t('msg.restoredWithFile', parsed.length, currentFileName)
                            : t('msg.restored', parsed.length);
                        showDeleteNotification(msg, 'success');
                    }
                } else if (isLocalVideo && currentFileName) {
                    showDeleteNotification(t('msg.lastFile', currentFileName), 'error');
                }
            } catch (e) {
                console.warn('載入 localStorage 失敗:', e);
            } finally {
                _isRestoringState = false;
            }
            // YT API 回呼可能比 DOMContentLoaded 早觸發而錯過 _pendingAutoLoad，
            // 還原完成後若 API 已就緒則立即補載入
            if (_pendingAutoLoad && window.YT && typeof YT.Player === 'function') {
                _pendingAutoLoad = false;
                loadVideo(_autoLoadSkipSubtitles);
            }
        }

        function resetPage() {
            if (!confirm(t('msg.resetConfirm'))) return;
            try {
                Object.entries(LS_KEYS).forEach(([name, k]) => {
                    if (name !== 'keyBindings' && name !== 'aiTutorialSeen') localStorage.removeItem(k);
                });
            } catch (e) {}
            gaEvent('reset_page');
            window.location.reload();
        }

        let currentVideoId = null;
        let isVideoLoaded = false;
        let captionsFetched = false;
        let _pendingAutoLoad = false;
        let _autoLoadSkipSubtitles = false;
        let currentTime = 0;
        let isPlaying = false;
        let timeInterval = null;
        let currentOutputFormat = 'srt';
        let showOnlyModified = false;
        let showComparison = false;
        let subtitlePanelFilter = 'all';
        // 各篩選 tab 各自記住捲動位置，切換時直接還原
        const panelScrollByFilter = { all: 0, modified: 0 };
        let suppressHighlightAutoScroll = false;
        let youtubeSubtitles = [];
        let player = null;
        let isPlayerReady = false;
        let currentHighlightedYouTube = -1;
        let isLocalVideo = false; // 是否為本機影片
        let localVideo = null; // 本機影片元素
        let currentFileName = ''; // 下載時的檔名（YouTube 標題或本機檔名）
        let isEditingCurrentTime = false;
        let currentTimeEditTimer = null;
        // 可自訂快捷鍵（以 e.code 儲存）；Space／方向鍵為固定鍵不可自訂
        const DEFAULT_KEY_BINDINGS = {
            prevSub: 'KeyA',
            nextSub: 'KeyD',
            speedDown: 'BracketLeft',
            speedUp: 'BracketRight'
        };
        const RESERVED_KEY_CODES = ['Space', 'ArrowLeft', 'ArrowRight', 'Escape', 'Enter', 'Tab'];
        let keyBindings = { ...DEFAULT_KEY_BINDINGS };
        let capturingBinding = null;
        let hintEditingMode = false;
        // 編輯文字時是否免按 Alt 直接觸發快捷鍵（按下時不會輸入字元）
        let directKeysWhileEditing = false;

        const YOUTUBE_PLAYBACK_RATES = [0.25, 0.5, 0.75, 1.0, 1.25, 1.5, 1.75, 2.0];
        const LOCAL_PLAYBACK_RATES = [0.25, 0.5, 0.75, 1.0, 1.25, 1.5, 1.75, 2.0, 2.5, 3.0, 4.0];
        
        // 初始化影片載入選擇器
        function initVideoLoadSelector() {
            const youtubeBtn = document.getElementById('youtubeBtn');
            const localVideoBtn = document.getElementById('localVideoBtn');
            const youtubeInput = document.getElementById('youtubeInput');
            const localVideoInput = document.getElementById('localVideoInput');
            
            youtubeBtn.addEventListener('click', function() {
                youtubeBtn.classList.add('active');
                localVideoBtn.classList.remove('active');
                youtubeInput.style.display = 'flex';
                localVideoInput.style.display = 'none';
                isLocalVideo = false;
                if (localVideo) localVideo.pause();
                updateYouTubeSubtitlesDisplay();
            });

            localVideoBtn.addEventListener('click', function() {
                localVideoBtn.classList.add('active');
                youtubeBtn.classList.remove('active');
                localVideoInput.style.display = 'flex';
                youtubeInput.style.display = 'none';
                isLocalVideo = true;
                if (player && isPlayerReady) { try { player.pauseVideo(); } catch(e) {} }
                updateYouTubeSubtitlesDisplay();
            });
        }
        
        // 重置影片播放器
        function resetVideoPlayer() {
            // 隱藏影片容器
            document.getElementById('videoContainer').style.display = 'none';
            document.getElementById('videoControls').style.display = 'none';
            
            // 重置狀態
            isVideoLoaded = false;
            isPlayerReady = false;
            currentTime = 0;
            isPlaying = false;
            
            // 停止時間追蹤
            if (timeInterval) {
                clearInterval(timeInterval);
                timeInterval = null;
            }
            
            // 停止字幕同步
            stopSubtitleSync();
            
            // 清除高亮
            clearAllHighlights();
            
            // 重置播放器
            if (player) {
                player.destroy();
                player = null;
            }
            
            // 重置本機影片
            if (localVideo) {
                localVideo.pause();
                localVideo.src = '';
                localVideo = null;
            }
            
            updateTimeDisplay();

            // 清除上一支影片的字幕與輸出
            youtubeSubtitles = [];
            if (typeof updateOutputTextarea === 'function') updateOutputTextarea();
        }

        // 初始化 YouTube Player
        function onYouTubeIframeAPIReady() {
            console.log('YouTube API 已準備就緒');
            if (_pendingAutoLoad) {
                _pendingAutoLoad = false;
                loadVideo(_autoLoadSkipSubtitles);
            }
        }
        // iframe_api 比 app.js 先載入，API 就緒時可能找不到全域回呼；
        // 明確掛上 window，並用 YT.ready 涵蓋「API 已就緒」的時序
        window.onYouTubeIframeAPIReady = onYouTubeIframeAPIReady;
        if (window.YT && typeof YT.ready === 'function') {
            YT.ready(onYouTubeIframeAPIReady);
        }

        function hasModifiedSubtitles() {
            return Array.isArray(youtubeSubtitles) && youtubeSubtitles.some(s => s.modified);
        }

        // onReady 偶爾不觸發（在已載入的 iframe 上掛 player 會錯過握手），輪詢補救
        let _readyPollTimer = null;
        function startPlayerReadyFallback() {
            if (_readyPollTimer) clearInterval(_readyPollTimer);
            let attempts = 0;
            _readyPollTimer = setInterval(() => {
                attempts++;
                if (isPlayerReady || attempts > 20) {
                    clearInterval(_readyPollTimer);
                    _readyPollTimer = null;
                    return;
                }
                if (player && typeof player.getPlayerState === 'function'
                    && player.getPlayerState() !== undefined) {
                    clearInterval(_readyPollTimer);
                    _readyPollTimer = null;
                    onPlayerReady({ target: player });
                }
            }, 500);
        }

        async function loadVideo(skipSubtitleFetch = false) {
            if (isLocalVideo) {
                loadLocalVideo();
                return;
            }

            const url = document.getElementById('youtubeUrl').value.trim();
            const videoId = extractVideoId(url);
            const loadBtn = document.getElementById('loadVideoBtn');

            if (!videoId) {
                showMessage(t('msg.invalidUrl'), 'error');
                return;
            }

            // 僅在非自動重載時清除字幕（自動重載時保留已儲存的編輯）
            if (!skipSubtitleFetch) {
                if (hasModifiedSubtitles() && !confirm(t('msg.overwriteConfirm'))) {
                    return;
                }
                youtubeSubtitles = [];
                updateOutputTextarea();
            }

            // YT API 尚未就緒時先排入待載，API 就緒後由 onYouTubeIframeAPIReady 重新呼叫
            if (!window.YT || typeof YT.Player !== 'function') {
                _pendingAutoLoad = true;
                _autoLoadSkipSubtitles = skipSubtitleFetch;
                return;
            }

            loadBtn.textContent = t('video.loadingBtn');
            loadBtn.disabled = true;

            updateProgress(25, t('msg.progressLoadingVideo'));

            try {
                captionsFetched = false;
                currentVideoId = videoId;

                // 確保 iframe 可見、本機影片隱藏
                const iframe = document.getElementById('youtubeIframe');
                iframe.style.display = '';
                if (localVideo) { localVideo.style.display = 'none'; }

                updateProgress(50, t('msg.progressVideoParams'));

                if (player && isPlayerReady && typeof player.loadVideoById === 'function') {
                    // 已有就緒的播放器：直接換片，不重建（onReady 只會觸發一次）
                    player.loadVideoById(videoId);
                } else {
                    // 由 YT API 自行建立 iframe（標準流程，onReady 才會可靠觸發）
                    isPlayerReady = false;
                    isVideoLoaded = false;
                    player = new YT.Player('youtubeIframe', {
                        videoId: videoId,
                        playerVars: { rel: 0, modestbranding: 1, disablekb: 1 },
                        events: {
                            'onReady': onPlayerReady,
                            'onStateChange': onPlayerStateChange,
                            'onError': onPlayerError,
                            'onApiChange': onApiChange
                        }
                    });
                    startPlayerReadyFallback();
                }

                // 獲取字幕（自動重載且已有儲存字幕時略過）
                if (skipSubtitleFetch) {
                    updateProgress(75, t('msg.progressUsingSaved'));
                } else {
                    try {
                        await fetchYouTubeSubtitles(videoId);
                        updateProgress(75, t('msg.progressSubtitlesDone'));
                    } catch (error) {
                        console.warn('API 字幕失敗，等待播放器備援:', error);
                        // 不立即顯示錯誤，讓 fetchSubtitlesFromPlayer 接手
                    }
                }
                
                // 顯示影片容器和控制項
                document.getElementById('videoContainer').style.display = 'block';
                document.getElementById('videoControls').style.display = '';
                
                updateProgress(100, t('msg.progressVideoDone'));

                loadBtn.textContent = t('video.loadBtn');
                loadBtn.disabled = false;

                showStatus(t('msg.videoLoadSuccess'), 'success');
                gaEvent('load_video', { source: 'youtube' });
                saveState();
                
                if (timeInterval) {
                    clearInterval(timeInterval);
                    timeInterval = null;
                }
                
                updateTimeDisplay();
                
            } catch (error) {
                console.error('載入影片錯誤:', error);
                loadBtn.textContent = t('video.loadBtn');
                loadBtn.disabled = false;
                showMessage(t('msg.loadVideoError'), 'error');
                document.getElementById('progressContainer').style.display = 'none';
            }
        }
        
        // 載入本機影片（核心邏輯，支援按鈕與拖曳兩種入口）
        function loadLocalVideoFromFile(file, loadBtn) {
            if (!file || (!file.type.startsWith('video/') && !file.type.startsWith('audio/'))) {
                showMessage(t('msg.invalidFile'), 'error');
                return;
            }

            currentFileName = file.name.replace(/\.[^.]+$/, '');
            const _display = document.getElementById('fileNameDisplay');
            const _zone = document.getElementById('fileDropZone');
            if (_display) _display.textContent = file.name;
            if (_zone) _zone.classList.add('has-file');

            if (loadBtn) { loadBtn.textContent = t('video.loadingBtn'); loadBtn.disabled = true; }

            updateProgress(25, t('msg.progressLoadingLocal'));

            try {
                // 停止 YouTube 播放器但不 destroy，避免移除 iframe DOM 元素
                if (player && isPlayerReady) {
                    try { player.stopVideo(); } catch(e) {}
                }
                player = null;
                isPlayerReady = false;

                const videoUrl = URL.createObjectURL(file);

                localVideo = document.getElementById('localVideo');
                if (!localVideo) {
                    localVideo = document.createElement('video');
                    localVideo.id = 'localVideo';
                    localVideo.controls = true;
                    localVideo.preload = 'metadata';
                    document.getElementById('videoContainer').appendChild(localVideo);
                }

                localVideo.pause();
                localVideo.currentTime = 0;
                localVideo.src = videoUrl;

                const isAudioOnly = file.type.startsWith('audio/');
                document.getElementById('youtubeIframe').style.display = 'none';
                document.getElementById('videoContainer').style.display = 'block';
                document.getElementById('subtitleOverlay').style.display = 'none';
                document.getElementById('videoClickOverlay').style.display = isAudioOnly ? 'block' : 'none';
                localVideo.style.display = 'block';

                updateProgress(50, t('msg.progressLocalParams'));

                localVideo.addEventListener('loadedmetadata', function() {
                    updateProgress(75, t('msg.progressLocalMeta'));
                    isVideoLoaded = true;
                    isPlayerReady = true;
                    currentTime = 0;

                    document.getElementById('videoControls').style.display = '';

                    if (youtubeSubtitles && youtubeSubtitles.length > 0) {
                        document.getElementById('subtitleOverlay').style.display = 'block';
                    }
                    updateYouTubeSubtitlesDisplay();

                    updateProgress(100, t('msg.progressLocalDone'));

                    if (loadBtn) { loadBtn.textContent = t('video.loadBtn'); loadBtn.disabled = false; }

                    showStatus(t('msg.localVideoLoadSuccess'), 'success');
                    gaEvent('load_video', { source: 'local' });
                    saveState();

                    updateTimeDisplay();
                    setupLocalVideoEvents();
                    syncSpeedSlider(getCurrentPlaybackRate());
                });

                localVideo.addEventListener('error', function(e) {
                    console.error('本機影片載入錯誤:', e.target.error);
                    if (loadBtn) { loadBtn.textContent = t('video.loadBtn'); loadBtn.disabled = false; }
                    showMessage(t('msg.localVideoError'), 'error');
                    document.getElementById('progressContainer').style.display = 'none';
                });

            } catch (error) {
                console.error('載入本機影片錯誤:', error);
                if (loadBtn) { loadBtn.textContent = t('video.loadBtn'); loadBtn.disabled = false; }
                showMessage(t('msg.localVideoError'), 'error');
                document.getElementById('progressContainer').style.display = 'none';
            }
        }

        function loadLocalVideo() {
            const fileInput = document.getElementById('localVideoFile');
            const loadBtn = document.getElementById('loadLocalVideoBtn');
            if (!fileInput.files || fileInput.files.length === 0) {
                showMessage(t('msg.selectFile'), 'error');
                return;
            }
            loadLocalVideoFromFile(fileInput.files[0], loadBtn);
        }
        
        // 設置本機影片事件監聽器
        function setupLocalVideoEvents() {
            if (!localVideo) return;

            // 讓 video 元素不持有 keyboard focus，防止 native 方向鍵 seek
            localVideo.addEventListener('focus', function() {
                this.blur();
            });

            // 播放事件
            localVideo.addEventListener('play', function() {
                isPlaying = true;
                startTimeTracking();
                startSubtitleSync();
                updatePlayToggleBtn();
            });

            // 暫停事件
            localVideo.addEventListener('pause', function() {
                isPlaying = false;
                stopTimeTracking();
                stopSubtitleSync();
                updatePlayToggleBtn();
            });
            
            // 時間更新事件
            localVideo.addEventListener('timeupdate', function() {
                currentTime = localVideo.currentTime;
                updateTimeDisplay();
                highlightCurrentSubtitles(currentTime);
            });
            
            // 結束事件
            localVideo.addEventListener('ended', function() {
                isPlaying = false;
                stopTimeTracking();
                stopSubtitleSync();
                updatePlayToggleBtn();
            });
        }

        function handleVideoContainerClick() {
            if (!isLocalVideo || !localVideo) return;
            if (localVideo.paused) {
                localVideo.play();
            } else {
                localVideo.pause();
            }
        }

        function onPlayerReady(event) {
            if (isPlayerReady) return; // 輪詢備援與原生 onReady 可能各觸發一次
            console.log('YouTube Player 已準備就緒');
            isPlayerReady = true;
            isVideoLoaded = true;
            try {
                const data = event.target.getVideoData();
                if (data && data.title) currentFileName = data.title;
            } catch(e) {}
            startSubtitleSync();
            updateYouTubeSubtitlesDisplay();
            syncSpeedSlider(getCurrentPlaybackRate());
            showDeleteNotification(t('msg.playerReady'), 'success');
            // 主動觸發 captions 模組載入，讓 onApiChange 盡快觸發
            if (player && typeof player.loadModule === 'function') {
                try { player.loadModule('captions'); } catch(e) {}
            }
            // 備援：若 onApiChange 未在 1.5 秒內觸發，主動嘗試
            setTimeout(() => {
                if (!captionsFetched && currentVideoId && (!youtubeSubtitles || youtubeSubtitles.length === 0)) {
                    captionsFetched = true;
                    fetchSubtitlesFromPlayer(currentVideoId);
                }
            }, 1500);
        }

        function onApiChange(event) {
            // 當 captions 模組載入完畢時立即取得字幕 URL（比 setTimeout 更可靠）
            if (captionsFetched) return;
            const modules = player && typeof player.getOptions === 'function' ? player.getOptions() : [];
            console.log('onApiChange 已載入模組:', modules);
            if (Array.isArray(modules) && modules.includes('captions')) {
                if (currentVideoId && (!youtubeSubtitles || youtubeSubtitles.length === 0)) {
                    captionsFetched = true;
                    fetchSubtitlesFromPlayer(currentVideoId);
                }
            }
        }

        async function fetchSubtitlesFromPlayer(videoId) {
            try {
                if (!player || typeof player.getOption !== 'function') return;
                // 若 captions 模組尚未載入則觸發載入
                const modules = typeof player.getOptions === 'function' ? player.getOptions() : [];
                if (!Array.isArray(modules) || !modules.includes('captions')) {
                    if (typeof player.loadModule === 'function') player.loadModule('captions');
                    await new Promise(r => setTimeout(r, 1000));
                }
                const tracklist = player.getOption('captions', 'tracklist');
                console.log('播放器字幕軌道:', tracklist);
                if (!tracklist || tracklist.length === 0) {
                    showDeleteNotification(t('msg.noSubtitlesPlayable'), 'error');
                    return;
                }

                const track = tracklist.find(t =>
                    t.languageCode?.startsWith('zh') || t.vssId?.includes('zh')
                ) || tracklist[0];

                const baseUrl = track.baseUrl;
                if (!baseUrl) {
                    console.log('tracklist 無 baseUrl，嘗試 timedtext API');
                    const lang = track.languageCode || 'zh-TW';
                    const timedTextUrl = `https://www.youtube.com/api/timedtext?v=${videoId}&lang=${encodeURIComponent(lang)}&fmt=json3`;
                    await tryProxyCaptions(timedTextUrl);
                } else {
                    const captionUrl = baseUrl.includes('fmt=') ? baseUrl : baseUrl + '&fmt=json3';
                    await tryProxyCaptions(captionUrl);
                }

                if (!youtubeSubtitles || youtubeSubtitles.length === 0) {
                    showDeleteNotification(t('msg.noSubtitlesPlayable'), 'error');
                }
            } catch (e) {
                console.warn('播放器字幕 API 獲取失敗:', e);
                showDeleteNotification(t('msg.noSubtitlesPlayable'), 'error');
            }
        }

        async function tryProxyCaptions(captionUrl) {
            try {
                const resp = await fetch(apiUrl(`/api/proxy-captions?url=${encodeURIComponent(captionUrl)}`));
                if (!resp.ok) return;
                const text = await resp.text();
                if (!text || text.length < 10) return;

                let subtitles = [];
                if (text.trimStart().startsWith('{')) {
                    subtitles = parseYouTubeTimedTextJson3(JSON.parse(text));
                } else if (text.trimStart().startsWith('<')) {
                    subtitles = parseYouTubeTimedTextXml(text);
                }

                if (subtitles.length > 0) {
                    youtubeSubtitles = subtitles;
                    currentHighlightedYouTube = -1;
                    updateYouTubeSubtitlesDisplay();
                    showDeleteNotification(t('msg.ytSubtitlesLoaded', subtitles.length), 'success');
                    saveState();
                }
            } catch (e) {
                console.warn('proxy 獲取失敗:', e);
            }
        }

        function parseYouTubeTimedTextJson3(data) {
            if (!data || !data.events) return [];
            return data.events
                .filter(e => e.segs && e.tStartMs !== undefined)
                .map(e => ({
                    start: e.tStartMs / 1000,
                    duration: typeof e.dDurationMs === 'number' ? e.dDurationMs / 1000 : null,
                    text: e.segs.map(s => s.utf8 || '').join('').trim()
                }))
                .filter(s => s.text);
        }

        function parseYouTubeTimedTextXml(xml) {
            const matches = [...xml.matchAll(/<text start="([^"]*)" dur="([^"]*)">([^<]*)<\/text>/g)];
            return matches.map(m => ({
                start: parseFloat(m[1]),
                duration: parseFloat(m[2]),
                text: m[3].replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&#39;/g, "'").replace(/&quot;/g, '"').trim()
            })).filter(s => s.text);
        }

        function onPlayerError(event) {
            console.error('YouTube Player 錯誤:', event.data);
            isPlayerReady = false;
            isVideoLoaded = false;
            const code = event.data;
            let msg;
            if (code === 101 || code === 150) {
                msg = t('msg.videoDisabledEmbed');
            } else if (code === 100) {
                msg = t('msg.videoNotFound');
            } else {
                msg = t('msg.playerError', code);
            }
            showDeleteNotification(msg, 'error');
        }

        function updatePlayToggleBtn() {
            const btn = document.getElementById('playToggleBtn');
            if (!btn) return;
            btn.innerHTML = isPlaying
                ? '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>'
                : '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>';
            btn.title = isPlaying ? t('controls.pause') : t('controls.play');
        }

        function onPlayerStateChange(event) {
            console.log('播放器狀態改變:', event.data);
            if (event.data === YT.PlayerState.PLAYING) {
                isPlaying = true;
                startTimeTracking();
                startSubtitleSync(); // 開始字幕同步
            } else if (event.data === YT.PlayerState.PAUSED) {
                isPlaying = false;
                stopTimeTracking();
                stopSubtitleSync(); // 停止字幕同步
            }
            updatePlayToggleBtn();
        }
        
        async function fetchYouTubeSubtitles(videoId) {
            try {
                showDeleteNotification(t('msg.fetchingSubtitles'), 'info');
                
                // 使用本地後端服務獲取字幕
                const response = await fetch(apiUrl(`/api/subtitles?videoId=${videoId}`));
                if (!response.ok) {
                    throw new Error('無法獲取字幕');
                }
                
                const data = await response.json();
                console.log('從後端接收到的原始資料:', data);
                
                if (!data || !data.subtitles || data.subtitles.length === 0) {
                    throw new Error('沒有可用的字幕');
                }
                
                // 確保時間是數字 - 檢查每個字幕項目
                youtubeSubtitles = data.subtitles.map((subtitle, index) => {
                    console.log(`處理第 ${index} 個字幕:`, subtitle);
                    
                    let start = 0;
                    if (typeof subtitle.start === 'number' && !isNaN(subtitle.start)) {
                        start = subtitle.start;
                    } else if (typeof subtitle.start === 'string') {
                        start = parseFloat(subtitle.start);
                    } else {
                        console.warn('無效的時間格式:', subtitle.start);
                        start = 0;
                    }
                    
                    const result = {
                        start: start,
                        duration: typeof subtitle.duration === 'number' ? subtitle.duration : null,
                        text: subtitle.text
                    };
                    console.log(`處理結果:`, result);
                    return result;
                });
                
                console.log('解析後的字幕:', youtubeSubtitles.slice(0, 3));
                showDeleteNotification(t('msg.ytSubtitlesLoaded', youtubeSubtitles.length), 'success');
                gaEvent('fetch_subtitles_success', { subtitle_count: youtubeSubtitles.length });

                // 更新字幕顯示
                currentHighlightedYouTube = -1;
                updateYouTubeSubtitlesDisplay();
                saveState();

                // 字幕可能比 player 事件晚就緒，補啟動同步以確保高亮
                startSubtitleSync();

                return youtubeSubtitles;
            } catch (error) {
                console.error('獲取字幕失敗:', error);
                gaEvent('fetch_subtitles_fail');
                youtubeSubtitles = [];
                updateYouTubeSubtitlesDisplay();
                return [];
            }
        }
        
        function escapeHtml(str) {
            return String(str)
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#39;');
        }

        function renderSubtitleItemHTML(subtitle, idx) {
            const time = formatTime(subtitle.start);
            const classes = ['youtube-subtitle-item'];
            if (subtitle.modified) classes.push('modified');
            const indexBadge = `<span class="subtitle-index">${idx + 1}</span>`;
            const timeBadge = `<span class="youtube-subtitle-time" title="${escapeHtml(time)}">${escapeHtml(time)}</span>`;
            const seekZone = `<div class="subtitle-seek-zone" onclick="seekToTime(${subtitle.start})" title="${escapeHtml(t('subtitle.seekTitle', time))}"><svg width="13" height="13" viewBox="0 0 20 20" fill="var(--text-muted)"><path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z"/></svg></div>`;
            const showComparison = subtitle.modified && subtitlePanelFilter === 'modified';
            let contentHTML;
            if (showComparison) {
                const edited = subtitle.editedText !== undefined ? subtitle.editedText : subtitle.text;
                contentHTML = `
                    <div class="youtube-subtitle-content modified-content">
                        <div class="youtube-subtitle-original-row">
                            ${indexBadge}${timeBadge}
                            <span class="subtitle-wrong">${escapeHtml(subtitle.text)}</span>
                            <button class="subtitle-revert-btn" onclick="revertSubtitle(${idx})" title="${escapeHtml(t('subtitle.revertTitle'))}"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 7v6h6"/><path d="M21 17a9 9 0 0 0-15-6.7L3 13"/></svg></button>
                        </div>
                        <span class="youtube-subtitle-text subtitle-correct"
                              contenteditable="true"
                              data-index="${idx}"
                              oninput="liveSync(${idx}, this)"
                              onblur="saveSubtitleEdit(${idx}, this)"
                              onkeydown="handleEnterKey(event, ${idx}, this)">${escapeHtml(edited)}</span>
                    </div>`;
            } else {
                const displayText = subtitle.modified && subtitle.editedText !== undefined ? subtitle.editedText : subtitle.text;
                contentHTML = `
                    <div class="youtube-subtitle-content">
                        ${indexBadge}${timeBadge}
                        <span class="youtube-subtitle-text"
                              contenteditable="true"
                              data-index="${idx}"
                              oninput="liveSync(${idx}, this)"
                              onblur="saveSubtitleEdit(${idx}, this)"
                              onkeydown="handleEnterKey(event, ${idx}, this)">${escapeHtml(displayText)}</span>
                    </div>`;
            }
            return `<div class="${classes.join(' ')}" data-index="${idx}">${contentHTML}${seekZone}</div>`;
        }

        function updateYouTubeSubtitlesDisplay(skipOutput = false) {
            const panel = document.getElementById('youtubeSubtitlesPanel');
            currentHighlightedYouTube = -1;

            if (!youtubeSubtitles || youtubeSubtitles.length === 0) {
                let msg;
                if (!isVideoLoaded && isLocalVideo) {
                    msg = t('subtitle.emptyLocalNotLoaded');
                } else if (!isVideoLoaded) {
                    msg = t('subtitle.emptyDefault');
                } else if (isLocalVideo) {
                    msg = t('subtitle.emptyLocalLoaded');
                } else {
                    msg = t('subtitle.emptyYouTube');
                }
                panel.innerHTML = `<div style="text-align: center; color: var(--text-muted); padding: 40px; font-size: 16px; line-height: 2;">${msg}</div>`;
                return;
            }

            const filtered = youtubeSubtitles
                .map((s, i) => ({ ...s, _index: i }))
                .filter(s => subtitlePanelFilter === 'modified' ? s.modified : true);

            panel.innerHTML = filtered.map(s => renderSubtitleItemHTML(s, s._index)).join('');

            highlightCurrentSubtitles(currentTime);
            if (!skipOutput) updateOutputTextarea();
        }

        // 還原單句修改（從「已修改」清單移除）
        function revertSubtitle(index) {
            const s = youtubeSubtitles[index];
            if (!s || !s.modified) return;
            delete s.editedText;
            s.modified = false;
            updateYouTubeSubtitlesDisplay();
            debouncedSaveState();
            gaEvent('revert_subtitle');
        }

        // 即時同步：輸入時更新資料模型、amber border、輸出區
        function liveSync(index, element) {
            const newText = element.textContent;
            const s = youtubeSubtitles[index];
            if (newText !== s.text) {
                s.editedText = newText;
                s.modified = true;
            } else {
                delete s.editedText;
                s.modified = false;
            }
            const item = element.closest('.youtube-subtitle-item');
            if (item) item.classList.toggle('modified', !!s.modified);
            updateOutputTextarea();
            debouncedSaveState();
        }

        function saveSubtitleEdit(index, element) {
            const newText = element.textContent.trim();
            const s = youtubeSubtitles[index];
            if (newText !== s.text) {
                s.editedText = newText;
                s.modified = true;
            } else {
                delete s.editedText;
                s.modified = false;
            }
            // Re-render only if two-line format state or modified class needs to change
            const item = element.closest('.youtube-subtitle-item');
            if (item) {
                const hasTwoLine = !!item.querySelector('.modified-content');
                const needsTwoLine = s.modified && subtitlePanelFilter === 'modified';
                if (hasTwoLine !== needsTwoLine || item.classList.contains('modified') !== !!s.modified) {
                    const wasPlaying = item.classList.contains('current-playing');
                    item.outerHTML = renderSubtitleItemHTML(s, index);
                    if (wasPlaying) {
                        const replaced = document.querySelector(`.youtube-subtitle-item[data-index="${index}"]`);
                        if (replaced) replaced.classList.add('current-playing');
                    }
                }
            }
            updateOutputTextarea();
            debouncedSaveState();
        }

        function filterSubtitlePanel(mode) {
            const panel = document.getElementById('youtubeSubtitlesPanel');
            if (panel) panelScrollByFilter[subtitlePanelFilter] = panel.scrollTop;

            subtitlePanelFilter = mode;
            ['all', 'modified'].forEach(m => {
                const btn = document.getElementById(`filter${m.charAt(0).toUpperCase() + m.slice(1)}`);
                if (btn) btn.classList.toggle('active', m === mode);
            });

            suppressHighlightAutoScroll = true;
            updateYouTubeSubtitlesDisplay();
            suppressHighlightAutoScroll = false;

            if (panel) {
                // 有高亮列就直接瞬間置中（不播放捲動動畫），否則還原該 tab 先前的位置
                const playing = panel.querySelector('.youtube-subtitle-item.current-playing');
                if (playing) {
                    panel.scrollTop = Math.max(0,
                        playing.offsetTop - panel.offsetTop - (panel.clientHeight / 2 - playing.clientHeight / 2));
                } else {
                    panel.scrollTop = panelScrollByFilter[mode] || 0;
                }
            }
            saveState();
        }

        function formatTime(seconds) {
            if (typeof seconds !== 'number' || isNaN(seconds)) {
                console.warn('無效的時間值:', seconds);
                return '00:00:00';
            }
            
            const hours = Math.floor(seconds / 3600);
            const minutes = Math.floor((seconds % 3600) / 60);
            const secs = Math.floor(seconds % 60);
            
            return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        }

        function getTimeDigitInputs() {
            return Array.from(document.querySelectorAll('#currentTime .time-digit'));
        }

        function setCurrentTimeEditorValue(seconds) {
            const inputs = getTimeDigitInputs();
            if (inputs.length !== 6) return;
            const value = formatTime(seconds).replace(/:/g, '').slice(-6).padStart(6, '0');
            inputs.forEach((input, index) => {
                input.value = value[index];
            });
        }

        function getCurrentTimeEditorSeconds() {
            const digits = getTimeDigitInputs().map(input => input.value.replace(/\D/g, '') || '0');
            const hours = parseInt(digits.slice(0, 2).join(''), 10);
            const minutes = Math.min(parseInt(digits.slice(2, 4).join(''), 10), 59);
            const seconds = Math.min(parseInt(digits.slice(4, 6).join(''), 10), 59);
            return hours * 3600 + minutes * 60 + seconds;
        }

        function applyEditedCurrentTime(showNotification = false) {
            const targetTime = getCurrentTimeEditorSeconds();

            let duration = Infinity;
            if (isLocalVideo && localVideo) {
                duration = localVideo.duration || Infinity;
            } else if (player && isPlayerReady) {
                try { duration = player.getDuration() || Infinity; } catch(e) {}
            }

            if (isFinite(duration) && targetTime > duration) {
                setCurrentTimeEditorValue(currentTime);
                isEditingCurrentTime = false;
                return;
            }

            currentTime = Math.max(0, targetTime);
            isEditingCurrentTime = false;

            if (isLocalVideo && localVideo) {
                localVideo.currentTime = currentTime;
            } else if (player && isPlayerReady && typeof player.seekTo === 'function') {
                player.seekTo(currentTime, true);
            }

            setCurrentTimeEditorValue(currentTime);
            highlightCurrentSubtitles(currentTime);

            if (showNotification) {
                showDeleteNotification(t('msg.jumpedTo', formatTime(currentTime)));
            }
        }

        function scheduleEditedCurrentTimeApply() {
            isEditingCurrentTime = true;
            clearTimeout(currentTimeEditTimer);
            currentTimeEditTimer = setTimeout(() => applyEditedCurrentTime(false), 350);
        }

        function fillTimeEditorFromText(text, startIndex = 0) {
            const inputs = getTimeDigitInputs();
            const digits = text.replace(/\D/g, '').slice(0, 6);
            if (!digits) return;

            digits.split('').forEach((digit, offset) => {
                const target = inputs[startIndex + offset];
                if (target) target.value = digit;
            });

            const nextIndex = Math.min(startIndex + digits.length, inputs.length - 1);
            inputs[nextIndex]?.focus();
            inputs[nextIndex]?.select();
            scheduleEditedCurrentTimeApply();
        }

        function initCurrentTimeEditor() {
            const inputs = getTimeDigitInputs();
            inputs.forEach((input, index) => {
                input.addEventListener('focus', () => {
                    input.select();
                });

                input.addEventListener('beforeinput', event => {
                    if (event.data && /\D/.test(event.data)) {
                        event.preventDefault();
                    }
                });

                input.addEventListener('input', () => {
                    input.value = input.value.replace(/\D/g, '').slice(-1);
                    fillTimeEditorFromText(input.value, index);
                });

                input.addEventListener('paste', event => {
                    event.preventDefault();
                    fillTimeEditorFromText(event.clipboardData.getData('text'), index);
                });

                input.addEventListener('keydown', event => {
                    if (event.key === 'Enter') {
                        event.preventDefault();
                        applyEditedCurrentTime(true);
                        input.blur();
                    } else if (event.key === 'ArrowLeft') {
                        event.preventDefault();
                        inputs[Math.max(0, index - 1)]?.focus();
                    } else if (event.key === 'ArrowRight') {
                        event.preventDefault();
                        inputs[Math.min(inputs.length - 1, index + 1)]?.focus();
                    } else if (event.key === 'Backspace' && !input.value && index > 0) {
                        event.preventDefault();
                        isEditingCurrentTime = true;
                        inputs[index - 1].value = '0';
                        inputs[index - 1].focus();
                        scheduleEditedCurrentTimeApply();
                    }
                });

                input.addEventListener('compositionend', event => {
                    const digit = (event.data || input.value).replace(/\D/g, '').slice(-1);
                    input.value = digit || '0';
                    if (digit) fillTimeEditorFromText(digit, index);
                });

                input.addEventListener('blur', () => {
                    setTimeout(() => {
                        if (document.activeElement?.closest('#currentTime')) return;
                        isEditingCurrentTime = false;
                        applyEditedCurrentTime(false);
                    }, 0);
                });
            });

            setCurrentTimeEditorValue(currentTime);
        }
        
        function parseSubtitleContent(content) {
            // 解析字幕內容，轉換成需要的格式
            const subtitles = [];
            const lines = content.split('\n');
            let currentTime = 0;
            let currentText = '';
            
            for (let line of lines) {
                if (line.match(/^\d{2}:\d{2}:\d{2},\d{3}/)) {
                    // 如果是時間戳記
                    if (currentText) {
                        subtitles.push({
                            start: currentTime,
                            text: currentText.trim()
                        });
                        currentText = '';
                    }
                    const timeMatch = line.match(/(\d{2}):(\d{2}):(\d{2}),(\d{3})/);
                    if (timeMatch) {
                        currentTime = parseInt(timeMatch[1]) * 3600 + 
                                     parseInt(timeMatch[2]) * 60 + 
                                     parseInt(timeMatch[3]);
                    }
                } else if (line.trim()) {
                    // 如果是字幕文字
                    currentText += line.trim() + ' ';
                }
            }
            
            // 添加最後一個字幕
            if (currentText) {
                subtitles.push({
                    start: currentTime,
                    text: currentText.trim()
                });
            }
            
            return subtitles;
        }
        
        function findMatchingSubtitle(wrongText) {
            console.log('尋找匹配字幕:', wrongText);
            console.log('可用字幕:', youtubeSubtitles);
            
            if (!youtubeSubtitles || youtubeSubtitles.length === 0) {
                console.log('沒有可用的字幕');
                return null;
            }

            let bestMatch = null;
            let bestScore = 0;
            
            // 清理文字以進行比對
            const cleanWrongText = wrongText.toLowerCase().trim();
            
            for (let subtitle of youtubeSubtitles) {
                const cleanSubtitleText = subtitle.text.toLowerCase().trim();
                const score = calculateSimilarity(cleanWrongText, cleanSubtitleText);
                console.log('比對:', { 
                    wrongText: cleanWrongText,
                    subtitleText: cleanSubtitleText, 
                    score 
                });
                
                if (score > bestScore && score > 0.2) {
                    bestScore = score;
                    bestMatch = subtitle;
                }
            }
            
            console.log('最佳匹配:', bestMatch, '分數:', bestScore);
            return bestMatch;
        }
        
        function calculateSimilarity(str1, str2) {
            if (!str1 || !str2) return 0;
            
            // 移除標點符號和特殊字符
            const cleanStr1 = str1.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, '');
            const cleanStr2 = str2.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, '');
            
            const longer = cleanStr1.length > cleanStr2.length ? cleanStr1 : cleanStr2;
            const shorter = cleanStr1.length > cleanStr2.length ? cleanStr2 : cleanStr1;
            
            if (longer.length === 0) return 1.0;
            
            const distance = levenshteinDistance(longer, shorter);
            return (longer.length - distance) / longer.length;
        }
        
        function levenshteinDistance(str1, str2) {
            const matrix = [];
            
            for (let i = 0; i <= str2.length; i++) {
                matrix[i] = [i];
            }
            
            for (let j = 0; j <= str1.length; j++) {
                matrix[0][j] = j;
            }
            
            for (let i = 1; i <= str2.length; i++) {
                for (let j = 1; j <= str1.length; j++) {
                    if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
                        matrix[i][j] = matrix[i - 1][j - 1];
                    } else {
                        matrix[i][j] = Math.min(
                            matrix[i - 1][j - 1] + 1,
                            matrix[i][j - 1] + 1,
                            matrix[i - 1][j] + 1
                        );
                    }
                }
            }
            
            return matrix[str2.length][str1.length];
        }
        
        function updateProgress(progress, text) {
            const container = document.getElementById('progressContainer');
            const fill = document.getElementById('progressFill');
            const textEl = document.getElementById('progressText');
            
            container.style.display = 'block';
            fill.style.width = progress + '%';
            textEl.textContent = text;
            
            if (progress >= 100) {
                setTimeout(() => {
                    container.style.display = 'none';
                }, 2000);
            }
        }
        
        function showStatus(message, type = 'info') {
            const statusEl = document.getElementById('statusInfo');
            statusEl.textContent = message;
            statusEl.style.display = 'block';
            statusEl.className = 'status-info';
            
            if (type === 'error') {
                statusEl.style.background = '#ffebee';
                statusEl.style.borderColor = '#f44336';
                statusEl.style.color = '#c62828';
            } else if (type === 'success') {
                statusEl.style.background = '#e8f5e8';
                statusEl.style.borderColor = '#4caf50';
                statusEl.style.color = '#2e7d32';
            }
            
            setTimeout(() => {
                statusEl.style.display = 'none';
            }, 4000);
        }
        
        
        function extractVideoId(url) {
            const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
            const match = url.match(regex);
            return match ? match[1] : null;
        }
        
        function controlVideo(action) {
            if (!isVideoLoaded) {
                showDeleteNotification(t('msg.loadVideoFirst'), 'error');
                return;
            }
            
            const SKIP_TIME = 5; // 設定前進後退時間為5秒
            
            if (isLocalVideo) {
                // 本機影片控制
                if (!localVideo) {
                    showDeleteNotification(t('msg.noLocalVideo'), 'error');
                    return;
                }
                
                if (action === 'toggle') {
                    if (localVideo.paused) {
                        localVideo.play();
                    } else {
                        localVideo.pause();
                    }
                } else if (action === 'play') {
                    if (localVideo.paused) {
                        localVideo.play();
                        showDeleteNotification(t('msg.playingFrom', formatTime(currentTime)));
                    }
                } else if (action === 'pause') {
                    if (!localVideo.paused) {
                        localVideo.pause();
                        showDeleteNotification(t('msg.pausedAt', formatTime(currentTime)));
                    }
                } else if (action === 'back') {
                    const newTime = Math.max(0, localVideo.currentTime - SKIP_TIME);
                    localVideo.currentTime = newTime;
                    currentTime = newTime;
                    if (localVideo.paused) localVideo.play();
                    updateTimeDisplay();
                    highlightCurrentSubtitles(currentTime);
                    showDeleteNotification(t('msg.rewindTo', formatTime(currentTime)));
                } else if (action === 'forward') {
                    const newTime = localVideo.currentTime + SKIP_TIME;
                    localVideo.currentTime = newTime;
                    currentTime = newTime;
                    if (localVideo.paused) localVideo.play();
                    updateTimeDisplay();
                    highlightCurrentSubtitles(currentTime);
                    showDeleteNotification(t('msg.forwardTo', formatTime(currentTime)));
                }
            } else {
                // YouTube影片控制
                if (!player || !isPlayerReady) {
                    showDeleteNotification(t('msg.loadVideoFirst'), 'error');
                    return;
                }

                if (action === 'toggle') {
                    try {
                        if (isPlaying) {
                            player.pauseVideo();
                        } else {
                            player.playVideo();
                        }
                    } catch(e) { console.warn('播放控制失敗:', e); }
                } else if (action === 'play') {
                    if (!isPlaying) {
                        player.playVideo();
                        showDeleteNotification(t('msg.playingFrom', formatTime(currentTime)));
                    }
                } else if (action === 'pause') {
                    if (isPlaying) {
                        player.pauseVideo();
                        showDeleteNotification(t('msg.pausedAt', formatTime(currentTime)));
                    }
                } else if (action === 'back') {
                    currentTime = Math.max(0, currentTime - SKIP_TIME);
                    player.seekTo(currentTime, true);
                    if (!isPlaying) player.playVideo();
                    updateTimeDisplay();
                    highlightCurrentSubtitles(currentTime);
                    showDeleteNotification(t('msg.rewindTo', formatTime(currentTime)));
                } else if (action === 'forward') {
                    currentTime += SKIP_TIME;
                    player.seekTo(currentTime, true);
                    if (!isPlaying) player.playVideo();
                    updateTimeDisplay();
                    highlightCurrentSubtitles(currentTime);
                    showDeleteNotification(t('msg.forwardTo', formatTime(currentTime)));
                }
            }
        }
        
        function changeSpeed(dir) {
            if (!isVideoLoaded) return;
            let cur;
            if (isLocalVideo) {
                if (!localVideo) return;
                cur = localVideo.playbackRate;
            } else {
                if (!player || !isPlayerReady) return;
                cur = player.getPlaybackRate();
            }
            const rates = isLocalVideo ? LOCAL_PLAYBACK_RATES : YOUTUBE_PLAYBACK_RATES;
            let idx = rates.findIndex(r => Math.abs(r - cur) < 0.01);
            if (idx === -1) {
                idx = dir === 1
                    ? rates.findIndex(r => r > cur)
                    : rates.filter(r => r < cur).length - 1;
                if (idx < 0) idx = 0;
                if (idx >= rates.length) idx = rates.length - 1;
            } else {
                idx = Math.min(Math.max(idx + dir, 0), rates.length - 1);
            }
            applyPlaybackRate(rates[idx]);
        }

        function applyPlaybackRate(newRate) {
            if (isLocalVideo) {
                if (!localVideo) return;
                localVideo.playbackRate = newRate;
            } else {
                if (!player || !isPlayerReady) return;
                player.setPlaybackRate(newRate);
            }
            syncSpeedSlider(newRate);
            showDeleteNotification(t('msg.speed', newRate));
        }

        function getPlaybackRates() {
            return isLocalVideo ? LOCAL_PLAYBACK_RATES : YOUTUBE_PLAYBACK_RATES;
        }

        // 依目前模式（本機/YouTube）設定速率滑桿範圍
        function initSpeedSlider() {
            const slider = document.getElementById('speedSlider');
            if (!slider) return;

            slider.max = String(getPlaybackRates().length - 1);

            // 用屬性指派避免重建時重複綁定
            slider.oninput = function() {
                applyPlaybackRate(getPlaybackRates()[Number(this.value)]);
            };

            // 手機沒有 hover，點按鈕開關 popover；點外側關閉
            document.addEventListener('click', function(e) {
                const control = document.getElementById('speedControl');
                if (control && control.classList.contains('open') && !control.contains(e.target)) {
                    control.classList.remove('open');
                }
            });

            syncSpeedSlider(getCurrentPlaybackRate());
        }

        function toggleSpeedPopover() {
            const control = document.getElementById('speedControl');
            if (control) control.classList.toggle('open');
        }

        function formatRateLabel(rate) {
            return `${rate}×`.replace('0.', '.');
        }

        function getCurrentPlaybackRate() {
            try {
                if (isLocalVideo && localVideo) return localVideo.playbackRate;
                if (player && typeof player.getPlaybackRate === 'function') return player.getPlaybackRate();
            } catch (e) {}
            return 1;
        }

        // 鍵盤調速或載入影片後，同步滑桿位置與速率標籤
        function syncSpeedSlider(rate) {
            const slider = document.getElementById('speedSlider');
            if (!slider) return;

            const rates = getPlaybackRates();
            slider.max = String(rates.length - 1);

            // 刻度點數量隨速率清單變動（本機 11 段、YouTube 8 段）；標籤上下交錯避免擁擠
            const dots = document.getElementById('speedSliderDots');
            if (dots && dots.childElementCount !== rates.length) {
                // 刻度標籤不帶 ×，視覺較乾淨；按鈕與目前值仍顯示 ×
                dots.innerHTML = rates.map(r => `<span data-label="${String(r).replace('0.', '.')}"></span>`).join('');
            }

            let idx = rates.findIndex(r => Math.abs(r - rate) < 0.01);
            if (idx === -1) idx = rates.findIndex(r => r >= rate);
            if (idx === -1) idx = rates.length - 1;
            slider.value = String(idx);

            const label = formatRateLabel(rates[idx]);
            const btn = document.getElementById('speedBtn');
            const value = document.getElementById('speedValue');
            if (btn) btn.textContent = label;
            if (value) value.textContent = label;
        }

        function jumpToSubtitle(dir) {
            if (!youtubeSubtitles || youtubeSubtitles.length === 0) return;
            const t = currentTime;
            let idx = -1;
            for (let i = 0; i < youtubeSubtitles.length; i++) {
                const start = youtubeSubtitles[i].start;
                const end = youtubeSubtitles[i + 1] ? youtubeSubtitles[i + 1].start : start + 5;
                if (t >= start && t < end) { idx = i; break; }
            }
            if (idx === -1) {
                idx = dir === -1
                    ? youtubeSubtitles.reduce((b, s, i) => s.start <= t ? i : b, 0)
                    : youtubeSubtitles.findIndex(s => s.start > t);
                if (idx < 0) idx = 0;
                if (idx >= youtubeSubtitles.length) idx = youtubeSubtitles.length - 1;
            } else {
                idx = Math.min(Math.max(idx + dir, 0), youtubeSubtitles.length - 1);
            }
            seekToTime(youtubeSubtitles[idx].start);
        }

        function startTimeTracking() {
            if (timeInterval) {
                clearInterval(timeInterval);
            }
            
            if (isLocalVideo) {
                // 本機影片不需要額外的時間追蹤，因為有timeupdate事件
                return;
            }
            
            timeInterval = setInterval(() => {
                if (isPlaying && player && isPlayerReady && typeof player.getCurrentTime === 'function') {
                    currentTime = player.getCurrentTime();
                    updateTimeDisplay();
                }
            }, 250);
        }
        
        function stopTimeTracking() {
            if (timeInterval) {
                clearInterval(timeInterval);
                timeInterval = null;
            }
        }
        
        function updateTimeDisplay() {
            if (!isEditingCurrentTime) {
                setCurrentTimeEditorValue(currentTime);
            }
        }
        
        function seekToTime(seconds, useYouTubeTime = false) {
            console.log('嘗試跳轉時間:', { 
                seconds, 
                useYouTubeTime, 
                isLocalVideo,
                isPlayerReady, 
                isVideoLoaded,
                player: !!player,
                localVideo: !!localVideo
            });
            
            if (isLocalVideo) {
                // 本機影片跳轉
                if (!localVideo) {
                    console.error('本機影片未載入');
                    showDeleteNotification(t('msg.loadLocalFirst'), 'error');
                    return;
                }

                try {
                    let targetTime = Math.max(0, seconds);
                    console.log('準備跳轉本機影片到時間:', targetTime);
                    
                    currentTime = targetTime;
                    localVideo.currentTime = targetTime;
                    updateTimeDisplay();
                    highlightCurrentSubtitles(targetTime);
                    
                    // 如果影片暫停，開始播放
                    if (localVideo.paused) {
                        localVideo.play();
                    }
                    
                    showDeleteNotification(t('msg.jumpedTo', formatTime(targetTime)));
                } catch (error) {
                    console.error('本機影片跳轉失敗:', error);
                    showDeleteNotification(t('msg.seekFailed'), 'error');
                }
            } else {
                // YouTube影片跳轉
                if (!player) {
                    console.error('播放器未初始化');
                    showDeleteNotification(t('msg.loadVideoFirst'), 'error');
                    return;
                }

                if (!isPlayerReady) {
                    console.error('播放器未準備就緒');
                    showDeleteNotification(t('msg.playerNotReady'), 'error');
                    return;
                }

                try {
                    let targetTime = Math.max(0, seconds);
                    
                    if (useYouTubeTime && youtubeSubtitles.length > 0) {
                        targetTime = seconds;
                    }
                    
                    console.log('準備跳轉YouTube影片到時間:', targetTime);
                    currentTime = targetTime;
                    updateTimeDisplay();
                    highlightCurrentSubtitles(targetTime);
                    
                    if (typeof player.seekTo !== 'function' || typeof player.playVideo !== 'function') {
                        throw new Error('播放器方法不可用');
                    }

                    player.seekTo(targetTime, true);
                    player.playVideo();
                    
                    isPlaying = true;
                    startTimeTracking();
                    
                    showDeleteNotification(t('msg.jumpedTo', formatTime(targetTime)));
                } catch (error) {
                    console.error('YouTube影片跳轉失敗:', error);
                    showDeleteNotification(t('msg.seekFailed'), 'error');
                }
            }
        }
        

        function handleEnterKey(event, index, element) {
            if (event.key === 'Enter' && !event.isComposing) {
                event.preventDefault();
                element.blur();
            }
        }
        
        function formatSrtTime(seconds) {
            const h = Math.floor(seconds / 3600);
            const m = Math.floor((seconds % 3600) / 60);
            const s = Math.floor(seconds % 60);
            const ms = Math.round((seconds % 1) * 1000);
            return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')},${String(ms).padStart(3,'0')}`;
        }

        function formatVttTime(seconds) {
            return formatSrtTime(seconds).replace(',', '.');
        }

        function buildSubtitleLines(list, getText) {
            if (currentOutputFormat === 'txt') {
                return list.map(s => getText(s)).join('\n');
            }
            const isSrt = currentOutputFormat === 'srt';
            const lines = isSrt ? [] : ['WEBVTT', ''];
            list.forEach((s, i) => {
                const endTime = s.duration ? s.start + s.duration
                    : (list[i + 1] ? list[i + 1].start : s.start + 3);
                const startStr = isSrt ? formatSrtTime(s.start) : formatVttTime(s.start);
                const endStr   = isSrt ? formatSrtTime(endTime)  : formatVttTime(endTime);
                if (isSrt) lines.push(String(i + 1));
                lines.push(`${startStr} --> ${endStr}`);
                lines.push(getText(s));
                lines.push('');
            });
            return lines.join('\n');
        }

        function generateFullOutput() {
            if (!youtubeSubtitles || youtubeSubtitles.length === 0) return '';
            return buildSubtitleLines(youtubeSubtitles, s => s.editedText !== undefined ? s.editedText : s.text);
        }

        function generateOutput() {
            if (showOnlyModified) {
                const modified = youtubeSubtitles.filter(s => s.modified);
                if (modified.length === 0) return '';
                if (showComparison) {
                    return modified.map(s => {
                        const idx = youtubeSubtitles.indexOf(s);
                        const num = idx !== -1 ? idx + 1 : '?';
                        const time = formatTime(s.start);
                        const original = s.text;
                        const corrected = s.editedText !== undefined ? s.editedText : s.text;
                        return `#${num} ${time} | ${original} | ${corrected}`;
                    }).join('\n');
                }
                return buildSubtitleLines(modified, s => s.editedText !== undefined ? s.editedText : s.text);
            }
            return generateFullOutput();
        }

        function updateOutputTextarea() {
            const ta = document.getElementById('subtitleOutput');
            if (ta) ta.value = generateOutput();
        }

        // 雙向同步：下方輸出 textarea 改動回寫至字幕列表
        let _outputSyncTimer = null;
        function onOutputInput() {
            clearTimeout(_outputSyncTimer);
            _outputSyncTimer = setTimeout(syncOutputToList, 400);
        }

        // 解析一行對比格式：`#編號 時間 | 原文 | 修正後`（編號與時間可缺漏或錯誤）
        function parseComparisonLine(line) {
            const pipe1 = line.indexOf(' | ');
            const pipe2 = line.lastIndexOf(' | ');
            if (pipe1 === -1 || pipe2 === pipe1) return null;
            const numMatch = line.substring(0, pipe1).match(/#?(\d+)/);
            return {
                num: numMatch ? parseInt(numMatch[1]) : null,
                original: line.substring(pipe1 + 3, pipe2).trim(),
                corrected: line.substring(pipe2 + 3).trim()
            };
        }

        // 找出對比行對應的字幕 index：編號優先；編號對不上時退回原文搜尋（精確優先，再子字串）
        function findComparisonTarget(entry, matchedIndices) {
            const { num, original } = entry;
            if (num !== null) {
                const byNum = youtubeSubtitles[num - 1];
                if (byNum && original && (byNum.text === original || byNum.text.includes(original))) {
                    return num - 1;
                }
            }
            if (!original) return -1;
            let substringHit = -1;
            for (let i = 0; i < youtubeSubtitles.length; i++) {
                if (matchedIndices.has(i)) continue;
                const text = youtubeSubtitles[i].text;
                if (text === original) return i;
                if (substringHit === -1 && text.includes(original)) substringHit = i;
            }
            return substringHit;
        }

        // 常駐警告面板：逐行列出無法對應的對比行（toast 會消失，使用者來不及看）
        // 預設展開；行數太多時可收合只留標題
        let _unmatchedCollapsed = false;

        function toggleUnmatchedPanel() {
            _unmatchedCollapsed = !_unmatchedCollapsed;
            applyUnmatchedCollapsed();
        }

        function applyUnmatchedCollapsed() {
            const panel = document.getElementById('unmatchedPanel');
            if (!panel) return;
            panel.classList.toggle('collapsed', _unmatchedCollapsed);
            const header = panel.querySelector('.unmatched-panel-header');
            if (header) header.setAttribute('aria-expanded', String(!_unmatchedCollapsed));
        }

        function updateUnmatchedPanel(unmatchedLines) {
            const panel = document.getElementById('unmatchedPanel');
            if (!panel) return;
            if (!unmatchedLines || unmatchedLines.length === 0) {
                panel.style.display = 'none';
                return;
            }
            document.getElementById('unmatchedPanelTitle').textContent = t('output.unmatchedTitle', unmatchedLines.length);
            document.getElementById('unmatchedPanelLines').textContent = unmatchedLines.join('\n');
            panel.style.display = 'block';
            applyUnmatchedCollapsed();
        }

        function syncComparisonToList(value) {
            const lines = value.split('\n').filter(l => l.trim());
            const matchedIndices = new Set();
            let changed = false;
            const unmatchedLines = [];

            for (const line of lines) {
                const entry = parseComparisonLine(line);
                const idx = entry ? findComparisonTarget(entry, matchedIndices) : -1;
                if (idx === -1) { unmatchedLines.push(line); continue; }
                matchedIndices.add(idx);
                const s = youtubeSubtitles[idx];
                // 原文與整句相同就整句替換，否則視為片段替換
                const newText = s.text === entry.original
                    ? entry.corrected
                    : s.text.split(entry.original).join(entry.corrected);
                if (newText !== s.text) {
                    if (s.editedText !== newText) {
                        s.editedText = newText;
                        s.modified = true;
                        changed = true;
                    }
                } else if (s.modified) {
                    delete s.editedText;
                    s.modified = false;
                    changed = true;
                }
            }

            // 已從輸出區刪除的對比行：還原該句修改
            youtubeSubtitles.forEach((s, i) => {
                if (s.modified && !matchedIndices.has(i)) {
                    delete s.editedText;
                    s.modified = false;
                    changed = true;
                }
            });

            if (changed) {
                updateYouTubeSubtitlesDisplay(true);
                debouncedSaveState();
            }
            updateUnmatchedPanel(unmatchedLines);
        }

        function syncOutputToList() {
            if (!youtubeSubtitles || youtubeSubtitles.length === 0) return;
            const ta = document.getElementById('subtitleOutput');
            if (!ta) return;

            // 比對模式：解析 #num time | original | corrected 格式同步（編號優先，原文搜尋退回）
            if (showOnlyModified && showComparison) {
                syncComparisonToList(ta.value);
                return;
            }

            if (showOnlyModified) return; // 非比對的 modified 模式：index 對不上全部字幕，略過同步

            if (currentOutputFormat === 'txt') {
                // TXT：每行對應一條字幕（依 index）
                const lines = ta.value.split('\n');
                if (lines.length !== youtubeSubtitles.length) return;
                let changed = false;
                for (let i = 0; i < lines.length; i++) {
                    const newText = lines[i];
                    const s = youtubeSubtitles[i];
                    if (newText !== s.text) {
                        s.editedText = newText;
                        s.modified = true;
                        changed = true;
                    } else if (s.modified) {
                        delete s.editedText;
                        s.modified = false;
                        changed = true;
                    }
                }
                if (changed) updateYouTubeSubtitlesDisplay(true); // skipOutput=true 避免迴圈
                return;
            }

            const ext = currentOutputFormat === 'vtt' ? 'output.vtt' : 'output.srt';
            const parsed = parseSubtitleFile(ta.value, ext);
            if (!parsed || parsed.length === 0) return;
            // 用 index 對應，避免毫秒精度丟失導致時間戳碰撞時配對錯誤
            if (parsed.length !== youtubeSubtitles.length) return;
            let changed = false;
            for (let i = 0; i < parsed.length; i++) {
                const newText = parsed[i].text;
                const s = youtubeSubtitles[i];
                if (newText !== s.text) {
                    s.editedText = newText;
                    s.modified = true;
                    changed = true;
                } else if (s.modified) {
                    delete s.editedText;
                    s.modified = false;
                    changed = true;
                }
            }
            if (changed) updateYouTubeSubtitlesDisplay(true); // skipOutput=true 避免迴圈
        }

        function switchOutputFormat(format) {
            currentOutputFormat = format;
            ['srt', 'vtt', 'txt'].forEach(f => {
                const btn = document.getElementById(`outputFormat${f.charAt(0).toUpperCase() + f.slice(1)}`);
                if (btn) btn.style.background = f === format ? '#2ecc71' : '';
                if (btn) btn.style.color = f === format ? 'white' : '';
            });
            updateOutputTextarea();
            saveState();
            if (!_appInitializing) gaEvent('switch_output_format', { format });
        }

        function toggleShowOnlyModified() {
            showOnlyModified = document.getElementById('chkOnlyModified').checked;
            const label = document.getElementById('chkComparisonLabel');
            if (label) label.style.display = showOnlyModified ? 'inline-flex' : 'none';
            if (!showOnlyModified) {
                showComparison = false;
                const chk = document.getElementById('chkComparison');
                if (chk) chk.checked = false;
            }
            if (!showComparison) updateUnmatchedPanel([]);
            updateOutputTextarea();
            saveState();
        }

        function toggleShowComparison() {
            showComparison = document.getElementById('chkComparison').checked;
            if (!showComparison) updateUnmatchedPanel([]);
            updateOutputTextarea();
            saveState();
        }

        // --- AI 校正教學 ---
        function initAiTutorialBadge() {
            if (localStorage.getItem(LS_KEYS.aiTutorialSeen)) return;
            const btn = document.getElementById('aiTutorialBtn');
            if (btn) btn.classList.add('is-new');
        }

        // 教學動畫輪播：每幕 5 秒自動播放，點擊指示點可手動切換，hover／按住時暫停
        const AI_DEMO_INTERVAL = 4000;
        let _aiDemoTimer = null;
        let _aiDemoIndex = 0;
        let _aiDemoPlaying = false; // Modal 開啟中（hover 暫停時計時器停但仍視為播放中）

        function aiDemoShow(index) {
            _aiDemoIndex = index;
            document.querySelectorAll('.ai-demo-scene').forEach((el, i) => {
                el.classList.toggle('active', i === index);
            });
            document.querySelectorAll('.ai-demo-dot').forEach((el, i) => {
                el.classList.toggle('active', i === index);
            });
        }

        function aiDemoStartTimer() {
            clearInterval(_aiDemoTimer);
            _aiDemoTimer = setInterval(() => aiDemoShow((_aiDemoIndex + 1) % 3), AI_DEMO_INTERVAL);
        }

        function aiDemoStart() {
            aiDemoShow(0);
            _aiDemoPlaying = true;
            aiDemoStartTimer();
        }

        function aiDemoStop() {
            clearInterval(_aiDemoTimer);
            _aiDemoTimer = null;
            _aiDemoPlaying = false;
        }

        function aiDemoGoTo(index) {
            aiDemoShow(index);
            // 手動切換後重新計時，避免剛點完就被自動播放跳走
            if (_aiDemoTimer) aiDemoStartTimer();
        }

        function aiDemoPause() {
            clearInterval(_aiDemoTimer);
            _aiDemoTimer = null;
        }

        function aiDemoResume() {
            if (_aiDemoPlaying && !_aiDemoTimer) aiDemoStartTimer();
        }

        function initAiDemoHoverPause() {
            const demo = document.getElementById('aiDemo');
            if (!demo) return;
            demo.addEventListener('mouseenter', aiDemoPause);
            demo.addEventListener('mouseleave', aiDemoResume);
            // 觸控裝置沒有 hover：按住暫停、放開繼續
            demo.addEventListener('touchstart', aiDemoPause, { passive: true });
            demo.addEventListener('touchend', aiDemoResume);
            demo.addEventListener('touchcancel', aiDemoResume);
        }

        function openAiTutorial() {
            const overlay = document.getElementById('aiTutorialOverlay');
            if (overlay) overlay.classList.add('open');
            const btn = document.getElementById('aiTutorialBtn');
            if (btn) btn.classList.remove('is-new');
            try { localStorage.setItem(LS_KEYS.aiTutorialSeen, 'true'); } catch (e) {}
            aiDemoStart();
            gaEvent('open_ai_tutorial');
        }

        function closeAiTutorial(event) {
            // 點擊 Modal 內容不關閉，僅點背景或關閉按鈕時關閉
            if (event && event.target !== event.currentTarget) return;
            const overlay = document.getElementById('aiTutorialOverlay');
            if (overlay) overlay.classList.remove('open');
            aiDemoStop();
        }

        function copyAiPrompt() {
            const pre = document.getElementById('aiPromptText');
            if (!pre) return;
            const text = pre.textContent;
            function showCopied() {
                gaEvent('copy_ai_prompt');
                const btn = document.getElementById('aiPromptCopyBtn');
                if (!btn) return;
                btn.textContent = t('ai.promptCopied');
                btn.classList.add('copied');
                setTimeout(() => {
                    btn.textContent = t('ai.promptCopy');
                    btn.classList.remove('copied');
                }, 1500);
            }
            function fallbackCopy() {
                const ta = document.createElement('textarea');
                ta.value = text;
                ta.style.cssText = 'position:fixed;opacity:0;pointer-events:none';
                document.body.appendChild(ta);
                ta.select();
                try { document.execCommand('copy'); showCopied(); }
                catch (e) { showDeleteNotification(t('msg.copyFailed'), 'error'); }
                document.body.removeChild(ta);
            }
            if (navigator.clipboard && window.isSecureContext) {
                navigator.clipboard.writeText(text).then(showCopied).catch(fallbackCopy);
            } else {
                fallbackCopy();
            }
        }

        document.addEventListener('keydown', (e) => {
            if (e.key !== 'Escape') return;
            const overlay = document.getElementById('aiTutorialOverlay');
            if (overlay && overlay.classList.contains('open')) {
                overlay.classList.remove('open');
                aiDemoStop();
            }
        });

        document.addEventListener('DOMContentLoaded', () => {
            initAiTutorialBadge();
            initAiDemoHoverPause();
        });

        function copyOutput() {
            const text = document.getElementById('subtitleOutput').value;
            if (!text) {
                showDeleteNotification(t('msg.noCopy'), 'error');
                return;
            }
            function showCopied() {
                gaEvent('copy_output');
                const btn = document.getElementById('copyOutputBtn');
                if (!btn) return;
                btn.textContent = t('msg.copied');
                btn.classList.add('copied');
                setTimeout(() => {
                    btn.textContent = t('msg.copyBtn');
                    btn.classList.remove('copied');
                }, 1500);
            }
            function fallbackCopy() {
                const ta = document.createElement('textarea');
                ta.value = text;
                ta.style.cssText = 'position:fixed;opacity:0;pointer-events:none';
                document.body.appendChild(ta);
                ta.select();
                ta.setSelectionRange(0, ta.value.length);
                try { document.execCommand('copy'); showCopied(); }
                catch (e) { showDeleteNotification(t('msg.copyFailed'), 'error'); }
                document.body.removeChild(ta);
            }
            if (navigator.clipboard && window.isSecureContext) {
                navigator.clipboard.writeText(text).then(showCopied).catch(fallbackCopy);
            } else {
                fallbackCopy();
            }
        }

        function downloadOutput() {
            if (!youtubeSubtitles?.length) {
                showDeleteNotification(t('msg.noDownload'), 'error');
                return;
            }
            const content = generateFullOutput();
            const ext = currentOutputFormat;
            const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            const baseName = (currentFileName || 'corrected_subtitles').replace(/[/\\?%*:|"<>]/g, '-');
            a.download = `${baseName}.${ext}`;
            a.click();
            URL.revokeObjectURL(url);
            gaEvent('download_output', { format: ext });
            showDeleteNotification(t('msg.downloaded', ext));
        }

        function showMessage(text, type) {
            const container = document.getElementById('messages');
            const message = document.createElement('div');
            message.className = type === 'error' ? 'error-message' : 'success-message';
            message.textContent = text;
            
            container.innerHTML = '';
            container.appendChild(message);
            
            setTimeout(() => {
                if (message.parentNode) {
                    message.remove();
                }
            }, 3000);
        }
        
        function showDeleteNotification(text, type = 'success') {
            const notification = document.getElementById('deleteNotification');
            notification.textContent = text;
            notification.className = 'delete-notification show';
            
            if (type === 'error') {
                notification.classList.add('error');
            } else {
                notification.classList.remove('error');
            }
            
            setTimeout(() => {
                notification.classList.remove('show');
            }, 2000);
        }
        
        let subtitleSyncInterval = null;
        
        function startSubtitleSync() {
            console.log('開始字幕同步...');
            if (subtitleSyncInterval) {
                clearInterval(subtitleSyncInterval);
            }
            
            subtitleSyncInterval = setInterval(() => {
                let currentPlayerTime = 0;
                
                if (isLocalVideo) {
                    if (!localVideo || !isVideoLoaded) return;
                    currentPlayerTime = localVideo.currentTime;
                    isPlaying = !localVideo.paused && !localVideo.ended;
                } else {
                    // 不依賴 isPlayerReady：onReady 握手偶爾遺失，只要 player 可取得時間就同步
                    if (!player || typeof player.getCurrentTime !== 'function') return;
                    try {
                        currentPlayerTime = player.getCurrentTime();
                        if (!Number.isFinite(currentPlayerTime)) return;
                        if (!isPlayerReady) {
                            isPlayerReady = true;
                            isVideoLoaded = true;
                        }
                        if (typeof player.getPlayerState === 'function' && window.YT?.PlayerState) {
                            isPlaying = player.getPlayerState() === YT.PlayerState.PLAYING;
                        }
                    } catch (error) {
                        console.warn('獲取YouTube播放時間失敗:', error);
                        return;
                    }
                }
                
                if (currentPlayerTime >= 0) {
                    console.log('當前播放時間:', currentPlayerTime);
                    updateCurrentTime(currentPlayerTime);
                    highlightCurrentSubtitles(currentPlayerTime);
                }
            }, 500); // 每500毫秒檢查一次
        }
        
        function stopSubtitleSync(clearHighlights = false) {
            if (subtitleSyncInterval) {
                clearInterval(subtitleSyncInterval);
                subtitleSyncInterval = null;
            }
            if (clearHighlights) {
                clearAllHighlights();
            }
        }
        
        function updateCurrentTime(playerTime) {
            currentTime = playerTime;
            updateTimeDisplay();
        }
        
        function highlightCurrentSubtitles(currentPlayerTime) {
            // 找到當前時間對應的字幕
            let currentSubtitle = null;
            if (youtubeSubtitles && youtubeSubtitles.length > 0) {
                for (let i = 0; i < youtubeSubtitles.length; i++) {
                    const subtitle = youtubeSubtitles[i];
                    const nextSubtitle = youtubeSubtitles[i + 1];
                    const startTime = subtitle.start;
                    const endTime = nextSubtitle ? nextSubtitle.start : startTime + 5;
                    
                    if (currentPlayerTime >= startTime && currentPlayerTime < endTime) {
                        currentSubtitle = subtitle;
                        break;
                    }
                }
            }
            
            // 更新字幕覆蓋層文字
            const overlayText = document.getElementById('subtitleOverlayText');
            if (currentSubtitle) {
                overlayText.textContent = currentSubtitle.text;
                overlayText.style.display = 'inline-block';
            } else {
                overlayText.style.display = 'none';
            }
            
            highlightYouTubeSubtitle(currentPlayerTime);
        }

        function highlightYouTubeSubtitle(currentPlayerTime) {
            if (!youtubeSubtitles || youtubeSubtitles.length === 0) {
                return;
            }
            
            const targetIndex = findActiveSubtitleIndex(youtubeSubtitles, currentPlayerTime, 'start', 5);
            
            console.log('YouTube字幕高亮檢查:', {
                currentTime: currentPlayerTime,
                targetIndex,
                currentHighlighted: currentHighlightedYouTube
            });
            
            if (targetIndex === -1) {
                clearYouTubeHighlight();
                return;
            }
            
            // 只有當找到新的字幕且與當前高亮不同時，才切換高亮
            const panel = document.getElementById('youtubeSubtitlesPanel');
            const item = panel?.querySelector(`.youtube-subtitle-item[data-index="${targetIndex}"]`);
            if (!item) {
                return;
            }

            if (targetIndex !== currentHighlightedYouTube || !item.classList.contains('current-playing')) {
                // 清除舊的高亮
                clearYouTubeHighlight(false);
                
                // 設置新的高亮
                currentHighlightedYouTube = targetIndex;
                item.classList.add('current-playing');
                console.log('設置新的YouTube字幕高亮:', targetIndex);

                // 確保元素在視圖中可見（切換篩選 tab 時不自動捲動，保留原位置）
                if (!suppressHighlightAutoScroll) {
                    scrollToElement(item, 'youtubeSubtitlesPanel');
                }
            }
        }
        
        function findActiveSubtitleIndex(subtitles, currentPlayerTime, timeKey, fallbackDuration, durationKey = null) {
            const EPS = 0.001;
            let i = 0;
            while (i < subtitles.length) {
                const startTime = Number(subtitles[i][timeKey]);
                if (!Number.isFinite(startTime)) { i++; continue; }

                // 收集起始時間相同的群組（player 擷取的字幕常出現重複時間戳）
                let j = i;
                while (j + 1 < subtitles.length) {
                    const tiedStart = Number(subtitles[j + 1][timeKey]);
                    if (!Number.isFinite(tiedStart) || Math.abs(tiedStart - startTime) > EPS) break;
                    j++;
                }

                const nextStartTime = j < subtitles.length - 1 ? Number(subtitles[j + 1][timeKey]) : NaN;
                const ownDuration = durationKey ? Number(subtitles[j][durationKey]) : NaN;
                const endTime = Number.isFinite(ownDuration) && ownDuration > 0
                    ? startTime + Math.max(ownDuration, 0.25)
                    : Number.isFinite(nextStartTime) && nextStartTime > startTime
                    ? nextStartTime
                    : startTime + fallbackDuration;

                if (currentPlayerTime >= startTime && currentPlayerTime < endTime) {
                    const groupSize = j - i + 1;
                    if (groupSize === 1) return i;
                    // 重複時間戳：把區間均分，讓高亮依序輪到群組內每一句，不卡住也不跳過
                    const slice = (endTime - startTime) / groupSize;
                    const offset = Math.min(groupSize - 1, Math.floor((currentPlayerTime - startTime) / slice));
                    return i + offset;
                }
                i = j + 1;
            }

            return -1;
        }
        
        function clearYouTubeHighlight(resetIndex = true) {
            document.querySelectorAll('.youtube-subtitle-item.current-playing')
                .forEach(item => item.classList.remove('current-playing'));
            if (resetIndex) {
                currentHighlightedYouTube = -1;
            }
        }
        
        function scrollToElement(element, containerId) {
            const container = document.getElementById(containerId);
            if (container && element) {
                const containerRect = container.getBoundingClientRect();
                const elementRect = element.getBoundingClientRect();
                const isMobile = window.matchMedia('(max-width: 768px)').matches;
                
                // 計算是否需要滾動：超出視野，或已進入容器底部三列範圍（提前回中）
                const bottomThreshold = containerRect.bottom - element.clientHeight * 3;
                const isComfortablyVisible = elementRect.top >= containerRect.top &&
                                elementRect.bottom <= bottomThreshold;

                if (!isComfortablyVisible || isMobile) {
                    const anchorOffset = isMobile
                        ? element.clientHeight
                        : (container.clientHeight / 2) - (element.clientHeight / 2);
                    const scrollTop = element.offsetTop - container.offsetTop - anchorOffset;
                    
                    container.scrollTo({
                        top: Math.max(0, scrollTop),
                        behavior: 'smooth'
                    });
                }
            }
        }
        
        function clearAllHighlights() {
            document.querySelectorAll('.youtube-subtitle-item.current-playing')
                .forEach(item => item.classList.remove('current-playing'));
            currentHighlightedYouTube = -1;
        }
        
        // 可拖曳分隔線
        function initPanelDivider() {
            const divider = document.getElementById('panelDivider');
            const wrapper = document.getElementById('contentWrapper');
            if (!divider || !wrapper) return;

            let dragging = false;
            let startX = 0;
            let startCols = null;

            divider.addEventListener('mousedown', function(e) {
                e.preventDefault();
                dragging = true;
                startX = e.clientX;
                divider.classList.add('dragging');
                const style = window.getComputedStyle(wrapper);
                startCols = style.gridTemplateColumns; // e.g. "600px 4px 400px"
                document.body.style.cursor = 'col-resize';
                document.body.style.userSelect = 'none';
            });

            document.addEventListener('mousemove', function(e) {
                if (!dragging) return;
                const delta = e.clientX - startX;
                const parts = startCols.split(' ');
                const leftPx = parseFloat(parts[0]) + delta;
                const rightPx = parseFloat(parts[2]) - delta;
                if (leftPx < 200 || rightPx < 200) return;
                wrapper.style.gridTemplateColumns = `${leftPx}px 4px ${rightPx}px`;
            });

            document.addEventListener('mouseup', function() {
                if (!dragging) return;
                dragging = false;
                divider.classList.remove('dragging');
                document.body.style.cursor = '';
                document.body.style.userSelect = '';
                saveState();
            });
        }

        // 上下可拖曳分隔線（調整輸出區高度）
        function initVerticalDivider() {
            const divider = document.getElementById('verticalDivider');
            const wrapper = document.getElementById('contentWrapper');
            if (!divider || !wrapper) return;

            let dragging = false;
            let startY = 0;
            let startHeight = 0;

            divider.addEventListener('mousedown', function(e) {
                e.preventDefault();
                dragging = true;
                startY = e.clientY;
                startHeight = wrapper.getBoundingClientRect().height;
                divider.classList.add('dragging');
                document.body.style.cursor = 'row-resize';
                document.body.style.userSelect = 'none';
            });

            document.addEventListener('mousemove', function(e) {
                if (!dragging) return;
                const delta = startY - e.clientY; // 往上拖 → delta 正值 → content-wrapper 縮小
                const header = document.querySelector('.header');
                const headerH = header ? header.offsetHeight : 58;
                const maxH = window.innerHeight - headerH;
                const minH = maxH * 0.5;
                const clampedHeight = Math.min(Math.max(startHeight - delta, minH), maxH);
                wrapper.style.height = `${clampedHeight}px`;
                // 上方面板縮小時，左右比例趨近 1:1
                const fraction = (maxH - clampedHeight) / (maxH - minH);
                const leftFr = 2.3 - 1.3 * fraction;
                wrapper.style.gridTemplateColumns = `${leftFr}fr 4px 1fr`;
            });

            document.addEventListener('mouseup', function() {
                if (!dragging) return;
                dragging = false;
                divider.classList.remove('dragging');
                document.body.style.cursor = '';
                document.body.style.userSelect = '';
                saveState();
            });
        }

        // 初始化頁面時設置鍵盤事件監聽
        window.addEventListener('i18n:change', function() {
            gaEvent('change_language', { lang: document.documentElement.lang });
            updateYouTubeSubtitlesDisplay(true);
            updatePlayToggleBtn();
            refreshShortcutHints();
        });

        // 整列（Play 按鈕左側、含時間 Label 右側空白）點擊即聚焦該列的可編輯文字
        function initSubtitleRowClickToEdit() {
            const panel = document.getElementById('youtubeSubtitlesPanel');
            if (!panel) return;

            panel.addEventListener('click', function(e) {
                if (e.target.closest('.subtitle-seek-zone')) return;
                const ce = e.target.closest('[contenteditable="true"]');
                if (ce) {
                    if (document.activeElement !== ce) ce.focus();
                    return;
                }

                // 拖曳選取文字後放開也會觸發 click，這時不可把游標移走，否則選取會被清掉
                const currentSelection = window.getSelection();
                if (currentSelection && !currentSelection.isCollapsed) return;

                const item = e.target.closest('.youtube-subtitle-item');
                if (!item) return;

                // 已修改 tab：點輸入框以外的任何區域直接播放該句
                if (subtitlePanelFilter === 'modified') {
                    const sub = youtubeSubtitles[Number(item.dataset.index)];
                    if (sub) seekToTime(sub.start);
                    return;
                }

                const editable = item.querySelector('.youtube-subtitle-text');
                if (!editable) return;

                editable.focus();
                // 游標移到文字末端
                const range = document.createRange();
                range.selectNodeContents(editable);
                range.collapse(false);
                const selection = window.getSelection();
                selection.removeAllRanges();
                selection.addRange(range);
            });
        }

        // ===== 可自訂快捷鍵 =====

        function loadKeyBindings() {
            try {
                const saved = JSON.parse(localStorage.getItem(LS_KEYS.keyBindings) || '{}');
                Object.keys(DEFAULT_KEY_BINDINGS).forEach(name => {
                    if (typeof saved[name] === 'string' && saved[name]) keyBindings[name] = saved[name];
                });
                directKeysWhileEditing = saved.directEditing === true;
            } catch (e) {}
        }

        function saveKeyBindings() {
            localStorage.setItem(LS_KEYS.keyBindings,
                JSON.stringify({ ...keyBindings, directEditing: directKeysWhileEditing }));
        }

        function getBindingAction(code) {
            if (code === keyBindings.speedDown) return () => changeSpeed(-1);
            if (code === keyBindings.speedUp) return () => changeSpeed(1);
            if (code === keyBindings.prevSub) return () => jumpToSubtitle(-1);
            if (code === keyBindings.nextSub) return () => jumpToSubtitle(1);
            return null;
        }

        // e.code → 顯示用符號
        function codeToLabel(code) {
            const special = {
                BracketLeft: '[', BracketRight: ']', Comma: ',', Period: '.', Slash: '/',
                Semicolon: ';', Quote: "'", Backquote: '`', Minus: '-', Equal: '=', Backslash: '\\',
                ArrowUp: '↑', ArrowDown: '↓', ArrowLeft: '←', ArrowRight: '→', Space: 'Space'
            };
            if (special[code]) return special[code];
            if (code.startsWith('Key')) return code.slice(3);
            if (code.startsWith('Digit')) return code.slice(5);
            if (code.startsWith('Numpad')) return `Num ${code.slice(6)}`;
            return code;
        }

        // 依目前綁定與編輯模式，更新 header 提示與設定面板按鈕文字
        function refreshShortcutHints() {
            const prefix = hintEditingMode && !directKeysWhileEditing ? 'Alt + ' : '';
            const jumpKbds = document.querySelectorAll('#jumpHint kbd');
            if (jumpKbds.length >= 2) {
                jumpKbds[0].textContent = prefix + codeToLabel(keyBindings.prevSub);
                jumpKbds[1].textContent = prefix + codeToLabel(keyBindings.nextSub);
            }
            const speedKbds = document.querySelectorAll('#speedHint kbd');
            if (speedKbds.length >= 2) {
                speedKbds[0].textContent = prefix + codeToLabel(keyBindings.speedDown);
                speedKbds[1].textContent = prefix + codeToLabel(keyBindings.speedUp);
            }
            Object.keys(DEFAULT_KEY_BINDINGS).forEach(name => {
                const cap = `${name.charAt(0).toUpperCase()}${name.slice(1)}`;
                const btn = document.getElementById(`bind${cap}`);
                if (btn) {
                    btn.textContent = capturingBinding === name ? t('keys.pressKey') : codeToLabel(keyBindings[name]);
                    btn.classList.toggle('capturing', capturingBinding === name);
                }
                // 改過的按鍵才顯示 Undo icon
                const undo = document.getElementById(`undo${cap}`);
                if (undo) undo.classList.toggle('visible', keyBindings[name] !== DEFAULT_KEY_BINDINGS[name]);
            });
            updateDirectEditingUI();
        }

        function toggleDirectEditing(checked) {
            directKeysWhileEditing = checked;
            saveKeyBindings();
            refreshShortcutHints();
        }

        // 同步 checkbox 狀態與回饋文字（清楚說明按下後會不會輸入字元）
        function updateDirectEditingUI() {
            const toggle = document.getElementById('directEditingToggle');
            if (toggle) toggle.checked = directKeysWhileEditing;
            const note = document.getElementById('directEditingNote');
            if (note) {
                note.textContent = directKeysWhileEditing
                    ? t('keys.directOnNote')
                    : t('keys.directOffNote');
                note.classList.toggle('on', directKeysWhileEditing);
            }
        }

        // 焦點在文字編輯處時，提示改顯示 Alt 組合
        function initShortcutHintModeSwitch() {
            function isEditingTarget(el) {
                return el && (el.tagName === 'TEXTAREA' || el.tagName === 'INPUT'
                    || el.closest?.('[contenteditable="true"]'));
            }
            // 只有字幕列表內的 contenteditable（非 URL input / textarea）才切換 Alt 提示
            function isSubtitleEditingTarget(el) {
                return el && el.closest?.('[contenteditable="true"]')
                    && el.closest?.('#subtitleDisplayPanel, .subtitle-display-panel');
            }
            document.addEventListener('focusin', e => {
                if (isSubtitleEditingTarget(e.target)) { hintEditingMode = true; refreshShortcutHints(); }
            });
            document.addEventListener('focusout', e => {
                if (isSubtitleEditingTarget(e.target)) { hintEditingMode = false; refreshShortcutHints(); }
            });
        }

        function toggleKeySettings() {
            const wrap = document.getElementById('keySettings');
            if (wrap) wrap.classList.toggle('open');
            if (capturingBinding) { capturingBinding = null; refreshShortcutHints(); }
            setKeySettingsMsg('');
        }

        function startKeyCapture(name) {
            // 擷取中再點同一顆按鈕 → 取消擷取並回復該鍵預設
            if (capturingBinding === name) {
                resetKeyBinding(name);
                return;
            }
            capturingBinding = name;
            setKeySettingsMsg('');
            refreshShortcutHints();
        }

        // 單一按鍵回復預設（各列的 Undo icon）
        function resetKeyBinding(name) {
            if (!(name in DEFAULT_KEY_BINDINGS)) return;
            keyBindings[name] = DEFAULT_KEY_BINDINGS[name];
            if (capturingBinding === name) capturingBinding = null;
            saveKeyBindings();
            setKeySettingsMsg('');
            refreshShortcutHints();
        }

        function setKeySettingsMsg(msg) {
            const el = document.getElementById('keySettingsMsg');
            if (el) el.textContent = msg;
        }

        // 回傳 true 表示此 keydown 已被「按鍵擷取」流程消化
        function handleKeyCapture(e) {
            if (!capturingBinding) return false;
            e.preventDefault();
            e.stopPropagation();

            const code = e.code;
            if (/^(Alt|Shift|Control|Meta)/.test(code)) return true; // 等待非修飾鍵
            if (code === 'Escape') {
                capturingBinding = null;
                refreshShortcutHints();
                return true;
            }
            if (RESERVED_KEY_CODES.includes(code)) {
                setKeySettingsMsg(t('keys.reserved', codeToLabel(code)));
                return true;
            }
            const conflict = Object.keys(keyBindings)
                .find(n => n !== capturingBinding && keyBindings[n] === code);
            if (conflict) {
                setKeySettingsMsg(t('keys.conflict', codeToLabel(code)));
                return true;
            }
            gaEvent('customize_keybinding', { key: capturingBinding });
            keyBindings[capturingBinding] = code;
            capturingBinding = null;
            saveKeyBindings();
            setKeySettingsMsg('');
            refreshShortcutHints();
            return true;
        }

        function initKeySettings() {
            loadKeyBindings();
            refreshShortcutHints();
            // 點擊面板外側關閉
            document.addEventListener('click', function(e) {
                const wrap = document.getElementById('keySettings');
                if (wrap && wrap.classList.contains('open') && !wrap.contains(e.target)) {
                    wrap.classList.remove('open');
                    capturingBinding = null;
                    refreshShortcutHints();
                }
            });
        }

        // 點擊 YouTube iframe 後，鍵盤焦點會被 iframe 吃掉；
        // 偵測到 window blur 且 activeElement 是 iframe 時，立即把焦點還給 window，
        // 讓自訂快捷鍵（上下句、速率）持續可用。
        window.addEventListener('blur', function() {
            if (document.activeElement === document.getElementById('youtubeIframe')) {
                requestAnimationFrame(function() { window.focus(); });
            }
        });

        document.addEventListener('DOMContentLoaded', function() {
            // 初始化影片載入選擇器
            initVideoLoadSelector();
            // 初始化可拖曳分隔線
            initPanelDivider();
            // 初始化上下分隔線
            initVerticalDivider();
            // 初始化可編輯時間
            initCurrentTimeEditor();
            // 整列點擊即進入編輯
            initSubtitleRowClickToEdit();
            // 速率滑桿
            initSpeedSlider();
            // 編輯模式時動態切換快捷鍵提示
            initShortcutHintModeSwitch();
            // 自訂快捷鍵
            initKeySettings();
            // 還原 localStorage 狀態
            loadState();
            _appInitializing = false;

            // GA：頁尾連結點擊
            const sponsorBtn = document.querySelector('.footer-btn-sponsor');
            if (sponsorBtn) sponsorBtn.addEventListener('click', () => gaEvent('sponsor_click'));
            const contactBtn = document.querySelector('.footer-btn-contact');
            if (contactBtn) contactBtn.addEventListener('click', () => gaEvent('contact_click'));
            
            // 添加鍵盤控制
            document.addEventListener('keydown', function(e) {
                // 自訂快捷鍵擷取模式優先
                if (handleKeyCapture(e)) return;

                // Alt+綁定鍵：編輯文字時也能操作且不輸入字元
                if (e.altKey && !e.ctrlKey && !e.metaKey) {
                    const altAction = getBindingAction(e.code);
                    if (altAction) {
                        e.preventDefault();
                        altAction();
                        return;
                    }
                }

                // 如果正在輸入文字，不處理鍵盤控制
                if (e.target.tagName === 'TEXTAREA' ||
                    e.target.tagName === 'INPUT' ||
                    e.target.contentEditable === 'true' ||
                    e.target.closest('[contenteditable="true"]')) {
                    // 使用者啟用「編輯時不需 Alt」：直接觸發功能且不輸入字元
                    if (directKeysWhileEditing && !e.ctrlKey && !e.metaKey) {
                        const directAction = getBindingAction(e.code);
                        if (directAction) {
                            e.preventDefault();
                            directAction();
                        }
                    }
                    return;
                }

                const action = getBindingAction(e.code);
                if (action) {
                    e.preventDefault();
                    action();
                    return;
                }

                switch(e.key) {
                    case ' ': // 空格鍵
                        e.preventDefault();
                        controlVideo('toggle');
                        break;
                    case 'ArrowLeft': // 左方向鍵
                        e.preventDefault();
                        controlVideo('back');
                        break;
                    case 'ArrowRight': // 右方向鍵
                        e.preventDefault();
                        controlVideo('forward');
                        break;
                }
            });
            
            // 拖曳影片至頁面任意位置
            document.addEventListener('dragover', function(e) {
                if ([...e.dataTransfer.types].includes('Files')) {
                    e.preventDefault();
                    document.getElementById('dragOverlay').classList.add('active');
                    document.body.classList.add('yte-dragging');
                }
            });
            document.addEventListener('dragleave', function(e) {
                if (e.relatedTarget === null) {
                    document.getElementById('dragOverlay').classList.remove('active');
                    document.body.classList.remove('yte-dragging');
                }
            });
            document.addEventListener('drop', function(e) {
                document.getElementById('dragOverlay').classList.remove('active');
                document.body.classList.remove('yte-dragging');
                const files = e.dataTransfer.files;
                if (!files || files.length === 0) return;
                const file = files[0];
                const name = file.name.toLowerCase();
                if (file.type.startsWith('video/') || file.type.startsWith('audio/')) {
                    e.preventDefault();
                    if (!document.getElementById('localVideoBtn').classList.contains('active')) {
                        document.getElementById('localVideoBtn').click();
                    }
                    loadLocalVideoFromFile(file, document.getElementById('loadLocalVideoBtn'));
                } else if (name.endsWith('.srt') || name.endsWith('.vtt')) {
                    e.preventDefault();
                    loadSubtitleFromFile(file);
                }
            });

            // 點選選檔後同步更新檔名顯示
            document.getElementById('localVideoFile').addEventListener('change', function() {
                if (this.files && this.files[0]) {
                    const display = document.getElementById('fileNameDisplay');
                    const zone = document.getElementById('fileDropZone');
                    if (display) display.textContent = this.files[0].name;
                    if (zone) zone.classList.add('has-file');
                }
            });

            console.log('頁面初始化完成，事件監聽器已設定');
        });
        
        // 處理字幕檔案上傳
        function loadSubtitleFromFile(file) {
            const name = file.name.toLowerCase();
            if (!name.endsWith('.srt') && !name.endsWith('.vtt')) {
                showDeleteNotification(t('msg.unsupportedFormat'), 'error');
                return;
            }
            if (hasModifiedSubtitles() && !confirm(t('msg.overwriteConfirm'))) {
                return;
            }
            const reader = new FileReader();
            reader.onload = function(e) {
                const content = e.target.result;
                try {
                    const subtitles = parseSubtitleFile(content, file.name);
                    if (subtitles && subtitles.length > 0) {
                        youtubeSubtitles = subtitles;
                        updateYouTubeSubtitlesDisplay();
                        if (isLocalVideo && isVideoLoaded && localVideo) {
                            document.getElementById('subtitleOverlay').style.display = 'block';
                            highlightCurrentSubtitles(localVideo.currentTime);
                        }
                        showDeleteNotification(t('msg.subtitlesLoaded', subtitles.length), 'success');
                        gaEvent('upload_subtitle', { format: name.endsWith('.vtt') ? 'vtt' : 'srt' });
                        saveState();
                    } else {
                        throw new Error('無法解析字幕內容');
                    }
                } catch (error) {
                    console.error('解析字幕檔案失敗:', error);
                    showDeleteNotification(t('msg.parseSubtitleFailed', error.message), 'error');
                }
            };
            reader.onerror = function() {
                showDeleteNotification(t('msg.readFileFailed'), 'error');
            };
            reader.readAsText(file);
        }

        document.getElementById('subtitleFileInput').addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (!file) return;
            loadSubtitleFromFile(file);
            // 清空以便取消覆蓋後仍可重選同一檔案
            e.target.value = '';
        });

        // 新增：解析字幕檔案
        function parseSubtitleFile(content, filename) {
            const lines = content.split('\n');
            const subtitles = [];
            let currentSubtitle = null;
            let isVTT = filename.toLowerCase().endsWith('.vtt');
            let isSRT = filename.toLowerCase().endsWith('.srt');
            
            // 移除 BOM 和空行
            const cleanLines = lines.map(line => line.trim()).filter(line => line);
            
            if (isVTT) {
                // 處理 VTT 格式
                for (let i = 0; i < cleanLines.length; i++) {
                    const line = cleanLines[i];
                    if (line.includes('-->')) {
                        const timeMatch = line.match(/(\d{2}):(\d{2}):(\d{2})\.(\d{3})/);
                        if (timeMatch) {
                            const hours = parseInt(timeMatch[1]);
                            const minutes = parseInt(timeMatch[2]);
                            const seconds = parseInt(timeMatch[3]);
                            const startTime = hours * 3600 + minutes * 60 + seconds;
                            
                            currentSubtitle = {
                                start: startTime,
                                text: ''
                            };
                        }
                    } else if (currentSubtitle && line && !line.includes('WEBVTT')) {
                        currentSubtitle.text += line + ' ';
                    }
                    
                    if (currentSubtitle && (i === cleanLines.length - 1 || cleanLines[i + 1].includes('-->'))) {
                        if (currentSubtitle.text) {
                            currentSubtitle.text = currentSubtitle.text.trim();
                            subtitles.push(currentSubtitle);
                            currentSubtitle = null;
                        }
                    }
                }
            } else if (isSRT) {
                // 處理 SRT 格式
                for (let i = 0; i < cleanLines.length; i++) {
                    const line = cleanLines[i];
                    if (line.includes('-->')) {
                        const timeMatch = line.match(/(\d{2}):(\d{2}):(\d{2}),(\d{3})/);
                        if (timeMatch) {
                            const hours = parseInt(timeMatch[1]);
                            const minutes = parseInt(timeMatch[2]);
                            const seconds = parseInt(timeMatch[3]);
                            const startTime = hours * 3600 + minutes * 60 + seconds;
                            
                            currentSubtitle = {
                                start: startTime,
                                text: ''
                            };
                        }
                    } else if (currentSubtitle && line && !/^\d+$/.test(line)) {
                        currentSubtitle.text += line + ' ';
                    }
                    
                    if (currentSubtitle && (i === cleanLines.length - 1 || /^\d+$/.test(cleanLines[i + 1]))) {
                        if (currentSubtitle.text) {
                            currentSubtitle.text = currentSubtitle.text.trim();
                            subtitles.push(currentSubtitle);
                            currentSubtitle = null;
                        }
                    }
                }
            }

            // 按時間排序
            subtitles.sort((a, b) => a.start - b.start);
            return subtitles;
        }
