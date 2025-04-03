import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  preferences: {
    categories: { type: [String], default: [] },
    // topics: { type: [String], default: [] },
    sources: { type: [String], default: [] },
  },
  likedArticles: [{ type: String, ref: 'Article' }],
  likedVideos: [{ type: String, ref: 'Article' }],
  comments: [
    {
      articleId: { type: String, ref: 'Article' },
      text: { type: String, required: true },
    },
  ],
});

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

export default mongoose.model('User', userSchema);

// import mongoose from 'mongoose';
// import bcrypt from 'bcryptjs';

// const userSchema = new mongoose.Schema({
//   username: { type: String, required: true, unique: true },
//   email: { type: String, required: true, unique: true },
//   password: { type: String, required: true },
//   preferences: {
//     categories: { type: [String], default: [] },
//     topics: { type: [String], default: [] },
//     sources: { type: [String], default: [] },
//   },
//   likedArticles: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Article' }],
//   comments: [
//     {
//       articleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Article' },
//       text: { type: String, required: true },
//     },
//   ],
// });

// // Hash password before saving
// userSchema.pre('save', async function (next) {
//   if (this.isModified('password')) {
//     this.password = await bcrypt.hash(this.password, 10);
//   }
//   next();
// });

// export default mongoose.model('User', userSchema);