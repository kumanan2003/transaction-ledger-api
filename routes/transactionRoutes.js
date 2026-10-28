

const express = require("express");

const {
  createTransaction,
  getTransactions,
} = require("../controllers/transactionController");

const router = express.Router();

router.post("/:id/transactions", createTransaction);
router.get("/:id/transactions", getTransactions);

module.exports = router;
