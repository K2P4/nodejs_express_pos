require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const stockRoutes = require("./routes/Stock-route");
const categoryRoutes = require("./routes/Category-route");
const userRoutes = require("./routes/User-route");
const orderRoutes = require("./routes/Order-route");
const invoiceRoutes = require("./routes/Invoice-route");


const app = express();
app.use(express.json());
app.use("/public", express.static("public"));
app.use(cors());
app.set("view engine", "ejs");
app.set("views", __dirname + "/views");

app.use("/api/order", orderRoutes);
app.use("/api/stocks", stockRoutes);
app.use("/api/category", categoryRoutes);
app.use("/api/invoice", invoiceRoutes);
app.use("/api/", userRoutes);

const baseUrl = process.env.APP_URL || "http://127.0.0.1:3000";

mongoose
  .connect(process.env.DB_CONNECTION, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to DB"))
  .catch((err) => console.log(err));

app.listen(3000, () => console.log("Server is running on port 3000"));
