// ==========================================
// 番外文本管理器 v3.0 - 双端极简无边框版
// ==========================================
const topDoc = (window.top && window.top.document) ? window.top.document : document;
const topWin = window.top || window;

const MY_WEB_URL = 'https://uaaaaasv.github.io/my-TextManager/';
const STORAGE_SETTINGS_KEY = 'extra_text_mgr_settings_v3';
const STORAGE_POS_KEY = 'extra_text_mgr_btn_pos_v3';

// 默认配置
function getSettings() {
    const def = {
        icon: 'fa-solid fa-book-journal-whills',
        showFloat: true,
        showSidebar: true,
        showQR: true
    };
    try {
        return { ...def, ...JSON.parse(localStorage.getItem(STORAGE_SETTINGS_KEY) || '{}') };
    } catch (e) { return def; }
}

function saveSettings(settings) {
    localStorage.setItem(STORAGE_SETTINGS_KEY, JSON.stringify(settings));
}

// 1. 无边框、无黑条、手机/PC自适应弹窗（点击空白关闭）
function createMainModal() {
    let overlay = topDoc.getElementById('extra-text-mgr-overlay');
    if (!overlay) {
        // 全屏背景遮罩
        overlay = topDoc.createElement('div');
        overlay.id = 'extra-text-mgr-overlay';
        overlay.style.cssText = `
            position: fixed; inset: 0; z-index: 999999;
            background: rgba(0, 0, 0, 0.65);
            backdrop-filter: blur(8px);
            -webkit-backdrop-filter: blur(8px);
            display: none; align-items: center; justify-content: center;
        `;

        // 弹窗主体（无黑条、无丑边框）
        const modal = topDoc.createElement('div');
        modal.id = 'extra-text-mgr-modal';
        modal.style.cssText = `
            width: 92vw; height: 92vh; max-width: 1400px;
            background: #11111b; border-radius: 16px;
            overflow: hidden; box-shadow: 0 20px 50px rgba(0,0,0,0.8);
            position: relative; border: 1px solid rgba(255,255,255,0.1);
        `;

        modal.innerHTML = `<iframe src="${MY_WEB_URL}" style="width:100%; height:100%; border:none; background:transparent;"></iframe>`;
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

// 2. 极简透明悬浮图标（支持鼠标与手机触摸拖动）
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
            background: rgba(0, 0, 0, 0.3);
            backdrop-filter: blur(6px);
            color: rgba(255,255,255,0.85);
            border: 1px solid rgba(255,255,255,0.15);
            border-radius: 50%;
            display: flex; justify-content: center; align-items: center;
            cursor: move; z-index: 999998;
            user-select: none; -webkit-user-select: none;
            touch-action: none;
            box-shadow: 0 4px 15px rgba(0,0,0,0.3);
        `;

        // 拖动逻辑（兼容 PC 鼠标与手机 Touch）
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

        btn.addEventListener('click', (e) => {
            if (!isDragging) toggleModal();
        });

        topDoc.body.appendChild(btn);
    }

    btn.style.display = 'flex';
    btn.innerHTML = `<i class="${settings.icon}" style="font-size: 19px;"></i>`;
}

// 3. 侧边栏入口
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

// 5. 酒馆内部设置界面 (含至少保留一个入口的限制)
function openSettingsDialog() {
    let dialog = topDoc.getElementById('extra-text-mgr-settings-dialog');
    const settings = getSettings();

    if (!dialog) {
        dialog = topDoc.createElement('div');
        dialog.id = 'extra-text-mgr-settings-dialog';
        dialog.style.cssText = `
            position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
            background: #1e1e2e; color: white; padding: 20px; border-radius: 12px;
            z-index: 1000001; border: 1px solid rgba(255,255,255,0.15);
            box-shadow: 0 15px 35px rgba(0,0,0,0.6); width: 310px; font-family: sans-serif;
        `;
        topDoc.body.appendChild(dialog);
    }

    dialog.innerHTML = `
        <h3 style="margin:0 0 15px 0; font-size:16px;">酒馆内部设置 - 番外文本管理</h3>
        <div style="margin-bottom:12px;">
            <label style="font-size:12px; display:block; margin-bottom:4px; color:#ccc;">图标 FontAwesome 类名：</label>
            <input id="set-icon-input" type="text" value="${settings.icon}" style="width:100%; padding:6px; background:#11111b; color:white; border:1px solid #444; border-radius:6px; box-sizing:border-box;" />
        </div>
        <div style="margin-bottom:12px; font-size:13px; display:flex; flex-direction:column; gap:8px;">
            <label style="display:flex; align-items:center; gap:8px; cursor:pointer;">
                <input id="chk-float" type="checkbox" ${settings.showFloat ? 'checked' : ''} /> 开启悬浮图标按钮
            </label>
            <label style="display:flex; align-items:center; gap:8px; cursor:pointer;">
                <input id="chk-sidebar" type="checkbox" ${settings.showSidebar ? 'checked' : ''} /> 开启侧边栏(魔杖)入口
            </label>
            <label style="display:flex; align-items:center; gap:8px; cursor:pointer;">
                <input id="chk-qr" type="checkbox" ${settings.showQR ? 'checked' : ''} /> 开启快捷回复栏入口
            </label>
        </div>
        <div style="display:flex; justify-content:flex-end; gap:8px; margin-top:15px;">
            <button id="set-cancel-btn" style="background:#444; color:white; border:none; padding:6px 12px; border-radius:6px; cursor:pointer;">取消</button>
            <button id="set-save-btn" style="background:#6366f1; color:white; border:none; padding:6px 12px; border-radius:6px; cursor:pointer;">保存</button>
        </div>
    `;

    dialog.style.display = 'block';

    topDoc.getElementById('set-cancel-btn').onclick = () => dialog.style.display = 'none';
    topDoc.getElementById('set-save-btn').onclick = () => {
        const icon = topDoc.getElementById('set-icon-input').value.trim() || 'fa-solid fa-book';
        const showFloat = topDoc.getElementById('chk-float').checked;
        const showSidebar = topDoc.getElementById('chk-sidebar').checked;
        const showQR = topDoc.getElementById('chk-qr').checked;

        // 必须保留至少一个入口
        if (!showFloat && !showSidebar && !showQR) {
            alert("⚠️至少必须保留一个入口");
            return;
        }

        saveSettings({ icon, showFloat, showSidebar, showQR });
        dialog.style.display = 'none';
        refreshUI();
    };
}

// 6. 注入【酒馆内部设置】选项到侧边栏
function injectSettingsEntry() {
    const menu = topDoc.getElementById('extensionsMenu') || topDoc.getElementById('extensions_menu');
    if (menu && !topDoc.getElementById('extra-mgr-settings-entry')) {
        const btn = topDoc.createElement('div');
        btn.id = 'extra-mgr-settings-entry';
        btn.className = 'list-group-item flex-container flexGap5 interactable';
        btn.innerHTML = `<i class="fa-solid fa-gear" style="width:20px; text-align:center;"></i><span>【设置】番外文本管理器</span>`;
        btn.onclick = () => { openSettingsDialog(); menu.style.display = 'none'; };
        menu.appendChild(btn);
    }
}

// 7. 接收文本直接发送到酒馆
window.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SEND_TO_ST_CHAT') {
        const text = event.data.text;
        const textarea = topDoc.getElementById('send_textarea');
        const sendBtn = topDoc.getElementById('send_but');

        if (textarea && sendBtn) {
            textarea.value = text;
            textarea.dispatchEvent(new Event('input', { bubbles: true }));
            setTimeout(() => { sendBtn.click(); }, 100);
        }
    }
});

function refreshUI() {
    createMainModal();
    renderFloatButton();
    renderSidebarButton();
    renderQRButton();
    injectSettingsEntry();
}

setTimeout(refreshUI, 1200);
