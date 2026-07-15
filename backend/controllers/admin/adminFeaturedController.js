const DailyFeatured = require('../../models/DailyFeatured');
const App = require('../../models/App');
const logActivity = require('../../utils/logActivity');

const setFeatured = async (req, res, next) => {
  try {
    const { appId, date } = req.body;

    const app = await App.findById(appId);
    if (!app) {
      return res.status(404).json({ message: 'App not found' });
    }

    const featuredDate = date
      ? new Date(date)
      : new Date();
    featuredDate.setUTCHours(0, 0, 0, 0);

    const featured = await DailyFeatured.findOneAndUpdate(
      { featuredDate },
      { appId, featuredDate, createdBy: req.user._id },
      { upsert: true, new: true }
    );

    await logActivity({
      adminId: req.user._id,
      action: 'featured_set',
      targetType: 'app',
      targetId: appId,
      changes: { featuredDate: featuredDate.toISOString(), appName: app.name },
    });

    res.json(featured);
  } catch (error) {
    next(error);
  }
};

const getFeatured = async (req, res, next) => {
  try {
    const queryDate = req.params.date ? new Date(req.params.date) : new Date();
    queryDate.setUTCHours(0, 0, 0, 0);

    const featured = await DailyFeatured.findOne({ featuredDate: queryDate }).populate('appId');
    if (!featured) {
      return res.status(404).json({ message: 'No featured app for this date' });
    }
    res.json(featured);
  } catch (error) {
    next(error);
  }
};

const listAll = async (req, res, next) => {
  try {
    const { limit = 30 } = req.query;
    const featured = await DailyFeatured.find()
      .populate('appId', 'name slug iconUrl')
      .sort({ featuredDate: -1 })
      .limit(parseInt(limit));
    res.json(featured);
  } catch (error) {
    next(error);
  }
};

module.exports = { setFeatured, getFeatured, listAll };
