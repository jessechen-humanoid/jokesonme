## Context

匯入頁面目前撥款明細重複上傳會靜默覆蓋，活動檔案重複上傳會靜默忽略。

## Goals / Non-Goals

**Goals:**
- 重複上傳時明確提示用戶

**Non-Goals:**
- 不做內容層級的重複偵測（只比對檔名）

## Decisions

### 使用 confirm 和 alert 提示

- 撥款明細：`confirm()` 確認是否替換
- 活動檔案：`alert()` 提示已存在
- 理由：最簡單直接，不需要額外 UI

## Risks / Trade-offs

無
