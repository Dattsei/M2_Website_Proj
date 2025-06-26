require('dotenv').config();
const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 4800;

// Middleware
app.use(express.static(path.join(__dirname, 'public')));
app.use('/assets', express.static(path.join(__dirname, 'assets')));

// Routes
app.get('/', (_req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/admin', (_req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

app.get('/favorites', (_req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'favorites.html'));
});

app.get('/login', (_req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.get('/mainpage', (_req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'mainpage.html'));
});

app.get('/register', (_req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'register.html'));
});

// 404 Handler
app.use((_req, res) => {
    res.status(404).sendFile(path.join(__dirname, 'public', '404.html'));
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});