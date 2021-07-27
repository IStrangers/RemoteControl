package hagtControlScreenController

import (
	"golang.org/x/net/websocket"
	"log"
	"net/http"
)

var (
	conns = make(map[string]*websocket.Conn)
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
	form := conn.Request().Form
	print(form)
	conns[""] = conn
}

/**
  获取当前图像帧
*/
func getCurrentImageFrame() {

}
