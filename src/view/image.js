import WBScoket from "../websocket/webSocket";
import {useState} from "react";

export default function imageView(socketUrl){
    let updateData;
    const webSocket = new WBScoket({
        socketUrl: socketUrl,
        timeout: 5000,
        socketMessage: (receive) => {
            const blob = receive.data;
            var reader = new FileReader();
            reader.onload = function (e) {
                updateData(e.target.result.split(',')[1]);
            }
            reader.readAsDataURL(blob);
        },
        socketClose: (msg) => {
            console.log('连接关闭: ' + msg);
            webSocket.close();
        },
        socketError: () => {
            console.log('连接建立失败');
        },
        socketOpen: () => {
            console.log('连接建立成功');
        }
    });

    webSocket.connection();
    return [webSocket, () => {
        let [data,setData] = useState();
        updateData = setData;
        return <img src={'data:image/png;base64, ' + data} style={{width: "100%",height: "100%",position: "absolute",top: 0, left: 0}}/>
    }]
}