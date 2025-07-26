const mongoose = require("mongoose");
const productInfo = new mongoose.Schema(
  {
    PNAME: String,
    WHOLEPRICE: Number,
    PNOTES: String,
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

exports.createNewProduct = async (PNAME, WHOLEPRICE, PNOTES,barcode,createdBy,lastUpdate) => {
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
          WHOLEPRICE: WHOLEPRICE,
          PNOTES: PNOTES,
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
