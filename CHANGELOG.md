# Changelog

## [1.0.0] - 2026-02-21

### ✨ Features
- 一鍵隨機推薦 2 家餐廳（高分優先 / 純隨機兩種模式）
- GPS 自動定位 + 手動輸入地址（Google Maps Geocoding）
- 多條件篩選：人數、場合、料理類型、預算、距離、飲食需求
- 餐廳卡片：評分、價位、距離、去過次數、首次推薦標註
- 就這家 → 寫入歷史紀錄；不想去 → 加入黑名單
- 帶我去（Google Maps 導航）、分享餐廳連結
- 歷史紀錄月曆視圖：菜系 emoji、同天多筆 +N
- 點日期展開當天詳細紀錄（手風琴）
- 本月統計：使用次數、探索料理種類、最愛類別 emoji
- 一鍵生成月報分享圖片（html2canvas），直接複製到剪貼簿
- 黑名單管理：單筆移除 / 清空全部
- 設定頁：語言切換、清除紀錄、Buy Me a Coffee
- PWA 支援（可加入主畫面）
- 三語言介面：繁體中文 / 簡體中文 / 英文
- 首次使用提示彈窗（資料儲存說明）

### 🎨 Design
- 配色：主色 `#a2cbde`（天藍）、背景 `#F7F5FF`（淡薰衣草白）
- 文字色：深色 `#2D2549`、輔助色 `#8C7B70`
- 底部三頁導航欄（首頁 / 足跡 / 黑名單），active 頁天藍色

### 🐛 Bug Fixes
- 修復 Google Maps API Key HTTP Referrer 限制（更新允許域名至 eatwhatla.vercel.app）
- 修復 Geocoding CORS 問題，改用 Maps JavaScript SDK Geocoder
- 修復底部導航欄 active 顏色切換 bug（class 累積問題）
- 修復月報分享圖「雙圖貼上」bug，改用 ClipboardItem API
- 修復統計「咖啡咖啡」重複顯示（移除 stats.top 多餘 `{type}` 佔位）
- 修復分享圖「本月統計」標題消失問題
- 修復統計排版階梯問題，改用 CSS grid 兩欄（標籤靠左、數值靠右）
- 修復 html2canvas CDN 未載入問題（補上 script tag）
- 修復分享月報靜默失敗（完善 toBlob async 處理與 fallback 邏輯）

### 🌐 i18n
- 系統語言自動偵測（`navigator.language` → zh-TW / zh-CN / en）
- 三語言完整支援所有 UI 文案、錯誤訊息、toast 通知
- 新增 stats 拆分 keys（`stats.visits.label/unit`、`stats.types.label/unit`、`stats.top.label`）
- 新增 `toast.copied.image`、`toast.saved.image`
- 最愛類別只顯示 emoji，不顯示次數

### 🏗️ Tech Stack
- Vanilla JS（無框架）
- Tailwind CSS（CDN）
- Google Maps JavaScript SDK（Places API + Geocoding）
- html2canvas（月報截圖）
- localStorage（歷史紀錄、黑名單、設定）
- Vercel（部署）

---

*https://eatwhatla.vercel.app*
