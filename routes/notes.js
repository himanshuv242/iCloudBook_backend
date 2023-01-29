const express = require("express");
const router = express.Router();
var fetchuser = require("../middleware/fetchuser");
const Note = require("../models/Note");
const { body, validationResult } = require("express-validator"); //to validate note if its not blank and we are still saving it to our data base.

//ROUTE:1 Get All the Notes using: GET "/api/notes/fetchallnotes".Login Required
router.get("/fetchallnotes", fetchuser, async (req, res) => {
  try {
    const notes = await Note.find({ user: req.user.id });
    res.json(notes);
  } catch (error) {
    console.log(error.message);
    res.status(500).send("Internal server error");
  }
});

//ROUTE:2 Add the Notes using: POST "/api/notes/addnote".Login Required
router.post(
  "/addnote",
  fetchuser,
  [
    //validations
    body("title", "Enter a valid title").isLength({ min: 3 }),
    body("description", "Description must be atleast 5 characters").isLength({
      min: 5,
    }),
  ],
  async (req, res) => {
    try {
      const { title, description, tag } = req.body;
      //If there are error, return Bad request and the errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const note = new Note({
        title,
        description,
        tag,
        user: req.user.id,
      });

      const savedNote = await note.save();

      res.json(savedNote);
    } catch (error) {
      console.log(error.message);
      res.status(500).send("Internal server error");
    }
  }
);

//ROUTE:3 UPDATE an existing note using: PUT "/api/notes/updatenote". Login Required
router.put(
  "/updatenote/:id", //so that user update only there note not other's.
  fetchuser,
  async (req, res) => {
    const { title, description, tag } = req.body;

    try {

    //Create a newNote object
    const newNote = {};
    if (title) {
      newNote.title = title;
    }
    if (description) {
      newNote.description = description;
    }
    if (tag) {
      newNote.tag = tag;
    }

    //Find the note to be update and update it.
    let note = await Note.findById(req.params.id);
    if (!note) {
      return res.status(404).send("Not Found");
    } //check if note exist

    if (note.user.toString() !== req.user.id) {
      // to check if someone is not trying to access other user note.
      return res.status(401).send("Not Allowed");
    }

    note = await Note.findByIdAndUpdate(
      req.params.id,
      { $set: newNote },
      { new: true }
    );
    res.json({ note });
  } catch (error) {
    console.log(error.message);
    res.status(500).send("Internal server error");
  }
  }
);


//ROUTE:4 DELETE an existing note using: DELETE "/api/notes/deletenote". Login Required
router.delete(
  "/deletenote/:id", //so that user update only there note not other's.
  fetchuser,
  async (req, res) => {

    try {

    //Find the note to be update and delete it.
    let note = await Note.findById(req.params.id);
    if (!note) {
      return res.status(404).send("Not Found");
    } //check if note exist

    if (note.user.toString() !== req.user.id) {
      // to check if someone is not trying to access other user note.
      return res.status(401).send("Not Allowed");
    }

    note = await Note.findByIdAndDelete(req.params.id);
    res.json({ "Success": "Note has been deleted", note:note });
  } catch (error) {
    console.log(error.message);
    res.status(500).send("Internal server error");
  }
  }
  
);


module.exports = router;
