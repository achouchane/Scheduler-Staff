var express = require("express");
var router = express.Router();
// var db = require("../db/db.js");
var path = require("path");

const Employee = require("../models/employee");
const EmployeeSchedule = require("../models/employeeSchedule");
const Announcements = require("../models/announcements");

// Getting Employees from the database
router.get("/getAllEmployees", async (req, res, next) => {
  try {
    const employees = await Employee.find({ active: 1 });
    res.send(employees);
  } catch (err) {
    console.log(err);
    next(err);
  }
});

// Get employee schedules from database
router.get("/getEmpSchedules", async (req, res, next) => {
  try {
    const schedules = await EmployeeSchedule.find({ active: 1 });
    res.send(schedules);
  } catch (err) {
    console.log(err);
    next(err);
  }
});

// Posting Employee Schedule to the database
router.post("/addEmpSchedule", async (req, res, next) => {
  try {
    await EmployeeSchedule.create({
      emp_id: req.body.emp_id,
      firstName: req.body.firstName,
      lastName: req.body.lastName,
    });
    res.send("Employee Schedule Saved!");
  } catch (err) {
    console.log(err);
    next(err);
  }
});
// Updating existing employee schedule
router.put("/updateSchedule/:id", async (req, res, next) => {
  try {
    const newSchedule = req.body.employeeSchedule;
    await EmployeeSchedule.findOneAndUpdate(
      { _id: req.params.id },
      {
        monday: newSchedule.monday,
        tuesday: newSchedule.tuesday,
        wednesday: newSchedule.wednesday,
        thursday: newSchedule.thursday,
        friday: newSchedule.friday,
        saturday: newSchedule.saturday,
        sunday: newSchedule.sunday,
      }
    );
    res.send("Employee schedule updated");
  } catch (err) {
    console.log(err);
    next(err);
  }
});
// Posting new Employee to the database
router.post("/addEmployee", async (req, res, next) => {
  try {
    const employee = await Employee.create({
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      addressOne: req.body.addressOne,
      addressTwo: req.body.addressTwo,
      city: req.body.city,
      state: req.body.state,
      zip: req.body.zip,
      email: req.body.email,
      phone: req.body.phone,
      phoneType: req.body.phoneType,
    });
    res.send(employee);
  } catch (err) {
    console.log(err);
    next(err);
  }
});

// Updating existing employee
router.put("/updateEmployee/:id", async (req, res, next) => {
  try {
    await Employee.findOneAndUpdate(
      { _id: req.params.id },
      {
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        addressOne: req.body.addressOne,
        addressTwo: req.body.addressTwo,
        city: req.body.city,
        state: req.body.state,
        zip: req.body.zip,
        email: req.body.email,
        phone: req.body.phone,
        phoneType: req.body.phoneType,
      }
    );
    res.send("Employee updated");
  } catch (err) {
    console.log(err);
    next(err);
  }
});

// Update employee's name in employee schedule collection
router.put("/updateEmpName/:emp_id", async (req, res, next) => {
  try {
    await EmployeeSchedule.findOneAndUpdate(
      { emp_id: req.params.emp_id },
      {
        firstName: req.body.firstName,
        lastName: req.body.lastName,
      }
    );
    res.send("Employee's name updated");
  } catch (err) {
    console.log(err);
    next(err);
  }
});

// "Remove" existing employee
router.put("/removeEmployee/:id", async (req, res, next) => {
  try {
    const employee = await Employee.findOneAndUpdate(
      { _id: req.params.id },
      { active: 0 }
    );
    res.send(employee);
  } catch (err) {
    console.log(err);
    next(err);
  }
});

// "Remove" existing employee schedule
router.put("/removeEmpSchedule/:emp_id", async (req, res, next) => {
  try {
    const schedule = await EmployeeSchedule.findOneAndUpdate(
      { emp_id: req.params.emp_id },
      { active: 0 }
    );
    res.send(schedule);
  } catch (err) {
    console.log(err);
    next(err);
  }
});
//Getting announcements from the database
router.get("/getAnnouncements", async (req, res, next) => {
  try {
    console.log("here");
    const announcements = await Announcements.find({ active: 1 });
    console.log(announcements);
    res.send(announcements);
  } catch (err) {
    console.log(err);
    next(err);
  }
});

// Put announcements to database
router.post("/addAnnouncements", async (req, res, next) => {
  try {
    const announcement = await Announcements.create({
      title: req.body.title,
      content: req.body.content,
    });
    res.send(announcement);
  } catch (err) {
    console.log(err);
    next(err);
  }
});

module.exports = router;
