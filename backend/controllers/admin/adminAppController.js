const App = require('../../models/App');
const slugify = require('../../utils/slugify');
const logActivity = require('../../utils/logActivity');

const create = async (req, res, next) => {
  try {
    let slug = req.body.slug || slugify(req.body.name);

    const existingSlug = await App.findOne({ slug });
    if (existingSlug) {
      slug = `${slug}-${Date.now()}`;
    }

    const app = await App.create({
      ...req.body,
      slug,
      createdBy: req.user._id,
    });

    await logActivity({
      adminId: req.user._id,
      action: 'app_created',
      targetType: 'app',
      targetId: app._id,
      changes: { name: app.name, packageName: app.packageName },
    });

    res.status(201).json(app);
  } catch (error) {
    next(error);
  }
};

const update = async (req, res, next) => {
  try {
    const app = await App.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedBy: req.user._id },
      { new: true, runValidators: true }
    );

    if (!app) {
      return res.status(404).json({ message: 'App not found' });
    }

    await logActivity({
      adminId: req.user._id,
      action: req.body.status === 'published' ? 'app_published' : 'app_updated',
      targetType: 'app',
      targetId: app._id,
      changes: req.body,
    });

    res.json(app);
  } catch (error) {
    next(error);
  }
};

const remove = async (req, res, next) => {
  try {
    const app = await App.findByIdAndDelete(req.params.id);

    if (!app) {
      return res.status(404).json({ message: 'App not found' });
    }

    await logActivity({
      adminId: req.user._id,
      action: 'app_deleted',
      targetType: 'app',
      targetId: req.params.id,
      changes: { name: app.name },
    });

    res.json({ message: 'App deleted' });
  } catch (error) {
    next(error);
  }
};

const listAll = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (status) filter.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [apps, total] = await Promise.all([
      App.find(filter).sort({ updatedAt: -1 }).skip(skip).limit(parseInt(limit)),
      App.countDocuments(filter),
    ]);

    res.json({
      apps,
      pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / parseInt(limit)) },
    });
  } catch (error) {
    next(error);
  }
};

const addScreenshots = async (req, res, next) => {
  try {
    const app = await App.findById(req.params.id);
    if (!app) {
      return res.status(404).json({ message: 'App not found' });
    }

    const files = req.files || [];
    const newScreenshots = files.map((file, idx) => ({
      url: file.path,
      order: app.screenshots.length + idx,
    }));

    app.screenshots.push(...newScreenshots);
    app.updatedBy = req.user._id;
    await app.save();

    res.json(app.screenshots);
  } catch (error) {
    next(error);
  }
};

const deleteScreenshot = async (req, res, next) => {
  try {
    const app = await App.findById(req.params.id);
    if (!app) {
      return res.status(404).json({ message: 'App not found' });
    }

    const screenshot = app.screenshots.id(req.params.screenshotId);
    if (!screenshot) {
      return res.status(404).json({ message: 'Screenshot not found' });
    }

    screenshot.deleteOne();
    app.updatedBy = req.user._id;
    await app.save();

    res.json({ message: 'Screenshot deleted' });
  } catch (error) {
    next(error);
  }
};

const getById = async (req, res, next) => {
  try {
    const app = await App.findById(req.params.id);
    if (!app) {
      return res.status(404).json({ message: 'App not found' });
    }
    res.json(app);
  } catch (error) {
    next(error);
  }
};

module.exports = { create, update, remove, listAll, addScreenshots, deleteScreenshot, getById };
