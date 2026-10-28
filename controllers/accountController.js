
const Account = require("../models/Account");

async function createAccount(req, res) {
  try {
    const { name } = req.body;

    // Validate the account name
    if (typeof name !== "string" || !name.trim()) {
      return res.status(400).json({
        message: "Account name is required",
      });
    }

    // Create the account with a server-controlled balance
    const account = await Account.create({
      name: name.trim(),
      balance: 0,
    });

    return res.status(201).json({
      message: "Account created successfully",
      account,
    });
  } catch (error) {
    console.error("Create account error:", error.message);

    return res.status(500).json({
      message: "Failed to create account",
    });
  }
}


async function getAccountBalance(req, res) {
  try {
    const { id } = req.params;

    // Validate the MongoDB account ID
    if (!/^[0-9a-fA-F]{24}$/.test(id)) {
      return res.status(400).json({
        message: "Invalid account ID",
      });
    }

    // Find the account in MongoDB
    const account = await Account.findById(id).select("name balance");

    if (!account) {
      return res.status(404).json({
        message: "Account not found",
      });
    }

    return res.status(200).json({
      account_id: account._id,
      name: account.name,
      balance: account.balance,
    });
  } catch (error) {
    console.error("Get account balance error:", error.message);

    return res.status(500).json({
      message: "Failed to retrieve account balance",
    });
  }
}

module.exports = { createAccount, getAccountBalance };