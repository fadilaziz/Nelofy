const express = require('express')
const app = express()
const path = require('path')
const dotenv = require('dotenv')
dotenv.config()
const routes = require('./common/routes')
const port = process.env.PORT || 3000

app.set('view engine', 'ejs')
app.locals.process = process;
app.use(
  "/assets",
  (req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Cache-Control", "public, max-age=86400");
    next();
  },
  express.static(path.join(__dirname, 'assets'))
);

app.use("/", routes)

app.listen(port, "0.0.0.0", () => {
  console.log(`Example app listening on port ${port}`)
})
