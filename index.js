// ==========================================
// 番外文本管理器 - 酒馆加载器 (救世主同款 jQuery 架构版)
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

    function renderIconHtml(iconStr) {
        if (!iconStr) iconStr = '📖';
        if (iconStr.includes('fa-') || iconStr.startsWith('fa ')) {
            return `<i class="${iconStr}"></i>`;
        }
        return `<span style="font-style:normal; font-size:18px; line-height:1; user-select:none;">${iconStr}</span>`;
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

    // 2. 对标《救世主》悬浮按钮与拖拽写法
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

            // 救世主同款拖拽逻辑
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

    // 3. 兼容你在酒馆助手编辑界面手动添加的“番外”按钮 (getButtonEvent)
    function registerTavernHelperButtons() {
        const settings = getSettings();
        const btnLabel = settings.icon || '📖';

        // 绑定你在脚本编辑界面手动添加的【番外】按钮
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
        }
    }

    // 5. 跨窗口文本发送 (jQuery 强行触发事件，100% 成功发送到酒馆聊天框)
    window.addEventListener('message', (event) => {
        if (event.data?.type === 'SEND_TO_ST_CHAT') {
            const text = event.data.text;
            if (!text) return;

            const $textarea = $('#send_textarea', topDoc);
            if ($textarea.length) {
                // jQuery 设值 + 强行触发 input/change，确保酒馆数据更新
                $textarea.val(text).trigger('input').trigger('change');
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
        } else if (event.data?.type === 'UPDATE_ST_SETTINGS') {
            saveSettings(event.data.settings);
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
