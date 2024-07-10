const mongoose = require("mongoose");
const productInfo = new mongoose.Schema(
  {
    PNAME: String,
    WHOLEPRICE: Number,
    PNOTES: String,
  },
  { timestamps: true }
);
const Info = mongoose.model("Product", productInfo);
exports.getAllProducts = async () => {
  return new Promise(async (resolve, reject) => {
    await mongoose
      .connect("mongodb+srv://M7L:M7L1234..567@apptest.lquzm.mongodb.net/?retryWrites=true&w=majority&appName=AppTest")
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

exports.createNewProduct = async (PNAME, WHOLEPRICE, PNOTES) => {
  return new Promise(async (resolve, reject) => {
    await mongoose
      .connect(
        "mongodb+srv://M7L:M7L1234..567@apptest.lquzm.mongodb.net/?retryWrites=true&w=majority&appName=AppTest"
      )
      .then(() => {
        return Info.findOne({ PNAME: PNAME });
      })
      .then((product) => {
        if (product) {
          reject("Product Exist !");
        } else {
          return true;
        }
      })
      .then(async () => {
        let Product = new Info({
          PNAME: PNAME,
          WHOLEPRICE: WHOLEPRICE,
          PNOTES: PNOTES,
        });
        return Product.save();
      })

      .then(() => {
        resolve();
      });
  }).catch((err) => {
    reject(err);
    console.log(err);
  });
};
exports.Info = Info;
