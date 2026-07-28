const Review = require('../models/Review');
const ReviewReport = require('../models/ReviewReport');
const App = require('../models/App');

const recalculateRatingStats = async (appId) => {
  const stats = await Review.aggregate([
    { $match: { appId: require('mongoose').Types.ObjectId.createFromHexString(appId.toString()), status: { $ne: 'removed' } } },
    { $group: { _id: null, average: { $avg: '$rating' }, count: { $sum: 1 } } },
  ]);

  const ratingStats = stats[0]
    ? { average: Math.round(stats[0].average * 10) / 10, count: stats[0].count }
    : { average: 0, count: 0 };

  await App.findByIdAndUpdate(appId, { ratingStats });
};

const listByApp = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [reviews, total] = await Promise.all([
      Review.find({ appId: req.params.appId, status: { $ne: 'removed' } })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Review.countDocuments({ appId: req.params.appId, status: { $ne: 'removed' } }),
    ]);

    res.json({
      reviews,
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

const create = async (req, res, next) => {
  try {
    const { rating, comment } = req.body;

    const app = await App.findById(req.params.appId);
    if (!app) {
      return res.status(404).json({ message: 'App not found' });
    }

    const existing = await Review.findOne({ appId: req.params.appId, deviceId: req.deviceId });
    if (existing) {
      return res.status(409).json({ message: 'You have already reviewed this app' });
    }

    const review = await Review.create({
      appId: req.params.appId,
      deviceId: req.deviceId,
      rating,
      comment,
    });

    await recalculateRatingStats(req.params.appId);

    res.status(201).json(review);
  } catch (error) {
    next(error);
  }
};

const update = async (req, res, next) => {
  try {
    const { rating, comment } = req.body;

    const review = await Review.findOneAndUpdate(
      { _id: req.params.reviewId, deviceId: req.deviceId },
      { rating, comment },
      { new: true, runValidators: true }
    );

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    await recalculateRatingStats(review.appId);

    res.json(review);
  } catch (error) {
    next(error);
  }
};

const remove = async (req, res, next) => {
  try {
    const review = await Review.findOneAndDelete({
      _id: req.params.reviewId,
      deviceId: req.deviceId,
    });

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    await recalculateRatingStats(review.appId);

    res.json({ message: 'Review deleted' });
  } catch (error) {
    next(error);
  }
};

const reportReview = async (req, res, next) => {
  try {
    const { reviewId } = req.params;
    const { reason } = req.body;

    await ReviewReport.create({ reviewId, deviceId: req.deviceId, reason });

    const review = await Review.findByIdAndUpdate(
      reviewId,
      { $inc: { reportCount: 1 } },
      { new: true }
    );

    if (review.reportCount >= 3 && review.status === 'published') {
      review.status = 'flagged';
      await review.save();
    }

    res.json({ success: true });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ error: 'You already reported this review' });
    }
    next(err);
  }
};

module.exports = { listByApp, create, update, remove, reportReview };
