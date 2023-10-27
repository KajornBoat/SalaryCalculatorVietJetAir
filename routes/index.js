var express = require('express');
var router = express.Router();


const fs = require('fs');

const loginController = require('../controller/Login.controller')
const reportController = require('../controller/Report.controller')

/* GET home page. */
router.get('/', async (req, res, next) => {
  // console.log(req.cookies)
  if (await loginController.checkCookieAvalible(req.cookies.AUTH) && req.cookies.AUTH) {
    let report = await reportController.main(req.cookies.AUTH)
    res.send(report)
  }
  else
    res.redirect("login")
});

router.get('/login', async (req, res) => {
  res.render('login', { title: 'Salary Calculator' });
});
router.post('/login', async (req, res) => {
  console.log("Login", req.body)
  try {
    let cookie = await loginController.getCookie(req.body.username, req.body.password)
    res.cookie("AUTH", cookie)
    res.sendStatus(200)
  } catch (e) {
    res.sendStatus(e)
  }
});

router.get('/test', async (req, res) => {

  fs.readFile('views/reportTemp.txt', (err, data) => {
    if (err) throw err; 
    reportHTML = data.toString()
    // console.log(reportHTML);
    let dataJson = reportController.extractReport(reportHTML)
    res.send(dataJson)
  })
});

module.exports = router;
