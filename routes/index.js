const express = require('express');
const router = express.Router();


const loginController = require('../controller/Login.controller')
const reportController = require('../controller/Report.controller')

/* GET home page. */
router.get('/', async (req, res, next) => {
  // console.log("GET /")
  if (await loginController.checkCookieAvalible(req.cookies.AUTH) && req.cookies.AUTH) {
    let info = await loginController.getAccountInfo(req.cookies.AUTH)
    res.render('report',info)
    // res.render('reportTest')
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

router.get('/data', async (req, res) => {
  // console.log("Get /data : from ", req.query.from, 'to ', req.query.to)
  if (await loginController.checkCookieAvalible(req.cookies.AUTH) && req.cookies.AUTH) {
    let data = await reportController.getDataJson({ from: req.query.from, to: req.query.to }, req.cookies.AUTH)
    res.json(data)
  }
  else
    res.sendStatus(403)
})
router.get('/test', async (req, res) => {
  // try{
  //   let info = await loginController.getAccountInfo(req.cookies.AUTH)
  //   res.json(info)
  // }
  // catch(e){
  //   console.log(e)
  //   res.sendStatus(404)
  // }
  
  res.render("reportTest")
});

module.exports = router;
