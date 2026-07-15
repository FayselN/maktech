const App = require('../models/App');
const RecentlyViewed = require('../models/RecentlyViewed');
const Favorite = require('../models/Favorite');
const DailyFeatured = require('../models/DailyFeatured');

const list = async (req, res, next) => {
  try {
    const { category, search, trending, new: isNewApp, page = 1, limit = 20 } = req.query;

    const filter = { status: 'published' };

    if (category) {
      filter.categories = category;
    }

    if (search) {
      filter.$text = { $search: search };
    }

    if (isNewApp === 'true') {
      filter.isNewApp = true;
    }

    let sort = { createdAt: -1 };

    if (trending === 'true') {
      sort = { viewCount: -1, favoriteCount: -1 };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [apps, total] = await Promise.all([
      App.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit))
        .select('-longDescription'),
      App.countDocuments(filter),
    ]);

    res.json({
      apps,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
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

const getBySlug = async (req, res, next) => {
  try {
    const app = await App.findOne({ slug: req.params.slug, status: 'published' });
    if (!app) {
      return res.status(404).json({ message: 'App not found' });
    }
    res.json(app);
  } catch (error) {
    next(error);
  }
};

const incrementView = async (req, res, next) => {
  try {
    const app = await App.findByIdAndUpdate(
      req.params.id,
      { $inc: { viewCount: 1 } },
      { new: true }
    );
    if (!app) {
      return res.status(404).json({ message: 'App not found' });
    }

    if (req.user) {
      await RecentlyViewed.findOneAndUpdate(
        { userId: req.user._id, appId: app._id },
        { viewedAt: new Date() },
        { upsert: true }
      );

      const count = await RecentlyViewed.countDocuments({ userId: req.user._id });
      if (count > 20) {
        const oldest = await RecentlyViewed.find({ userId: req.user._id })
          .sort({ viewedAt: 1 })
          .limit(count - 20);
        const idsToDelete = oldest.map((r) => r._id);
        await RecentlyViewed.deleteMany({ _id: { $in: idsToDelete } });
      }
    }

    res.json({ viewCount: app.viewCount });
  } catch (error) {
    next(error);
  }
};

const getDailyFeatured = async (req, res, next) => {
  try {
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    const featured = await DailyFeatured.findOne({ featuredDate: today }).populate('appId');
    if (!featured || !featured.appId) {
      return res.status(404).json({ message: 'No featured app today' });
    }
    res.json(featured.appId);
  } catch (error) {
    next(error);
  }
};

const getTrending = async (req, res, next) => {
  try {
    const apps = await App.find({ status: 'published' })
      .sort({ viewCount: -1, favoriteCount: -1 })
      .limit(10)
      .select('-longDescription');
    res.json(apps);
  } catch (error) {
    next(error);
  }
};

const getNewApps = async (req, res, next) => {
  try {
    const apps = await App.find({ status: 'published', isNewApp: true })
      .sort({ createdAt: -1 })
      .limit(20)
      .select('-longDescription');
    res.json(apps);
  } catch (error) {
    next(error);
  }
};

module.exports = { list, getById, getBySlug, incrementView, getDailyFeatured, getTrending, getNewApps };
