const express = require('express');
const logger = require('./middleware/logger');
require('dotenv').config();
const {
  createTodoValidator,
  editTodoValidator,
} = require('./middleware/validator.js');

const errorHandler = require('./middleware/errorHandler');
const e = require('express');
const app = express();
app.use(express.json()); // Parse JSON bodies

app.use(logger); // Custom middleware
let todos = [
  { id: 1, task: 'Learn Node.js', completed: false },
  { id: 2, task: 'Build CRUD API', completed: false },
];
//GET ALL TODOS
app.get ('/todos' , (req, res) => {
res.status(200).json(todos)
});

// GET ID – Read
app.get('/todos/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const todo = todos.find(t => t.id == id);
  if (!todo) {
      return res.status(404).json({message: 'Todo not found'})
  }
  res.json(todo);
});

// POST New – Create
app.post('/todos', createTodoValidator, (req, res) => {
  const newTodo = { id: todos.length + 1, ...req.body }; // Auto-ID
  todos.push(newTodo);
  res.status(201).json(newTodo); // Echo back
});

//Post validation 
app.post('/todos/', (req, res) => {
  const { task} = req.body;
  if (!task || task.trim() == '') {
    return res.status(400).json({
      message:"Task is required"
    });
  }
  const newTodo ={
    id: Date.now(), task,
    completed: false
  };
  todos.push(newTodo);
  res.status(202).json(newTodo)
});

//GET ACTIVE TODOS
app.get ('/todos/active', (req,res) => {
  const activeTodos = todos.filter ( t => !t.completed);
  res.json(activeTodos);
});

// PATCH Update – Partial
app.patch('/todos/:id', editTodoValidator, (req, res) => {
  const todo = todos.find((t) => t.id === parseInt(req.params.id)); // Array.find()
  if (!todo) return res.status(404).json({ message: 'Todo not found' });
  Object.assign(todo, req.body); // Merge: e.g., {completed: true}
  res.status(200).json(todo);
});

// DELETE Remove
app.delete('/todos/:id', (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const initialLength = todos.length;
    todos = todos.filter((t) => t.id !== id); // Array.filter() – non-destructive
    if (todos.length === initialLength)
      return res.status(404).json({ error: 'Not found' });
    res.status(204).send(); // Silent success
  } catch (error) {
    next(error); // Pass to error handler
  }
});

app.get('/todos/completed', (req, res) => {
  const completed = todos.filter((t) => t.completed);
  res.json(completed); // Custom Read!
});

app.use(errorHandler); // Error-handling middleware

const PORT = process.env.PORT || 2000;
app.listen(PORT, () => console.log(`Server on port ${PORT}`));
