const Favorite = require('../models/Favorite');
const App = require('../models/App');

const list = async (req, res, next) => {
  try {
    const favorites = await Favorite.find({ userId: req.user._id })
      .populate('appId')
      .sort({ createdAt: -1 });

    const apps = favorites
      .filter((f) => f.appId)
      .map((f) => f.appId);

    res.json(apps);
  } catch (error) {
    next(error);
  }
};

const add = async (req, res, next) => {
  try {
    const app = await App.findById(req.params.appId);
    if (!app) {
      return res.status(404).json({ message: 'App not found' });
    }

    const existing = await Favorite.findOne({ userId: req.user._id, appId: req.params.appId });
    if (existing) {
      return res.status(409).json({ message: 'Already favorited' });
    }

    await Favorite.create({ userId: req.user._id, appId: req.params.appId });
    await App.findByIdAndUpdate(req.params.appId, { $inc: { favoriteCount: 1 } });

    res.status(201).json({ message: 'Added to favorites' });
  } catch (error) {
    next(error);
  }
};

const remove = async (req, res, next) => {
  try {
    const result = await Favorite.findOneAndDelete({
      userId: req.user._id,
      appId: req.params.appId,
    });

    if (!result) {
      return res.status(404).json({ message: 'Favorite not found' });
    }

    await App.findByIdAndUpdate(req.params.appId, { $inc: { favoriteCount: -1 } });

    res.json({ message: 'Removed from favorites' });
  } catch (error) {
    next(error);
  }
};

const check = async (req, res, next) => {
  try {
    const favorite = await Favorite.findOne({
      userId: req.user._id,
      appId: req.params.appId,
    });
    res.json({ isFavorited: !!favorite });
  } catch (error) {
    next(error);
  }
};

module.exports = { list, add, remove, check };
