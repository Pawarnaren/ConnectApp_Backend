import mongoose from 'mongoose';

const postSchema = mongoose.Schema({
    name: { type: String, required: true },
    address: { type: String, required: true },
    phone: { type: String, required: true },
    imgUrl: { type: String, required: true },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    archived: { type: Boolean, default: false }
});

const Post = mongoose.model('Post', postSchema);
export default Post;
