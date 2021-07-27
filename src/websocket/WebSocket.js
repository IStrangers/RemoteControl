/**
 * 参数：[socketOpen|socketClose|socketMessage|socketError] = func，[socket连接成功时触发|连接关闭|发送消息|连接错误]
 * timeout：连接超时时间
 * @type {module.webSocket}
 */
module.exports =  class webSocket {
    constructor(param = {}) {
        this.param = param;
        this.reconnectCount = 0;
        this.socket = null;
        this.isSucces=true;
    }
    connection = () => {
        let {socketUrl} = this.param;
        // 检测当前浏览器是什么浏览器来决定用什么socket
        if ('WebSocket' in window) {
            this.socket = new WebSocket(socketUrl);
        }
        else if ('MozWebSocket' in window) {
            // eslint-disable-next-line no-undef
            this.socket = new MozWebSocket(socketUrl);
        }
        else {
            // eslint-disable-next-line no-undef
            this.socket = new SockJS(socketUrl);
        }
        this.socket.onopen = this.onopen;
        this.socket.onmessage = this.onmessage;
        this.socket.onclose = this.onclose;
        this.socket.onerror = this.onerror;
        this.socket.sendMessage = this.sendMessage;
        this.socket.closeSocket = this.closeSocket;
    };
    // 连接成功触发
    onopen = () => {
        let {socketOpen} = this.param;
        //连接成功将标识符改为false
        this.isSucces = false;
        socketOpen && socketOpen();
    };
    // 后端向前端推得数据
    onmessage = (msg) => {
        let {socketMessage} = this.param;
        socketMessage && socketMessage(msg);
    };
    // 关闭连接触发
    onclose = (e) => {
        //关闭将标识符改为true
        this.isSucces = true;
        let {socketClose} = this.param;
        socketClose && socketClose(e);
        // 根据后端返回的状态码做操作
        // 我的项目是当前页面打开两个或者以上，就把当前以打开的socket关闭
        // 否则就20秒重连一次，直到重连成功为止
        if(e.code === '500'){
            this.socket.close();
        }
    };
    onerror = (e) => {
        // socket连接报错触发
        let {socketError} = this.param;
        this.socket = null;
        socketError && socketError(e);
    };
    sendMessage = (value) => {
        // 向后端发送数据
        if(this.socket) {
            this.socket.send(JSON.stringify(value));
        }
    };
};