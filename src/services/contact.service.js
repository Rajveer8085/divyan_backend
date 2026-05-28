import { Contact } from '../models/Contact.js';

export const saveContact = (data) => Contact.create(data);
export const listContacts = () => Contact.find().sort({ createdAt: -1 });
export const removeContact = (id) => Contact.findByIdAndDelete(id);
export const markContactRead = (id, read = true) =>
  Contact.findByIdAndUpdate(id, { read }, { new: true });
