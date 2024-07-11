const express = require("express");
const app = express();
let port = 80;
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const path = require("path");
const Info = require("./models/productSchema");
const moment = require("moment");
moment.locale('ar');
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
mongoose
  .connect(
    "mongodb+srv://M7L:M7L1234..567@apptest.lquzm.mongodb.net/?retryWrites=true&w=majority&appName=AppTest",
    { useNewUrlParser: true, useUnifiedTopology: true }
  )
  .then(() => {
    console.log("DB Started Successfully");
  });
app.get("/crud", async (req, res) => {
  getAll = Info.getAllProducts();
  getAll.then((result) => {
    res.render("./crud.ejs", {
      allProducts: result,
      moment: moment
    });
  });
});
app.post("/productAdd", (req, res) => {
  Info.createNewProduct(
    req.body.PNAME,
    req.body.WHOLEPRICE,
    req.body.PNOTES
  ).then(() => {
    res.redirect("/crud");
  });
});
app.delete("/crud/delete/:id", (req, res) => {
  Info.Info.findByIdAndDelete(req.params.id)

    .then((params) => {
      res.status(200).json("Done");
    })

    .catch((err) => {
      console.log(err);
    });
});
app.post("/crud/update/:id", (req, res) => {
  Info.Info.findById(req.params.id).then((value) => {
    console.log(value);
  });
});
app.post("/productUpdate/:id", (req, res) => {
  Info.Info.findByIdAndUpdate(req.params.id, {
    PNAME: req.body.PNAME,
    WHOLEPRICE: req.body.WHOLEPRICE,
    PNOTES: req.body.PNOTES
  }).then((value) => {
    res.redirect("/crud")
  });
});
app.get("/crud/update/:id", async (req, res) => {
  await Info.Info.findById(req.params.id).then((value) => {
    console.log("Find The Product");
    console.log(value);
    res.status(200).json(value);
  });
});
app.get("/", (req, res) => {
  res.redirect("/crud");
});

// Tracking Visits System
// in model:  visitCount: { type: Number, default: 0 }
// async function trackVisits(req, res, next) {
//   if (req.session && req.session._id) {
//       const id = req.session._id;

//       try {
//           // Find employee by ID and update visitCount
//           await Auth.User.findByIdAndUpdate(id, { $inc: { visitCount: 1 } });
//           next();
//       } catch (err) {
//           console.error(err);
//           res.status(500).send('Server Error');
//       }
//   } else {
//       next();
//   }
// }

module.exports = trackVisits;
app.use(bodyParser.urlencoded({ extended: true }));
app.listen(port, () => {
  console.log("Started Successfully");
});
