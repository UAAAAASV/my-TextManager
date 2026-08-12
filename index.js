// ==========================================
// 番外文本管理器 - 酒馆加载器 
// ==========================================
(function() {
    'use strict';

    const topWin = window.top || window.self;
    const topDoc = topWin.document || document;
    const $ = topWin.jQuery || window.jQuery || $;

    const MY_WEB_URL = 'https://uaaaaasv.github.io/my-TextManager/';
    const STORAGE_SETTINGS_KEY = 'extra_text_mgr_settings_v3';
    const STORAGE_POS_KEY = 'extra_text_mgr_btn_pos_v3';

    let lastToggleTime = 0;

    // 注入彩色 Emoji 渲染规则
    function injectEmojiStyle() {
        if (!topDoc.getElementById('extra-emoji-fix-style')) {
            const style = topDoc.createElement('style');
            style.id = 'extra-emoji-fix-style';
            style.innerHTML = `
                .extra-color-emoji {
                    font-family: 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji', sans-serif !important;
                    font-style: normal !important;
                    font-weight: normal !important;
                    font-size: 20px !important;
                    line-height: 1 !important;
                    color: initial !important;
                    -webkit-text-fill-color: initial !important;
                    display: inline-block !important;
                    vertical-align: middle !important;
                }
            `;
            topDoc.head.appendChild(style);
        }
    }
    injectEmojiStyle();

    function getSettings() {
        const def = { icon: '📖', showFloat: true, showSidebar: true, showQR: true };
        try {
            return { ...def, ...JSON.parse(localStorage.getItem(STORAGE_SETTINGS_KEY) || '{}') };
        } catch (e) { return def; }
    }

    function saveSettings(s) {
        localStorage.setItem(STORAGE_SETTINGS_KEY, JSON.stringify(s));
    }

    function renderIconHtml(iconStr) {
        if (!iconStr) iconStr = '📖';
        if (iconStr.includes('fa-') || iconStr.startsWith('fa ')) {
            return `<i class="${iconStr}"></i>`;
        }
        return `<span class="extra-color-emoji">${iconStr}</span>`;
    }

    // 1. 居中卡片弹窗 (右上角纯黑 ✕ 关闭按钮)
    function createMainModal() {
        let $overlay = $('#extra-text-mgr-overlay', topDoc);
        if ($overlay.length === 0) {
            const isMobile = (topWin.innerWidth || 800) <= 768;
            
            const modalStyle = isMobile 
                ? 'width: 92vw; height: 94vh; border-radius: 8px;' 
                : 'width: 88vw; height: 85vh; max-width: 1400px; max-height: 900px; border-radius: 10px;';

            const closeBtnHtml = `
                <button id="extra-modal-close-btn" title="关闭" style="
                    position: absolute; top: 8px; right: 12px; z-index: 1000001;
                    background: transparent !important; border: none !important;
                    color: #000000 !important; font-size: 22px !important;
                    font-weight: bold !important; cursor: pointer !important;
                    padding: 0 !important; line-height: 1 !important;
                    opacity: 0.7; transition: opacity 0.2s;
                ">✕</button>
            `;

            const overlayHtml = `
                <div id="extra-text-mgr-overlay" style="display: none; position: fixed; z-index: 1000000; left: 0; top: 0; width: 100vw; height: 100vh; background-color: rgba(0, 0, 0, 0.65); backdrop-filter: blur(5px); -webkit-backdrop-filter: blur(5px); justify-content: center; align-items: center;">
                    <div id="extra-text-mgr-modal" style="background: #11111b; border: 1px solid rgba(255, 255, 255, 0.2); box-shadow: 0 20px 50px rgba(0, 0, 0, 0.7); display: flex; flex-direction: column; overflow: hidden; box-sizing: border-box; position: relative; ${modalStyle}">
                        ${closeBtnHtml}
                        <iframe src="${MY_WEB_URL}" style="width:100%; height:100%; border:none; background:white;"></iframe>
                    </div>
                </div>
            `;
            $('body', topDoc).append(overlayHtml);
            $overlay = $('#extra-text-mgr-overlay', topDoc);

            // 点击外部背景空白处关闭
            $overlay.on('click', function(e) {
                if (e.target === this) {
                    $(this).hide();
                }
            });

            // 点击纯黑 ✕ 关闭
            $('#extra-modal-close-btn', topDoc).on('click', function() {
                $overlay.hide();
            });
        }
        return $overlay;
    }

    function toggleModal() {
        const now = Date.now();
        if (now - lastToggleTime < 400) return;
        lastToggleTime = now;

        const $overlay = createMainModal();
        if ($overlay.is(':visible')) {
            $overlay.hide();
        } else {
            $overlay.css('display', 'flex');
        }
    }

    // 2. 悬浮按钮
    function renderFloatButton() {
        const settings = getSettings();
        let $btn = $('#extra-text-mgr-float-btn', topDoc);

        if (!settings.showFloat) {
            if ($btn.length) $btn.hide();
            return;
        }

        if ($btn.length === 0) {
            const savedPos = JSON.parse(localStorage.getItem(STORAGE_POS_KEY) || 'null');
            const winWidth = topWin.innerWidth || 375;
            const winHeight = topWin.innerHeight || 667;

            let defaultTop = winHeight - 100;
            let defaultLeft = winWidth - 65;

            if (savedPos) {
                if (savedPos.left < 0 || savedPos.left > winWidth - 50) {
                    defaultLeft = winWidth - 65;
                } else {
                    defaultLeft = savedPos.left;
                }
                if (savedPos.top < 0 || savedPos.top > winHeight - 50) {
                    defaultTop = winHeight - 90;
                } else {
                    defaultTop = savedPos.top;
                }
            }

            const btnHtml = `
                <div id="extra-text-mgr-float-btn" title="打开番外文本管理器" style="position: fixed; z-index: 100050; cursor: grab; width: 44px; height: 44px; background: rgba(0, 0, 0, 0.45); backdrop-filter: blur(6px); border: 1px solid rgba(255, 255, 255, 0.25); border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(0,0,0,0.3); user-select: none; touch-action: none; top: ${defaultTop}px; left: ${defaultLeft}px;">
                    ${renderIconHtml(settings.icon)}
                </div>
            `;
            $('body', topDoc).append(btnHtml);
            $btn = $('#extra-text-mgr-float-btn', topDoc);

            makeButtonDraggable($btn);
        }

        $btn.show().html(renderIconHtml(settings.icon));
    }

    function makeButtonDraggable($button) {
        let startX, startY, hasDragged = false, offset;
        const $doc = $(topDoc);

        const getCoords = e => e.type.startsWith('touch') ? (e.originalEvent.touches[0] || e.originalEvent.changedTouches[0]) : e;

        const dragStart = e => {
            if (e.type === 'mousedown' && e.which === 3) return;
            const coords = getCoords(e);
            startX = coords.pageX; startY = coords.pageY;
            hasDragged = false;
            const pos = $button.offset();
            offset = { y: startY - pos.top, x: startX - pos.left };
            $button.css('cursor', 'grabbing');

            $doc.on(`mousemove.extraMgr touchmove.extraMgr`, dragMove);
            $doc.one(`mouseup.extraMgr touchend.extraMgr`, dragEnd);
        };

        const dragMove = e => {
            const coords = getCoords(e);
            if (Math.abs(coords.pageX - startX) > 4 || Math.abs(coords.pageY - startY) > 4) hasDragged = true;
            let newTop = coords.pageY - offset.y;
            let newLeft = coords.pageX - offset.x;
            newTop = Math.max(10, Math.min(newTop, topWin.innerHeight - $button.outerHeight() - 10));
            newLeft = Math.max(10, Math.min(newLeft, topWin.innerWidth - $button.outerWidth() - 10));
            $button.css({ top: newTop + 'px', left: newLeft + 'px', right: 'auto', bottom: 'auto' });
        };

        const dragEnd = () => {
            $doc.off(`mousemove.extraMgr touchmove.extraMgr`);
            $button.css('cursor', 'grab');
            if (!hasDragged) {
                toggleModal();
            } else {
                localStorage.setItem(STORAGE_POS_KEY, JSON.stringify({ top: $button.offset().top, left: $button.offset().left }));
            }
        };

        $button.on(`mousedown.extraMgr touchstart.extraMgr`, dragStart);
    }

    // 3. 注册酒馆助手事件
    function registerTavernHelperButtons() {
        const safeBind = (winObj) => {
            if (typeof winObj.getButtonEvent === 'function' && typeof winObj.eventOn === 'function') {
                try {
                    const evt = winObj.getButtonEvent("番外");
                    if (evt) {
                        winObj.eventOn(evt, toggleModal);
                    }
                } catch(e) {}
            }
        };

        safeBind(window);
        safeBind(topWin);
    }

    // 4. 侧边栏菜单
    function renderSidebarButton() {
        const settings = getSettings();
        const $menu = $('#extensionsMenu, #extensions_menu', topDoc);
        let $btn = $('#extra-mgr-sidebar-btn', topDoc);

        if (!settings.showSidebar) {
            if ($btn.length) $btn.hide();
            return;
        }

        if ($menu.length) {
            const innerContent = `
                <div style="width:20px; text-align:center; display:inline-flex; align-items:center; justify-content:center; flex-shrink:0;">
                    ${renderIconHtml(settings.icon)}
                </div>
                <span>番外文本管理器</span>
            `;

            if ($btn.length === 0) {
                const html = `
                    <div id="extra-mgr-sidebar-btn" class="list-group-item flex-container flexGap5 interactable" title="番外文本管理器">
                        ${innerContent}
                    </div>
                `;
                $menu.prepend(html);
                $btn = $('#extra-mgr-sidebar-btn', topDoc);
                $btn.on('click', () => { toggleModal(); $menu.hide(); });
            }
            $btn.css('display', 'flex').html(innerContent);
        }
    }

    // 5. 跨窗口文本发送
    function sendToTavernChat(text) {
        if (!text) return;

        const textarea = topDoc.getElementById('send_textarea');
        const sendBtn = topDoc.getElementById('send_but');

        if (textarea) {
            textarea.value = text;
            textarea.dispatchEvent(new Event('input', { bubbles: true, cancelable: true }));
            textarea.dispatchEvent(new Event('change', { bubbles: true, cancelable: true }));

            if ($) {
                $(textarea).trigger('input').trigger('change');
            }

            setTimeout(() => {
                if (sendBtn) {
                    sendBtn.click();
                } else if (typeof topWin.triggerSlash === 'function') {
                    topWin.triggerSlash(`/send ${text}`);
                }
            }, 100);
        } else if (typeof topWin.triggerSlash === 'function') {
            topWin.triggerSlash(`/send ${text}`);
        }
    }

    // 6. 核心通信信令处理
    topWin.addEventListener('message', (event) => {
        if (event.data?.type === 'SEND_TO_ST_CHAT') {
            // A. 发送文本到酒馆输入框
            sendToTavernChat(event.data.text);

            // B. 核心：发送完成后自动收起/关闭管理弹窗
            const $overlay = $('#extra-text-mgr-overlay', topDoc);
            if ($overlay.length) {
                $overlay.hide();
            }
        } else if (event.data?.type === 'UPDATE_ST_SETTINGS') {
            saveSettings(event.data.settings);
            
            $('#extra-text-mgr-float-btn', topDoc).remove();
            $('#extra-mgr-sidebar-btn', topDoc).remove();
            
            refreshUI();
        }
    });

    function refreshUI() {
        createMainModal();
        renderFloatButton();
        renderSidebarButton();
        registerTavernHelperButtons();
    }

    $(document).ready(() => {
        setTimeout(refreshUI, 800);
    });
})();
