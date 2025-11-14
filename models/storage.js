const mongoose = require("mongoose");
const storage = new mongoose.Schema(
  {
    productName: String,
    quantity: Number,
    unit: String,
    wholePrice: Number,
    status: String,
    createdBy: { type: String}, // من أنشأ المنتج
    lastUpdate: { type: String}, // من قام بالتحديث الأخير
  },
  { timestamps: true }
);
const Storage = mongoose.model("Storage", storage);

exports.storageProduct = async(productName, quantity, unit,price,status,createdBy,lastUpdate) =>{
    return new Promise(async (resolve, reject) => {
        await mongoose
          .connect(process.env.DB)
          .then(() => {
            return Storage.findOne({ productName: productName });
          })
          .then((product) => {
            if (product) {
              reject("Product Exist !");
            } else {
              return true;
            }
          })
          .then(async () => {
            let Product = new Storage({
              productName: productName,
              quantity: quantity,
              unit: unit,
              price: price,
              status: status,
              createdBy: createdBy,
              lastUpdate: lastUpdate
            });
            return Product.save();
          })
    
          .then(() => {
            resolve();
          });
      }).catch((err) => {
        console.log(err);
      });
}

exports.Storage = Storage