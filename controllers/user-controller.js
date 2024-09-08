import User from '../models/userModel.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import cloudinary from '../config/cloudinaryConfig.js';
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;

// SignupUser FUNCTION
export const signUpUser = async (req, res) => {
    const { firstName, middleName, lastName, username, email, phone, password, profileImage } = req.body;

    // Validate input
    if (!username || !password || !email) {
        return res.status(400).json({ message: 'Username, email, and password are required' });
    }
    try {
        // Check if email or username already exists
        const existingUserByEmail = await User.findOne({ email });
        if (existingUserByEmail) {
            return res.status(400).json({ message: 'Email already exists' });
        }
        const existingUserByUsername = await User.findOne({ username });
        if (existingUserByUsername) {
            return res.status(400).json({ message: 'Username already exists' });
        }
        // Hash the password using bcryptjs
        const hashedPassword = await bcrypt.hash(password, 10);
        // Create a new user
        const newUser = new User({
            firstName,
            middleName,
            lastName,
            username,
            email,
            phone,
            password: hashedPassword,
            profileImage
            // followersCount, followingCount, and posts are not included; they default to 0
        });
        // Save the new user
        await newUser.save();
        res.status(201).json({ message: 'User registered successfully', user: newUser });
    } catch (error) {
        console.error('Error registering user:', error); // Log the error for debugging
        res.status(500).json({ message: 'Error registering user', error: error.message });
    }
};

// LoginUser FUNCTION
export const loginUser = async (req, res) => {
    const { email, password } = req.body;
    console.log(email);
    console.log(password);
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: 'Invalid Email or Password' });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid Email or Password' });
        }
        // Generate JWT token
        const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '2h' });
        res.status(200).json({
            message: 'Login successful',
            user: {
                id: user._id,
                firstName: user.firstName,
                middleName: user.middleName,
                lastName: user.lastName,
                username: user.username,
                email: user.email,
                phone: user.phone,
                followersCount: user.followers.length, // Use length of followers array
                followingCount: user.following.length, // Use length of following array
                profileImage: user.profileImage
            },
            token
        });
    } catch (error) {
        res.status(500).json({ message: 'Error logging in', error: error.message });
    }
};

// Update User Email
export const updateUserEmail = async (req, res) => {
    const { newEmail } = req.body;
    const userId = req.user.id;
    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        user.email = newEmail;
        await user.save();
        res.status(200).json({ message: 'Email updated successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error updating email', error: error.message });
    }
};

// Update User Password
export const updateUserPassword = async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        // Compare current password with hashed password
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Current password is incorrect' });
        }
        // Hash the new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        await user.save();
        res.status(200).json({ message: 'Password updated successfully' });
    } catch (error) {
        console.error('Error updating password:', error); // Log the error for debugging
        res.status(500).json({ message: 'Error updating password', error: error.message });
    }
};

