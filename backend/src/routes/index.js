const router = require('express').Router();
const userRoutes = require('./userRoutes');
const exerciseRoutes = require('./exercisesRoutes');
const onboardingRoutes = require('./onboardingRoutes');
const exerciseSyncRoutes = require('./exerciseSyncRoutes');

router.use('/user',userRoutes);
router.use('/exercise',exerciseRoutes);
router.use('/onboarding',onboardingRoutes);
router.use('/exercises',exerciseSyncRoutes);

module.exports = router;
