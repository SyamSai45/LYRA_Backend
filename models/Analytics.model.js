import mongoose from "mongoose";

// ── Daily snapshot stored for fast dashboard reads ────────────────
const DailySnapshotSchema = new mongoose.Schema({
  date:            { type: Date, required: true, index: true },
  revenue:         { type: Number, default: 0 },
  orders:          { type: Number, default: 0 },
  newCustomers:    { type: Number, default: 0 },
  cancelledOrders: { type: Number, default: 0 },
  refunds:         { type: Number, default: 0 },
}, { _id: false });

const AnalyticsSchema = new mongoose.Schema({
  period:    { type: String, enum: ["daily","monthly","yearly"], default: "monthly" },
  month:     { type: String },
  year:      { type: Number },
  revenue:   { type: Number, default: 0 },
  orders:    { type: Number, default: 0 },
  customers: { type: Number, default: 0 },
  snapshots: [DailySnapshotSchema],
  updatedAt: { type: Date, default: Date.now },
}, { timestamps: true });

const Analytics = mongoose.model("Analytics", AnalyticsSchema);

export default Analytics;