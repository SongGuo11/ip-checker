function getLocalIP() {
    return new Promise((resolve, reject) => {
        // 使用WebRTC来获取本地IP地址
        const RTCPeerConnection = window.RTCPeerConnection || window.webkitRTCPeerConnection;
        const pc = new RTCPeerConnection({
            iceServers: []
        });

        pc.createDataChannel("");
        pc.createOffer()
            .then(offer => pc.setLocalDescription(offer))
            .catch(err => reject(err));

        pc.onicecandidate = (event) => {
            if (!event.candidate) return;

            // 从candidate中提取IP地址
            const ipRegex = /([0-9]{1,3}(\.[0-9]{1,3}){3})/;
            const match = ipRegex.exec(event.candidate.candidate);
            
            if (match) {
                const ip = match[1];
                if (ip.substr(0, 3) !== '127') { // 排除localhost
                    resolve(ip);
                    pc.onicecandidate = null;
                    pc.close();
                }
            }
        };
    });
}

// 显示IP地址
window.addEventListener('load', () => {
    const ipDisplay = document.getElementById('ipAddress');
    
    getLocalIP()
        .then(ip => {
            ipDisplay.textContent = ip;
        })
        .catch(err => {
            ipDisplay.textContent = '无法获取IP地址';
            console.error('获取IP地址失败:', err);
        });
});
