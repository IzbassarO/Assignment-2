const mongoose = require('mongoose');

const logSchema = new mongoose.Schema({
  username: String,
  citySearched: String,
  searchTime: Date,
  weatherData: Object // or specific fields as per your requirement
});

const SearchLog = mongoose.model('SearchLog', logSchema);

module.exports = SearchLog;
