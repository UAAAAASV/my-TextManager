// ==========================================
// 核心修复：适配【酒馆助手】沙盒环境，定位到主页面
// ==========================================
const targetDoc = (window.parent && window.parent.document) ? window.parent.document : document;

// 1. 你的 Github Pages 网页地址
const MY_WEB_URL = 'https://uaaaaasv.github.io/my-TextManager/';

// 2. 在酒馆主页面上创建悬浮按钮
function createPluginButton() {
    if (targetDoc.getElementById('my-mgr-btn')) return;

    const btn = targetDoc.createElement('button');
    btn.id = 'my-mgr-btn';
    btn.innerText = '⚙️ 文本管理';
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
        font-weight: bold;
        box-shadow: 0 4px 10px rgba(0,0,0,0.3);
    `;

    btn.onclick = () => {
        let modal = targetDoc.getElementById('my-mgr-modal');
        if (!modal) {
            modal = targetDoc.createElement('div');
            modal.id = 'my-mgr-modal';
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
                <div style="padding:10px; background:#2a2b3d; color:white; display:flex; justify-content:space-between; align-items:center;">
                    <span style="font-weight:bold;">文本管理器</span>
                    <button id="my-mgr-close-btn" style="background:#ef4444; color:white; border:none; padding:4px 10px; border-radius:4px; cursor:pointer;">关闭</button>
                </div>
                <iframe src="${MY_WEB_URL}" style="width:100%; height:100%; border:none; background:white;"></iframe>
            `;
            targetDoc.body.appendChild(modal);

            // 绑定关闭按钮事件
            targetDoc.getElementById('my-mgr-close-btn').onclick = () => {
                modal.style.display = 'none';
            };
        } else {
            modal.style.display = modal.style.display === 'none' ? 'flex' : 'none';
        }
    };

    targetDoc.body.appendChild(btn);
    console.log("【文本管理器】按钮已成功穿透沙盒并绘制到酒馆主界面！");
}

// 执行创建
createPluginButton();
