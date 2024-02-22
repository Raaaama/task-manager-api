const mongoose = require("mongoose");
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Task = require('../models/Task');
const User = require('../models/User');

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized: Missing token' });
  }

  try {
    const decoded = jwt.verify(token, 'rama');
    req.username = decoded.username; // Attach username to the request object
    next(); // Move to the next middleware or route handler
  } catch (error) {
    return res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }
};

// Middleware to extract userId from token
const extractUserId = (req) => {
    const token = req.headers.authorization.split(' ')[1];
    const decodedToken = jwt.verify(token, 'rama');
    return decodedToken.userId;
};

// Routes

// Get all tasks for the authenticated user
router.post('/get-user-tasks', verifyToken, async (req, res) => {
  try {
    var userId = new mongoose.Types.ObjectId(extractUserId(req));
    const tasks = await Task.find({ user: userId });
    res.json(tasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Add a new task for the authenticated user
router.post('/add-task', verifyToken, async (req, res) => {
  try {
    // Extract task details from the request body
    const { title, description, completed, important } = req.body;

    const token = req.headers.authorization.split(' ')[1]; // Get the token from the authorization header
    const decodedToken = jwt.verify(token, 'rama'); // Decode the token
    const userId = decodedToken.userId; // Extract user ID from the decoded token
    
    // Create a new task associated with the authenticated user
    const task = new Task({
      title,
      description,
      completed: !!completed, // Convert to boolean (if not already)
      important: !!important, // Convert to boolean (if not already)
      user: userId // Associate the task with the authenticated user
    });

    // Save the task to the database
    await task.save();

    // Respond with a success message and the newly created task
    res.status(201).json({ message: 'Task created successfully', task });


  } catch (error) {
    // Handle errors
    console.error('Error creating task:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update a task for the authenticated user
router.put('/:taskId', verifyToken, async (req, res) => {
  try {
    const { taskId, title, description, completed, important } = req.body;

    // Find the task by ID and ensure it belongs to the authenticated user
    const task = await Task.findOne({ _id: taskId });
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // Update the task fields if provided
    if (title) task.title = title;
    if (description) task.description = description;
    if (completed !== undefined) task.completed = !!completed;
    if (important !== undefined) task.important = !!important;

    // Save the updated task
    await task.save();

    // Respond with the updated task
    res.json({ message: 'Task updated successfully', task });
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete a task for the authenticated user
router.delete('/:taskId', verifyToken, async (req, res) => {
  try {
    const taskId = req.params.taskId;

    // Find the task by ID and ensure it belongs to the authenticated user
    const task = await Task.findByIdAndDelete({ _id: taskId });
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // Respond with a success message
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
