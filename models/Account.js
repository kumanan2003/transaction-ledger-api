const mongoose = require("mongoose");

const accountSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Account name is required"],
      trim: true,
    },

    balance: {
  type: Number,
  default: 0,
  min: [0, "Balance cannot be negative"],
  validate: {
    validator: Number.isSafeInteger,
    message: "Balance must be a safe integer in paise",
  },
},
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: false },
  }
);

module.exports = mongoose.model("Account", accountSchema);
