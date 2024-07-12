const userController = require('../controllers/userController');
const auth = require('../middlewares/authMiddleware');

const router = new require('express').Router();


router.get('/', auth('ADMIN'), userController.getUsers);
router.get('/me', auth('ADMIN', 'SALES_MANAGER', 'CONTENT_MANAGER', 'USER'), userController.me);
router.put('/:id', auth('USER', 'ADMIN'), userController.updateUser);
router.post('/', userController.createUser);
router.post('/login', userController.login);
router.post('/employees/:id', auth('ADMIN'), userController.createEmployee);
router.delete('/:id', auth('ADMIN'), userController.removeUser);
router.get('/applications', auth('ADMIN'), userController.getApplications);
router.delete('/applications/:id', auth('ADMIN'), userController.removeApplication);

module.exports = router;

