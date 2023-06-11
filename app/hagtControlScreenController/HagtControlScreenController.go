package hagtControlScreenController

import (
	"bytes"
	"compress/zlib"
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
	conns           sync.Map
	prevFrameData   []byte
	fwidth, fheight = robotgo.GetScreenSize()
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
	data = compressedData(data)
	if bytes.Equal(prevFrameData, data) {
		return
	}
	conns.Range(func(k, conn any) bool {
		f(k, conn.(*websocket.Conn), data)
		return true
	})
	prevFrameData = data
}

func Send(k any, conn *websocket.Conn, data []byte) {
	if err := conn.WriteMessage(websocket.BinaryMessage, data); err != nil {
		conns.Delete(k)
		conn.Close()
	}
}

func compressedData(data []byte) []byte {
	var buf bytes.Buffer
	zw := zlib.NewWriter(&buf)
	if _, err := zw.Write(data); err != nil {
		panic(err)
	}
	if err := zw.Close(); err != nil {
		panic(err)
	}
	return buf.Bytes()
}

func handlingEvent() {
	for {
		conns.Range(func(k, conn any) bool {
			socketConn := conn.(*websocket.Conn)
			messageType, data, err := socketConn.ReadMessage()
			if err != nil {
				conns.Delete(k)
				socketConn.Close()
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
	MessageType string
	Value       map[string]any
}

type MessageHandler interface {
	handlingMessage(message Message)
}

type KeyDownHandling struct{}

func (self KeyDownHandling) handlingMessage(message Message) {
	key := message.Value["key"].(string)
	robotgo.KeyDown(key)
}

type KeyUpHandling struct{}

func (self KeyUpHandling) handlingMessage(message Message) {
	key := message.Value["key"].(string)
	robotgo.KeyUp(key)
}

type MouseClickHandling struct{}

func (self MouseClickHandling) handlingMessage(message Message) {
	key := message.Value["key"].(string)
	isDouble := message.Value["isDouble"].(bool)
	robotgo.Click(key, isDouble)
}

type MoveSmoothHandling struct{}

func (self MoveSmoothHandling) handlingMessage(message Message) {
	x := message.Value["x"].(float64)
	y := message.Value["y"].(float64)
	fw := message.Value["fw"].(float64)
	fh := message.Value["fh"].(float64)
	x = (x / fw) * float64(fwidth)
	y = (y / fh) * float64(fheight)
	robotgo.Move(int(x), int(y))
}

type ScrollMouseHandling struct{}

func (self ScrollMouseHandling) handlingMessage(message Message) {
	x := message.Value["x"].(float64)
	y := message.Value["y"].(float64)
	robotgo.Scroll(int(x), int(y))
}

type MouseToggleHandling struct{}

func (self MouseToggleHandling) handlingMessage(message Message) {
	key := message.Value["key"].(string)
	leftOrRight := message.Value["leftOrRight"].(string)
	robotgo.Toggle(key, leftOrRight)
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
	if err := json.Unmarshal(data, &message); err != nil {
		return
	}
	handler := messageHandlerMap[message.MessageType]
	if handler == nil {
		return
	}
	handler.handlingMessage(message)
}

func handlingBinaryMessage(data []byte) {

}

/*
*连接
 */
func connection(w http.ResponseWriter, r *http.Request) {
	params := r.URL.Query()
	id := params.Get("id")
	// 完成http应答，在httpheader中放下如下参数
	var conn *websocket.Conn
	var err error
	if conn, err = upgrader.Upgrade(w, r, nil); err != nil {
		// 获取连接失败直接返回
		return
	}
	conns.Store(id, conn)
}

func startServer() {
	http.HandleFunc("/Connection", connection)
	log.Println("HagtControlScreenController Listening and serving HTTP on :8888")
	err := http.ListenAndServe(":8888", nil)
	if err != nil {
		log.Fatal(err)
	}
}
