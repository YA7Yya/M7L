const mongoose = require("mongoose");
const storage = new mongoose.Schema(
  {
    PNAME: String,
    WHOLEPRICE: Number,
    PNOTES: String,
    createdBy: { type: String}, // من أنشأ المنتج
    lastUpdate: { type: String}, // من قام بالتحديث الأخير
  },
  { timestamps: true }
);
const Info = mongoose.model("Storage", storage);