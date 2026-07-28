const Review = require('../../models/Review');
const ReviewReport = require('../../models/ReviewReport');
const AdminActivityLog = require('../../models/AdminActivityLog');

const getFlagged = async (req, res, next) => {
  try {
    const reviews = await Review.find({ status: 'flagged' })
      .populate('appId', 'name')
      .sort({ reportCount: -1 });

    // For each review, let's also fetch the reasons (optional but helpful)
    const reviewsWithReasons = await Promise.all(
      reviews.map(async (review) => {
        const reports = await ReviewReport.find({ reviewId: review._id }).select('reason otherReason -_id');
        return {
          ...review.toObject(),
          reports: reports.map(r => r.reason === 'other' && r.otherReason ? `Other: ${r.otherReason}` : r.reason)
        };
      })
    );

    res.json(reviewsWithReasons);
  } catch (error) {
    next(error);
  }
};

const moderate = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { action } = req.body; // 'delete' or 'dismiss'

    const review = await Review.findById(id);
    if (!review) return res.status(404).json({ message: 'Review not found' });

    let actionDetails = '';
    
    if (action === 'delete') {
      review.status = 'removed';
      await review.save();
      
      // We should also recalculate rating stats for this app since the review is removed
      const reviewController = require('../reviewController');
      // Wait, recalculateRatingStats is not exported. Let's just recalculate it here manually.
      const stats = await Review.aggregate([
        { $match: { appId: review.appId, status: { $ne: 'removed' } } },
        { $group: { _id: null, average: { $avg: '$rating' }, count: { $sum: 1 } } },
      ]);
    
      const ratingStats = stats[0]
        ? { average: Math.round(stats[0].average * 10) / 10, count: stats[0].count }
        : { average: 0, count: 0 };
    
      await require('../../models/App').findByIdAndUpdate(review.appId, { ratingStats });
      actionDetails = 'Deleted flagged review';
    } else if (action === 'dismiss') {
      review.status = 'published';
      review.reportCount = 0;
      await review.save();
      
      // Optionally delete the reports so it starts fresh
      await ReviewReport.deleteMany({ reviewId: id });
      actionDetails = 'Dismissed flagged review';
    } else {
      return res.status(400).json({ message: 'Invalid action' });
    }

    await AdminActivityLog.create({
      adminId: req.admin._id,
      action: action === 'delete' ? 'delete_review' : 'dismiss_review_reports',
      details: actionDetails,
      targetId: review._id,
      targetModel: 'Review'
    });

    res.json({ success: true, review });
  } catch (error) {
    next(error);
  }
};

module.exports = { getFlagged, moderate };
