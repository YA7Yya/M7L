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
      .connect(
        "mongodb+srv://Scriptat:Scriptat12349_99_9@cluster0.s5mgvqz.mongodb.net/"
      )
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
        "mongodb+srv://Scriptat:Scriptat12349_99_9@cluster0.s5mgvqz.mongodb.net/"
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
    console.log(err);
  });
};
exports.Info = Info;
