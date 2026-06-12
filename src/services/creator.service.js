import { Creator } from '../models/Creator.js';

// `withHash` is used only by the login flow, which needs the password hash to verify.
export const findCreatorByEmail = (email, withHash = false) => {
  const query = Creator.findOne({ email });
  return withHash ? query.select('+passwordHash') : query;
};

export const createCreator = (data) => Creator.create(data);
export const getCreatorById = (id) => Creator.findById(id);
export const listCreators = (filter = {}) => Creator.find(filter).sort({ createdAt: -1 });
export const deleteCreator = (id) => Creator.findByIdAndDelete(id);

// Dot-path $set update (merges nested fields instead of replacing whole objects).
export const updateCreatorById = (id, set) =>
  Creator.findByIdAndUpdate(id, { $set: set }, { new: true, runValidators: true });
