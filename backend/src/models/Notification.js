const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["booking", "payment", "promotion", "membership", "supercoins", "system"],
      default: "system",
    },
    channel: {
      type: String,
      enum: ["in-app", "email", "sms", "push"],
      default: "in-app",
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    isBroadcast: {
      type: Boolean,
      default: false,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  { timestamps: true }
);

notificationSchema.index({ user: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ isBroadcast: 1, createdAt: -1 });

module.exports = mongoose.model("Notification", notificationSchema);
