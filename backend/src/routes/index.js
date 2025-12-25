const router = require('express').Router();
const userRoutes = require('./userRoutes');
const exerciseRoutes = require('./exercisesRoutes');

router.use('/user',userRoutes);
router.use('/exercise',exerciseRoutes);

module.exports = router;
