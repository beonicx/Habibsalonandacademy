const mongoose = require("mongoose");

const membershipPlanSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    durationMonths: {
      type: Number,
      required: true,
      min: 1,
    },
    benefits: [
      {
        type: String,
      },
    ],
    discountPercent: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    freeServices: [
      {
        service: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Service",
        },
        name: String,
        quantity: { type: Number, default: 1 },
      },
    ],
    superCoinsMultiplier: {
      type: Number,
      default: 1,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    sortOrder: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("MembershipPlan", membershipPlanSchema);
