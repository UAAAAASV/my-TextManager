// ==========================================
// 番外文本管理器 - 酒馆加载器 (原生 eventOnButton 同排绑定版)
// ==========================================
const topWin = window.top || window;
const topDoc = topWin.document || document;

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
    return `<span style="font-style:normal; font-size:16px; line-height:1; user-select:none;">${iconStr}</span>`;
}

// 1. Flex 居中无边框弹窗 (对标文本净化，永不起飞)
function createMainModal() {
    let overlay = topDoc.getElementById('extra-text-mgr-overlay');
    if (!overlay) {
        overlay = topDoc.createElement('div');
        overlay.id = 'extra-text-mgr-overlay';
        overlay.style.cssText = `
            display: none; position: fixed; z-index: 1000000; left: 0; top: 0;
            width: 100vw; height: 100vh; background-color: rgba(0, 0, 0, 0.65);
            backdrop-filter: blur(4px); -webkit-backdrop-filter: blur(4px);
            justify-content: center; align-items: center;
        `;

        const modal = topDoc.createElement('div');
        modal.id = 'extra-text-mgr-modal';
        modal.style.cssText = `
            background: #11111b; border: 1px solid rgba(255, 255, 255, 0.15);
            border-radius: 12px; box-shadow: 0 15px 35px rgba(0, 0, 0, 0.6);
            width: 92vw; height: 88vh; max-width: 1300px; display: flex; flex-direction: column;
            font-family: inherit; color: #e0e0e0; overflow: hidden;
            box-sizing: border-box; position: relative;
        `;

        modal.innerHTML = `<iframe src="${MY_WEB_URL}" style="width:100%; height:100%; border:none; background:white;"></iframe>`;
        overlay.appendChild(modal);
        topDoc.body.appendChild(overlay);

        overlay.onclick = (e) => {
            if (e.target === overlay) overlay.style.display = 'none';
        };
    }
    return overlay;
}

function toggleModal() {
    const overlay = createMainModal();
    overlay.style.display = (overlay.style.display === 'none' || !overlay.style.display) ? 'flex' : 'none';
}

// 2. 悬浮图标
function renderFloatButton() {
    const settings = getSettings();
    let btn = topDoc.getElementById('extra-text-mgr-float-btn');

    if (!settings.showFloat) {
        if (btn) btn.style.display = 'none';
        return;
    }

    if (!btn) {
        btn = topDoc.createElement('div');
        btn.id = 'extra-text-mgr-float-btn';

        const savedPos = JSON.parse(localStorage.getItem(STORAGE_POS_KEY) || 'null');
        const defaultTop = window.innerHeight - 100;
        const defaultLeft = window.innerWidth - 70;

        btn.style.cssText = `
            position: fixed !important;
            top: ${savedPos ? savedPos.top : defaultTop}px;
            left: ${savedPos ? savedPos.left : defaultLeft}px;
            width: 44px; height: 44px;
            background: rgba(0, 0, 0, 0.45) !important;
            backdrop-filter: blur(6px);
            color: rgba(255,255,255,0.95) !important;
            border: 1px solid rgba(255,255,255,0.2) !important;
            border-radius: 50% !important;
            display: flex !important; justify-content: center; align-items: center;
            cursor: move; z-index: 999999 !important;
            user-select: none; -webkit-user-select: none;
            touch-action: none;
            box-shadow: 0 4px 15px rgba(0,0,0,0.4);
        `;

        let isDragging = false, startX, startY, initialLeft, initialTop;

        const onStart = (e) => {
            isDragging = false;
            const clientX = e.touches ? e.touches[0].clientX : e.clientX;
            const clientY = e.touches ? e.touches[0].clientY : e.clientY;
            startX = clientX; startY = clientY;
            initialLeft = btn.offsetLeft; initialTop = btn.offsetTop;

            const onMove = (ev) => {
                const curX = ev.touches ? ev.touches[0].clientX : ev.clientX;
                const curY = ev.touches ? ev.touches[0].clientY : ev.clientY;
                const dx = curX - startX, dy = curY - startY;
                if (Math.abs(dx) > 4 || Math.abs(dy) > 4) isDragging = true;
                btn.style.left = `${initialLeft + dx}px`;
                btn.style.top = `${initialTop + dy}px`;
            };

            const onEnd = () => {
                topDoc.removeEventListener('mousemove', onMove);
                topDoc.removeEventListener('mouseup', onEnd);
                topDoc.removeEventListener('touchmove', onMove);
                topDoc.removeEventListener('touchend', onEnd);
                if (isDragging) {
                    localStorage.setItem(STORAGE_POS_KEY, JSON.stringify({ top: btn.offsetTop, left: btn.offsetLeft }));
                }
            };

            topDoc.addEventListener('mousemove', onMove);
            topDoc.addEventListener('mouseup', onEnd);
            topDoc.addEventListener('touchmove', onMove, { passive: false });
            topDoc.addEventListener('touchend', onEnd);
        };

        btn.addEventListener('mousedown', onStart);
        btn.addEventListener('touchstart', onStart, { passive: false });

        btn.addEventListener('click', () => { if (!isDragging) toggleModal(); });
        topDoc.body.appendChild(btn);
    }

    btn.style.display = 'flex !important';
    btn.innerHTML = renderIconHtml(settings.icon);
}

