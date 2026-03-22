package handlers

import (
	"net/http"
	"os"
	"os/exec"
	"github.com/gin-gonic/gin"
)

// GetLogsStage ステージング環境限定で Gcloud ログを返します
func GetLogsStage(c *gin.Context) {
	// ステージング環境以外（releaseモード）ではセキュリティのため無効化
	if os.Getenv("GIN_MODE") == "release" {
		c.JSON(http.StatusNotFound, gin.H{"error": "Forbidden"})
		return
	}

	// 指定されたコマンドを実行してログを取得
	cmd := exec.Command("bash", "-c", "gcloud run services logs read backend --region=us-east1 --project=wyze-develop-staging --limit=50 2>&1")
	
	output, err := cmd.CombinedOutput()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error(), "output": string(output)})
		return
	}

	c.String(http.StatusOK, string(output))
}
