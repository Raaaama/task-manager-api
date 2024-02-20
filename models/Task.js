const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  completed: { type: Boolean, default: false },
  importance: { type: Boolean, default: false }, // Importance field
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true } // Reference to User _id
});

const Task = mongoose.model('Task', taskSchema);

module.exports = Task;