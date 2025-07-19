const mongoose = require("mongoose");
const sale = new mongoose.Schema(
  {
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
    },
    TOTAL: {
      type: String,
      default: 0
    },
    RECEIPTID: Number,
    createdBy: { type: String}, // من أنشأ المنتج
    lastUpdate: { type: String}, // من قام بالتحديث الأخير
  },
  { timestamps: true }
);
const Sale = mongoose.model("Sales", sale);

exports.newSale = async(PNAME,QUANTITY,PRICE,PNOTES,TOTAL,RECEIPTID,createdBy,lastUpdate) =>{
     
  return new Promise(async (resolve, reject) => {
       let dbconnect =  await mongoose
          .connect(process.env.DB)
          let countDocuments = Sale.estimatedDocumentCount()
          .then(async (countedDoc) => {
            RECEIPTID = countedDoc
            let sale = new Sale({
              PNAME: PNAME,
              QUANTITY: QUANTITY,
              PRICE: PRICE,
              PNOTES: PNOTES,
              TOTAL: TOTAL,
              RECEIPTID: RECEIPTID + 1,
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