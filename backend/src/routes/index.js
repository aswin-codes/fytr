const router = require('express').Router();
const userRoutes = require('./userRoutes');
const exerciseRoutes = require('./exercisesRoutes');
const onboardingRoutes = require('./onboardingRoutes');

router.use('/user',userRoutes);
router.use('/exercise',exerciseRoutes);
router.use('/onboarding',onboardingRoutes);

module.exports = router;
