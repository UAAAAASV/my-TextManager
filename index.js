// ==========================================
// 番外文本管理器 - 酒馆加载器 (对标文本净化 Flex 居中架构)
// ==========================================
const topDoc = (window.top && window.top.document) ? window.top.document : document;

const MY_WEB_URL = 'https://uaaaaasv.github.io/my-TextManager/';
const STORAGE_SETTINGS_KEY = 'extra_text_mgr_settings_v3';
const STORAGE_POS_KEY = 'extra_text_mgr_btn_pos_v3';

function getSettings() {
    const def = { icon: 'fa-solid fa-book-journal-whills', showFloat: true, showSidebar: true, showQR: true };
    try {
        return { ...def, ...JSON.parse(localStorage.getItem(STORAGE_SETTINGS_KEY) || '{}') };
    } catch (e) { return def; }
}

function saveSettings(s) {
    localStorage.setItem(STORAGE_SETTINGS_KEY, JSON.stringify(s));
}

// 1. 完全对标《文本净化》的 Flexbox 绝对居中架构 (100% 解决起飞问题)
function createMainModal() {
    let overlay = topDoc.getElementById('extra-text-mgr-overlay');
    if (!overlay) {
        // 外层遮罩：Flex 绝对居中布局
        overlay = topDoc.createElement('div');
        overlay.id = 'extra-text-mgr-overlay';
        overlay.style.cssText = `
            display: none; position: fixed; z-index: 100000; left: 0; top: 0;
            width: 100vw; height: 100vh; background-color: rgba(0, 0, 0, 0.6);
            backdrop-filter: blur(4px); -webkit-backdrop-filter: blur(4px);
            justify-content: center; align-items: center;
        `;

        // 内部弹窗主体：天然居中，无 top/left 偏移，永不起飞
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

        // 点击空白背景直接关闭
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

// 2. 悬浮按钮 (支持鼠标与手机触摸拖动)
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
        const defaultTop = window.innerHeight - 90;
        const defaultLeft = window.innerWidth - 70;

        btn.style.cssText = `
            position: fixed;
            top: ${savedPos ? savedPos.top : defaultTop}px;
            left: ${savedPos ? savedPos.left : defaultLeft}px;
            width: 44px; height: 44px;
            background: rgba(0, 0, 0, 0.35);
            backdrop-filter: blur(6px);
            color: rgba(255,255,255,0.9);
            border: 1px solid rgba(255,255,255,0.2);
            border-radius: 50%;
            display: flex; justify-content: center; align-items: center;
            cursor: move; z-index: 99999;
            user-select: none; -webkit-user-select: none;
            touch-action: none;
            box-shadow: 0 4px 15px rgba(0,0,0,0.3);
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

    btn.style.display = 'flex';
    btn.innerHTML = `<i class="${settings.icon}" style="font-size: 19px;"></i>`;
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
            btn.innerHTML = `<i class="fa-solid fa-book-bookmark" style="width:20px; text-align:center;"></i><span>番外文本管理器</span>`;
            btn.onclick = () => { toggleModal(); menu.style.display = 'none'; };
            menu.prepend(btn);
        }
        btn.style.display = 'flex';
    }
}

// 4. 快捷回复栏入口
function renderQRButton() {
    const settings = getSettings();
    const qrBar = topDoc.getElementById('quick-reply-bar') || topDoc.getElementById('send_controls');
    let btn = topDoc.getElementById('extra-mgr-qr-btn');

    if (!settings.showQR) {
        if (btn) btn.style.display = 'none';
        return;
    }

    if (qrBar) {
        if (!btn) {
            btn = topDoc.createElement('div');
            btn.id = 'extra-mgr-qr-btn';
            btn.className = 'menu_button';
            btn.title = '番外文本管理器';
            btn.style.cssText = 'padding: 4px 8px; cursor: pointer; display: inline-flex; align-items: center;';
            btn.innerHTML = `<i class="fa-solid fa-book-bookmark"></i>`;
            btn.onclick = toggleModal;
            qrBar.appendChild(btn);
        }
        btn.style.display = 'inline-flex';
    }
}

// 5. 跨跨通信监听 (文本发送 + 网页端修改配置即时保存刷新)
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
