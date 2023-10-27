var express = require('express');
var router = express.Router();


const fs = require('fs');

const loginController = require('../controller/loginController')
const reportController = require('../controller/Report.controller')
/* GET home page. */
router.get('/', async (req, res, next) => {
  // console.log(req.cookies)
  if(await loginController.checkCookieAvalible(req.cookies.AUTH) && req.cookies.AUTH){ 
    let report = await reportController.main(req.cookies.AUTH)
    res.send(report)
  }
  else
    res.redirect("login")
});

router.get('/login', async (req, res) => {
  res.render('login', { title: 'Salary Calculator' });
});

router.get('/loging', async (req, res) => {
  body = await loginController.main()
  // console.log(req.query.username)
  // fs.writeFile('Output.html', body, (err) => {

  //   // In case of a error throw err. 
  //   if (err) throw err;
  // })
  res.send(body)
});
router.post('/login', async (req, res) => {
  console.log("Login", req.body)
  try {
    let cookie = await loginController.getCookie(req.body.username, req.body.password)
    res.cookie("AUTH",cookie)
    res.sendStatus(200)
  } catch (e) {
    res.sendStatus(e)
  }
});

module.exports = router;
