const express  = require('express');
const mongoose = require('mongoose');
const path = require('path');
const port = 3019;

const app = express();
app.use(express.static(__dirname));
app.use(express.urlencoded({extended:true}));

mongoose.connect('mongodb://127.0.0.1:27017/students');
const db = mongoose.connection;
db.once('open', () => {
    console.log("MongoDB Connection Successful");
});

const userSchema = new mongoose.Schema({
    regd_no: String,
    name: String,
    email: String,
    branch: String,
});

const Users = mongoose.model("data", userSchema);

// Serve form
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'form.html'));
});

// Create user
app.post('/post', async (req, res) => {
    const { regd_no, name, email, branch } = req.body;
    const user = new Users({ regd_no, name, email, branch });
    await user.save();
    console.log(user);
    res.send("Form Submission Successful");
});

// Read users
app.get('/users', async (req, res) => {
    const users = await Users.find();
    res.json(users);
});

// Serve update form
app.get('/edit/:id', async (req, res) => {
    const user = await Users.findById(req.params.id);
    res.send(`
        <form action="/update/${user._id}" method="POST">
            <label>Registration Number:</label>
            <input type="text" name="regd_no" value="${user.regd_no}">
            <label>Name:</label>
            <input type="text" name="name" value="${user.name}">
            <label>Email:</label>
            <input type="email" name="email" value="${user.email}">
            <label>Branch:</label>
            <select name="branch">
                <option value="CSE" ${user.branch === 'CSE' ? 'selected' : ''}>CSE</option>
                <option value="IT" ${user.branch === 'IT' ? 'selected' : ''}>IT</option>
                <option value="MECH" ${user.branch === 'MECH' ? 'selected' : ''}>MECH</option>
                <option value="CIVIL" ${user.branch === 'CIVIL' ? 'selected' : ''}>CIVIL</option>
                <option value="ELE" ${user.branch === 'ELE' ? 'selected' : ''}>ELE</option>
            </select>
            <button type="submit">Update</button>
        </form>
    `);
});

// Update user
app.post('/update/:id', async (req, res) => {
    const { regd_no, name, email, branch } = req.body;
    await Users.findByIdAndUpdate(req.params.id, { regd_no, name, email, branch });
    res.send("User updated successfully");
});

// Delete user
app.post('/delete/:id', async (req, res) => {
    await Users.findByIdAndDelete(req.params.id);
    res.send("User deleted successfully");
});

app.get('/delete-user/:id', (req, res) => {
    res.send(`
        <form action="/delete/${req.params.id}" method="POST">
            <button type="submit">Delete User</button>
        </form>
    `);
});

// Serve delete.html
app.get('/delete-user', (req, res) => {
    res.sendFile(path.join(__dirname, 'delete.html'));
});



app.listen(port, () => {
    console.log("Server started on port", port);
});



// http://localhost:3019/    Create
// http://localhost:3019/users   Read
// http://localhost:3019/edit/<user_id>  Update
// http://localhost:3019/delete-user?id=66e6835492b037ab73cbd740  Delete
