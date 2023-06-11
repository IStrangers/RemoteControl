import './App.css';
import {useEffect, useRef} from "react";
import canvasView from "./view/canvas"
import videoView from  "./view/video"
import imageView from  "./view/image"
import {throttle} from "./util/common";

//192.168.0.102
//192.168.0.101
const socketUrl = 'ws:/localhost:8888/Connection?id=' + new Date().getTime()
const viewType = "Image"

const [webSocket,render] = (() => {
  if(viewType === "Canvas") {
    return canvasView(socketUrl)
  }
  if(viewType === "Canvas") {
    return videoView(socketUrl)
  }
  if(viewType === "Image") {
    return imageView(socketUrl)
  }
})()

function App() {

  const viewRef = useRef()

  const onContextMenu = (event) => {
    event.preventDefault();
    onClick(event)
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
  const onMouseMove = throttle((event) => {
    webSocket.sendMessage({
      MessageType: 'MoveSmooth',
      Value: {
        x: event.clientX,
        y: event.clientY,
        fw: viewRef.current.clientWidth,
        fh: viewRef.current.clientHeight
      }
    })
  },200)
  const onWheel = throttle((event) => {
    webSocket.sendMessage({
      MessageType: 'ScrollMouse',
      Value: {
        x: event.clientX,
        y: event.clientY,
      }
    })
  },200)

  useEffect(() => viewRef.current.focus(),[viewRef])

  return (
    <div className="App">
        <div className="view" ref={viewRef} tabIndex={-1} onContextMenu={onContextMenu} onKeyDown={onKeyDown} onKeyUp={onKeyUp} onClick={onClick} onMouseMove={onMouseMove} onWheel={onWheel}>
          { render() }
        </div>
    </div>
  );
}

export default App;
