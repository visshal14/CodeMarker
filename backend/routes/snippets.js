const express = require('express');
const router = express.Router();
const Snippet = require('../modals/snippet');
const Comment = require('../modals/comments');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect(['developer']), async (req, res) => {
    const { title, description, language, code } = req.body;

    try {
        const snippet = new Snippet({
            title,
            description,
            language,
            code,
            author: req.user.userId
        });

        const createdSnippet = await snippet.save();
        res.status(201).json(createdSnippet);
    } catch (error) {
        res.status(500).json({ error: `Error creating snippet: ${error.message}` });
    }
});

router.get('/', protect(['developer', 'reviewer']), async (req, res) => {
    try {
        const query = req.user.role === 'developer' ? { author: req.user.userId } : {};
        const snippets = await Snippet.find(query).populate('author', 'username').populate('reviewers', 'username');

        const snippetsWithComments = await Promise.all(
            snippets.map(async snippet => {
                const comments = await Comment.find({ snippetId: snippet._id });
                return { ...snippet.toObject(), commentCount: comments.length };
            })
        );

        res.json(snippetsWithComments);
    } catch (error) {
        res.status(500).json({ error: `Error fetching snippets: ${error.message}` });
    }
});


router.get('/:id', protect(['developer', 'reviewer']), async (req, res) => {
    try {
        const snippet = await Snippet.findById(req.params.id).populate('author', 'username').populate('reviewers', 'username');

        if (!snippet) {
            return res.status(404).json({ message: 'Snippet not found.' });
        }

        const comments = await Comment.find({ snippetId: snippet._id });

        res.json({ ...snippet.toObject(), commentCount: comments });
    } catch (error) {
        res.status(500).json({ error: `Error fetching snippet: ${error.message}` });
    }
});


router.put('/:id', protect(['developer']), async (req, res) => {
    const { title, description, language, code } = req.body;

    try {
        const snippet = await Snippet.findById(req.params.id).populate('author', 'username').populate('reviewers', 'username');

        if (!snippet) {
            return res.status(404).json({ message: 'Snippet not found.' });
        }

        if (snippet.author._id.toString() !== req.user.userId) {
            return res.status(403).json({ message: 'Unauthorized.' });
        }

        snippet.title = title;
        snippet.description = description;
        snippet.language = language;
        snippet.code = code;

        const updatedSnippet = await snippet.save();
        res.json(updatedSnippet);
    } catch (error) {
        res.status(500).json({ error: `Error updating snippet: ${error.message}` });
    }
});


router.delete('/:id', protect(['developer']), async (req, res) => {
    try {
        const snippet = await Snippet.findById(req.params.id);

        if (!snippet) {
            return res.status(404).json({ message: 'Snippet not found.' });
        }

        if (snippet.author.toString() !== req.user.userId) {
            return res.status(403).json({ message: 'Unauthorized.' });
        }

        await Snippet.findByIdAndDelete(req.params.id);
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: `Error deleting snippet: ${error.message}` });
    }
});


router.put('/:id/assign-reviewers', protect(['developer']), async (req, res) => {
    const { reviewers } = req.body;

    try {
        const snippet = await Snippet.findById(req.params.id).populate('author', 'username').populate('reviewers', 'username');


        if (!snippet) {
            return res.status(404).json({ message: 'Snippet not found.' });
        }

        if (snippet.author?._id.toString() !== req.user.userId) {
            return res.status(403).json({ message: 'Unauthorized.' });
        }

        snippet.reviewers = reviewers;
        await snippet.save();

        const updatedSnippet = await Snippet.findById(req.params.id).populate('author', 'username').populate('reviewers', 'username');


        res.json(updatedSnippet);
    } catch (error) {
        res.status(500).json({ error: `Error assigning reviewers: ${error.message}` });
    }
});


router.put('/:id/mark-reviewed', protect(['reviewer']), async (req, res) => {
    try {
        const snippet = await Snippet.findById(req.params.id).populate('author', 'username').populate('reviewers', 'username');

        if (!snippet) {
            return res.status(404).json({ message: 'Snippet not found.' });
        }
        console.log(snippet.reviewers);
        if (!snippet.reviewers.some(reviewer => reviewer._id.toString() === req.user.userId)) {
            return res.status(403).json({ message: 'Unauthorized: You are not assigned to review this snippet.' });
        }

        snippet.status = 'Reviewed';
        const updatedSnippet = await snippet.save();
        res.json(updatedSnippet);
    } catch (error) {
        res.status(500).json({ error: `Error marking snippet as reviewed: ${error.message}` });
    }
});
// < !--ℑ♑︎  亖⌽⎭🂱⎶☀️☀️⌶⍱   -->
router.get('/review/assigned', protect(['reviewer']), async (req, res) => {
    try {
        const snippets = await Snippet.find({ reviewers: req.user.userId }).populate('author', 'username').populate('reviewers', 'username');

        const snippetsWithComments = await Promise.all(
            snippets.map(async snippet => {
                const comments = await Comment.find({ snippetId: snippet._id });
                return { ...snippet.toObject(), commentCount: comments.length };
            })
        );

        res.json(snippetsWithComments);
    } catch (error) {
        res.status(500).json({ error: `Error fetching assigned snippets: ${error.message}` });
    }
});

module.exports = router;
