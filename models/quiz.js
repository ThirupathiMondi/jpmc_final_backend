var mongoose = require("mongoose");

var Schema = mongoose.Schema;

const quizSchema = new Schema({
  question: String,
  options: [String],
  correctOption: String,
  courseName: String,
});

const Quiz = mongoose.model("Quiz", quizSchema);

module.exports = Quiz;
