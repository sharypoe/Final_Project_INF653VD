const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const stateSchema = new Schema({
  stateCode: {
    type: String,
    require: true,
    unique: true,
  },
  funfacts: {
    type: [String], // an array that contains string data
  },
});

module.exports = mongoose.model("State", stateSchema);
