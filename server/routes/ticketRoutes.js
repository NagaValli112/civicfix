const express = require('express');
const router = express.Router();
const multer = require('multer');
const { reportIssue, getTickets, analyzeImage, updateTicketStatus, getHighPriorityZones } = require('../controllers/ticketController');

// Multer Setup for Memory Storage
const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Debugging Router-level
router.use((req, res, next) => {
    console.log(`[DEBUG] Ticket Router: ${req.method} ${req.url}`);
    next();
});

router.post('/report', upload.single('image'), reportIssue);
router.post('/', upload.single('image'), reportIssue); // Client compatibility
router.post('/analyze', upload.single('image'), analyzeImage);
router.get('/', getTickets);
router.patch('/:id/status', updateTicketStatus);
router.put('/:id', updateTicketStatus); // Client compatibility
router.delete('/:id', require('../controllers/ticketController').deleteTicket);
router.get('/zones', getHighPriorityZones);
router.get('/:id', require('../controllers/ticketController').getTicketById);

module.exports = router;
