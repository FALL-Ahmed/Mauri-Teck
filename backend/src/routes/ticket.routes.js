const router = require('express').Router();
const ctrl = require('../controllers/ticket.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

router.get('/my-events',             authenticate, authorize('AGENT'),     ctrl.myEvents);
router.post('/scan',                 authenticate, authorize('AGENT'),     ctrl.scan);
router.get('/scan-stats/:eventId',   authenticate, authorize('AGENT'),     ctrl.scanStats);
router.get('/scan-history/:eventId', authenticate, authorize('AGENT'),     ctrl.scanHistory);
router.patch('/:ticketId/cancel',    authenticate, authorize('ORGANIZER'), ctrl.cancelTicket);

module.exports = router;
