const router = new require('express').Router();

const requestController = require('../controllers/requestController');
const auth = require('../middlewares/authMiddleware')

router.get('/',auth('SALES_MANAGER'), requestController.getAll);
router.get('/me',auth('USER'), requestController.getMy);
router.get('/:id/package', auth('USER'),requestController.getPackage)
router.post('/', auth('SALES_MANAGER'), requestController.create);
router.delete('/:id',auth('SALES_MANAGER', 'USER'),  requestController.delete);
router.patch('/:id',auth('SALES_MANAGER'),  requestController.updateStatus);
router.patch('/:id/pay',auth('USER'), requestController.pay);
router.patch('/:id/finish',auth('SALES_MANAGER'),  requestController.finish);


module.exports = router;