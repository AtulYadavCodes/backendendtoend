import mongoose from 'mongoose';

const relationSchema = new mongoose.Schema(
  {
    Image: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    group: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Group',
    },
  },
  {
    timestamps: true,
  }
);
const Relation = mongoose.model('Relation', relationSchema);

export default Relation;