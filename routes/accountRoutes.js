
const express = require("express");

const {
  createAccount,
  getAccountBalance,
} = require("../controllers/accountController");

const router = express.Router();

router.post("/", createAccount);
router.get("/:id/balance", getAccountBalance);

module.exports = router;

