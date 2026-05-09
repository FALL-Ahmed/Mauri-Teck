const router = require('express').Router();
const ctrl = require('../controllers/order.controller');
const { authenticate, authorize, optionalAuthenticate } = require('../middleware/auth.middleware');
const { uploadPaymentProof } = require('../middleware/upload.middleware');

// Public / guest
router.post('/',                   optionalAuthenticate, ctrl.create);
router.get('/track/:orderNumber',  ctrl.trackOrder);
router.post('/:id/payment-proof',  uploadPaymentProof, ctrl.uploadProof);

// Buyer connecté
router.get('/my',                  authenticate, ctrl.myOrders);

// Organizer
router.get('/organizer/pending',   authenticate, authorize('ORGANIZER'), ctrl.getPending);
router.get('/organizer/all',       authenticate, authorize('ORGANIZER'), ctrl.getOrganizerOrders);
router.patch('/:id/confirm',       authenticate, authorize('ORGANIZER'), ctrl.confirm);
router.patch('/:id/reject',        authenticate, authorize('ORGANIZER'), ctrl.reject);

// Admin
router.get('/admin/all',           authenticate, authorize('ADMIN'), ctrl.getAllOrders);

module.exports = router;
