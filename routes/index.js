var express = require('express');
var router = express.Router();

const fs = require('fs');

const loginController = require('../controller/loginController')

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { title: 'Salary Calculator' });
});
router.get('/login', async (req, res) => {
  body = await loginController()
  // console.log(req.query.username)
  fs.writeFile('Output.html', body, (err) => {

    // In case of a error throw err. 
    if (err) throw err;
  })
  res.send(body)
});

module.exports = router;
