const express = require("express");
const app = express();
let port = 80;
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const path = require("path");
const Info = require("./models/productSchema");
const Employee = require("./models/employees");
const authGuard = require("./middlewares/auth.guard")
const adminGuard = require("./middlewares/admin.guard")
const managerGuard = require("./middlewares/manager.guard")
const moment = require("moment");
const session = require("express-session");
const SessionStore = require("connect-mongodb-session")(session);
moment.locale('ar');
require('dotenv').config()
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
mongoose
  .connect(
    process.env.DB,
    { useNewUrlParser: true, useUnifiedTopology: true }
  )
  .then(() => {
    console.log("DB Started Successfully");
  });
  let day = 3600000 * 24;
const STORE = new SessionStore({
  uri: process.env.DB,
  collection: "sessions",
});
app.use(
  session({
    secret: "this is my secret for ENcryPt",
    saveUninitialized: false,
    cookie: { expires: new Date(Date.now() + day * 365) },
    store: STORE,
  })
);
// app.use(async (req, res, next) => {
//   try {
//     const user = await Employee.Employee.findOne({
//       _id: req.session._id,
//     });
//     if (user) {
//       // user found
//       req.session = user;
//     }

//     next();
//   } catch (error) {
//     // error handling
//     console.error(error);
//     res.status(500).send("Internal Server Error");
//   }
// });
app.get("/crud",authGuard.isAuth, async (req, res) => {
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
app.get("/",authGuard.isAuth, (req, res) => {
res.redirect("/crud")
});

app.get("/createEmployee",managerGuard.isManager,(req,res) =>{ 
res.render("./auth/createEmployee.ejs")
});
app.get("/login", (req,res) =>{ 
res.render("./auth/login.ejs")
});
app.post("/createEmployee",managerGuard.isManager, async (req,res) =>{
  Employee.createNewEmployee(req.body.username, req.body.password).then((user) =>{
res.redirect("/login")
  }).catch((err) => {
    console.log(err)
  })
})
app.post("/login", async(req,res) =>{
 await Employee.login(req.body.username, req.body.password).then((result) =>{
    req.session.userId = result.userId
    req.session.username = result.username
    req.session.role = result.role
    req.session.visits = result.visits
res.redirect("/crud")
  }).catch((err) => {
    console.log(err)
  })
})
app.all("/logout", async(req,res) =>{
   req.session.destroy(() => {

    res.redirect("/login");
    

  })
});

app.use((req,res) =>{
  res.status(404).send(
    `
  <div title="Error 404" class="ss">Error 404</div>
  
        <style>
        a{
          text-decoration: none
        }
        @import url('https://fonts.googleapis.com/css?family=Fira+Mono:400');
  
  body{ 
    display: flex;
    width: 100vw;
    height: 100vh;
    align-items: center;
    justify-content: center;
    margin: 0;
    background: #131313;
    color: #fff;
    font-size: 96px;
    font-family: 'Fira Mono', monospace;
    letter-spacing: -7px;
  }
  
  .ss{
    animation: glitch 1s linear infinite;
  }
  
  @keyframes glitch{
    2%,64%{
      transform: translate(2px,0) skew(0deg);
    }
    4%,60%{
      transform: translate(-2px,0) skew(0deg);
    }
    62%{
      transform: translate(0,0) skew(5deg); 
    }
  }
  
  .ss:before,
  .ss:after{
    content: attr(title);
    position: absolute;
    left: 0;
  }
  
  .ss:before{
    animation: glitchTop 1s linear infinite;
    clip-path: polygon(0 0, 100% 0, 100% 33%, 0 33%);
    -webkit-clip-path: polygon(0 0, 100% 0, 100% 33%, 0 33%);
  }
  
  @keyframes glitchTop{
    2%,64%{
      transform: translate(2px,-2px);
    }
    4%,60%{
      transform: translate(-2px,2px);
    }
    62%{
      transform: translate(13px,-1px) skew(-13deg); 
    }
  }
  
  .ss:after{
    animation: glitchBotom 1.5s linear infinite;
    clip-path: polygon(0 67%, 100% 67%, 100% 100%, 0 100%);
    -webkit-clip-path: polygon(0 67%, 100% 67%, 100% 100%, 0 100%);
  }
  
  @keyframes glitchBotom{
    2%,64%{
      transform: translate(-2px,0);
    }
    4%,60%{
      transform: translate(-2px,0);
    }
    62%{
      transform: translate(-22px,5px) skew(21deg); 
    }
  }
        </style>
        `
  );
})

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

// module.exports = trackVisits;

app.listen(port, () => {
  console.log("Started Successfully");
});
