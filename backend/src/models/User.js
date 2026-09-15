const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 6,
    },
    phone: {
      type: String,
      default: "",
    },
    role: {
      type: String,
      enum: ["user", "admin", "staff"],
      default: "user",
    },
    gender: {
      type: String,
      enum: ["male", "female", "other", ""],
      default: "",
    },
    dateOfBirth: Date,
    address: {
      type: String,
      default: "",
    },
    profileImage: {
      type: String,
      default: "",
    },
    notes: {
      type: String,
      default: "",
    },
    superCoins: {
      type: Number,
      default: 0,
    },
    totalSpent: {
      type: Number,
      default: 0,
    },
    visitCount: {
      type: Number,
      default: 0,
    },
    lastVisit: Date,
    isActive: {
      type: Boolean,
      default: true,
    },
    referredBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    tags: [String],
  },
  { timestamps: true }
);

userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.__v;
  return obj;
};

module.exports = mongoose.model("User", userSchema);
