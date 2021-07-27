package controller

import (
	"crypto/rand"
	"github.com/gin-gonic/gin"
	"math"
	"math/big"
	"net/http"
	"sort"
	"strconv"
	"strings"
)

func GetRandomNumber(c *gin.Context) {
	randomNuberArray := make([]string, 8)
	for i := 0; i < 5; i++ {
		for {
			randomNumber := strconv.FormatInt(RangeRand(1, 35), 10)
			if len(randomNumber) < 2 {
				randomNumber = "0" + randomNumber
			}
			if in(randomNumber, randomNuberArray) == false {
				randomNuberArray = append(randomNuberArray, randomNumber)
				break
			}
		}
	}
	randomNuberArray = append(randomNuberArray, "-")
	for {
		randomNumber1 := strconv.FormatInt(RangeRand(1, 12), 10)
		if len(randomNumber1) < 2 {
			randomNumber1 = "0" + randomNumber1
		}
		randomNumber2 := strconv.FormatInt(RangeRand(1, 12), 10)
		if len(randomNumber2) < 2 {
			randomNumber2 = "0" + randomNumber2
		}
		if randomNumber1 != randomNumber2 {
			randomNuberArray = append(randomNuberArray, randomNumber1)
			randomNuberArray = append(randomNuberArray, randomNumber2)
			break
		}
	}
	c.JSON(http.StatusOK, map[string]string{"randomCode": strings.Join(randomNuberArray, " ")})
}

func in(target string, str_array []string) bool {
	sort.Strings(str_array)
	index := sort.SearchStrings(str_array, target)
	if index < len(str_array) && str_array[index] == target {
		return true
	}
	return false
}

func RangeRand(min, max int64) int64 {
	if min > max {
		panic("the min is greater than max!")
	}
	if min < 0 {
		f64Min := math.Abs(float64(min))
		i64Min := int64(f64Min)
		result, _ := rand.Int(rand.Reader, big.NewInt(max+1+i64Min))

		return result.Int64() - i64Min
	} else {
		result, _ := rand.Int(rand.Reader, big.NewInt(max-min+1))
		return min + result.Int64()
	}
}
