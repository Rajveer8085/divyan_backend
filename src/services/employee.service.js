import { Employee } from '../models/Employee.js';
import { logger } from '../utils/logger.js';

// Default roster — inserted only if the collection is empty.
const SEED = [
  { name: 'Anil Kushwah', role: 'Founder & CEO',                  tag: 'Leadership',  initials: 'AK', grad: 'from-indigo to-cyan',   img: null, quote: "We don't sell deliverables — we own outcomes. That's the whole company in one line." },
  { name: 'Riya Sharma',  role: 'Chief Technology Officer',       tag: 'Engineering', initials: 'RS', grad: 'from-violet to-indigo', img: null, quote: 'Good architecture is invisible until the day it quietly saves you from disaster.' },
  { name: 'Vikram Singh', role: 'Head of Marketplace Operations', tag: 'Operations',  initials: 'VS', grad: 'from-cyan to-emerald',  img: null, quote: 'Every product listing is a system. We engineer it like one, then optimize relentlessly.' },
  { name: 'Neha Verma',   role: 'Director of Digital Marketing',  tag: 'Marketing',   initials: 'NV', grad: 'from-indigo to-violet', img: null, quote: 'Data tells us where to aim; creativity is what makes the message actually land.' },
];

export const getAllEmployees = () => Employee.find().sort({ createdAt: 1 });
export const getEmployee = (id) => Employee.findById(id);
export const createEmployee = (data) => Employee.create(data);
export const updateEmployee = (id, patch) =>
  Employee.findByIdAndUpdate(id, patch, { new: true, runValidators: true });
export const deleteEmployee = (id) => Employee.findByIdAndDelete(id);

export const seedIfEmpty = async () => {
  try {
    const count = await Employee.estimatedDocumentCount();
    if (count === 0) {
      await Employee.insertMany(SEED);
      logger.info(`Seeded ${SEED.length} default employees.`);
    }
  } catch (err) {
    logger.warn('Employee seed skipped:', err.message);
  }
};
