// ==========================================
// 1. 配置你的网页地址 (替换成你第一步获取的 Github Pages 网址)
// ==========================================
const MY_WEB_URL = 'https://xxx.github.io/your-repo-name/'; 

// ==========================================
// 2. 创建嵌入网页的弹窗 (Modal + Iframe)
// ==========================================
function createWebModal() {
    if (document.getElementById('my-html-modal')) return;

    // 创建弹窗容器
    const modal = document.createElement('div');
    modal.id = 'my-html-modal';
    modal.style.cssText = `
        display: none;
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 80vw;
        height: 80vh;
        background: #1e1e2e;
        border: 2px solid var(--SmartThemeBorderColor, #444);
        border-radius: 12px;
        z-index: 99999;
        box-shadow: 0 10px 30px rgba(0,0,0,0.5);
        overflow: hidden;
        flex-direction: column;
    `;

    // 弹窗顶部标题栏 + 关闭按钮
    modal.innerHTML = `
        <div style="padding: 8px 15px; background: rgba(0,0,0,0.2); display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(255,255,255,0.1);">
            <span style="color: #fff; font-weight: bold;">我的工具箱</span>
            <button id="close-my-html-modal" style="background: transparent; border: none; color: #fff; cursor: pointer; font-size: 16px;">✕</button>
        </div>
        <!-- 核心：用 iframe 直接加载你的 HTML 网页 -->
        <iframe id="my-html-iframe" src="${MY_WEB_URL}" style="width: 100%; height: 100%; border: none;"></iframe>
    `;

    document.body.appendChild(modal);

    // 关闭按钮事件
    document.getElementById('close-my-html-modal').onclick = () => {
        modal.style.display = 'none';
    };
}

// ==========================================
// 3. 在酒馆加入触发按钮 (快捷回复栏 / 顶部栏)
// ==========================================
function injectButton() {
    if (document.getElementById('my-html-btn')) return;

    const btn = document.createElement('div');
    btn.id = 'my-html-btn';
    btn.className = 'menu_button'; // 酒馆原生按钮样式
    btn.title = '打开我的网页';
    btn.innerHTML = '<i class="fa-solid fa-window-maximize"></i>'; // 图标

    // 点击按钮显示/隐藏弹窗
    btn.onclick = () => {
        createWebModal();
        const modal = document.getElementById('my-html-modal');
        modal.style.display = (modal.style.display === 'none' || !modal.style.display) ? 'flex' : 'none';
    };

    // 插入到顶部导航栏 (如果想插到别的按钮旁边，可以换选择器)
    const topBar = document.getElementById('top-bar');
    if (topBar) {
        topBar.appendChild(btn);
    }
}

// 初始化执行
injectButton();