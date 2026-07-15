const Category = require('../../models/Category');
const slugify = require('../../utils/slugify');
const logActivity = require('../../utils/logActivity');

const create = async (req, res, next) => {
  try {
    const slug = req.body.slug || slugify(req.body.name);

    const category = await Category.create({ ...req.body, slug });

    await logActivity({
      adminId: req.user._id,
      action: 'category_created',
      targetType: 'category',
      targetId: category._id,
      changes: { name: category.name },
    });

    res.status(201).json(category);
  } catch (error) {
    next(error);
  }
};

const update = async (req, res, next) => {
  try {
    const category = await Category.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    await logActivity({
      adminId: req.user._id,
      action: 'category_updated',
      targetType: 'category',
      targetId: category._id,
      changes: req.body,
    });

    res.json(category);
  } catch (error) {
    next(error);
  }
};

const remove = async (req, res, next) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);

    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    await logActivity({
      adminId: req.user._id,
      action: 'category_deleted',
      targetType: 'category',
      targetId: req.params.id,
      changes: { name: category.name },
    });

    res.json({ message: 'Category deleted' });
  } catch (error) {
    next(error);
  }
};

const listAll = async (req, res, next) => {
  try {
    const categories = await Category.find().sort({ sortOrder: 1, name: 1 });
    res.json(categories);
  } catch (error) {
    next(error);
  }
};

module.exports = { create, update, remove, listAll };
