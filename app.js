
const express = require("express");
const app = express();
let port = 80;
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const path = require("path");
const Info = require("./models/productSchema");
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
  getAll =  Info.getAllProducts();
  getAll.then((result) => {
    res.render("./crud.ejs", {
      allProducts: result,
    });
  });
});
app.post("/productAdd", (req,res) =>{
    Info.createNewProduct(req.body.PNAME, req.body.WHOLEPRICE, req.body.PNOTES).then(() => {
        res.redirect("/crud")
    })
})
app.delete("/crud/delete/:id", (req,res) =>{
   Info.Info.findByIdAndDelete(req.params.id)

    .then((params) => {
res.send("Done")
    })

    .catch((err) => {
      console.log(err);
    });
});
app.get("/", (req,res) =>{
    res.redirect("/crud")
})
app.use(bodyParser.urlencoded({ extended: true }));
app.listen(port, () => {
  console.log("Started Successfully");
});
