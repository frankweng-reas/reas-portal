# REAS Portal

REAS 內部工具入口，用於管理 NeuroSme on-prem 授權碼的發放與歷史記錄。

## 功能

- 產生 NeuroSme on-prem 授權碼（指定客戶、Agents、到期日）
- 檢視所有歷史發放記錄
- 一鍵複製授權碼
- 套用歷史設定快速重新產生

## 快速開始

```bash
cp .env.example .env
# 編輯 .env，填入真實的 PORTAL_API_KEY 和 DB_PASSWORD
docker compose up -d
```

開啟瀏覽器 → `http://localhost:5174`

## 設定

| 環境變數 | 說明 |
|---|---|
| `DB_PASSWORD` | PostgreSQL 密碼 |
| `PORTAL_API_KEY` | Portal 前端存取 API 用的金鑰 |
| `ACTIVATION_SECRET` | 與 NeuroSme `docker-compose.onprem.yml` 中的 `ACTIVATION_SECRET` 完全一致 |

## 本機開發

```bash
# Backend
cd backend
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
cp ../.env.example .env  # 調整 DATABASE_URL 指向本機 DB
uvicorn app.main:app --reload --port 8080

# Frontend
cd frontend
npm install
npm run dev  # port 5174
```
