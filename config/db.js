const mongoose = require("mongoose");
mongoose.set("strictQuery", true);

const connection = mongoose.connect("mongodb+srv://medistar:medistar@medistar.ne0fmxt.mongodb.net/medistar?retryWrites=true&w=majority");

module.exports = { connection };