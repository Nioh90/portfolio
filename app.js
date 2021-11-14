const express = require("express");
const bodyParser = require("body-parser");
const request = require("request");
const https = require("https");
require("dotenv").config();

const app = express();

var warning = "";
var year = new Date().getFullYear();
var d1 = new Date(2021, 8, 2);
var d2 = new Date();

function monthDiff(d1, d2) {
  var months;
  months = (d2.getFullYear() - d1.getFullYear()) * 12;
  months -= d1.getMonth();
  months += d2.getMonth();
  return months <= 0 ? 0 : months;
}

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");

app.get("/", function (req, res) {
  res.render("list", {
    warning: warning,
    year: year,
    months: monthDiff(d1, d2),
  });
});

app.post("/", function (req, res) {
  const name = req.body.fName;
  const email = req.body.email;
  const message = req.body.message;
  const data = {
    members: [
      {
        email_address: email,
        status: "subscribed",
        merge_fields: {
          FNAME: name,
          MESSAGE: message,
        },
      },
    ],
  };

  const jsonData = JSON.stringify(data);
  const url =
    "https://us5.api.mailchimp.com/3.0/lists/" + process.env.USER_LIST;
  const options = {
    method: "POST",
    auth: "kunal1:" + process.env.API_KEY,
  };

  const request = https.request(url, options, function (response) {
    console.log(response.statusCode);
    if (response.statusCode == 200) {
      warning = "Your message was delivered! ";
      res.redirect("/#contact");
    } else {
      warning =
        "Your message could not be delivered, please use my email address instead. ";
      res.redirect("/#contact");
    }

    response.on("data", function (data) {
      // console.log(JSON.parse(data));
    });
  });

  request.write(jsonData);
  request.end();
});

app.listen(process.env.PORT || 3000, function () {
  console.log("Server is running on port 3000");
});
