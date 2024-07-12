const userRouter = require('./userRouter');
const hotelRouter = require('./hotelRouter');
const flightRouter = require('./flightRouter');
const serviceRouter = require('./serviceRouter');
const cityRouter = require('./cityRouter');
const countryRouter = require('./countryRouter');
const tourRouter  = require('./tourRouter');
const requestRouter = require('./requestRouter');

const router = new require('express').Router();

router.use('/users', userRouter);
router.use('/hotels', hotelRouter);
router.use('/flights', flightRouter);
router.use('/services', serviceRouter);
router.use('/cities', cityRouter);
router.use('/countries', countryRouter);
router.use('/tours', tourRouter);
router.use('/requests', requestRouter);

module.exports = router;

