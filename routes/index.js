const express = require('express');
const router = express.Router();

const conf = require(REQUIRE_PATH.configure);

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', 
    { 
      title: `Bording on ${conf.env.environment}`,
      body: `Bwing project`  
    }
  );
});

module.exports = router;