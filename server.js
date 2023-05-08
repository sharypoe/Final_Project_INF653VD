require("dotenv").config(); // need to add to beginning of file
const express = require("express");
const app = express();
const path = require("path");
const cors = require("cors");
const corsOptions = require("./config/corsOptions");
const connectDB = require("./config/dbConn");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser"); // cookie parser
const PORT = process.env.PORT || 3000; // different port

// connect to MongoDB
connectDB();

// cors -> cross-origin-resource-sharing
app.use(cors(corsOptions));

// ‘content-type: application/x-www-form-urlencoded’
app.use(express.urlencoded({ extended: false }));

// built-in middleware for json
app.use(express.json());

//middleware for cookies
app.use(cookieParser());

//serve static files
// app.use('/', express.static(path.join(__dirname, '/public')));

// routes
app.use("/", require("./routes/root"));
app.use("/states", require("./routes/api/states"));

// catch for missing route
app.all("*", (req, res) => {
  res.status(404);
  if (req.accepts("html")) {
    res.sendFile(path.join(__dirname, "views", "404.html"));
  } else if (req.accepts("json")) {
    res.json({ error: "404 Not Found" });
  } else {
    res.type("txt").send("404 Not Found");
  }
});

mongoose.connection.once("open", () => {
  console.log("Connected to MongoDB");
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});
