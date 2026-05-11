const router = require('express').Router()
const ctrl = require('../controllers/guestTicket.controller')
const { authenticate } = require('../middleware/auth.middleware')

router.post('/',                  authenticate, ctrl.createGuestTicket)
router.get('/event/:eventId',     authenticate, ctrl.getEventGuestTickets)
router.post('/scan',              authenticate, ctrl.scanGuestTicket)
router.delete('/:id',            authenticate, ctrl.deleteGuestTicket)

module.exports = router
