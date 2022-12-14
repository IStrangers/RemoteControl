package main

import (
	"github.com/gin-gonic/gin"
	"go-web/app/controller"
	"go-web/app/hagtControlScreenController"
	"net/http"
)

func main() {

	hagtControlScreenController.Start()

	r := gin.Default()
	r.Use(func(c *gin.Context) {
		method := c.Request.Method
		c.Header("Access-Control-Allow-Origin", "*")
		c.Header("Access-Control-Allow-Headers", "Content-Type,AccessToken,X-CSRF-Token, Authorization, Token")
		c.Header("Access-Control-Allow-Methods", "POST, GET, OPTIONS")
		c.Header("Access-Control-Expose-Headers", "Content-Length, Access-Control-Allow-Origin, Access-Control-Allow-Headers, Content-Type")
		c.Header("Access-Control-Allow-Credentials", "true")

		//放行所有OPTIONS方法
		if method == "OPTIONS" {
			c.AbortWithStatus(http.StatusNoContent)
		}
		// 处理请求
		c.Next()
	})
	r.Static("/static", "./static")
	r.GET("/GetRandomNumber", controller.GetRandomNumber)
	r.Run()
}