// 3. 侧边栏魔杖菜单入口
function renderSidebarButton() {
    const settings = getSettings();
    const menu = topDoc.getElementById('extensionsMenu') || topDoc.getElementById('extensions_menu');
    let btn = topDoc.getElementById('extra-mgr-sidebar-btn');

    if (!settings.showSidebar) {
        if (btn) btn.style.display = 'none';
        return;
    }

    if (menu) {
        if (!btn) {
            btn = topDoc.createElement('div');
            btn.id = 'extra-mgr-sidebar-btn';
            btn.className = 'list-group-item flex-container flexGap5 interactable';
            btn.title = '番外文本管理器';
            btn.onclick = () => { toggleModal(); menu.style.display = 'none'; };
            menu.prepend(btn);
        }
        btn.style.display = 'flex';
        btn.innerHTML = `${renderIconHtml(settings.icon)}<span style="margin-left:6px;">番外文本管理器</span>`;
    }
}

// 4. 核心：使用酒馆助手原生的 eventOnButton 绑定 (保证和 回顶/回底/回楼层 排在同一排)
function renderQRButton() {
    const settings = getSettings();
    if (!settings.showQR) return;

    const btnLabel = settings.icon || '📖';

    // 优先使用酒馆助手的原生 eventOnButton API (与回顶脚本保持 100% 一致，自动完美排在一行)
    if (typeof eventOnButton === 'function') {
        eventOnButton(btnLabel, toggleModal);
    } else if (typeof topWin.eventOnButton === 'function') {
        topWin.eventOnButton(btnLabel, toggleModal);
    } else {
        // 备用 DOM 拼接
        const qrBar = topDoc.getElementById('quick-reply-bar') || 
                      topDoc.querySelector('.quick_reply_bar') || 
                      topDoc.getElementById('send_controls');
        let btn = topDoc.getElementById('extra-mgr-qr-btn');
        if (qrBar && !btn) {
            btn = topDoc.createElement('div');
            btn.id = 'extra-mgr-qr-btn';
            btn.className = 'menu_button interactable';
            btn.style.cssText = 'padding: 4px 8px; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; margin: 2px;';
            btn.onclick = toggleModal;
            qrBar.appendChild(btn);
        }
        if (btn) {
            btn.style.display = 'inline-flex';
            btn.innerHTML = renderIconHtml(settings.icon);
        }
    }
}

// 5. 跨窗口文本发送 (引入 triggerSlash 确保 100% 原生触发发送)
window.addEventListener('message', (event) => {
    if (event.data?.type === 'SEND_TO_ST_CHAT') {
        const text = event.data.text;
        if (!text) return;

        // 优先使用酒馆原生的 /send 命令触发发送 (100% 成功，不受系统拦截)
        if (typeof triggerSlash === 'function') {
            triggerSlash(`/send ${text}`);
        } else if (typeof topWin.triggerSlash === 'function') {
            topWin.triggerSlash(`/send ${text}`);
        } else {
            // DOM 备用操作
            const textarea = topDoc.getElementById('send_textarea');
            const sendBtn = topDoc.getElementById('send_but');
            if (textarea) {
                textarea.value = text;
                textarea.dispatchEvent(new Event('input', { bubbles: true }));
                textarea.dispatchEvent(new Event('change', { bubbles: true }));
                if (sendBtn) sendBtn.click();
            }
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
    renderQRButton();
}

setTimeout(refreshUI, 1000);
