import WBScoket from "../websocket/webSocket";
import {useEffect, useRef} from "react";
import {decompressBlob} from "../util/common";

export default function canvasView(socketUrl){
    const img = new Image();
    const webSocket = new WBScoket({
        socketUrl: socketUrl,
        timeout: 5000,
        socketMessage: (receive) => {
            const blob = receive.data;
            decompressBlob(blob, (error, uncompressedData) => {
                window.URL.revokeObjectURL(img.src);
                const uncompressedBlob = new Blob([uncompressedData], { type: blob.type });
                img.src = window.URL.createObjectURL(uncompressedBlob);
            });
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
        const canvasRef = useRef();
        useEffect(() => {
            canvasRef.current.width = window.innerWidth;
            canvasRef.current.height = window.innerHeight;
            const ctx = canvasRef.current.getContext('2d');
            window.addEventListener("resize", () => {
                canvasRef.current.width = window.innerWidth;
                canvasRef.current.height = window.innerHeight;
            });
            img.onload = function(){
                ctx.drawImage(img,0,0,canvasRef.current.width,canvasRef.current.height);
            }
        },[canvasRef])
        return <canvas ref={canvasRef} className="App-hagt-control-screen"></canvas>
    }]
}