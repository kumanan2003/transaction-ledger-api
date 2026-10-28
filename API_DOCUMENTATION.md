# Transaction Ledger API — API Documentation

## Base URL

Local development: `http://localhost:3000`

## 1. Create an Account

**Endpoint:** `POST /api/accounts`

**Request body**
```json
{
  "name": "Kumanan"
}
```

**Successful response:** `201 Created`

```json
{
  "name": "Kumanan",
  "balance": 0
}
```

The response may also include the generated account ID and creation timestamp.

## 2. Get Account Balance

**Endpoint:** `GET /api/accounts/:id/balance`

Replace `:id` with the account's MongoDB ObjectId.

**Successful response:** `200 OK`

Returns the account details and current balance.

## 3. Create a Transaction

**Endpoint:** `POST /api/accounts/:id/transactions`

**Credit request**
```json
{
  "type": "credit",
  "amount": 10050,
  "description": "Initial deposit",
  "reference_id": "REF-001"
}
```

**Debit request**
```json
{
  "type": "debit",
  "amount": 5050,
  "description": "Payment",
  "reference_id": "REF-002"
}
```

**Successful response:** `201 Created`

Returns the created transaction. The account balance is updated atomically with the transaction record.

**Money representation:** Amounts are positive integers in paise. `10050` represents ₹100.50.

## 4. Get Transaction History

**Endpoint:** `GET /api/accounts/:id/transactions`

**Optional query parameters**
- `type`: `credit` or `debit`
- `page`: page number
- `limit`: number of records per page

**Example**
```http
GET /api/accounts/ACCOUNT_ID/transactions?type=credit&page=1&limit=10
```

Returns matching transactions in newest-first order, along with pagination metadata.

## Common HTTP Status Codes

| Status | Meaning |
|---|---|
| `200` | Request successful |
| `201` | Account or transaction created |
| `400` | Invalid request data |
| `404` | Account not found |
| `409` | Duplicate transaction reference |
| `500` | Unexpected server error |

Exact response fields and status codes should match the implementation in the repository.
