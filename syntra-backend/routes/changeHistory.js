const express = require('express');
const router = express.Router();
const ChangeHistory = require('../modals/changeHistory');
const { protect } = require('../middleware/authMiddleware');


router.get('/:snippetId', protect(['developer', 'reviewer']), async (req, res) => {
    try {
        const snippetId = req.params.snippetId;
        const history = await ChangeHistory.find({ snippetId }).sort({ timestamp: -1 });
        res.json(history)
    } catch (error) {
        res.status(500).send("Error fetching change history: ${ error }");
    }
});

module.exports = router;