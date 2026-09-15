const mongoose = require("mongoose");

const superCoinTransactionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    points: {
      type: Number,
      required: true,
    },
    type: {
      type: String,
      enum: ["earned", "redeemed", "expired", "adjusted"],
      required: true,
    },
    source: {
      type: String,
      enum: ["booking", "referral", "birthday", "membership", "promotion", "manual", "redemption"],
      required: true,
    },
    referenceId: {
      type: mongoose.Schema.Types.ObjectId,
    },
    referenceModel: {
      type: String,
      enum: ["Booking", "Payment", "Membership", null],
    },
    description: {
      type: String,
      default: "",
    },
    balanceAfter: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

superCoinTransactionSchema.index({ user: 1, createdAt: -1 });
superCoinTransactionSchema.index({ type: 1 });

module.exports = mongoose.model("SuperCoinTransaction", superCoinTransactionSchema);
