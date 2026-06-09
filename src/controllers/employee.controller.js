import { asyncHandler } from '../utils/asyncHandler.js';
import * as repo from '../services/employee.service.js';
import { removeUploadedFile } from '../middleware/upload.js';

const GRADS = [
  'from-indigo to-cyan',
  'from-violet to-indigo',
  'from-cyan to-emerald',
  'from-indigo to-violet',
  'from-emerald to-cyan',
  'from-violet to-cyan',
];

const initialsFrom = (name = '') =>
  name.trim().split(/\s+/).slice(0, 2).map((w) => w[0]?.toUpperCase() || '').join('') || '?';

const pickGrad = () => GRADS[Math.floor(Math.random() * GRADS.length)];

export const listEmployees = asyncHandler(async (req, res) => {
  res.json({ success: true, data: await repo.getAllEmployees() });
});

export const createEmployee = asyncHandler(async (req, res) => {
  const { name, role, tag, quote, grad } = req.body;

  const employee = await repo.createEmployee({
    name: name.trim(),
    role: role.trim(),
    tag: (tag || 'Team').trim(),
    quote: (quote || '').trim(),
    initials: initialsFrom(name),
    grad: grad || pickGrad(),
    img: req.file ? `/uploads/${req.file.filename}` : null,
  });

  res.status(201).json({ success: true, data: employee });
});

export const updateEmployee = asyncHandler(async (req, res) => {
  const patch = {};
  ['name', 'role', 'tag', 'quote', 'grad'].forEach((k) => {
    if (req.body[k] !== undefined) patch[k] = req.body[k];
  });
  if (patch.name) patch.initials = initialsFrom(patch.name);

  // When a new photo replaces an old one, capture the old path so we can delete it.
  let oldImg = null;
  if (req.file) {
    patch.img = `/uploads/${req.file.filename}`;
    const existing = await repo.getEmployee(req.params.id);
    oldImg = existing?.img || null;
  }

  const employee = await repo.updateEmployee(req.params.id, patch);
  if (!employee) {
    // errorHandler cleans up the just-uploaded file for us.
    const err = new Error('Employee not found');
    err.statusCode = 404;
    throw err;
  }

  if (oldImg && oldImg !== employee.img) removeUploadedFile(oldImg);
  res.json({ success: true, data: employee });
});

export const deleteEmployee = asyncHandler(async (req, res) => {
  const removed = await repo.deleteEmployee(req.params.id);
  if (!removed) {
    const err = new Error('Employee not found');
    err.statusCode = 404;
    throw err;
  }
  removeUploadedFile(removed.img);
  res.json({ success: true, message: 'Employee removed' });
});
