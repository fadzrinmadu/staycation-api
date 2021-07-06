const router =  require('express').Router();
const authController = require('../controllers/authController');

router.get('/', authController.viewLogin);
router.post('/', authController.actionLogin);

router.get('/logout', authController.actionLogout);

module.exports = router;
