# Ethiopian Payment Receipt Verifier

Verify payment receipts from Telebirr, CBE, and Bank of Abyssinia against your expected transaction details. This is useful for automating payment verification in e-commerce platforms, subscription services, or any system that accepts Ethiopian digital payments.

Ideal for startup SaaS applications that need a simple, reliable way to verify payments just clone or integrate the code into your project and start using it immediately.

## Currently Supported Banks and Wallets

**✓ Telebirr** | **✓ CBE (Commercial Bank of Ethiopia)** | **✓ BOA (Bank of Abyssinia)**

**More coming soon!**

## Performance Features

- **Parallel Batch Processing**: Verify up to 10 receipts simultaneously using concurrent processing
- **High-Performance HTTP Client**: Powered by `undici` with connection pooling and HTTP pipelining
- **Smart Connection Management**: Reuses TCP connections with 60s keep-alive for faster requests
- **Configurable Concurrency**: Adjust batch size and parallel processing limits in `config/performance.config.js`
- **Automatic Timeouts**: 15-second timeouts prevent hanging on unresponsive services

**Performance Impact**: ~10-15x faster batch processing compared to sequential verification.

## Setup

```bash
git clone https://github.com/abrhamyalew/telebirr-payment-verifier.git
cd telebirr-payment-verifier
npm install
```

Create `.env` with your expected payment details:

### Telebirr Configuration

```env
TELEBIRR_EXPECTED_AMOUNT=100
TELEBIRR_EXPECTED_RECIPIENT_ACCOUNT=1000123456789
TELEBIRR_EXPECTED_RECIPIENT_NAME=Abrham Yalew
TELEBIRR_EXPECTED_PAYMENT_YEAR=2025
TELEBIRR_EXPECTED_PAYMENT_MONTH=12
TELEBIRR_EXPECTED_STATUS=Completed
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

### BOA (Bank of Abyssinia) Configuration

Add these variables to your `.env` for BOA verification:

```env
BOA_EXPECTED_AMOUNT=200
BOA_EXPECTED_RECIPIENT_ACCOUNT=1******95
BOA_EXPECTED_RECIPIENT_NAME=TEWODROS HULGIZIE TEMESGEN
BOA_EXPECTED_PAYMENT_YEAR=25
BOA_EXPECTED_PAYMENT_MONTH=10
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
  "receipt": "FT253183LQF089873510",
  "defaultVerification": true
}
```

**Option B: Using Full URL**

```json
{
  "receipt": "https://apps.cbe.com.et:100/BranchReceipt/FT25292FRPWD&89873710",
  "defaultVerification": true
}
```

### 3. Custom Field Verification

Select specific fields to verify for any receipt type:

```json
{
  "receipt": "FT253W23LQF089173710",
  "defaultVerification": {
    "amount": true,
    "recipientName": true,
    "date": true,
    "accountNumber": true
  }
}
```

_Note: `status` verification is skipped for CBE and BOA receipts as it's not explicitly present._

### 4. BOA (Bank of Abyssinia) Verification

Supports both full URLs and standalone receipt IDs.

**Option A: Using Receipt ID**

```json
{
  "receipt": "FT25284X11PS79448",
  "defaultVerification": true
}
```

**Option B: Using Full URL**

```json
{
  "receipt": "https://cs.bankofabyssinia.com/receipt?trx=FT25284X11PS79448",
  "defaultVerification": true
}
```

## Batch Receipt Verification

Verify multiple Telebirr, CBE, and BOA receipts in a single request.

**Request:**

```json
{
  "receipt": [
    "FT24838X11PS82079",
    "FT25284X11PS79328"
  ],
  "defaultVerification": true
}
```

**Response:**

```json
{
  "validReceipts": ["FT24838X11PS82079", "FT25284X11PS79328"],
  "failedReceipts": [
    {
      "receiptId": "https://cs.bankofabyssinia.com/slip/?trx=FT25284X11PS79328",
      "error": "Mismatch on amount. Expected: 100, Actual: 40.00"
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

### Verification Settings

Edit `config/verification.config.js` to change default verification fields and expected values.

### Performance Settings

Edit `config/performance.config.js` to tune batch processing:

```javascript
export default {
  batch: {
    maxBatchSize: 10, 
    defaultConcurrency: 10,
    timeout: 60000,
  },
};
```

**Tuning Tips:**

- Increase `defaultConcurrency` (e.g., 20) for faster processing if your server can handle it
- Decrease it (e.g., 5) if you're hitting rate limits from bank services
- Adjust `maxBatchSize` based on your typical use case

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
