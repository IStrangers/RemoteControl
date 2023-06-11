import WBScoket from "../websocket/webSocket";
import {useEffect, useRef} from "react";
import {decompressBlob} from "../util/common";

export default function canvasView(socketUrl){

    const mediaSource = new MediaSource();
    let sourceBuffer;
    mediaSource.addEventListener('sourceopen', function() {
        sourceBuffer = mediaSource.addSourceBuffer('video/mp4; codecs="avc1.42E01E"');
    });

    const webSocket = new WBScoket({
        socketUrl: socketUrl,
        timeout: 5000,
        socketMessage: (receive) => {
            const blob = receive.data;
            decompressBlob(blob,(error, uncompressedData) => {
                sourceBuffer && sourceBuffer.appendBuffer(uncompressedData);
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
        const videoRef = useRef()
        useEffect(() => {
            videoRef.current.src = URL.createObjectURL(mediaSource);
        },[videoRef]);
        return <video ref={videoRef}></video>
    }]
}