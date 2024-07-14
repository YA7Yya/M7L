const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const employeeData = new mongoose.Schema({
  username: String,
  password: String,
  role: {
    type: String,
    default: "Employee",
  },
  visits: {
    type: Number,
    default: 0,
  },
  addations: {
    type: Number,
    default: 0,
  },
  deleteations: {
    type: Number,
    default: 0,
  },
  updateations: {
    type: Number,
    default: 0,
  },
});
const Employee = mongoose.model("Employee", employeeData);

exports.createNewEmployee = async (
  username,
  password,
  role,
  visits,
  addations,
  deleteations,
  updateations
) => {
  return new Promise((resolve, reject) => {
    mongoose
      .connect(process.env.DB, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      })
      .then(() => {
        return Employee.findOne({ username: username });
      })
      .then((user) => {
        if (user) {
          reject("User Already Exists!");
        } else {
          return bcrypt.hash(password, 10);
        }
      })
      .then(async (hashedPassword) => {
        if (hashedPassword) {
          let user = new Employee({
            username: username,
            password: hashedPassword,
            role: role,
            visits: visits,
            addations: addations,
            deleteations: deleteations,
            updateations: updateations,
          });
          return user.save();
        }
      })
      .catch((error) => {
        console.error("Error in createNewEmployee:", error);
        reject(error);
      });
  });
};
exports.login = (username, password) => {
  return new Promise((resolve, reject) => {
    Employee.findOne({ username: username })
      .then((user) => {
        if (!user) {
          reject("User Does Not Exist!");
        } else {
          bcrypt.compare(password, user.password).then((same) => {
            if (!same) {
              reject("Password Incorrect");
            } else {
              resolve({
                id: user._id,
                username: user.username,
                role: user.role,
                visits: user.visits,
              });
            }
          });
        }
      })
      .catch((err) => {
        reject(err);
      });
  });
};
// Export Employee model
exports.Employee = Employee;
