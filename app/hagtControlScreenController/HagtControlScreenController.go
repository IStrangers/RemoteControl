package hagtControlScreenController

import (
	"bytes"
	"github.com/gorilla/websocket"
	"github.com/kbinani/screenshot"
	"image/png"
	"log"
	"net/http"
	"sync"
)

var (
	upgrader = websocket.Upgrader{
		// 读取存储空间大小
		ReadBufferSize: 1024,
		// 写入存储空间大小
		WriteBufferSize: 1024,
		// 允许跨域
		CheckOrigin: func(r *http.Request) bool {
			return true
		},
	}
	conns sync.Map
)

func Start() {
	go func() {
		http.HandleFunc("/Connection", connection)
		log.Println("HagtControlScreenController Listening and serving HTTP on :8888")
		err := http.ListenAndServe(":8888", nil)
		if err != nil {
			log.Fatal(err)
		}
	}()
	for {
		img, _ := screenshot.CaptureDisplay(0)
		buf := new(bytes.Buffer)
		png.Encode(buf, img)
		data := buf.Bytes()
		sendCurrentImageFrame(data)
		//time.Sleep(1 * time.Second)
	}
}

/**
  连接
*/
func connection(w http.ResponseWriter, r *http.Request) {
	params := r.URL.Query()
	print(params)
	currentTime := params.Get("currentTime")
	// 完成http应答，在httpheader中放下如下参数
	var conn *websocket.Conn
	var err error
	if conn, err = upgrader.Upgrade(w, r, nil); err != nil {
		// 获取连接失败直接返回
		return
	}
	conns.Store(currentTime, conn)
}

/**
  发送当前图像帧
*/
func sendCurrentImageFrame(data []byte) {
	Foreach(Send, data)
}

func Foreach(f func(k interface{}, conn *websocket.Conn, data []byte), data []byte) {
	conns.Range(func(k, conn interface{}) bool {
		f(k, conn.(*websocket.Conn), data)
		return true
	})
}

func Send(k interface{}, conn *websocket.Conn, data []byte) {
	if err := conn.WriteMessage(websocket.BinaryMessage, data); err != nil {
		conns.Delete(k)
		conn.Close()
	}
}
