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
            dividerCols:      'yte_dividerCols'
        };

        let _saveStateTimer = null;
        function debouncedSaveState() {
            clearTimeout(_saveStateTimer);
            _saveStateTimer = setTimeout(saveState, 600);
        }

        function saveState() {
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
            } catch (e) {
                console.warn('localStorage 儲存失敗:', e);
            }
        }

        function loadState() {
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
                        if (display) display.textContent = `${savedFileName}（請重新選取）`;
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
                if (savedDividerCols) {
                    const wrapper = document.getElementById('contentWrapper');
                    if (wrapper) wrapper.style.gridTemplateColumns = savedDividerCols;
                }
                if (savedSubtitles) {
                    const parsed = JSON.parse(savedSubtitles);
                    if (Array.isArray(parsed) && parsed.length > 0) {
                        youtubeSubtitles = parsed;
                        updateYouTubeSubtitlesDisplay();
                        const msg = isLocalVideo && currentFileName
                            ? `✅ 已還原 ${parsed.length} 條字幕，請重新選取影片：${currentFileName}`
                            : `✅ 已還原上次編輯（${parsed.length} 條字幕）`;
                        showDeleteNotification(msg, 'success');
                    }
                } else if (isLocalVideo && currentFileName) {
                    showDeleteNotification(`⚠️ 上次的影片：${currentFileName}，請重新選取`, 'error');
                }
            } catch (e) {
                console.warn('載入 localStorage 失敗:', e);
            }
        }

        function resetPage() {
            if (!confirm('確定要重置頁面嗎？所有未下載的修改將會遺失。')) return;
            try { Object.values(LS_KEYS).forEach(k => localStorage.removeItem(k)); } catch (e) {}
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
        let youtubeSubtitles = [];
        let player = null;
        let isPlayerReady = false;
        let currentHighlightedYouTube = -1;
        let isLocalVideo = false; // 是否為本機影片
        let localVideo = null; // 本機影片元素
        let currentFileName = ''; // 下載時的檔名（YouTube 標題或本機檔名）
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

        async function loadVideo(skipSubtitleFetch = false) {
            if (isLocalVideo) {
                loadLocalVideo();
                return;
            }

            const url = document.getElementById('youtubeUrl').value.trim();
            const videoId = extractVideoId(url);
            const loadBtn = document.getElementById('loadVideoBtn');

            if (!videoId) {
                showMessage('請輸入有效的YouTube網址', 'error');
                return;
            }

            // 僅在非自動重載時清除字幕（自動重載時保留已儲存的編輯）
            if (!skipSubtitleFetch) {
                youtubeSubtitles = [];
                updateOutputTextarea();
            }

            loadBtn.textContent = '載入中...';
            loadBtn.disabled = true;
            
            updateProgress(25, '正在載入影片...');
            
            try {
                isPlayerReady = false;
                isVideoLoaded = false;
                captionsFetched = false;
                currentVideoId = videoId;
                
                // 設置 iframe（確保 iframe 可見、本機影片隱藏）
                const iframe = document.getElementById('youtubeIframe');
                iframe.style.display = '';
                if (localVideo) { localVideo.style.display = 'none'; }
                const embedUrl = `https://www.youtube.com/embed/${videoId}?enablejsapi=1&rel=0&modestbranding=1&origin=${encodeURIComponent(window.location.origin)}`;
                iframe.src = embedUrl;
                
                // 等待 iframe 載入
                await new Promise((resolve, reject) => {
                    iframe.onload = resolve;
                    iframe.onerror = reject;
                });
                
                updateProgress(50, '設定影片參數...');
                
                // 創建播放器
                player = new YT.Player('youtubeIframe', {
                    events: {
                        'onReady': onPlayerReady,
                        'onStateChange': onPlayerStateChange,
                        'onError': onPlayerError,
                        'onApiChange': onApiChange
                    }
                });
                
                // 獲取字幕（自動重載且已有儲存字幕時略過）
                if (skipSubtitleFetch) {
                    updateProgress(75, '使用已儲存的字幕');
                } else {
                    try {
                        await fetchYouTubeSubtitles(videoId);
                        updateProgress(75, '字幕載入完成');
                    } catch (error) {
                        console.warn('獲取字幕失敗:', error);
                        showDeleteNotification('無法獲取字幕，但影片仍可播放', 'error');
                    }
                }
                
                // 顯示影片容器和控制項
                document.getElementById('videoContainer').style.display = 'block';
                document.getElementById('videoControls').style.display = 'flex';
                
                updateProgress(100, '影片載入完成！');
                
                loadBtn.textContent = '重新載入';
                loadBtn.disabled = false;
                
                showStatus('影片載入成功！現在可以點擊字幕進行跳轉。', 'success');
                saveState();
                
                if (timeInterval) {
                    clearInterval(timeInterval);
                    timeInterval = null;
                }
                
                updateTimeDisplay();
                
            } catch (error) {
                console.error('載入影片錯誤:', error);
                loadBtn.textContent = '載入影片';
                loadBtn.disabled = false;
                showMessage('載入影片時發生錯誤，請重試', 'error');
                document.getElementById('progressContainer').style.display = 'none';
            }
        }
        
        // 載入本機影片（核心邏輯，支援按鈕與拖曳兩種入口）
        function loadLocalVideoFromFile(file, loadBtn) {
            if (!file || (!file.type.startsWith('video/') && !file.type.startsWith('audio/'))) {
                showMessage('請選擇有效的影片或音訊檔案', 'error');
                return;
            }

            currentFileName = file.name.replace(/\.[^.]+$/, '');
            const _display = document.getElementById('fileNameDisplay');
            const _zone = document.getElementById('fileDropZone');
            if (_display) _display.textContent = file.name;
            if (_zone) _zone.classList.add('has-file');

            if (loadBtn) { loadBtn.textContent = '載入中...'; loadBtn.disabled = true; }

            updateProgress(25, '正在載入本機影片...');

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

                updateProgress(50, '設定影片參數...');

                localVideo.addEventListener('loadedmetadata', function() {
                    updateProgress(75, '影片載入完成');
                    isVideoLoaded = true;
                    isPlayerReady = true;
                    currentTime = 0;

                    document.getElementById('videoControls').style.display = 'flex';

                    if (youtubeSubtitles && youtubeSubtitles.length > 0) {
                        document.getElementById('subtitleOverlay').style.display = 'block';
                    }
                    updateYouTubeSubtitlesDisplay();

                    updateProgress(100, '本機影片載入完成！');

                    if (loadBtn) { loadBtn.textContent = '重新載入'; loadBtn.disabled = false; }

                    showStatus('本機影片載入成功！如果已上傳字幕檔案，字幕將自動顯示。', 'success');
                    saveState();

                    updateTimeDisplay();
                    setupLocalVideoEvents();
                });

                localVideo.addEventListener('error', function(e) {
                    console.error('本機影片載入錯誤:', e.target.error);
                    if (loadBtn) { loadBtn.textContent = '載入影片'; loadBtn.disabled = false; }
                    showMessage('載入本機影片時發生錯誤，請重試', 'error');
                    document.getElementById('progressContainer').style.display = 'none';
                });

            } catch (error) {
                console.error('載入本機影片錯誤:', error);
                if (loadBtn) { loadBtn.textContent = '載入影片'; loadBtn.disabled = false; }
                showMessage('載入本機影片時發生錯誤，請重試', 'error');
                document.getElementById('progressContainer').style.display = 'none';
            }
        }

        function loadLocalVideo() {
            const fileInput = document.getElementById('localVideoFile');
            const loadBtn = document.getElementById('loadLocalVideoBtn');
            if (!fileInput.files || fileInput.files.length === 0) {
                showMessage('請選擇影片檔案', 'error');
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
            });
            
            // 暫停事件
            localVideo.addEventListener('pause', function() {
                isPlaying = false;
                stopTimeTracking();
                stopSubtitleSync();
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
            console.log('YouTube Player 已準備就緒');
            isPlayerReady = true;
            isVideoLoaded = true;
            try {
                const data = event.target.getVideoData();
                if (data && data.title) currentFileName = data.title;
            } catch(e) {}
            startSubtitleSync();
            updateYouTubeSubtitlesDisplay();
            showDeleteNotification('影片播放器已準備就緒', 'success');
            // onApiChange 是主要觸發點；這裡只做 3 秒後的備援
            setTimeout(() => {
                if (!captionsFetched && currentVideoId && (!youtubeSubtitles || youtubeSubtitles.length === 0)) {
                    fetchSubtitlesFromPlayer(currentVideoId);
                }
            }, 3000);
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
                if (!tracklist || tracklist.length === 0) return;

                const track = tracklist.find(t =>
                    t.languageCode?.startsWith('zh') || t.vssId?.includes('zh')
                ) || tracklist[0];

                const baseUrl = track.baseUrl;
                if (!baseUrl) {
                    console.log('tracklist 無 baseUrl，嘗試 timedtext API');
                    const lang = track.languageCode || 'zh-TW';
                    const timedTextUrl = `https://www.youtube.com/api/timedtext?v=${videoId}&lang=${encodeURIComponent(lang)}&fmt=json3`;
                    await tryProxyCaptions(timedTextUrl);
                    return;
                }

                const captionUrl = baseUrl.includes('fmt=') ? baseUrl : baseUrl + '&fmt=json3';
                await tryProxyCaptions(captionUrl);
            } catch (e) {
                console.warn('播放器字幕 API 獲取失敗:', e);
            }
        }

        async function tryProxyCaptions(captionUrl) {
            try {
                const resp = await fetch(`/api/proxy-captions?url=${encodeURIComponent(captionUrl)}`);
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
                    showDeleteNotification(`YouTube字幕載入完成 (共 ${subtitles.length} 條)`, 'success');
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
            showDeleteNotification('影片播放器發生錯誤', 'error');
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
        }
        
        async function fetchYouTubeSubtitles(videoId) {
            try {
                showDeleteNotification('正在獲取YouTube字幕...', 'info');
                
                // 使用本地後端服務獲取字幕
                const response = await fetch(`/api/subtitles?videoId=${videoId}`);
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
                showDeleteNotification(`YouTube字幕載入完成 (共 ${youtubeSubtitles.length} 條)`, 'success');

                // 更新字幕顯示
                currentHighlightedYouTube = -1;
                updateYouTubeSubtitlesDisplay();
                saveState();

                return youtubeSubtitles;
            } catch (error) {
                console.error('獲取字幕失敗:', error);
                showDeleteNotification('無法獲取YouTube字幕，將使用校正檔案的時間', 'error');
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
            const timeBadge = `<span class="youtube-subtitle-time" title="${escapeHtml(time)}">${escapeHtml(time)}</span>`;
            const seekZone = `<div class="subtitle-seek-zone" onclick="seekToTime(${subtitle.start})" title="跳轉到 ${escapeHtml(time)}"><svg width="13" height="13" viewBox="0 0 20 20" fill="var(--text-muted)"><path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z"/></svg></div>`;
            const showComparison = subtitle.modified && subtitlePanelFilter === 'modified';
            let contentHTML;
            if (showComparison) {
                const edited = subtitle.editedText !== undefined ? subtitle.editedText : subtitle.text;
                contentHTML = `
                    <div class="youtube-subtitle-content modified-content">
                        <div class="youtube-subtitle-original-row">
                            ${timeBadge}
                            <span class="subtitle-wrong">${escapeHtml(subtitle.text)}</span>
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
                        ${timeBadge}
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
                    msg = `請先載入本機影片<br>再點擊「上傳字幕檔」按鈕<br>或直接拖曳 .srt / .vtt 字幕檔至此`;
                } else if (!isVideoLoaded) {
                    msg = `請先載入影片<br>再點擊「上傳字幕檔」按鈕<br>或直接拖曳 .srt / .vtt 字幕檔至此`;
                } else if (isLocalVideo) {
                    msg = `本機影片不含自動字幕<br>請點擊「上傳字幕檔」按鈕<br>或直接拖曳 .srt / .vtt 字幕檔至此`;
                } else {
                    msg = `未偵測到字幕<br>請點擊「上傳字幕檔」按鈕<br>或直接拖曳 .srt / .vtt 字幕檔至此`;
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
            subtitlePanelFilter = mode;
            ['all', 'modified'].forEach(m => {
                const btn = document.getElementById(`filter${m.charAt(0).toUpperCase() + m.slice(1)}`);
                if (btn) btn.classList.toggle('active', m === mode);
            });
            updateYouTubeSubtitlesDisplay();
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
                showDeleteNotification('請先載入影片', 'error');
                return;
            }
            
            const SKIP_TIME = 5; // 設定前進後退時間為5秒
            
            if (isLocalVideo) {
                // 本機影片控制
                if (!localVideo) {
                    showDeleteNotification('本機影片未載入', 'error');
                    return;
                }
                
                if (action === 'play') {
                    if (localVideo.paused) {
                        localVideo.play();
                        showDeleteNotification(`▶️ 從 ${formatTime(currentTime)} 開始播放`);
                    }
                } else if (action === 'pause') {
                    if (!localVideo.paused) {
                        localVideo.pause();
                        showDeleteNotification(`⏸️ 在 ${formatTime(currentTime)} 暫停`);
                    }
                } else if (action === 'back') {
                    const newTime = Math.max(0, localVideo.currentTime - SKIP_TIME);
                    localVideo.currentTime = newTime;
                    currentTime = newTime;
                    updateTimeDisplay();
                    highlightCurrentSubtitles(currentTime);
                    showDeleteNotification(`⏪ 後退到 ${formatTime(currentTime)}`);
                } else if (action === 'forward') {
                    const newTime = localVideo.currentTime + SKIP_TIME;
                    localVideo.currentTime = newTime;
                    currentTime = newTime;
                    updateTimeDisplay();
                    highlightCurrentSubtitles(currentTime);
                    showDeleteNotification(`⏩ 前進到 ${formatTime(currentTime)}`);
                }
            } else {
                // YouTube影片控制
                if (!player || !isPlayerReady) {
                    showDeleteNotification('請先載入影片', 'error');
                    return;
                }
                
                if (action === 'play') {
                    if (!isPlaying) {
                        player.playVideo();
                        showDeleteNotification(`▶️ 從 ${formatTime(currentTime)} 開始播放`);
                    }
                } else if (action === 'pause') {
                    if (isPlaying) {
                        player.pauseVideo();
                        showDeleteNotification(`⏸️ 在 ${formatTime(currentTime)} 暫停`);
                    }
                } else if (action === 'back') {
                    currentTime = Math.max(0, currentTime - SKIP_TIME);
                    player.seekTo(currentTime, true);
                    updateTimeDisplay();
                    highlightCurrentSubtitles(currentTime);
                    showDeleteNotification(`⏪ 後退到 ${formatTime(currentTime)}`);
                } else if (action === 'forward') {
                    currentTime += SKIP_TIME;
                    player.seekTo(currentTime, true);
                    updateTimeDisplay();
                    highlightCurrentSubtitles(currentTime);
                    showDeleteNotification(`⏩ 前進到 ${formatTime(currentTime)}`);
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
            const newRate = rates[idx];
            if (isLocalVideo) {
                localVideo.playbackRate = newRate;
            } else {
                player.setPlaybackRate(newRate);
            }
            showDeleteNotification(`播放速率：${newRate}x`);
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
            const timeEl = document.getElementById('currentTime');
            if (timeEl) {
                timeEl.textContent = formatTime(currentTime);
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
                    showDeleteNotification('請先載入本機影片', 'error');
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
                    
                    showDeleteNotification(`🎯 已跳轉到 ${formatTime(targetTime)}`);
                } catch (error) {
                    console.error('本機影片跳轉失敗:', error);
                    showDeleteNotification('跳轉失敗，請重新載入影片', 'error');
                }
            } else {
                // YouTube影片跳轉
                if (!player) {
                    console.error('播放器未初始化');
                    showDeleteNotification('請先載入影片', 'error');
                    return;
                }

                if (!isPlayerReady) {
                    console.error('播放器未準備就緒');
                    showDeleteNotification('播放器未準備就緒，請稍候再試', 'error');
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
                    
                    showDeleteNotification(`🎯 已跳轉到 ${formatTime(targetTime)}`);
                } catch (error) {
                    console.error('YouTube影片跳轉失敗:', error);
                    showDeleteNotification('跳轉失敗，請重新載入影片', 'error');
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

        function syncOutputToList() {
            if (!youtubeSubtitles || youtubeSubtitles.length === 0) return;
            const ta = document.getElementById('subtitleOutput');
            if (!ta) return;

            // 比對模式：解析 #num time | original | corrected 格式，依編號同步
            if (showOnlyModified && showComparison) {
                const lines = ta.value.split('\n').filter(l => l.trim());
                let changed = false;
                for (const line of lines) {
                    const numMatch = line.match(/^#(\d+)/);
                    if (!numMatch) continue;
                    const s = youtubeSubtitles[parseInt(numMatch[1]) - 1];
                    if (!s) continue;
                    const pipe1 = line.indexOf(' | ');
                    const pipe2 = pipe1 !== -1 ? line.indexOf(' | ', pipe1 + 3) : -1;
                    if (pipe2 === -1) continue;
                    const corrected = line.substring(pipe2 + 3);
                    if (corrected !== s.text) {
                        s.editedText = corrected;
                        s.modified = true;
                        changed = true;
                    } else if (s.modified) {
                        delete s.editedText;
                        s.modified = false;
                        changed = true;
                    }
                }
                if (changed) updateYouTubeSubtitlesDisplay(true);
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
            updateOutputTextarea();
            saveState();
        }

        function toggleShowComparison() {
            showComparison = document.getElementById('chkComparison').checked;
            updateOutputTextarea();
            saveState();
        }

        function copyOutput() {
            const text = document.getElementById('subtitleOutput').value;
            if (!text) {
                showDeleteNotification('⚠️ 尚無內容可複製', 'error');
                return;
            }
            navigator.clipboard.writeText(text).then(() => {
                showDeleteNotification('📋 已複製到剪貼簿');
            });
        }

        function downloadOutput() {
            if (!youtubeSubtitles?.length) {
                showDeleteNotification('⚠️ 尚無字幕可下載', 'error');
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
            showDeleteNotification(`⬇️ 已下載完整校正後字幕 .${ext}`);
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
                    if (!player || !isPlayerReady || typeof player.getCurrentTime !== 'function') return;
                    try {
                        currentPlayerTime = player.getCurrentTime();
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
            if (targetIndex !== currentHighlightedYouTube) {
                // 清除舊的高亮
                clearYouTubeHighlight(false);
                
                // 設置新的高亮
                currentHighlightedYouTube = targetIndex;
                const items = document.querySelectorAll('.youtube-subtitle-item');
                if (items[targetIndex]) {
                    items[targetIndex].classList.add('current-playing');
                    console.log('設置新的YouTube字幕高亮:', targetIndex);
                    
                    // 確保元素在視圖中可見
                    scrollToElement(items[targetIndex], 'youtubeSubtitlesPanel');
                }
            }
        }
        
        function findActiveSubtitleIndex(subtitles, currentPlayerTime, timeKey, fallbackDuration, durationKey = null) {
            for (let i = 0; i < subtitles.length; i++) {
                const startTime = Number(subtitles[i][timeKey]);
                if (!Number.isFinite(startTime)) continue;
                
                const nextStartTime = i < subtitles.length - 1 ? Number(subtitles[i + 1][timeKey]) : NaN;
                const ownDuration = durationKey ? Number(subtitles[i][durationKey]) : NaN;
                const endTime = Number.isFinite(ownDuration) && ownDuration > 0
                    ? startTime + Math.max(ownDuration, 0.25)
                    : Number.isFinite(nextStartTime) && nextStartTime > startTime
                    ? nextStartTime
                    : startTime + fallbackDuration;
                
                if (currentPlayerTime >= startTime && currentPlayerTime < endTime) {
                    return i;
                }
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
                
                // 計算是否需要滾動
                const isVisible = elementRect.top >= containerRect.top && 
                                elementRect.bottom <= containerRect.bottom;
                
                if (!isVisible) {
                    const scrollTop = element.offsetTop - container.offsetTop - 
                                    (container.clientHeight / 2) + (element.clientHeight / 2);
                    
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

        // 初始化頁面時設置鍵盤事件監聽
        document.addEventListener('DOMContentLoaded', function() {
            // 初始化影片載入選擇器
            initVideoLoadSelector();
            // 初始化可拖曳分隔線
            initPanelDivider();
            // 還原 localStorage 狀態
            loadState();
            
            // 添加鍵盤控制
            document.addEventListener('keydown', function(e) {
                // 如果正在輸入文字，不處理鍵盤控制
                if (e.target.tagName === 'TEXTAREA' || 
                    e.target.tagName === 'INPUT' || 
                    e.target.contentEditable === 'true' ||
                    e.target.closest('[contenteditable="true"]')) {
                    return;
                }
                
                if (e.code === 'BracketLeft') {
                    e.preventDefault();
                    changeSpeed(-1);
                    return;
                }
                if (e.code === 'BracketRight') {
                    e.preventDefault();
                    changeSpeed(1);
                    return;
                }
                if (e.code === 'KeyA') {
                    e.preventDefault();
                    jumpToSubtitle(-1);
                    return;
                }
                if (e.code === 'KeyD') {
                    e.preventDefault();
                    jumpToSubtitle(1);
                    return;
                }

                switch(e.key) {
                    case ' ': // 空格鍵
                        e.preventDefault();
                        if (isPlaying) {
                            controlVideo('pause');
                        } else {
                            controlVideo('play');
                        }
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
                showDeleteNotification('❌ 僅支援 .srt 和 .vtt 格式', 'error');
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
                        showDeleteNotification(`✅ 成功載入 ${subtitles.length} 條字幕`, 'success');
                        saveState();
                    } else {
                        throw new Error('無法解析字幕內容');
                    }
                } catch (error) {
                    console.error('解析字幕檔案失敗:', error);
                    showDeleteNotification('❌ 解析字幕檔案失敗: ' + error.message, 'error');
                }
            };
            reader.onerror = function() {
                showDeleteNotification('❌ 讀取檔案失敗', 'error');
            };
            reader.readAsText(file);
        }

        document.getElementById('subtitleFileInput').addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (!file) return;
            loadSubtitleFromFile(file);
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
