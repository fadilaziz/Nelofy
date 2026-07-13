const express = require('express')
const router = express.Router()
const viewPath = __dirname + '/../modules/checkout/view'
// const { authMiddleware } = require('../../billing-api/middleware/auth_middleware')

// router.get('/', (req, res) => {
//   res.render(__dirname + '/../modules/home/home_page.ejs')
// })
router.get('/', (req, res) => {
  res.render(__dirname + '/../modules/product/products.ejs')
})

router.get('/profile', (req, res) => {
  res.render(__dirname + '/../modules/profile/profile.ejs')
})

router.get('/checkout', (req, res) => {
  res.render(__dirname + '/../modules/checkout/checkout.ejs')
})

router.get('/payment', (req, res) => {
  res.render(__dirname + '/../modules/payment/payment.ejs')
})

router.get('/thankyou', (req, res) => {
  res.render(__dirname + '/../modules/payment/thankyou.ejs')
})
router.get('/change_password', (req, res) => {
  res.render(__dirname + '/../modules/password/change_password.ejs')
})
router.get('/reset_password', (req, res) => {
  res.render(__dirname + '/../modules/password/reset_password.ejs')
})

module.exports = router