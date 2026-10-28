# Transaction Ledger API

A RESTful API built with Node.js, Express.js, and MongoDB to manage accounts, record credit and debit transactions, and retrieve account balances and transaction history.

## Features

- Create accounts with a default balance of zero.
- Record credit and debit transactions.
- Prevent debits that exceed the available balance.
- Prevent duplicate transaction references within the same account.
- Retrieve account balances.
- Retrieve transaction history with type filtering and pagination.
- Return transaction history in newest-first order.
- Validate request data and handle errors.
- Keep transaction records immutable.
- Use MongoDB transactions to maintain consistency between transaction records and account balances.

## Technology Stack

- Node.js
- Express.js
- MongoDB
- Mongoose
- dotenv

## Prerequisites

Install the following before running the project:

- Node.js and npm
- A MongoDB database that supports transactions, such as MongoDB Atlas or a properly configured replica set

## Installation

1. Clone or download this repository.
2. Open a terminal in the project directory.
3. Install dependencies:

   ```bash
   npm install
   ```

4. Create a `.env` file in the project root:

   ```env
   PORT=3000
   MONGODB_URI=your_mongodb_connection_string
   ```

5. Replace the placeholder with your MongoDB connection string. Do not commit your real `.env` file to version control.

6. Start the server:

   ```bash
   npm start
   ```

   If no `start` script is configured in `package.json`, run:

   ```bash
   node server.js
   ```

The API runs at `http://localhost:3000` when the server starts successfully.

## API Endpoints

### 1. Health Check

**GET** `/`

Returns a message confirming that the API is running.

### 2. Create an Account

**POST** `/api/accounts`

Request body:

```json
{
  "name": "Test Account"
}
```

The server generates the account ID, sets the initial balance to zero, and records the creation timestamp.

### 3. Get Account Balance

**GET** `/api/accounts/:id/balance`

Returns the account details and current balance.

### 4. Create a Transaction

**POST** `/api/accounts/:id/transactions`

Request body:

```json
{
  "type": "credit",
  "amount": 10000,
  "description": "Initial deposit",
  "reference_id": "TXN-001"
}
```

`type` must be `credit` or `debit`. `amount` must be a positive safe integer in paise. For example, `10000` represents ₹100.00. The server updates the balance and creates the transaction atomically.

A debit is rejected if the account does not have sufficient funds. A duplicate `reference_id` for the same account is rejected.

### 5. Get Transaction History

**GET** `/api/accounts/:id/transactions`

Optional query parameters:

- `type`: `credit` or `debit`
- `page`: page number, starting at `1`
- `limit`: records per page, up to `100`

Example:

```text
GET /api/accounts/ACCOUNT_ID/transactions?type=credit&page=1&limit=10
```

The response includes the transaction records and pagination metadata, such as the current page, page size, total records, and total pages.

## Error Handling

The API validates account IDs, transaction types, amounts, reference IDs, and pagination parameters.

Common HTTP status codes include:

- `400 Bad Request` — invalid input or insufficient funds
- `404 Not Found` — account does not exist
- `409 Conflict` — duplicate transaction reference
- `500 Internal Server Error` — unexpected server error

## Data Consistency

MongoDB transactions are used to ensure the transaction record and account balance update succeed or fail together. The compound unique index on `account_id` and `reference_id` prevents duplicate references within an account while allowing the same reference in different accounts.

Transaction fields are immutable after creation.

## Security and Configuration

- Keep database credentials in environment variables.
- Add `.env` and `node_modules/` to `.gitignore`.
- Do not commit database credentials or other secrets.
- Use a MongoDB deployment that supports multi-document transactions.

## Running Tests

Use Postman or Thunder Client to test the endpoints. Verify account creation, credits, debits, insufficient funds, duplicate references, invalid amounts, balance consistency, and transaction-history pagination.

## License

Add the license applicable to this project.
