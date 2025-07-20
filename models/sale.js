const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  PNAME: {
    type: String,
    default: "None"
  },
  QUANTITY: {
    type: Number,
    default: 0
  },
  PRICE: {
    type: Number,
    default: 0
  },
  PNOTES: {
    type: String,
    default: "None"
  }
});

const saleSchema = new mongoose.Schema(
  {
    products: [productSchema], // Array of products
    TOTAL: {
      type: Number,
      default: 0
    },
    RECEIPTID: Number,
    createdBy: { type: String },
    lastUpdate: { type: String },
  },
  { timestamps: true }
);

const Sale = mongoose.model("Sales", saleSchema);

exports.newSale = async (products, RECEIPTID, createdBy, lastUpdate) => {
  return new Promise(async (resolve, reject) => {
    try {
      await mongoose.connect(process.env.DB);
      const total = products.reduce((sum, product) => sum + (product.PRICE * product.QUANTITY), 0);
      
      const sale = new Sale({
        products: products.map(product => ({
          PNAME: product.PNAME,
          QUANTITY: product.QUANTITY,
          PRICE: product.PRICE,
          PNOTES: product.PNOTES
        })),
        TOTAL: total,
        RECEIPTID: RECEIPTID,
        createdBy: createdBy,
        lastUpdate: lastUpdate,
      });

      console.log(sale);
      await sale.save();
      resolve();
    } catch (err) {
      console.error(err);
      reject("Error");
    }
  });
};

exports.Sale = Sale;