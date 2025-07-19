const mongoose = require("mongoose");
const sale = new mongoose.Schema(
  {
    PNAME: String,
    QUANTITY: Number,
    PRICE: Number,
    PNOTES: String,
    TOTAL: Number,
    RCEIPTID: Number,
    createdBy: { type: String}, // من أنشأ المنتج
    lastUpdate: { type: String}, // من قام بالتحديث الأخير
  },
  { timestamps: true }
);
const Sale = mongoose.model("Sales", sale);

exports.newSale = async(PNAME,QUANTITY,PRICE,PNOTES,TOTAL,createdBy,lastUpdate) =>{
   const count = await Sale.estimatedDocumentCount();
    return new Promise(async (resolve, reject) => {
        await mongoose
          .connect(process.env.DB)
          .then(async () => {
            let sale = new Sale({
              PNAME: PNAME,
              QUANTITY: QUANTITY,
              PRICE: PRICE,
              PNOTES: PNOTES,
              TOTAL: TOTAL,
              RCEIPTID: count + 1,
              createdBy: createdBy,
              lastUpdate: lastUpdate,
            });
            return sale.save();
          })
    
          .then(() => {
            resolve();
          });
      }).catch((err) => {
        reject("Error")
        console.log(err);
      });
}

exports.Sale = Sale;