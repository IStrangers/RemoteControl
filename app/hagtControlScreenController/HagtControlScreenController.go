package hagtControlScreenController

import (
	"fmt"
	"golang.org/x/net/websocket"
	"log"
	"net/http"
	"os"
	"sync"
)

var (
	conns sync.Map
)

func Start() {
	http.Handle("/Connection", websocket.Handler(connection))
	log.Println("HagtControlScreenController Listening and serving HTTP on :8888")
	err := http.ListenAndServe(":8888", nil)
	if err != nil {
		log.Fatal(err)
	}
}

/**
  连接
*/
func connection(conn *websocket.Conn) {
	params := conn.Request().URL.Query()
	print(params)
	currentTime := params.Get("currentTime")
	conns.Store(currentTime, conn)
	sendCurrentImageFrame()
}

/**
  发送当前图像帧
*/
func sendCurrentImageFrame() {
	file, _ := os.OpenFile("C:\\Users\\Administrator\\Pictures\\Saved Pictures\\t0102f87f6ba772d45e.gif", os.O_RDWR, 0666)
	fileStat, _ := file.Stat()
	data := make([]byte, fileStat.Size())
	file.Read(data)
	Foreach(Send, data)
}

func Foreach(f func(conn *websocket.Conn, msg interface{}), v interface{}) {
	conns.Range(func(k, conn interface{}) bool {
		f(conn.(*websocket.Conn), v)
		return true
	})
}

func Send(conn *websocket.Conn, msg interface{}) {
	if err := websocket.Message.Send(conn, msg); err != nil {
		fmt.Println("Send msg error: ", err)
	}
}
