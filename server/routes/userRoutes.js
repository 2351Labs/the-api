const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

router.get('/:id', userController.getUser);
router.post('/signup', userController.createUser);   
router.post('/login', userController.validateUser);
router.post('/oauth/google', userController.googleOAuth);
  
module.exports = router;