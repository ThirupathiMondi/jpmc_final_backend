const mongoose = require("mongoose");

// Define the schema for a chapter
const chapterSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
});

// Define the schema for a course
const courseSchema = new mongoose.Schema({
  image: {
    type: String, // Assuming you store image URLs, adjust as needed
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    // type: [chapterSchema], // An array of chapter documents
    type : String,
    required: true,
  },
  category: {
    type: String,
    required: true
  }
});

// Create the Course model
const Course = mongoose.model("Course", courseSchema);

module.exports = Course;
