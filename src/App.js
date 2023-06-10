import './App.css';
import WBScoket from './websocket/WebSocket';
import pako from 'pako'
import {useRef} from "react";

function App() {

  const viewRef = useRef()
  let webSocket;

  const decompress = (blob, callback) => {
    const fileReader = new FileReader();
    fileReader.onload = function() {
      const compressedData = new Uint8Array(fileReader.result);
      const uncompressedData = pako.inflate(compressedData);
      const uncompressedBlob = new Blob([uncompressedData], { type: blob.type });
      callback(null, uncompressedBlob);
    };
    fileReader.onerror = function() {
      callback(new Error('Failed to read the file.'));
    };
    fileReader.readAsArrayBuffer(blob);
  }
  function getCurrentImageFrame(){
    let AppHagtControlScreen;
    let ctx;
    const img = new Image();
    img.onload = function(){
      AppHagtControlScreen.width = window.innerWidth;
      AppHagtControlScreen.height = window.innerHeight;
      ctx.drawImage(img,0,0,AppHagtControlScreen.width,AppHagtControlScreen.height);
    }
     webSocket = new WBScoket({
      //192.168.0.102
      //192.168.0.101
      socketUrl: 'ws:/localhost:8888/Connection?currentTime=' + new Date().getTime(),
      timeout: 5000,
      socketMessage: (receive) => {
        decompress(receive.data, (error, uncompressedBlob) => {
          window.URL.revokeObjectURL(img.src);
          img.src = window.URL.createObjectURL(uncompressedBlob);
        });
      },
      socketClose: (msg) => {
        console.log(msg);
        webSocket.close();
      },
      socketError: () => {
        console.log('连接建立失败');
      },
      socketOpen: () => {
        console.log('连接建立成功');
        AppHagtControlScreen = document.getElementById('AppHagtControlScreen');
        ctx = AppHagtControlScreen.getContext('2d');
        window.addEventListener("resize", () => {
          AppHagtControlScreen.width = window.innerWidth;
          AppHagtControlScreen.height = window.innerHeight;
        });
      }
    });

    webSocket.connection();
    viewRef.current.focus();
  }
  const onKeyDown = (event) => {
    webSocket.sendMessage({
      MessageType: 'KeyDown',
      Value: {
        key: event.key
      }
    })
  }
  const onKeyUp = (event) => {
    webSocket.sendMessage({
      MessageType: 'KeyUp',
      Value: {
        key: event.key
      }
    })
  }
  const onClick = (event) => {
    let key;
    switch (event.button) {
      case 0:
        key = "left"
        break;
      case 1:
        break;
      case 2:
        key = "right"
        break;
    }
    webSocket.sendMessage({
      MessageType: 'MouseClick',
      Value: {
        key: key,
        isDouble: false
      }
    })
  }
  const onMouseMove = (event) => {
    webSocket.sendMessage({
      MessageType: 'MoveSmooth',
      Value: {
        x: event.clientX,
        y: event.clientY
      }
    })
  }
  const onContextMenu = (event) => {
    event.preventDefault();
    onClick(event)
  }
  window.onload = getCurrentImageFrame;

  return (
    <div className="App">
        <div className="view" ref={viewRef} tabIndex={-1} onContextMenu={onContextMenu} onKeyDown={onKeyDown} onKeyUp={onKeyUp} onClick={onClick} onMouseMove={onMouseMove}>
          <canvas id="AppHagtControlScreen" className="App-hagt-control-screen"></canvas>
        </div>
    </div>
  );
}

export default App;
