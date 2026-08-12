// ==========================================
// 番外文本管理器 - 酒馆加载器 (原生彩色 Emoji + 强力发送版)
// ==========================================
(function() {
    'use strict';

    const topWin = window.top || window;
    const topDoc = topWin.document || document;
    const $ = topWin.jQuery || window.jQuery || $;

    const MY_WEB_URL = 'https://uaaaaasv.github.io/my-TextManager/';
    const STORAGE_SETTINGS_KEY = 'extra_text_mgr_settings_v3';
    const STORAGE_POS_KEY = 'extra_text_mgr_btn_pos_v3';

    function getSettings() {
        const def = { icon: '📖', showFloat: true, showSidebar: true, showQR: true };
        try {
            return { ...def, ...JSON.parse(localStorage.getItem(STORAGE_SETTINGS_KEY) || '{}') };
        } catch (e) { return def; }
    }

    function saveSettings(s) {
        localStorage.setItem(STORAGE_SETTINGS_KEY, JSON.stringify(s));
    }

    // 渲染图标：强制启用系统彩色 Emoji 字体，保证 100% 彩色显示
    function renderIconHtml(iconStr) {
        if (!iconStr) iconStr = '📖';
        if (iconStr.includes('fa-') || iconStr.startsWith('fa ')) {
            return `<i class="${iconStr}"></i>`;
        }
        // 强制使用彩色 Emoji 字体样式
        return `<span style="
            font-family: 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji', sans-serif !important;
            font-style: normal !important;
            font-weight: normal !important;
            font-size: 20px !important;
            line-height: 1 !important;
            color: initial !important;
            display: inline-block;
            user-select: none;
        ">${iconStr}</span>`;
    }

    // 1. Flex 居中无边框弹窗 (对标文本净化，永不起飞)
    function createMainModal() {
        let $overlay = $('#extra-text-mgr-overlay', topDoc);
        if ($overlay.length === 0) {
            const overlayHtml = `
                <div id="extra-text-mgr-overlay" style="display: none; position: fixed; z-index: 1000000; left: 0; top: 0; width: 100vw; height: 100vh; background-color: rgba(0, 0, 0, 0.65); backdrop-filter: blur(4px); -webkit-backdrop-filter: blur(4px); justify-content: center; align-items: center;">
                    <div id="extra-text-mgr-modal" style="background: #11111b; border: 1px solid rgba(255, 255, 255, 0.15); border-radius: 12px; box-shadow: 0 15px 35px rgba(0, 0, 0, 0.6); width: 92vw; height: 88vh; max-width: 1300px; display: flex; flex-direction: column; overflow: hidden; box-sizing: border-box; position: relative;">
                        <iframe src="${MY_WEB_URL}" style="width:100%; height:100%; border:none; background:white;"></iframe>
                    </div>
                </div>
            `;
            $('body', topDoc).append(overlayHtml);
            $overlay = $('#extra-text-mgr-overlay', topDoc);

            $overlay.on('click', function(e) {
                if (e.target === this) {
                    $(this).hide();
                }
            });
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

    // 2. 悬浮按钮 (救世主同款)
    function renderFloatButton() {
        const settings = getSettings();
        let $btn = $('#extra-text-mgr-float-btn', topDoc);

        if (!settings.showFloat) {
            if ($btn.length) $btn.hide();
            return;
        }

        if ($btn.length === 0) {
            const savedPos = JSON.parse(localStorage.getItem(STORAGE_POS_KEY) || 'null');
            const defaultTop = (topWin.innerHeight || 800) - 100;
            const defaultLeft = (topWin.innerWidth || 400) - 70;

            const btnTop = savedPos ? savedPos.top : defaultTop;
            const btnLeft = savedPos ? savedPos.left : defaultLeft;

            const btnHtml = `
                <div id="extra-text-mgr-float-btn" title="打开番外文本管理器" style="position: fixed; z-index: 100050; cursor: grab; width: 46px; height: 44px; background: rgba(0, 0, 0, 0.45); backdrop-filter: blur(6px); color: #ffffff; border: 1px solid rgba(255, 255, 255, 0.25); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 18px; font-weight: bold; box-shadow: 0 4px 12px rgba(0,0,0,0.3); user-select: none; top: ${btnTop}px; left: ${btnLeft}px;">
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
            if (Math.abs(coords.pageX - startX) > 5 || Math.abs(coords.pageY - startY) > 5) hasDragged = true;
            let newTop = coords.pageY - offset.y;
            let newLeft = coords.pageX - offset.x;
            newTop = Math.max(0, Math.min(newTop, topWin.innerHeight - $button.outerHeight()));
            newLeft = Math.max(0, Math.min(newLeft, topWin.innerWidth - $button.outerWidth()));
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

    // 3. 酒馆助手编辑界面手动添加的【番外】按钮
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

    // 4. 侧边栏魔杖菜单
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

    // 5. 跨窗口文本发送强力函数 (优先调用酒馆官方 API，100% 成功)
    function sendToTavernChat(text) {
        if (!text) return;

        // 方案 A：使用酒馆原生 JS 官方 API 发送 (ST 1.11+)
        if (topWin.SillyTavern && typeof topWin.SillyTavern.getContext === 'function') {
            try {
                const ctx = topWin.SillyTavern.getContext();
                if (ctx && typeof ctx.sendMessage === 'function') {
                    ctx.sendMessage(text);
                    console.log("【番外文本管理器】通过 SillyTavern 官方 API 发送成功！");
                    return;
                }
            } catch (e) {
                console.warn("调用 SillyTavern API 失败，降级使用 DOM 操作:", e);
            }
        }

        // 方案 B：DOM 模拟触发（兼容多行文本与事件冒泡）
        const $textarea = $('#send_textarea', topDoc);
        if ($textarea.length) {
            const nativeEl = $textarea[0];
            nativeEl.value = text;
            
            // 触发原生事件
            nativeEl.dispatchEvent(new Event('input', { bubbles: true, cancelable: true }));
            nativeEl.dispatchEvent(new Event('change', { bubbles: true, cancelable: true }));

            // 触发 jQuery 事件
            $textarea.trigger('input').trigger('change');

            setTimeout(() => {
                const $sendBtn = $('#send_but', topDoc);
                if ($sendBtn.length) {
                    $sendBtn.click();
                } else if (typeof topWin.triggerSlash === 'function') {
                    topWin.triggerSlash(`/send ${text.replace(/\n/g, ' ')}`);
                }
            }, 120);
        } else if (typeof topWin.triggerSlash === 'function') {
            topWin.triggerSlash(`/send ${text.replace(/\n/g, ' ')}`);
        }
    }

    // 监听网页消息
    window.addEventListener('message', (event) => {
        if (event.data?.type === 'SEND_TO_ST_CHAT') {
            sendToTavernChat(event.data.text);
        } else if (event.data?.type === 'UPDATE_ST_SETTINGS') {
            saveSettings(event.data.settings);
            
            // 销毁旧节点重新渲染最新图标
            $('#extra-text-mgr-float-btn', topDoc).remove();
            $('#extra-mgr-sidebar-btn', topDoc).remove();
            $('#extra-mgr-qr-btn', topDoc).remove();
            
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
