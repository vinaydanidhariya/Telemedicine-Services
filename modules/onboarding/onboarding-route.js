const express = require('express');
const OnboardingController = require('./onboarding-controller');
const AuthMiddleware = require('../../middleware/authorize.js');
const { registerUserValidator, loginValidator } = require('../../helpers/validators');
const router = express.Router();

/* GET users listing. */
router.get('/', OnboardingController.getInstance);
router.post('/signup', AuthMiddleware.validateApiKey, registerUserValidator, OnboardingController.signup);
router.post('/signin', AuthMiddleware.validateApiKey, loginValidator, OnboardingController.signin);
// router.get('/refresh-token', AuthMiddleware.validateApiKey, OnboardingController.refreshToken);

module.exports = router;
