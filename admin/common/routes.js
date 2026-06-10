const express = require('express');
const router = express.Router();

router.get('/login', (req, res) => {
  res.render('../modules/login/login.ejs');
});

router.get('/', (req, res) => {
  res.render('../modules/dashboard/dashboard.ejs');
});

router.get('/forgot-password', (req, res) => {
  res.render('../modules/login/forgot_password.ejs');
});

router.get('/profile', (req, res) => {
  res.render('../modules/profile/profile.ejs');
});

module.exports = router;
