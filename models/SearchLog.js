const mongoose = require('mongoose');

const logSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  username: String,
  citySearched: String,
  searchTime: Date,
  weatherData: Object
});

const SearchLog = mongoose.model('SearchLog', logSchema);

module.exports = SearchLog;