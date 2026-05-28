import mongoose from 'mongoose';

const employeeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    role: { type: String, required: true, trim: true },
    tag: { type: String, default: 'Team', trim: true },
    quote: { type: String, default: '', trim: true },
    initials: { type: String, default: '' },
    grad: { type: String, default: 'from-indigo to-cyan' },
    img: { type: String, default: null },
  },
  { timestamps: true }
);

// Expose `id` (string) and hide `_id` / `__v` in API responses.
employeeSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (doc, ret) => {
    delete ret._id;
    return ret;
  },
});

export const Employee = mongoose.model('Employee', employeeSchema);
