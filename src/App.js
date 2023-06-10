import './App.css';
import WBScoket from './websocket/WebSocket';

function App() {

  function getCurrentImageFrame(){
    let AppHagtControlScreen;
    let ctx;
    const img = new Image();
    img.onload = function(){
      AppHagtControlScreen.width = window.innerWidth;
      AppHagtControlScreen.height = window.innerHeight;
      ctx.drawImage(img,0,0,AppHagtControlScreen.width,AppHagtControlScreen.height);
    }
    const webSocket = new WBScoket({
      socketUrl: 'ws://localhost:8888/Connection?currentTime=' + new Date().getTime(),
      timeout: 5000,
      socketMessage: (receive) => {
        const bolbImage = receive.data;
        window.URL.revokeObjectURL(img.src);
        img.src = window.URL.createObjectURL(bolbImage);
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
        window.addEventListener("resize", resizeCanvas);
        function resizeCanvas() {
          AppHagtControlScreen.width = window.innerWidth;
          AppHagtControlScreen.height = window.innerHeight;
        }
      }
    });
    try {
      webSocket.connection();
    } catch (e) {
      console.log(e);
    }
  }

  const onKeyDown = (event) => {
    debugger
  }

  window.onload = getCurrentImageFrame;

  return (
    <div className="App">
      <header className="App-header">
        <canvas id="AppHagtControlScreen" className="App-hagt-control-screen" onKeyDown={onKeyDown}></canvas>
      </header>
    </div>
  );
}

export default App;
