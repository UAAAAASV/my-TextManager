// 1. 你的 Github Pages 网页地址
const MY_WEB_URL = 'https://uaaaaasv.github.io/my-TextManager/';

// 2. 注入右下角悬浮按钮
function createPluginButton() {
    if (document.getElementById('my-mgr-btn')) return;

    const btn = document.createElement('button');
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
        let modal = document.getElementById('my-mgr-modal');
        if (!modal) {
            modal = document.createElement('div');
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
            `;
            // 注意：下面的 HTML 全都在反引号 `` 内部！
            modal.innerHTML = `
                <div style="padding:10px; background:#2a2b3d; color:white; display:flex; justify-size:space-between; align-items:center;">
                    <span style="font-weight:bold;">文本管理器</span>
                    <button onclick="document.getElementById('my-mgr-modal').style.display='none'" style="background:#ef4444; color:white; border:none; padding:4px 10px; border-radius:4px; cursor:pointer; margin-left:auto;">关闭</button>
                </div>
                <iframe src="${MY_WEB_URL}" style="width:100%; height:100%; border:none; background:white;"></iframe>
            `;
            document.body.appendChild(modal);
        } else {
            modal.style.display = modal.style.display === 'none' ? 'flex' : 'none';
        }
    };

    document.body.appendChild(btn);
}

// 执行创建
createPluginButton();
