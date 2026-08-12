// ==========================================
// 番外文本管理器 - 酒馆加载器 (Emoji + 双端防遮挡版)
// ==========================================
const topDoc = (window.top && window.top.document) ? window.top.document : document;

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

// 渲染图标（智能识别 Emoji 表情 / 文本 / FontAwesome 类名）
function renderIconHtml(iconStr) {
    if (!iconStr) iconStr = '📖';
    if (iconStr.includes('fa-') || iconStr.startsWith('fa ')) {
        return `<i class="${iconStr}"></i>`;
    }
    return `<span style="font-style:normal; font-size:18px; line-height:1; user-select:none;">${iconStr}</span>`;
}

// 1. Flex 居中无边框弹窗
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

// 2. 悬浮按钮 (最高层级防遮挡 + 触摸拖动)
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

// 4. 快捷回复栏入口 (增强型多选择器匹配)
function renderQRButton() {
    const settings = getSettings();
    let btn = topDoc.getElementById('extra-mgr-qr-btn');

    if (!settings.showQR) {
        if (btn) btn.style.display = 'none';
        return;
    }

    // 适配各类酒馆版本/主题的底栏容器选择器
    const qrBar = topDoc.getElementById('quick-reply-bar') || 
                  topDoc.querySelector('.quick_reply_bar') || 
                  topDoc.getElementById('send_controls') || 
                  topDoc.getElementById('send_form') || 
                  topDoc.querySelector('.write_form');

    if (qrBar) {
        if (!btn) {
            btn = topDoc.createElement('div');
            btn.id = 'extra-mgr-qr-btn';
            btn.className = 'menu_button interactable';
            btn.title = '番外文本管理器';
            btn.style.cssText = 'padding: 4px 8px; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; margin: 2px;';
            btn.onclick = toggleModal;
            qrBar.appendChild(btn);
        }
        btn.style.display = 'inline-flex';
        btn.innerHTML = renderIconHtml(settings.icon);
    }
}

// 5. 跨跨通信监听
window.addEventListener('message', (event) => {
    if (event.data?.type === 'SEND_TO_ST_CHAT') {
        const textarea = topDoc.getElementById('send_textarea');
        const sendBtn = topDoc.getElementById('send_but');
        if (textarea && sendBtn) {
            textarea.value = event.data.text;
            textarea.dispatchEvent(new Event('input', { bubbles: true }));
            setTimeout(() => { sendBtn.click(); }, 100);
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

setTimeout(refreshUI, 1200);
