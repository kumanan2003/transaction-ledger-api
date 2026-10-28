
const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema(
  {
    account_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Account",
      required: [true, "Account ID is required"],
      immutable: true,
    },

    type: {
      type: String,
      enum: {
        values: ["credit", "debit"],
        message: "Type must be credit or debit",
      },
      required: [true, "Transaction type is required"],
      immutable: true,
    },

    amount: {
  type: Number,
  required: [true, "Amount is required"],
  min: [1, "Amount must be at least 1 paise"],
  validate: {
    validator: Number.isSafeInteger,
    message: "Amount must be a positive safe integer in paise",
  },
  immutable: true,
},

    description: {
      type: String,
      trim: true,
      default: "",
      immutable: true,
    },

    reference_id: {
      type: String,
      required: [true, "Reference ID is required"],
      trim: true,
      immutable: true,
    },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: false },
  }
);

// A reference ID can repeat across different accounts,
// but not within the same account.
transactionSchema.index(
  { account_id: 1, reference_id: 1 },
  { unique: true }
);

module.exports = mongoose.model("Transaction", transactionSchema);
