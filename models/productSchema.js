const mongoose = require("mongoose");
const productInfo = new mongoose.Schema(
  {
    PNAME: String,
    costPrice: Number,
    price: Number,
    profit: Number,
    unit: String,
    PNOTES: String,
    totalQuantity: Number,
    displayedQuantity: Number,
    storedQuantity: Number,
    barcode:Number,
    createdBy: { type: String}, // من أنشأ المنتج
    lastUpdate: { type: String}, // من قام بالتحديث الأخير
  },
  { timestamps: true }
);
const Info = mongoose.model("Product", productInfo);

exports.getAllProducts = async () => {
  return new Promise(async (resolve, reject) => {
    await mongoose
      .connect(process.env.DB)
      .then(() => {
        return Info.find();
      })
      .then((users) => {
        resolve(users);
      })
      .catch((err) => {
        reject(err);
      });
  });
};

exports.createNewProduct = async (PNAME,costPrice, price,profit,unit,PNOTES,totalQuantity,displayedQuantity,storedQuantity, barcode,createdBy,lastUpdate) => {
  return new Promise(async (resolve, reject) => {
    await mongoose
      .connect(process.env.DB)
      .then(() => {
        return Info.findOne({ PNAME: PNAME });
      })
      .then((product) => {
        if (product) {
          reject("Product Exist !");
        } else {
              let Product = new Info({
          PNAME: PNAME,
          costPrice: costPrice,
          price: price,
          profit: price-costPrice,
          unit: unit,
          PNOTES: PNOTES,
          totalQuantity:totalQuantity,
          displayedQuantity:displayedQuantity,
          storedQuantity: totalQuantity-displayedQuantity,
          barcode:barcode,
          createdBy: createdBy,
          lastUpdate: lastUpdate,
        });
         
          resolve(Product.save())
        }
      })
  }).catch((err) => {
    console.log(err);
  });
};
exports.Info = Info;
