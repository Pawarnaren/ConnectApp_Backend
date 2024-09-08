import mongoose from 'mongoose';
import Post from '../models/postModel.js';
import User from '../models/userModel.js';

// getting post by owner email
export const getPostsByOwnerEmail = async (req, res) => {
    try {
        const email = req.params.email;
        console.log('Requested Email:', email);
        if (!email) {
            return res.status(400).json({ message: 'Email parameter not provided' });
        }
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        // Validate ObjectId
        if (!mongoose.Types.ObjectId.isValid(user._id)) {
            return res.status(404).json({ message: 'Invalid user ID' });
        }
        // Fetch only non-archived posts
        const posts = await Post.find({ owner: user._id, archived: false });
        res.status(200).json(posts);
    } catch (error) {
        console.error('Error fetching posts by owner email:', error.message);
        res.status(500).json({ message: 'Error fetching posts', error: error.message });
    }
};

// create post api
export const createPost = async (req, res) => {
    try {
        // Create the new post
        const newPost = new Post({
            ...req.body,
            owner: req.user._id, 
        });
        await newPost.save();
        // Find the user and increment the posts count
        const user = await User.findById(req.user._id);
        if (user) {
            user.postsCount += 1; // Increment post count
            await user.save(); // Save the updated user
        } else {
            console.error('User not found');
        }
        res.status(201).json(newPost);
    } catch (error) {
        console.error('Error creating post:', error);
        res.status(500).json({ message: 'Error creating post' });
    }
};

// getting post by a id
export const getPostById = async (req, res) => {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        console.error('Invalid post ID:', id);  // Log invalid ID
        return res.status(400).json({ message: 'Invalid post ID' });
    }
    try {
        const post = await Post.findById(id);
        if (!post) {
            console.error('Post not found:', id);  // Log not found
            return res.status(404).json({ message: 'Post not found' });
        }
        res.status(200).json(post);
    } catch (error) {
        console.error('Error fetching post:', error.message);  // Log the error message
        res.status(500).json({ message: 'Error fetching post', error: error.message });
    }
};

// post update api
export const updatePost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }
        if (post.owner.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized' });
        }
        Object.assign(post, req.body);
        await post.save();

        res.status(200).json(post);
    } catch (error) {
        console.error('Error updating post:', error);
        res.status(500).json({ message: 'Error updating post' });
    }
};

// delete post api 
export const deletePost = async (req, res) => {
    try {
        // Find the post to be deleted
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        // Check if the logged-in user is the owner of the post
        if (post.owner.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        // Delete the post
        await Post.deleteOne({ _id: req.params.id });
        // Find the user and decrement the posts count
        const user = await User.findById(req.user._id);
        if (user) {
            user.postsCount = Math.max(0, user.postsCount - 1); // Decrement post count but ensure it doesn't go negative
            await user.save(); // Save the updated user
        } else {
            console.error('User not found');
        }

        res.status(200).json({ message: 'Post deleted' });
    } catch (error) {
        console.error('Error deleting post:', error.message);
        res.status(500).json({ message: 'Error deleting post', error: error.message });
    }
};

// archive post api
export const archivePost = async (req, res) => {
    try {
        const postId = req.params.id;
        // Expecting { archived: true/false }
        const { archived } = req.body; 
        if (typeof archived !== 'boolean') {
            return res.status(400).json({ message: 'Invalid archived status' });
        }
        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }
        post.archived = archived; // Set the archived status based on the request body
        await post.save();
        res.status(200).json({ message: 'Post updated successfully', post });
    } catch (error) {
        console.error('Error updating post archive status:', error.message);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Fetching archived posts
export const getArchivedPostsByOwnerEmail = async (req, res) => {
    try {
      const { email } = req.params;
      // Find posts where archived is true
      const posts = await Post.find({ 
        owner: req.user.id, // Ensure you're checking the user's posts
        archived: true 
      }).populate('owner');
      res.status(200).json(posts);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
};