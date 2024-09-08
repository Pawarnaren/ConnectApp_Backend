import express from 'express';
import { authenticateUserByToken } from '../middleware/auth-middleware.js';
import { createPost, getPostById, updatePost, deletePost, getPostsByOwnerEmail,archivePost, getArchivedPostsByOwnerEmail } from '../controllers/post-controller.js';


const router = express.Router();

router.post('/posts/create', authenticateUserByToken, createPost);
router.get('/posts/:id', authenticateUserByToken, getPostById);
router.put('/posts/:id', authenticateUserByToken, updatePost);
router.delete('/posts/:id', authenticateUserByToken, deletePost);

// Route for archive path page
router.patch('/posts/archive/:id', authenticateUserByToken, archivePost);

// Route to get archived posts by owner email
router.get('/posts/archived/owner/:email', authenticateUserByToken, getArchivedPostsByOwnerEmail);

// Route to get all the post that are created by a user
router.get('/posts/owner/:email', getPostsByOwnerEmail);


export default router;
