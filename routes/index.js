const express = require('express');
const router = express.Router();

const fs = require('fs');

const loginController = require('../controller/Login.controller')
const reportController = require('../controller/Report.controller')

const dataJson = require('../views/data.json')

/* GET home page. */
router.get('/', async (req, res, next) => {
  // console.log("GET /")
  if (await loginController.checkCookieAvalible(req.cookies.AUTH) && req.cookies.AUTH) {
    res.render('report')
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

  // fs.readFile('views/reportTemp.txt', (err, data) => {
  //   if (err) throw err; 
  //   reportHTML = data.toString()
  //   // console.log(reportHTML);
  //   let dataJson = reportController.extractReport(reportHTML)
  //   res.send(dataJson)
  // })
  res.render('report')
});
router.get('/data', async (req, res) => {
  // console.log("Get /data : from ", req.query.from, 'to ', req.query.to)
  if (await loginController.checkCookieAvalible(req.cookies.AUTH) && req.cookies.AUTH) {
    let data = await reportController.getDataJson({ from: req.query.from, to: req.query.to }, req.cookies.AUTH)
    res.json(data)
  }
  else
    res.sendStatus(403)
})
router.get('/dataJson', async (req, res) => {

  res.json(dataJson)
  // res.sendStatus(200)
});

module.exports = router;
