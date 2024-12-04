function getLocalIP() {
    return new Promise((resolve, reject) => {
        try {
            // 检查WebRTC支持
            if (!window.RTCPeerConnection) {
                throw new Error('浏览器不支持WebRTC');
            }

            const pc = new RTCPeerConnection({
                iceServers: []
            });

            // 添加超时处理
            setTimeout(() => {
                if (pc.connectionState !== 'closed') {
                    pc.close();
                    reject(new Error('获取IP超时'));
                }
            }, 5000);

            pc.createDataChannel("");
            pc.createOffer()
                .then(offer => pc.setLocalDescription(offer))
                .catch(err => {
                    console.error('创建offer失败:', err);
                    reject(err);
                });

            pc.onicecandidate = (event) => {
                if (!event.candidate) return;

                console.log('获取到candidate:', event.candidate.candidate);
                
                const ipRegex = /([0-9]{1,3}(\.[0-9]{1,3}){3})/;
                const match = ipRegex.exec(event.candidate.candidate);
                
                if (match) {
                    const ip = match[1];
                    console.log('找到IP:', ip);
                    if (ip.substr(0, 3) !== '127') {
                        resolve(ip);
                        pc.onicecandidate = null;
                        pc.close();
                    }
                }
            };
        } catch (err) {
            console.error('获取IP时发生错误:', err);
            reject(err);
        }
    });
}

// 显示IP地址
window.addEventListener('load', () => {
    const ipDisplay = document.getElementById('ipAddress');
    
    ipDisplay.textContent = '正在获取IP地址...';
    console.log('开始获取IP地址');
    
    getLocalIP()
        .then(ip => {
            console.log('成功获取到IP:', ip);
            ipDisplay.textContent = ip;
        })
        .catch(err => {
            console.error('获取IP地址失败:', err);
            ipDisplay.textContent = '无法获取IP地址: ' + err.message;
        });
}); 
