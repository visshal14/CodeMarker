const dotenv = require('dotenv');
dotenv.config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { Server } = require('socket.io');
const { createServer } = require('http');
const authRoutes = require('./routes/auth');
const snippetRoutes = require('./routes/snippets');
const commentRoutes = require('./routes/comments');
const changeHistoryRoute = require('./routes/changeHistory');
const ChangeHistory = require('./modals/changeHistory');
const Snippet = require('./modals/snippet');



const app = express();
const httpServer = createServer(app);
const PORT = process.env.PORT || 5000;
const io = new Server(httpServer, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST'],
    },
});



mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB Connected!'))
    .catch(err => console.log(err));


app.use(cors());
app.use(express.json());
app.use('/auth', authRoutes);
app.use('/snippets', snippetRoutes);
app.use('/comments', commentRoutes);
app.use('/change-history', changeHistoryRoute);


app.get('/', (req, res) => {
    res.send("API is running");
});


io.on("connection", (socket) => {
    console.log(`User connected: ${socket.id}`);

    socket.on('join-room', (snippetId) => {
        socket.join(snippetId);
        console.log(`User ${socket.id} joined room: ${snippetId}`);
    });

    socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.id}`);
    });

    socket.on('send-comment', async (commentData) => {
        io.to(commentData.snippetId).emit('new-comment', commentData);
        try {
            io.to(commentData.snippetId).emit('new-notification', {
                type: 'comment',
                message: `New comment on line ${commentData.line} for your snippet: ${commentData.snippetTitle}`,
            });
        } catch (error) {
            console.error('Error sending comment notification:', error);
        }
    });

    socket.on('code-change', async (codeChangeData) => {

        io.to(codeChangeData.snippetId).emit('code-change', codeChangeData);
        try {
            const snippet = await Snippet.findById(codeChangeData.snippetId);
            if (snippet) {
                const lines = snippet.code.split('\n');
                lines[codeChangeData.lineNumber - 1] = codeChangeData.lineCode;
                snippet.code = lines.join('\n');
                await snippet.save();
            }

            const changeHistory = new ChangeHistory({
                user: codeChangeData.author,
                type: 'code-change',
                detail: `Code changed on line ${codeChangeData.lineNumber}: ${codeChangeData.lineCode}`,
                snippetId: codeChangeData.snippetId,
            });
            await changeHistory.save();

            io.to(codeChangeData.snippetId).emit('change-history-update', {
                user: codeChangeData.author,
                type: 'Code Changed',
                detail: `Code changed on line ${codeChangeData.lineNumber}: ${codeChangeData.lineCode}`,
            });
        } catch (error) {
            console.error('Error saving code change history:', error);
        }
    });
});


httpServer.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
