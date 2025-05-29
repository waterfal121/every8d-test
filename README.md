# every8d-test

用於測試發送 Every8d SMS API 的 Node.js 腳本

## 指令使用方式

- 立即發送：`node index.mjs send`
- 查詢狀態：`node index.mjs status [batchid]`
- 預約發送：`node index.mjs schedule`
- 取消排程：`node index.mjs cancel [batchid]`

## 注意事項

- 請先建立 `.env` 並填入以下內容：
  uid=你的帳號
  pwd=你的密碼
- API 文件版本：Every8d SMS API v3.0
