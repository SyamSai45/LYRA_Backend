import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },

    mobileNumber: {
      type: String,
      required: true,
      unique: true,
      match: /^[0-9]{10}$/,
    },

    password: {
      type: String,
      required: true,
    },

    otp: {
      type: String,
    },

    otpExpiry: {
      type: Date,
    },

    resetOtp: String,
    resetOtpExpiry: Date,

    profileImage: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);


// import mongoose from "mongoose";
// import bcrypt from "bcryptjs";

// const addressSchema = new mongoose.Schema({
//   label:     { type: String, default: "Home" },
//   street:    { type: String },
//   city:      { type: String },
//   state:     { type: String },
//   pincode:   { type: String },
//   isDefault: { type: Boolean, default: false },
// });

// const userSchema = new mongoose.Schema(
//   {
//     fullName:         { type: String, required: true, trim: true },
//     email:            { type: String, required: true, unique: true, lowercase: true, trim: true },
//     mobileNumber:     { type: String, required: true, unique: true, trim: true },
//     password:         { type: String, required: true, minlength: 6 },
//     confirmPassword:  { type: String, required: true, minlength: 6 },
//     role:             { type: String, enum: ["user", "admin"], default: "user" },
//     profileImage:     { type: String, default: "" },
//     isVerified:       { type: Boolean, default: false },
//     otp:              { type: String, default: null },
//     otpExpiry:        { type: Date,   default: null },
//     address:          [addressSchema],
//   },
//   { timestamps: true }
// );

// // ── Hash password before save ──────────────
// userSchema.pre("save", async function (next) {
//   if (!this.isModified("password")) return next();
//   this.password = await bcrypt.hash(this.password, 12);
//   next();
// });

// // ── Compare entered password with hash ─────
// userSchema.methods.matchPassword = async function (enteredPassword) {
//   return await bcrypt.compare(enteredPassword, this.password);
// };

// const User = mongoose.model("User", userSchema);
// export default User;