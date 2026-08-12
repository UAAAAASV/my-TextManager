// ==========================================
// 番外文本管理器 - 酒馆加载器 (彩色 Emoji 破解 + 双端精准分流版)
// ==========================================
(function() {
    'use strict';

    const topWin = window.top || window;
    const topDoc = topWin.document || document;
    const $ = topWin.jQuery || window.jQuery || $;

    const MY_WEB_URL = 'https://uaaaaasv.github.io/my-TextManager/';
    const STORAGE_SETTINGS_KEY = 'extra_text_mgr_settings_v3';
    const STORAGE_POS_KEY = 'extra_text_mgr_btn_pos_v3';

    // 1. 注入 CSS 破解酒馆的黑白图标剥离规则，强制恢复彩色 Emoji
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

    // 渲染彩色 Emoji 图标
    function renderIconHtml(iconStr) {
        if (!iconStr) iconStr = '📖';
        if (iconStr.includes('fa-') || iconStr.startsWith('fa ')) {
            return `<i class="${iconStr}"></i>`;
        }
        return `<span class="extra-color-emoji">${iconStr}</span>`;
    }

    // 2. 双端自适应弹窗 (PC端留出四周空白点击关闭；手机端全屏加关闭按钮)
    function createMainModal() {
        let $overlay = $('#extra-text-mgr-overlay', topDoc);
        if ($overlay.length === 0) {
            const isMobile = (topWin.innerWidth || 800) <= 768;
            
            // PC 端留出背景空白，手机端全屏
            const modalStyle = isMobile 
                ? 'width: 100vw; height: 100vh; border-radius: 0px;' 
                : 'width: 88vw; height: 84vh; max-width: 1300px; max-height: 850px; border-radius: 12px;';

            // 手机端全屏时提供右上角红框关闭按钮
            const mobileCloseBtnHtml = isMobile 
                ? `<button id="extra-mobile-close-btn" style="position: absolute; top: 10px; right: 10px; z-index: 1000001; background: #ef4444; color: white; border: none; border-radius: 50%; width: 32px; height: 32px; font-weight: bold; font-size: 16px; cursor: pointer; box-shadow: 0 2px 8px rgba(0,0,0,0.4);">✕</button>`
                : '';

            const overlayHtml = `
                <div id="extra-text-mgr-overlay" style="display: none; position: fixed; z-index: 1000000; left: 0; top: 0; width: 100vw; height: 100vh; background-color: rgba(0, 0, 0, 0.65); backdrop-filter: blur(5px); -webkit-backdrop-filter: blur(5px); justify-content: center; align-items: center;">
                    <div id="extra-text-mgr-modal" style="background: #11111b; border: 1px solid rgba(255, 255, 255, 0.15); box-shadow: 0 15px 35px rgba(0, 0, 0, 0.6); display: flex; flex-direction: column; overflow: hidden; box-sizing: border-box; position: relative; ${modalStyle}">
                        ${mobileCloseBtnHtml}
                        <iframe src="${MY_WEB_URL}" style="width:100%; height:100%; border:none; background:white;"></iframe>
                    </div>
                </div>
            `;
            $('body', topDoc).append(overlayHtml);
            $overlay = $('#extra-text-mgr-overlay', topDoc);

            // 点击黑色背景遮罩关闭
            $overlay.on('click', function(e) {
                if (e.target === this) {
                    $(this).hide();
                }
            });

            if (isMobile) {
                $('#extra-mobile-close-btn', topDoc).on('click', function() {
                    $overlay.hide();
                });
            }
        }
        return $overlay;
    }

    function toggleModal() {
        const $overlay = createMainModal();
        if ($overlay.is(':visible')) {
            $overlay.hide();
        } else {
            $overlay.css('display', 'flex');
        }
    }

    // 3. 悬浮按钮 (越界回归 + 拖拽)
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
                <div id="extra-text-mgr-float-btn" title="打开番外文本管理器" style="position: fixed; z-index: 100050; cursor: grab; width: 46px; height: 44px; background: rgba(0, 0, 0, 0.45); backdrop-filter: blur(6px); border: 1px solid rgba(255, 255, 255, 0.25); border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(0,0,0,0.3); user-select: none; -webkit-user-select: none; touch-action: none; top: ${defaultTop}px; left: ${defaultLeft}px;">
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

    // 4. 酒馆助手编辑界面手动添加的【番外】按钮
    function registerTavernHelperButtons() {
        const settings = getSettings();
        const btnLabel = settings.icon || '📖';

        if (typeof getButtonEvent === 'function') {
            getButtonEvent("番外", toggleModal);
        } else if (typeof topWin.getButtonEvent === 'function') {
            topWin.getButtonEvent("番外", toggleModal);
        }

        if (typeof eventOnButton === 'function') {
            eventOnButton("番外", toggleModal);
            eventOnButton(btnLabel, toggleModal);
        } else if (typeof topWin.eventOnButton === 'function') {
            topWin.eventOnButton("番外", toggleModal);
            topWin.eventOnButton(btnLabel, toggleModal);
        }
    }

    // 5. 侧边栏菜单入口
    function renderSidebarButton() {
        const settings = getSettings();
        const $menu = $('#extensionsMenu, #extensions_menu', topDoc);
        let $btn = $('#extra-mgr-sidebar-btn', topDoc);

        if (!settings.showSidebar) {
            if ($btn.length) $btn.hide();
            return;
        }

        if ($menu.length) {
            if ($btn.length === 0) {
                const html = `
                    <div id="extra-mgr-sidebar-btn" class="list-group-item flex-container flexGap5 interactable" title="番外文本管理器">
                        ${renderIconHtml(settings.icon)}<span style="margin-left:6px;">番外文本管理器</span>
                    </div>
                `;
                $menu.prepend(html);
                $btn = $('#extra-mgr-sidebar-btn', topDoc);
                $btn.on('click', () => { toggleModal(); $menu.hide(); });
            }
            $btn.css('display', 'flex');
            $btn.html(`${renderIconHtml(settings.icon)}<span style="margin-left:6px;">番外文本管理器</span>`);
        }
    }

    // 6. 接收文本直接发送到酒馆消息框
    function sendToTavernChat(text) {
        if (!text) return;

        if (topWin.SillyTavern && typeof topWin.SillyTavern.getContext === 'function') {
            try {
                const ctx = topWin.SillyTavern.getContext();
                if (ctx && typeof ctx.sendMessage === 'function') {
                    ctx.sendMessage(text);
                    return;
                }
            } catch (e) {}
        }

        const $textarea = $('#send_textarea', topDoc);
        if ($textarea.length) {
            const nativeEl = $textarea[0];
            nativeEl.value = text;
            nativeEl.dispatchEvent(new Event('input', { bubbles: true, cancelable: true }));
            nativeEl.dispatchEvent(new Event('change', { bubbles: true, cancelable: true }));

            setTimeout(() => {
                const $sendBtn = $('#send_but', topDoc);
                if ($sendBtn.length) {
                    $sendBtn.click();
                } else if (typeof topWin.triggerSlash === 'function') {
                    topWin.triggerSlash(`/send ${text}`);
                }
            }, 100);
        } else if (typeof topWin.triggerSlash === 'function') {
            topWin.triggerSlash(`/send ${text}`);
        }
    }

    window.addEventListener('message', (event) => {
        if (event.data?.type === 'SEND_TO_ST_CHAT') {
            sendToTavernChat(event.data.text);
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
