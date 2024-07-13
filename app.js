const express = require("express");
const app = express();
const cors = require("cors");
const corsConfig = {
  origin: "*",
  credential: true,
  methods: ["GET", "POST", "PUT", "DELETE"],
};
app.options("", cors(corsConfig));
app.use(cors(corsConfig));
let port = 80;
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const path = require("path");
const Info = require("./models/productSchema");
const Employee = require("./models/employees");
const authGuard = require("./middlewares/auth.guard");
const adminGuard = require("./middlewares/admin.guard");
const managerGuard = require("./middlewares/manager.guard");
const MongoClient = require("mongodb").MongoClient;
const Log = require("./models/logs");
const logAction = require("./middlewares/logAction");
const moment = require("moment");
const session = require("express-session");
const SessionStore = require("connect-mongodb-session")(session);
const compression = require("compression");
app.use(compression());
moment.locale("ar");
require("dotenv").config();
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
mongoose.connect(process.env.DB).then(() => {
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
app.use(async (req, res, next) => {
  try {
    const user = await Employee.Employee.findOne({
      _id: req.session.userId,
    });
    if (user) {
      // user found
      req.session.username = user.username;
      req.session.role = user.role;
      req.session.visits = user.visits;
      req.session.addations = user.addations;
      req.session.deleteations = user.deleteations;
      req.session.updateations = user.updateations;
    }
    next();
  } catch (error) {
    // error handling
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});
app.get("/crud", authGuard.isAuth, adminGuard.isEmployee, async (req, res) => {
  if (req.session && req.session.userId) {
    const id = req.session.userId;

    try {
      // Find employee by ID and update visitCount
      await Employee.Employee.findByIdAndUpdate(id, { $inc: { visits: 1 } });

      // Fetch all products after updating the visit count
      const allProducts = await Info.getAllProducts();

      res.render("./crud.ejs", {
        allProducts: allProducts,
        isUser: req.session.userId,
        isManager: req.session.role === "Manager",
        moment: moment,
      });
    } catch (err) {
      console.error(err);
      res.status(500).send("Server Error");
    }
  } else {
    // If there's no session userId, redirect to login or handle accordingly
    res.redirect("/login");
  }
});

app.get("/logs", async (req, res) => {
  try {
    const logs = await Log.find().sort({ timestamp: -1 });
    res.render("logs/logs", { logs, moment: moment });
  } catch (error) {
    res.status(500).send("Error retrieving logs");
  }
});

app.get("/api/employee-stats/:username", async (req, res) => {
  try {
    const username = req.params.username;

    const employee = await Employee.Employee.findOne({
      username: new RegExp(`^${username}$`, "i"),
    });

    if (!employee) {
      console.log(`Employee with username ${username} not found`);
      return res.status(404).send("Employee not found");
    }

    res.json({
      addations: employee.addations,
      deleteations: employee.deleteations,
      updateations: employee.updateations,
      visits: employee.visits,
      username: employee.username,
    });
  } catch (error) {
    console.error("Error fetching employee data:", error);
    res.status(500).send("Internal Server Error");
  }
});

app.get("/employee/:username/stats", async (req, res) => {
  const username = req.params.username;

  res.render("logs/dashboard", {
    username,
  });
});

app.post("/logs", managerGuard.isManager, async (req, res) => {
  const url = process.env.DB;

  console.log("Connecting to database...");

  try {
    const client = await MongoClient.connect(url, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Connected to database");

    const dbo = client.db("test");

    // Drop the collection
    const result = await dbo.collection("products").drop();
    console.log("Collection successfully deleted.");
    res.redirect("/crud");

    client.close();
  } catch (error) {
    if (error.codeName === "NamespaceNotFound") {
      console.log("Collection not found or already deleted.");
      res.redirect("/crud");
    } else {
      console.error("Error:", error);
      res.status(500).send("Error processing request");
    }
  }
});

app.post("/productAdd", async (req, res) => {
  Info.createNewProduct(
    req.body.PNAME,
    req.body.WHOLEPRICE,
    req.body.PNOTES
  ).then(async () => {
    await Employee.Employee.findByIdAndUpdate(req.session.userId, {
      $inc: { addations: 1 },
    });
    logAction(req.session.userId, "إضافة منتج", req.body, req.session.username);
    res.redirect("/crud");
  });
});
app.delete("/crud/delete/:id", (req, res) => {
  Info.Info.findByIdAndDelete(req.params.id)

    .then(async (body) => {
      await Employee.Employee.findByIdAndUpdate(req.session.userId, {
        $inc: { deleteations: 1 },
      });
      logAction(req.session.userId, "حذف منتج", body, req.session.username);
      res.status(200).json("Done");
    })

    .catch((err) => {
      console.log(err);
    });
});
app.post("/productUpdate/:id", (req, res) => {
  Info.Info.findByIdAndUpdate(req.params.id, {
    PNAME: req.body.PNAME,
    WHOLEPRICE: req.body.WHOLEPRICE,
    PNOTES: req.body.PNOTES,
  }).then(async (value) => {
    await Employee.Employee.findByIdAndUpdate(req.session.userId, {
      $inc: { updateations: 1 },
    });
    logAction(
      req.session.userId,
      "تحديث المنتج",
      req.body,
      req.session.username
    );
    res.redirect("/crud");
  });
});
app.get("/crud/update/:id", async (req, res) => {
  await Info.Info.findById(req.params.id).then((value) => {
    console.log("Find The Product");
    console.log(value);
    res.status(200).json(value);
  });
});
app.get("/", (req, res) => res.send("Express on Vercel"));

app.get("/createEmployee", managerGuard.isManager, (req, res) => {
  res.render("./auth/createEmployee.ejs");
});
app.get("/login", (req, res) => {
  res.render("./auth/login.ejs");
});

app.post("/createEmployee", managerGuard.isManager, async (req, res) => {
  await Employee.createNewEmployee(req.body.username, req.body.password)
    .then((user) => {
      logAction(
        req.session.userId,
        "Employee Create",
        req.body,
        req.session.username
      );
      res.redirect("/login");
    })
    .catch((err) => {
      console.log(err);
    });
});
app.get("/session-check", (req, res) => {
  res.json(req.session);
});
app.post("/login", async (req, res) => {
  await Employee.login(req.body.username, req.body.password)
    .then(async (result) => {
      req.session.userId = result.id;
      req.session.username = result.username;
      req.session.role = result.role;
      req.session.visits = result.visits;
      res.redirect("/crud");
    })
    .catch((err) => {
      console.log(err);
    });
});
app.all("/logout", async (req, res) => {
  req.session.destroy(() => {
    res.redirect("/login");
  });
});

app.use((req, res) => {
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
});

// Tracking Visits System
// in model:  visitCount: { type: Number, default: 0 }

app.listen(port, () => {
  console.log("Started Successfully");
});
module.exports = app;
