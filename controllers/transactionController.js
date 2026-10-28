
const mongoose = require("mongoose");
const Account = require("../models/Account");
const Transaction = require("../models/Transaction");


async function createTransaction(req, res) {
  const { id } = req.params;
  const body = req.body;

  if (
    !body ||
    typeof body !== "object" ||
    Array.isArray(body)
  ) {
    return res.status(400).json({
      message: "Request body must be a JSON object",
    });
  }

  const {
    type,
    amount,
    description = "",
    reference_id,
  } = body;

  // Validate account ID
  if (!/^[0-9a-fA-F]{24}$/.test(id)) {
    return res.status(400).json({
      message: "Invalid account ID",
    });
  }

  // Validate transaction type
  if (!["credit", "debit"].includes(type)) {
    return res.status(400).json({
      message: "Type must be credit or debit",
    });
  }

  // Validate amount
  if (
  typeof amount !== "number" ||
  !Number.isSafeInteger(amount) ||
  amount <= 0
) {
  return res.status(400).json({
    message: "Amount must be a positive integer in paise",
  });
}

  // Validate reference ID
  if (
    typeof reference_id !== "string" ||
    !reference_id.trim()
  ) {
    return res.status(400).json({
      message: "Reference ID is required",
    });
  }

  if (typeof description !== "string") {
    return res.status(400).json({
      message: "Description must be a string",
    });
  }

  const session = await mongoose.startSession();

  try {
    let result;

    await session.withTransaction(async () => {
      // Check that the account exists
      const account = await Account.findById(id).session(session);

      if (!account) {
        const error = new Error("Account not found");
        error.statusCode = 404;
        throw error;
      }

      // Reject a reference already used for this account
      const existingTransaction = await Transaction.findOne({
        account_id: id,
        reference_id: reference_id.trim(),
      }).session(session);

      if (existingTransaction) {
        const error = new Error(
          "Reference ID already exists for this account"
        );
        error.statusCode = 409;
        throw error;
      }

      // Update the balance only if the account has sufficient funds
      const balanceFilter = { _id: id };

      if (type === "debit") {
        balanceFilter.balance = { $gte: amount };
      }

      const updatedAccount = await Account.findOneAndUpdate(
        balanceFilter,
        { $inc: { balance: type === "credit" ? amount : -amount } },
        { new: true, session }
      );

      if (!updatedAccount) {
        const error = new Error("Insufficient funds");
        error.statusCode = 400;
        throw error;
      }

      // Create the transaction record in the same database transaction
      const [transaction] = await Transaction.create(
        [
          {
            account_id: id,
            type,
            amount,
            description: description.trim(),
            reference_id: reference_id.trim(),
          },
        ],
        { session }
      );

      result = {
        transaction,
        balance: updatedAccount.balance,
      };
    });

    return res.status(201).json({
      message: "Transaction created successfully",
      transaction: result.transaction,
      balance: result.balance,
    });
  } catch (error) {
    // MongoDB's unique compound index protects against concurrent duplicates
    if (error.code === 11000) {
      return res.status(409).json({
        message: "Reference ID already exists for this account",
      });
    }

    if (error.statusCode) {
      return res.status(error.statusCode).json({
        message: error.message,
      });
    }

    console.error("Create transaction error:", error.message);

    return res.status(500).json({
      message: "Failed to create transaction",
    });
  } finally {
    await session.endSession();
  }
}


async function getTransactions(req, res) {
  try {
    const { id } = req.params;
    const { type, page = "1", limit = "10" } = req.query;

    // Validate account ID
    if (!/^[0-9a-fA-F]{24}$/.test(id)) {
      return res.status(400).json({
        message: "Invalid account ID",
      });
    }

    // Validate optional transaction type
    if (type !== undefined && !["credit", "debit"].includes(type)) {
      return res.status(400).json({
        message: "Type must be credit or debit",
      });
    }

    // Validate pagination parameters
    const pageNumber = Number(page);
    const pageSize = Number(limit);

    if (
      !Number.isInteger(pageNumber) ||
      !Number.isInteger(pageSize) ||
      pageNumber < 1 ||
      pageSize < 1 ||
      pageSize > 100
    ) {
      return res.status(400).json({
        message: "Page must be >= 1 and limit must be between 1 and 100",
      });
    }

    // Check that the account exists
    const account = await Account.findById(id).select("_id");

    if (!account) {
      return res.status(404).json({
        message: "Account not found",
      });
    }

    // Build the transaction filter
    const filter = { account_id: account._id };

    if (type) {
      filter.type = type;
    }

    const totalRecords = await Transaction.countDocuments(filter);

    const transactions = await Transaction.find(filter)
      .sort({ created_at: -1, _id: -1 })
      .skip((pageNumber - 1) * pageSize)
      .limit(pageSize)
      .lean();

    return res.status(200).json({
      account_id: account._id,
      pagination: {
        current_page: pageNumber,
        page_size: pageSize,
        total_records: totalRecords,
        total_pages: Math.ceil(totalRecords / pageSize),
      },
      transactions,
    });
  } catch (error) {
    console.error("Get transactions error:", error.message);

    return res.status(500).json({
      message: "Failed to retrieve transactions",
    });
  }
}

module.exports = { createTransaction, getTransactions };
