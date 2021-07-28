//import logo from './logo.svg';
import './App.css';
//import Button from '@material-ui/core/Button';
// import axios from "axios";
// import {useState} from 'react';
import WBScoket from './websocket/WebSocket';

function App() {

/*  const [randomCode, setRandomCode] = useState("");

  function getRandomCode () {
    axios.get("http://192.168.0.128:8080/GetRandomNumber")
    .then(res => {
      if (res.status === 200){
        setRandomCode(res.data.randomCode);
      }
    })
    .catch(error => {
      console.log(error);
    });
  }*/

  function getCurrentImageFrame(){
    let AppHagtControlScreen;
    let ctx;
    let img = new Image();
    img.onload = function(){
      AppHagtControlScreen.width = window.innerWidth;
      AppHagtControlScreen.height = window.innerHeight;
      ctx.drawImage(img,0,0,AppHagtControlScreen.width,AppHagtControlScreen.height);
    }
    let webScoket = new WBScoket({
      socketUrl: 'ws://192.168.0.128:8888/Connection?currentTime=' + new Date().getTime(),
      timeout: 5000,
      socketMessage: (receive) => {
        let bolbImage = receive.data;
        window.URL.revokeObjectURL(img.src);
        img.src = window.URL.createObjectURL(bolbImage);
      },
      socketClose: (msg) => {
        console.log(msg);
        webScoket.close();
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
      webScoket.connection();
    } catch (e) {
      console.log(e);
    }
  }

  window.onload = getCurrentImageFrame;

  return (
    <div className="App">
      <header className="App-header">
        <canvas id="AppHagtControlScreen" className="App-hagt-control-screen"></canvas>
{/*        <img id="AppLogo" src={logo} className="App-logo" alt="logo"/>
        <div >{randomCode}</div>
        <br/>
        <Button onClick={getRandomCode} variant="contained" color="primary" disableElevation>
          生成号码
        </Button>*/}
      </header>
    </div>
  );
}

export default App;
