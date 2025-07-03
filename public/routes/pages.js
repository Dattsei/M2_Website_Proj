const express = require('express');
const router = express.Router();
const path = require('path');

const servePage = (page) => (req, res) => {
  res.sendFile(path.join(__dirname, '../public', `${page}.html`)); 
};


router.get('/', servePage('index'));
router.get('/login', servePage('login'));
router.get('/register', servePage('register'));


const protectedPages = [
  'admin', 'favorites', 'mainpage', 'account',
  'manage-profiles', 'payment-method', 'profiles',
  'search', 'subscription', 'watchpage'
];

protectedPages.forEach(page => {
  router.get(`/${page}`, (req, res) => {
    if (!req.session.user && page !== 'mainpage') return res.redirect('/login');
    servePage(page)(req, res);
  });
});

module.exports = router;