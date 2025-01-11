const express = require("express");
const app = express();
const cors = require("cors");
const corsConfig = {
  origin: "*",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE"],
};
let port = 80;
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const path = require("path");
const Info = require("./models/productSchema");
const Storage = require("./models/storage");
const Employee = require("./models/employees");
const authGuard = require("./middlewares/auth.guard");
const adminGuard = require("./middlewares/admin.guard");
const managerGuard = require("./middlewares/manager.guard");
const MongoClient = require("mongodb").MongoClient;
const Log = require("./models/logs");
const Sales = require("./models/sale");
const logAction = require("./middlewares/logAction");
const moment = require("moment");
const session = require("express-session");
const SessionStore = require("connect-mongodb-session")(session);
const compression = require("compression");
const http = require("http");
const socketIo = require('socket.io');
const server = http.createServer(app);
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./views/swagger.json');

const io = socketIo(server, {
  cors: {
    origin: "*",
  }
});
app.use(compression());
moment.locale("ar-EG");
require("dotenv").config();
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));
mongoose.connect(process.env.DB, { useUnifiedTopology: true }).then(() => {
  console.log("DB Started Successfully");
});
app.use(cors(corsConfig));
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


io.on('connection', (socket) => {
  console.log('A user connected');

  socket.on('disconnect', () => {
    console.log('A user disconnected');
  });
});
app.use(async (req, res, next) => {
  try {
    const user = await Employee.Employee.findOne({
      _id: req.session.userId,
    }).lean();
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
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.get("/crud", authGuard.isAuth, adminGuard.isEmployee, async (req, res) => {
  const id = req.session.userId;

  try {
    const updateVisitCount = await Employee.Employee.findByIdAndUpdate(id, { $inc: { visits: 1 } }).lean();
    await io.emit('visitsUpdate', updateVisitCount.visits);

    const fetchProducts = Info.Info.find().sort({ updatedAt: -1 }).limit(3).lean();

    const [updateResult, allProducts] = await Promise.all([updateVisitCount, fetchProducts]);

    res.render("./crud.ejs", {
      allProducts: allProducts,
      isUser: req.session.userId,
      isManager: req.session.role === "Manager",
      Dev: req.session.role === "Developer",
      moment: moment,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});
app.delete("/storage/delete/:id",authGuard.isAuth,adminGuard.isEmployee, async(req,res) =>{
  let deleted = await Storage.Storage.findByIdAndDelete(req.params.id);
  res.json("Done").status(200)
})
app.post("/storage/update/:id",async (req,res) =>{
    try {
      // Fetch the original document before update
      const originalProduct = await Storage.Storage.findById(req.params.id).lean();
  
      if (!originalProduct) {
        return res.status(404).send("Product not found");
      }
  
      // Create an object with the updated fields
      const updatedFields = {
        productName: req.body.productName !== originalProduct.productName ? req.body.productName : originalProduct.productName,
        wholePrice: req.body.wholePrice !== originalProduct.wholePrice ? parseFloat(req.body.wholePrice) : originalProduct.wholePrice,
        quantity: req.body.quantity !== originalProduct.quantity ? req.body.quantity : originalProduct.quantity,
        unit: req.body.unit !== originalProduct.unit ? req.body.unit : originalProduct.unit,
        status: req.body.status !== originalProduct.status ? req.body.status : originalProduct.status,
      };
  
      // Update the document
      const updatedProduct =  await Storage.Storage.findByIdAndUpdate(
        req.params.id,
        updatedFields
      ).lean();
      let updateU = await Employee.Employee.findByIdAndUpdate(req.session.userId, {
        $inc: { updateations: 1 },
      }).lean();
    await io.emit('updateationsUpdate', updateU.updateations);
      let lastupdate = await Storage.Storage.findByIdAndUpdate(req.params.id, {
        createdBy: originalProduct.createdBy,
        lastUpdate: req.session.username
      }).lean();
      console.log(originalProduct);
  await Promise.all([originalProduct,updatedProduct,updateU,lastupdate]);
  
  
      // Log the changes
      const logDetails = {};
      for (const key in updatedFields) {
        if (originalProduct[key] !== updatedFields[key]) {
          logDetails.before = originalProduct[key];
          logDetails.after = updatedFields[key];
          let ss = await Log.create({
            action: `Update ${key}`,
            userId: req.session.userId,
            username: req.session.username,
            details: {
              productName: req.body.productName,
              wholePrice: req.body.wholePrice,
              quantity: req.body.quantity,
              unit: req.body.unit,
              status: req.body.status,
            },
            update: logDetails,
          });
        }
      }
  
  
  
      res.redirect("/storage");
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal Server Error");
    }
})
app.post("/storage",authGuard.isAuth,adminGuard.isEmployee, (req,res) =>{
  console.log(req.body);
  Storage.storageProduct(req.body.productName, req.body.quantity, req.body.unit,req.body.wholePrice,req.body.status,req.session.username).then(() => {
    res.redirect("/storage")
  })
})
app.get("/storage",authGuard.isAuth,adminGuard.isEmployee, async(req,res) =>{
await Storage.Storage.find().sort({updatedAt: -1}).limit(3).then((storedProducts) => {
  res.render("./storage.ejs", {
    product: storedProducts,
    moment: moment,
  })
})
})
app.get("/loadMoreProducts", authGuard.isAuth, async (req, res) => {
  try {
    const offset = parseInt(req.query.offset) || 0;
    const limit = 3;
    
    const moreProducts = await Info.Info.find().sort({ updatedAt: -1 }).skip(offset).limit(limit).lean();

    res.json(moreProducts);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});
app.get("/loadMoreStorageProducts", authGuard.isAuth, async (req, res) => {
  try {
    const offset = parseInt(req.query.offset) || 0;
    const limit = 3;
    
    const moreProducts = await Storage.Storage.find().sort({ updatedAt: -1 }).skip(offset).limit(limit).lean();

    res.json(moreProducts);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});
app.get("/products/api",authGuard.isAuth,managerGuard.isManager, (req,res) =>{
  Info.Info.find().lean().then((api) => {
    res.json(api)
  })
})
app.get("/logs", authGuard.isAuth, managerGuard.isManager, async (req, res) => {
  try {
    const logs = await Log.find().sort({ createdAt: -1 }).lean();
    res.render("logs/logs", { logs, moment: moment });
  } catch (error) {
    res.status(500).send("Error retrieving logs");
  }
});

app.get("/dashboard/:username", authGuard.isAuth, managerGuard.isManager, async (req, res) => {
  const username = req.params.username;

  res.render("logs/dashboard", {
    username,
  });
});
app.get("/api/employee-stats/:username", authGuard.isAuth, managerGuard.isManager, async (req, res) => {
  try {
    const username = req.params.username;

    const employee = await Employee.Employee.findOne({
      username: new RegExp(`^${username}$`, "i"),
    }).lean();

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
app.post("/search" ,(req,res) =>{
  let searchText = req.body.barcode.trim();

  Info.Info.find({
    barcode:searchText
  }).then((result) => {
    console.log(result);
    res.render("search.ejs", {
      title: "Search",
      searchResult: result,
      moment: moment,
    });
  });
})
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
    const result = await dbo.collection("logs").drop();
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

app.post("/productAdd", authGuard.isAuth,adminGuard.isEmployee, async (req, res) => {
  const create = Info.createNewProduct(
    req.body.PNAME,
    req.body.WHOLEPRICE,
    req.body.PNOTES,
    req.body.barcode,
    req.session.username,
    "Not Updated Yet"
  )
  const emp = await Employee.Employee.findByIdAndUpdate(req.session.userId, {
    $inc: { addations: 1 },
  }).lean();
  await io.emit('addationsUpdate', emp.addations)
  await Promise.all([create,emp])
  .then(async (body) => {
    logAction(
      "إضافة منتج",
      req.session.userId,
      req.session.username,{

  PNAME: req.body.PNAME,
  WHOLEPRICE: req.body.WHOLEPRICE,
  PNOTES: req.body.PNOTES
},
    )
    res.redirect("/crud");
  });
});
app.delete("/crud/delete/:id",authGuard.isAuth,adminGuard.isEmployee, async (req, res) => {
  let deleted = await Info.Info.findByIdAndDelete(req.params.id)
  let updateD = await Employee.Employee.findByIdAndUpdate(req.session.userId, {
    $inc: { deleteations: 1 },
  }).then(async(value) => {
    io.emit('deleteationsUpdate', value.deleteations);
  });
  await Promise.all([deleted,updateD])
    .then(async (body) => {
      await logAction("حذف منتج", req.session.userId, req.session.username,
        {
        PNAME: deleted.PNAME,
        WHOLEPRICE: deleted.WHOLEPRICE,
        PNOTES: deleted.PNOTES,
    }
      );
      res.status(200).json("Done");
    })

    .catch((err) => {
      console.log(err);
    });
});

app.post("/crud/update/:id",authGuard.isAuth,adminGuard.isEmployee, async (req, res) => {
  try {
    // Fetch the original document before update
    const originalProduct = await Info.Info.findById(req.params.id).lean();

    if (!originalProduct) {
      return res.status(404).send("Product not found");
    }

    // Create an object with the updated fields
    const updatedFields = {
      PNAME: req.body.PNAME !== originalProduct.PNAME ? req.body.PNAME : originalProduct.PNAME,
      WHOLEPRICE: req.body.WHOLEPRICE !== originalProduct.WHOLEPRICE ? parseFloat(req.body.WHOLEPRICE) : originalProduct.WHOLEPRICE,
      PNOTES: req.body.PNOTES !== originalProduct.PNOTES ? req.body.PNOTES : originalProduct.PNOTES,
    };

    // Update the document
    const updatedProduct =  await Info.Info.findByIdAndUpdate(
      req.params.id,
      updatedFields
    ).lean();
    let updateU = await Employee.Employee.findByIdAndUpdate(req.session.userId, {
      $inc: { updateations: 1 },
    }).lean();
  await io.emit('updateationsUpdate', updateU.updateations);
    let lastupdate = await Info.Info.findByIdAndUpdate(req.params.id, {
      createdBy: originalProduct.createdBy,
      lastUpdate: req.session.username
    }).lean();
    console.log(originalProduct);
await Promise.all([originalProduct,updatedProduct,updateU,lastupdate]);


    // Log the changes
    const logDetails = {};
    for (const key in updatedFields) {
      if (originalProduct[key] !== updatedFields[key]) {
        logDetails.before = originalProduct[key];
        logDetails.after = updatedFields[key];
        let ss = await Log.create({
          action: `Update ${key}`,
          userId: req.session.userId,
          username: req.session.username,
          details: {
            PNAME: req.body.PNAME,
            WHOLEPRICE: req.body.WHOLEPRICE,
            PNOTES: req.body.PNOTES,
          },
          update: logDetails,
        });
      }
    }



    res.redirect("/crud");
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});
app.post("/allEmployees", authGuard.isAuth, managerGuard.isManager, async(req,res) =>{
  await Employee.Employee.find().lean().then((rs) => {
    res.send(rs)
  });
})
app.get("/crud/update/:id", async (req, res) => {
  await Info.Info.findById(req.params.id).lean().then((value) => {
    console.log("Find The Product");
    console.log(value);
    res.status(200).json(value);
  });
});
app.get("/storage/update/:id", async (req, res) => {
  await Storage.Storage.findById(req.params.id).lean().then((value) => {
    console.log("Find The Product");
    console.log(value);
    res.status(200).json(value);
  });
});
app.get("/", (req, res) => res.redirect("/crud"));

app.get("/createEmployee", managerGuard.isManager, (req, res) => {
  res.render("./auth/createEmployee.ejs");
});
app.get("/login", authGuard.notAuth, (req, res) => {
  res.render("auth/login.ejs");
});
app.get("/product/:barcode", async (req, res) => {
  try {
    const product = await Info.Info.findOne({ barcode: req.params.barcode }).lean();

    if (!product) {
      return res.status(404).send("Product not found");
    }

    res.json(product);
  } catch (error) {
    console.error("Error fetching product by barcode:", error);
    res.status(500).send("Internal Server Error");
  }
});
app.get("/this", (req, res) => {
  res.render("./this.ejs");
});

app.post("/createEmployee", managerGuard.isManager, async (req, res) => {
  await Employee.createNewEmployee(req.body.username, req.body.password)
    .then((user) => {
      logAction(
        "إنشاء موظف",
        req.session.userId,
        req.session.username,
        req.body
      );
      res.redirect("/crud");
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
app.get("/sale/add", (req,res) =>{
  res.render("./sales/sale")
})
app.post("/sale/add", (req,res) =>{
   Sales.newSale(req.body.PNAME,req.body.QUANTITY,req.body.PRICE,req.body.PNOTES,req.session.username,req.session.username).then((result)=>{
  res.redirect("/")
})
})

app.all("/logout", adminGuard.isEmployee, async (req, res) => {
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

server.listen(port, () => {
  console.log("Started Successfully");
});
module.exports = app;
