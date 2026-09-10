require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');
const Student = require('./models/Student');

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/studentdb';

// ---------- Middleware ----------
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ---------- Database Connection ----------
mongoose
  .connect(MONGO_URI)
  .then(() => console.log('MongoDB connected:', MONGO_URI))
  .catch((err) => {
    console.error('MongoDB connection error:', err.message);
    console.error(
      'Make sure MongoDB is running locally, or set MONGO_URI in a .env file to your Atlas connection string.'
    );
  });

// ---------- Helper: send validation errors cleanly ----------
function handleError(res, err) {
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({ success: false, message: messages.join(', ') });
  }
  if (err.code === 11000) {
    return res.status(400).json({ success: false, message: 'Roll No. already exists' });
  }
  if (err.name === 'CastError') {
    return res.status(400).json({ success: false, message: 'Invalid student ID' });
  }
  console.error(err);
  return res.status(500).json({ success: false, message: 'Server error' });
}

// ---------- Routes ----------

// POST /students -> Add a new student record
app.post('/students', async (req, res) => {
  try {
    const { name, rollNo, course, marks } = req.body;
    const student = await Student.create({ name, rollNo, course, marks });
    res.status(201).json({ success: true, data: student });
  } catch (err) {
    handleError(res, err);
  }
});

// GET /students -> Fetch all student records
app.get('/students', async (req, res) => {
  try {
    const students = await Student.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: students.length, data: students });
  } catch (err) {
    handleError(res, err);
  }
});

// GET /students/:id -> Fetch a single student record
app.get('/students/:id', async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }
    res.status(200).json({ success: true, data: student });
  } catch (err) {
    handleError(res, err);
  }
});

// PUT /students/:id -> Update an existing student record
app.put('/students/:id', async (req, res) => {
  try {
    const { name, rollNo, course, marks } = req.body;
    const student = await Student.findByIdAndUpdate(
      req.params.id,
      { name, rollNo, course, marks },
      { new: true, runValidators: true }
    );
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }
    res.status(200).json({ success: true, data: student });
  } catch (err) {
    handleError(res, err);
  }
});

// DELETE /students/:id -> Delete a student record
app.delete('/students/:id', async (req, res) => {
  try {
    const student = await Student.findByIdAndDelete(req.params.id);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }
    res.status(200).json({ success: true, message: 'Student deleted', data: student });
  } catch (err) {
    handleError(res, err);
  }
});

// Fallback: serve the frontend for any other GET route
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}

module.exports = app;
