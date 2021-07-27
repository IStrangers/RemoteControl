import logo from './logo.svg';
import './App.css';
import Button from '@material-ui/core/Button';
import axios from "axios";
import {useState} from 'react';
import WBScoket from './websocket/WebSocket';

function App() {

  const [randomCode, setRandomCode] = useState("");

  function getRandomCode () {
    axios.get(" http://localhost:8080/GetRandomNumber")
    .then(res => {
      if (res.status === 200){
        setRandomCode(res.data.randomCode);
      }
    })
    .catch(error => {
      console.log(error);
    });
  }

  function getCurrentImageFrame(){
    let webScoket = new WBScoket({
      socketUrl: 'ws://localhost:8888/Connection',
      timeout: 5000,
      socketMessage: (receive) => {
        console.log(receive);  //后端返回的数据，渲染页面
      },
      socketClose: (msg) => {
        console.log(msg);
      },
      socketError: () => {
        console.log('连接建立失败');
      },
      socketOpen: () => {
        console.log('连接建立成功');
      }
    });
    try {
      webScoket.connection();
    } catch (e) {
      console.log(e);
    }
  }
  getCurrentImageFrame();

  return (
    <div className="App">
      <header className="App-header">
        <canvas className="App-hagt-control-screen"></canvas>
        <img src={logo} className="App-logo" alt="logo" />
        <div >{randomCode}</div>
        <br/>
        <Button onClick={getRandomCode} variant="contained" color="primary" disableElevation>
          生成号码
        </Button>
      </header>
    </div>
  );
}

export default App;
