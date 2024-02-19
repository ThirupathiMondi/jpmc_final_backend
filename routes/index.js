var express = require("express");
var router = express.Router();
var Quiz = require("../models/quiz");
const bcrypt = require("bcrypt");
const Course = require("../models/course"); // Adjust the path based on your project structure
const User = require("../models/user");
const jwt = require("jsonwebtoken");
// Connect to MongoDB
// Example data for a course

// Create a new course document
router.post("/register", async (req, res) => {
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(req.body.password, salt);
  const user = new User({
    name: req.body.name,
    email: req.body.email,
    password: hashedPassword,
  });
  const result = await user
    .save()
    .then((result) => {
      // const { password, ...data } = result.toJSON();
      // res.send(data);
      re = {
        message: "success",
      };
      res.send(re);
    })
    .catch((error) => {
      res.send({
        message: "User already exists",
      });
    });
});

// router.get("/register", (req, res) => {
//   let doesExist = User.findOne({ name: req.body.name }).select("_id name");
//   if (doesExist != null) {
//     res.send("Username already exists");
//   }

//   // return User.findOne({ name: req.body.name }).select("_id name");
// });

router.post("/login", async (req, res) => {
  const user = await User.findOne({ name: req.body.name });

  if (!user) {
    // return res.status(404).send({
    //   message: "user not found",
    // });
    res.send({
      message: "user not found",
    });
    // return;
  } else if (!(await bcrypt.compare(req.body.password, user.password))) {
    // return res.status(400).send({
    //   message: "invalid credentials",
    // });
    res.send({
      message: "invalid credentials",
    });
  } else {
    const token = jwt.sign({ _id: user._id }, "finland");
    res.cookie("jwt", token, {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    });
    res.send({
      message: "success",
    });
  }
});

router.get("/user", async (req, res) => {
  try {
    const cookie = req.cookies["jwt"];
    const claims = jwt.verify(cookie, "finland");

    if (!claims) {
      return res.status(401).send({
        message: "unauthenticated",
      });
    }

    const user = await User.findOne({ _id: claims._id });
    const { password, ...userDetails } = await user.toJSON();
    res.send(userDetails);
  } catch (e) {
    return res.status(401).send({ message: "unauthenticated" });
  }
});

router.post("/logout", (req, res) => {
  res.cookie("jwt", "", { maxAge: 0 });
  res.send({ message: "success" });
});

router.post("/save", (req, res) => {
  const newCourse = new Course(req.body);
  // Save the course to the database
  newCourse
    .save()
    .then((savedCourse) => {
      console.log("Course saved:", savedCourse);
      res.send("Course saved successfully");
    })
    .catch((error) => {
      console.error("Error saving course:", error);
    });
});

// router.get("/save", async (req, res) => {
//   // Course.findOne({image : "course-image-url1"}).select("_id image title chapters")
//   // .then(result=> console.log(result))
//   // .catch(error=> console.log(error))
//   const courses = await Course.find({catagory:req.body.category}).select("image title description");

//   // Respond with the fetched courses
//   res.json(courses);
// });
router.post("/getCourse", async (req, res) => {
  const courses = await Course.find({ category: req.body.category }).select(
    "image title description"
  );

  //   // Respond with the fetched courses
  res.json(courses);
});
router.post("/api/questions", (req, res) => {
  const { question, options, correctOption, courseName } = req.body;
  const newQuestion = new Quiz({
    question,
    options,
    correctOption,
    courseName,
  });

  newQuestion
    .save()
    .catch((err) => {
      res.status(500).send(err);
    })
    .then(() => {
      res.status(201).json(question);
    });
});

router.post("/api/getQuestions", (req, res) => {
  Quiz.find({ courseName: req.body.courseName })
    .then((question) => {
      res.status(201).json(question);
    })
    .catch((error) => {
      res.status(500).send(error);
    });
});

router.post("/saveResults", async (req, res) => {
  // User.findOneAndUpdate({userName:req.body.userName}).select('userQuizzes').
  try {
    const { name, attemptedQuiz, score } = req.body;
    const result = await User.findOne({ name: name });
    if (!result) return res.status(404).json({ message: "User not found" });

    if (!result.quizzes) {
      result.quizzes = [];
    }

    const existingAttempt = await User.findOneAndUpdate(
      {
        name: name,
        "quizzes.attemp tedQuiz": attemptedQuiz,
      },
      {
        $set: {
          "quizzes.$.score": score,
        },
      },
      { new: true }
    );
    if (!existingAttempt) {
      result.quizzes.push({
        attemptedQuiz: attemptedQuiz,
        score: score,
      });
    }
    await result.save();
    // then(res => console.log('Score updated')).catch(error => console.log(error));
    return res.status(200).json({ message: "Score saved successfully" });
  } catch (e) {
    console.log(e);
    return res.status(500).json({
      message: "error occured white storing",
    });
  }
});

// router.get("/api/questions", (req, res) => {
//   const { count, language } = req.query;

//   Quiz.find({ language })
//     .limit(parseInt(count))
//     .exec()
//     .catch((err) => {
//       res.status(500).send(err);
//     })
//     .then((question) => {
//       res.status(201).json(question);
//     });
// });

module.exports = router;
