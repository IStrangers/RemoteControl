package hagtControlScreenController

import (
	"bytes"
	"encoding/json"
	"github.com/go-vgo/robotgo"
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
	go handlingFrame()
	go handlingEvent()
	startServer()
}

/*
*发送当前图像帧
 */
func handlingFrame() {
	for {
		img, _ := screenshot.CaptureDisplay(0)
		buf := new(bytes.Buffer)
		png.Encode(buf, img)
		data := buf.Bytes()
		sendCurrentImageFrame(data)
	}
}

func sendCurrentImageFrame(data []byte) {
	Foreach(Send, data)
}

func Foreach(f func(k any, conn *websocket.Conn, data []byte), data []byte) {
	conns.Range(func(k, conn any) bool {
		f(k, conn.(*websocket.Conn), data)
		return true
	})
}

func Send(k any, conn *websocket.Conn, data []byte) {
	if err := conn.WriteMessage(websocket.BinaryMessage, data); err != nil {
		conns.Delete(k)
		conn.Close()
	}
}

func handlingEvent() {
	for {
		conns.Range(func(k, conn any) bool {
			socketConn := conn.(*websocket.Conn)
			messageType, data, err := socketConn.ReadMessage()
			if err != nil {
				return false
			}
			switch messageType {
			case websocket.TextMessage:
				handlingTextMessage(data)
				break
			case websocket.BinaryMessage:
				handlingBinaryMessage(data)
				break
			}
			return true
		})
	}
}

type Message struct {
	messageType string
	value       any
}

type MessageHandler interface {
	handlingMessage(message Message)
}

type KeyDownHandling struct{}
type KeyDownValue struct {
	key string
}

func (self KeyDownHandling) handlingMessage(message Message) {
	keyDownValue := message.value.(KeyDownValue)
	robotgo.KeyDown(keyDownValue.key)
}

type KeyUpHandling struct{}
type KeyUpValue struct {
	key string
}

func (self KeyUpHandling) handlingMessage(message Message) {
	keyUpValue := message.value.(KeyUpValue)
	robotgo.KeyUp(keyUpValue.key)
}

type MouseClickHandling struct{}
type MouseClickValue struct {
	key      string
	isDouble bool
}

func (self MouseClickHandling) handlingMessage(message Message) {
	mouseClickValue := message.value.(MouseClickValue)
	robotgo.Click(mouseClickValue.key, mouseClickValue.isDouble)
}

type MoveSmoothHandling struct{}
type MoveSmoothValue struct {
	x, y int
}

func (self MoveSmoothHandling) handlingMessage(message Message) {
	position := message.value.(MoveSmoothValue)
	robotgo.MoveSmooth(position.x, position.y)
}

type ScrollMouseHandling struct{}
type ScrollMouseValue struct {
	x, y int
}

func (self ScrollMouseHandling) handlingMessage(message Message) {
	scrollMouseValue := message.value.(ScrollMouseValue)
	robotgo.Scroll(scrollMouseValue.x, scrollMouseValue.y)
}

type MouseToggleHandling struct{}
type MouseToggleValue struct {
	key         string
	leftOrRight string
}

func (self MouseToggleHandling) handlingMessage(message Message) {
	mouseToggleValue := message.value.(MouseToggleValue)
	robotgo.Toggle(mouseToggleValue.key, mouseToggleValue.leftOrRight)
}

var messageHandlerMap = map[string]MessageHandler{
	"KeyDown":     &KeyDownHandling{},
	"KeyUp":       &KeyUpHandling{},
	"MouseClick":  &MouseClickHandling{},
	"MoveSmooth":  &MoveSmoothHandling{},
	"ScrollMouse": &ScrollMouseHandling{},
	"MouseToggle": &MouseToggleHandling{},
}

func handlingTextMessage(data []byte) {
	var message Message
	json.Unmarshal(data, &message)
	handler := messageHandlerMap[message.messageType]
	handler.handlingMessage(message)
}

func handlingBinaryMessage(data []byte) {

}

/*
*连接
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

func startServer() {
	http.HandleFunc("/Connection", connection)
	log.Println("HagtControlScreenController Listening and serving HTTP on :8888")
	err := http.ListenAndServe(":8888", nil)
	if err != nil {
		log.Fatal(err)
	}
}
