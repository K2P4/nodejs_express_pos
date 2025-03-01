const express = require("express");
const Stock = require("../Models/Stock");
const path = require("path");
const multer = require("multer");


const router = express.Router();


const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "public/uploads"));
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage: storage });


router.get("/", async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const perpage = parseInt(req.query.perpage) || 10;
    const search = req.query.search;

    const filter = {};
    const offset = (page - 1) * perpage;

    if (search) {
      filter["$text"] = { $search: search };
    }

    const stocks = await Stock.find(filter).limit(perpage).skip(offset);
    const totalCount = await Stock.countDocuments(filter);

    res.status(200).json({
      total: totalCount,
      page,
      perpage,

      data: stocks,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const getByID = async (req, res, next) => {
  try {
    const { id } = req.params;
    const stock = await Stock.findById(id);

    if (!stock) {
      return res.status(404).json({ message: "404 NOT FOUND" });
    }

    req.stock = stock;
    next();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

router.get("/:id", getByID, async (req, res) => {
  res.status(200).json({ message: "Sucessfull", stock: req.stock });
});

router.post("/", async (req, res, next) => {
  try {
    const stockData = req.body;
    if(stockData.image){
      stockData.image = req.file.path;

    }
    const newStock = new Stock(stockData);
    await newStock.save();
    res
      .status(201)
      .json({ message: "Stock item added successfully", data: newStock });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put("/:id", getByID, upload.single('image'), async (req, res, next) => {
  try {
    const stock = req.stock;
    Object.assign(stock, req.body);

    if(req.file){
      stock.image = req.file.path;
    }

    await stock.save();
    res
      .status(201)
      .json({ message: "Stock item Updated successfully", data: stock });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete("/:id", getByID, async (req, res, next) => {
  await req.stock.remove();
  res.status(200).json({ message: "Stock item deleted successfully" });
});

module.exports = router;
