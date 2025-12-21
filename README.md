# Telebirr Payment Verifier

Verify Telebirr payment receipts against your expected transaction details. This is useful for automating payment verification in e-commerce platforms, subscription services, or any system that accepts Telebirr payments.

Ideal for startup SaaS applications that need a simple, reliable way to verify payments just clone or integrate the code into your project and start using it immediately.

## Currently supported Banks and wallets

**✓ Telebirr ✓CBE**

**And more on the way**


## Setup

```bash
git clone https://github.com/abrhamyalew/telebirr-payment-verifier.git
cd telebirr-payment-verifier
npm install
```

Create `.env` with your expected payment details:

```env
EXPECTED_AMOUNT=100
EXPECTED_RECIPIENT_ACCOUNT=1000123456789
EXPECTED_RECIPIENT_NAME=Abrham Yalew
EXPECTED_PAYMENT_YEAR=2025
EXPECTED_PAYMENT_MONTH=12
EXPECTED_STATUS=Completed
```

**Ensure that all expected data matches the receipt exactly in format and content.**

### CBE Receipt Configuration

Add these variables to your `.env` for CBE verification:

```env
CBE_EXPECTED_AMOUNT=40
CBE_EXPECTED_RECIPIENT_ACCOUNT=1****1234
CBE_EXPECTED_RECIPIENT_NAME=ABRHAM YALEW
CBE_EXPECTED_PAYMENT_YEAR=2025
CBE_EXPECTED_PAYMENT_MONTH=12
```

## API Usage

**POST** `http://localhost:5000/api/verify`

### 1. Telebirr Verification

You can use the receipt ID or full URL:

```json
{
  "receipt": "CJP9OSW9U",
  "defaultVerification": true
}
```

### 2. CBE Verification

Supports both query-param based and path-based URLs, as well as standalone IDs.

**Option A: Using Receipt ID**

```json
{
  "receipt": "FT253183LQF089873517",
  "defaultVerification": true
}
```

**Option B: Using Full URL**

```json
{
  "receipt": "https://apps.cbe.com.et:100/BranchReceipt/FT25292FRPWD&89873717",
  "defaultVerification": true
}
```

### 3. Custom Field Verification

Select specific fields to verify for any receipt type:

```json
{
  "receipt": "FT253W23LQF089173717",
  "defaultVerification": {
    "amount": true,
    "recipientName": true,
    "date": true,
    "accountNumber": true
  }
}
```

_Note: `status` verification is skipped for CBE receipts as it's not explicitly present._

## Batch Receipt Verification

verify multiple Telebirr and CBE receipts in a single request.

**Request:**

```json
{
  "receipt": [
    "FT253523LQF089573717",
    "https://apps.cbe.com.et:100/BranchReceipt/FT25299FRPWD&85873717"
  ],
  "defaultVerification": true
}
```

**Response:**

```json
{
  "result": ["FT25R99FRPWD&89843717", "FT253Y23LQF789873717"],
  "failed": [
    {
      "receiptId": "https://apps.cbe.com.et:100/BranchReceipt/FT25235FRPWD&89873717",
      "error": "Mismatch on amount. Expected: 30.00, Actual: 40.00"
    }
  ],
  "summary": {
    "total": 2,
    "valid": 1,
    "invalid": 1
  }
}
```

## Config

Edit `config/verification.config.js` to change defaults.

## Responses

**Valid receipt:**

```json
{
  "message": "The receipt 'CJP9OSP9W' is a valid receipt."
}
```

**Mismatch found:**

```json
{
  "error": "Mismatch on amount. Expected: 85, Actual: 100"
}
```

## Fields You Can Verify

| Field           | What it checks                          |
| --------------- | --------------------------------------- |
| `amount`        | Payment amount matches                  |
| `status`        | Transaction status (Telebirr only)      |
| `recipientName` | Recipient name matches                  |
| `accountNumber` | Recipient account number                |
| `date`          | Payment happened in expected year/month |
