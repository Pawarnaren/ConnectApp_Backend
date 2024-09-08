import express from 'express';
import { signUpUser, loginUser, getUserProfile, getCurrentUserProfile, uploadProfilePicture, updateUserEmail, updateUserPassword, getAllUsers, updateUserProfile } from '../controllers/user-controller.js';
import { followUser, unfollowUser, searchUsersByTag } from '../controllers/user-controller.js';
import { authenticateUserByToken } from '../middleware/auth-middleware.js';
import upload from '../config/multer.js';

const router = express.Router();

// Check route to verify backend is running
router.get('/checkup', (req, res) => {
  console.log('GET /checkup endpoint was hit');
  res.status(200).send('Backend is running correctly');
});

// POST route for user signup
router.post('/signup', signUpUser);

// POST route for login user
router.post('/login', loginUser);

// Route to fetch a specific user profile with dynamic routing
router.get('/users/:username', authenticateUserByToken, getUserProfile);

// Route to get the current user's profile
router.get('/user', authenticateUserByToken, getCurrentUserProfile);

// Route to update email
router.put('/user/change-email', authenticateUserByToken, updateUserEmail);

// Route to update password
router.put('/user/change-password', authenticateUserByToken, updateUserPassword);

// Route to update user profile (including bio and tags)
router.put('/users/:username/update-biotag', authenticateUserByToken, updateUserProfile);

// Route to handle profile picture upload
router.post('/users/uploadProfilePicture', authenticateUserByToken, upload.single('profileImage'), uploadProfilePicture);

// Route to fetch all users
router.get('/all-users', authenticateUserByToken, getAllUsers);

// Route to follow a user
router.post('/users/follow', authenticateUserByToken, followUser);

// Route to unfollow a user
router.post('/users/unfollow', authenticateUserByToken, unfollowUser);

// Route to search users by tag
router.get('/users/searchtag/:tag', authenticateUserByToken, searchUsersByTag);


// Example of a protected route
router.get('/protected', authenticateUserByToken, (req, res) => {
  res.status(200).json({ message: 'You are authorized to access this route' });
});

export default router;
