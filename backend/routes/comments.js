const express = require('express');
const router = express.Router();
const Comment = require('../modals/comments');
const { protect } = require('../middleware/authMiddleware')


router.post('/', protect(['developer', 'reviewer']), async (req, res) => {
    try {
        const { text, line, author, snippetId } = req.body;
        const comment = new Comment({
            text,
            line,
            author,
            snippetId
        });
        await comment.save();
        res.status(201).json(comment)
    } catch (error) {
        res.status(500).send(`Error creating comment: ${error}`);
    }
});

module.exports = router;