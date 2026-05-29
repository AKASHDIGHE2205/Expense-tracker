import mongoose from 'mongoose';

const categorySchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  label: {
    type: String,
    required: true,
  },
  family: {
    type: String,
    required: true,
  },
  color: {
    type: String,
    required: true,
  },
  c_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  }
}, { timestamps: true });

const Category = mongoose.model('Category', categorySchema);
export default Category;