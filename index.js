console.log("【调试】loader.js 开始加载...");

// 1. 替换成你自己的 Github Pages 网址
const MY_WEB_URL = 'https://uaaaaasv.github.io/my-TextManager/';

// 2. 创建悬浮按钮（强制放在屏幕右下角，保证能看到）
function createFloatingButton() {
    if (document.getElementById('my-html-btn')) {
        console.log("【调试】按钮已存在，跳过创建");
        return;
    }

    const btn = document.createElement('button');
    btn.id = 'my-html-btn';
    btn.innerHTML = '⚙️ 我的网页';
    btn.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        z-index: 999999;
        padding: 10px 15px;
        background: #6366f1;
        color: white;
        border: none;
        border-radius: 8px;
        cursor: pointer;
        box-shadow: 0 4px 10px rgba(0,0,0,0.3);
        font-weight: bold;
    `;

    btn.onclick = () => {
        console.log("【调试】点击了按钮，准备打开弹窗");
        toggleModal();
    };

    document.body.appendChild(btn);
    console.log("【调试】右下角悬浮按钮创建成功！");
}

// 3. 创建 Iframe 弹窗
function toggleModal() {
    let modal = document.getElementById('my-html-modal');
    
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'my-html-modal';
        modal.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 80vw;
            height: 80vh;
            background: #1e1e2e;
            border: 2px solid #6366f1;
            border-radius: 12px;
            z-index: 1000000;
            display: flex;
            flex-direction: column;
            overflow: hidden;
            box-shadow: 0 10px 30px rgba(0,0,0,0.5);
        `;

        modal.innerHTML = `
            <div style="padding: 10px; background: #2a2b3d; color: white; display: flex; justify-content: space-between; align-items: center;">
                <span>我的网页工具</span>
                <button onclick="document.getElementById('my-html-modal').style.display='none'" style="background:red; color:white; border:none; padding:4px 8px; border-radius:4px; cursor:pointer;">关闭</button>
            </div>
            <iframe src="${MY_WEB_URL}" style="width: 100%; height: 100%; border: none; background: white;"></iframe>
        `;
        document.body.appendChild(modal);
    } else {
        modal.style.display = modal.style.display === 'none' ? 'flex' : 'none';
    }
}

// 执行创建
createFloatingButton();        </div>
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
    btn.title = '番外';
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