// Function to get user profile by username
export const getUserProfile = async (req, res) => {
    try {
        const { username } = req.params;
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json({
            username: user.username,
            firstName: user.firstName,
            middleName: user.middleName,
            lastName: user.lastName,
            email: user.email,
            phone: user.phone,
            profileImage: user.profileImage,
            followersCount: user.followers.length,
            followingCount: user.following.length,
            postsCount: user.postsCount,
            followers: user.followers,
            following: user.following,
            tags: user.tags,
            bio: user.bio
        });
    } catch (error) {
        console.error('Error fetching user profile:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get current user profile
export const getCurrentUserProfile = async (req, res) => {
    try {
        const user = req.user; // User is attached to the request by the authenticateUserByToken middleware
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json({
            username: user.username,
            firstName: user.firstName,
            middleName: user.middleName,
            lastName: user.lastName,
            email: user.email,
            phone: user.phone,
            profileImage: user.profileImage,
            followersCount: user.followersCount, // Use length of followers array
            followingCount: user.followingCount, // Use length of following array
            postsCount: user.postsCount, // Use postsCount directly
            followers: user.followers,
            following: user.following,
            tags: user.tags,
            bio: user.bio
        });
    } catch (error) {
        console.error('Error fetching user profile:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Function to upload profile picture
export const uploadProfilePicture = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check if file is uploaded
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        // Save the Cloudinary URL to the user's profileImage field
        user.profileImage = req.file.path; 
        await user.save();

        res.status(200).json({ profileImage: user.profileImage });
    } catch (error) {
        console.error('Error uploading profile picture:', error);
        res.status(500).json({ message: 'Error uploading profile picture' });
    }
};

// Function to getAllUsers so that to display in the AllUsers page section
export const getAllUsers = async (req, res) => {
  try {
    // Fetch all users and select only the necessary fields
    const users = await User.find()
      .select('_id username profileImage followersCount followingCount'); // Modify fields as needed

    // Respond with the list of users
    res.status(200).json(users);
  } catch (error) {
    // Log and respond with an error message if something goes wrong
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Function to unfollow a user
export const unfollowUser = async (req, res) => {
    const { userId } = req.body;
    const { _id } = req.user;

    try {
        // Validate userId
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ message: 'Invalid user ID' });
        }

        // Find the user to unfollow
        const userToUnfollow = await User.findById(userId);
        if (!userToUnfollow) {
            return res.status(404).json({ message: 'User to unfollow not found' });
        }

        // Find the current user
        const currentUser = await User.findById(_id);
        if (!currentUser) {
            return res.status(404).json({ message: 'Current user not found' });
        }

        // Check if not following
        if (!currentUser.following.includes(userId)) {
            return res.status(400).json({ message: 'Not following this user' });
        }

        // Update both users
        currentUser.following = currentUser.following.filter(id => id.toString() !== userId);
        currentUser.followingCount -= 1;
        await currentUser.save();

        userToUnfollow.followers = userToUnfollow.followers.filter(id => id.toString() !== _id.toString());
        userToUnfollow.followersCount -= 1;
        await userToUnfollow.save();

        res.status(200).json({
            message: 'Unfollowed successfully',
            userId,
            followersCount: userToUnfollow.followersCount,
            followingCount: currentUser.followingCount,
        });
    } catch (error) {
        console.error('Error unfollowing user:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// Function to follow a user
export const followUser = async (req, res) => {
    const { userId } = req.body; // Make sure this matches the client-side request
    const { _id } = req.user;
  
    try {
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).json({ message: 'Invalid user ID' });
      }
  
      const userToFollow = await User.findById(userId);
      if (!userToFollow) {
        return res.status(404).json({ message: 'User to follow not found' });
      }
  
      const currentUser = await User.findById(_id);
      if (!currentUser) {
        return res.status(404).json({ message: 'Current user not found' });
      }
  
      if (currentUser.following.includes(userId)) {
        return res.status(400).json({ message: 'Already following this user' });
      }
  
      currentUser.following.push(userId);
      currentUser.followingCount += 1;
      await currentUser.save();
  
      userToFollow.followers.push(_id);
      userToFollow.followersCount += 1;
      await userToFollow.save();
  
      res.status(200).json({
        message: 'Followed successfully',
        userId,
        followersCount: userToFollow.followersCount,
        followingCount: currentUser.followingCount,
      });
    } catch (error) {
      console.error('Error following user:', error);
      res.status(500).json({ message: 'Server Error' });
    }
  };
  
// Update user profile (bio and tags)
export const updateUserProfile = async (req, res) => {
    const { bio, tags } = req.body; // Extract bio and tags from request body
  
    try {
      const user = await User.findById(req.user._id); // Assuming `req.user._id` is set by `authenticateUserByToken`
      
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
  
      // Update user profile
      user.bio = bio || user.bio; // Update bio if provided
      user.tags = tags || user.tags; // Update tags if provided
  
      await user.save(); // Save changes to the database
  
      res.status(200).json(user); // Respond with updated user
    } catch (error) {
      console.error('Error updating user profile:', error);
      res.status(500).json({ error: 'Error updating profile' });
    }
  };
  
// Search Users by Tag
export const searchUsersByTag = async (req, res) => {
    const { tag } = req.params; // Get the tag from path parameters

    console.log('Received tag:', tag);

    if (!tag) {
        return res.status(400).json({ message: 'Tag is required' });
    }

    try {
        // Find users with the specified tag as a single string
        const users = await User.find({
            tags: tag
        }).select('_id username profileImage followersCount followingCount bio');

        if (users.length === 0) {
            return res.status(404).json({ message: 'No users found with this tag' });
        }

        res.status(200).json(users);
    } catch (error) {
        console.error('Error searching users by tag:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};