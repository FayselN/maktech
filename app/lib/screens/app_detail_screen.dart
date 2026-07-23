import 'package:flutter/material.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:provider/provider.dart';
import 'package:share_plus/share_plus.dart';
import 'package:url_launcher/url_launcher.dart';
import '../providers/app_provider.dart';
import '../providers/favorite_provider.dart';
import '../models/review_model.dart';
import '../services/api_service.dart';
import '../theme/app_theme.dart';
import '../widgets/star_rating.dart';

class AppDetailScreen extends StatefulWidget {
  final String appId;
  const AppDetailScreen({super.key, required this.appId});

  @override
  State<AppDetailScreen> createState() => _AppDetailScreenState();
}

class _AppDetailScreenState extends State<AppDetailScreen> {
  final _commentController = TextEditingController();
  final _formKey = GlobalKey<FormState>();
  List<ReviewModel> _reviews = [];
  int _rating = 5;
  bool _reviewsLoading = true;
  bool _submittingReview = false;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (!mounted) return;
      context.read<AppProvider>().loadAppDetail(widget.appId);
    });
    _loadReviews();
  }

  @override
  void dispose() {
    _commentController.dispose();
    super.dispose();
  }

  Future<void> _loadReviews() async {
    try {
      final response = await ApiService().get(
        '/apps/${widget.appId}/reviews',
        queryParams: {'limit': '50'},
      );
      final reviews = (response['reviews'] as List)
          .map((review) => ReviewModel.fromJson(review as Map<String, dynamic>))
          .toList();
      if (mounted) setState(() => _reviews = reviews);
    } catch (_) {
      // The app details remain usable if reviews cannot be loaded.
    } finally {
      if (mounted) setState(() => _reviewsLoading = false);
    }
  }

  Future<void> _submitReview() async {
    if (!_formKey.currentState!.validate()) return;
    final appProvider = context.read<AppProvider>();
    setState(() => _submittingReview = true);
    try {
      await ApiService().post(
        '/apps/${widget.appId}/reviews',
        body: {'rating': _rating, 'comment': _commentController.text.trim()},
      );
      _commentController.clear();
      await Future.wait([
        _loadReviews(),
        appProvider.loadAppDetail(widget.appId),
      ]);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: const Text('Thanks for your review!'),
            backgroundColor: AppTheme.card,
            behavior: SnackBarBehavior.floating,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(12),
              side: BorderSide(color: Colors.white.withValues(alpha: 0.1)),
            ),
          ),
        );
      }
    } on ApiException catch (error) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(error.message),
            backgroundColor: AppTheme.error.withValues(alpha: 0.9),
            behavior: SnackBarBehavior.floating,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(12),
            ),
          ),
        );
      }
    } catch (_) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: const Text('Could not submit your review.'),
            backgroundColor: AppTheme.error.withValues(alpha: 0.9),
            behavior: SnackBarBehavior.floating,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(12),
            ),
          ),
        );
      }
    } finally {
      if (mounted) setState(() => _submittingReview = false);
    }
  }

  Future<void> _shareApp(String url, String appName) async {
    await SharePlus.instance.share(
      ShareParams(
        text: 'Check out $appName on Mak Tech!\n$url',
        subject: 'Check out $appName on Mak Tech',
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final appProv = context.watch<AppProvider>();
    final app = appProv.selectedApp;
    final favProv = context.watch<FavoriteProvider>();

    // Show smooth loading spinner if loading or if the selectedApp belongs to a different app ID
    if (appProv.loading || app == null || app.id != widget.appId) {
      return Scaffold(
        appBar: AppBar(),
        body: const Center(
          child: CircularProgressIndicator(),
        ),
      );
    }

    return Scaffold(
      body: CustomScrollView(
        slivers: [
          SliverAppBar(
            expandedHeight: 260,
            pinned: true,
            flexibleSpace: FlexibleSpaceBar(
              background: Stack(
                fit: StackFit.expand,
                children: [
                  CachedNetworkImage(
                    imageUrl: app.screenshots.isNotEmpty
                        ? app.screenshots.first.url
                        : app.iconUrl,
                    fit: BoxFit.cover,
                    placeholder: (_, _) => Container(
                      decoration: const BoxDecoration(
                        gradient: LinearGradient(
                          begin: Alignment.topLeft,
                          end: Alignment.bottomRight,
                          colors: [AppTheme.primary, AppTheme.primaryDark],
                        ),
                      ),
                    ),
                    errorWidget: (_, _, _) => Container(
                      decoration: const BoxDecoration(
                        gradient: LinearGradient(
                          begin: Alignment.topLeft,
                          end: Alignment.bottomRight,
                          colors: [AppTheme.primary, AppTheme.primaryDark],
                        ),
                      ),
                      child: const Center(
                        child: Icon(Icons.explore, color: Colors.white, size: 64),
                      ),
                    ),
                  ),
                  Container(
                    decoration: BoxDecoration(
                      gradient: LinearGradient(
                        begin: Alignment.topCenter,
                        end: Alignment.bottomCenter,
                        colors: [
                          Colors.transparent,
                          Colors.black.withValues(alpha: 0.75),
                        ],
                      ),
                    ),
                  ),
                  Positioned(
                    bottom: 16,
                    left: 16,
                    right: 16,
                    child: Row(
                      children: [
                        ClipRRect(
                          borderRadius: BorderRadius.circular(14),
                          child: Container(
                            width: 56,
                            height: 56,
                            color: Colors.white.withValues(alpha: 0.2),
                            child: CachedNetworkImage(
                              imageUrl: app.iconUrl,
                              fit: BoxFit.cover,
                              errorWidget: (_, _, _) => const Icon(
                                Icons.explore,
                                color: Colors.white,
                                size: 28,
                              ),
                            ),
                          ),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                app.curiosityTitle,
                                style: const TextStyle(
                                  fontSize: 20,
                                  fontWeight: FontWeight.bold,
                                  color: Colors.white,
                                ),
                                maxLines: 2,
                                overflow: TextOverflow.ellipsis,
                              ),
                              const SizedBox(height: 2),
                              Text(
                                app.shortDescription,
                                style: TextStyle(
                                  fontSize: 12,
                                  color: Colors.white.withValues(alpha: 0.85),
                                ),
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [

                  Row(
                    children: [
                      if (app.playStoreRating > 0) ...[
                        StarRating(
                          rating: app.playStoreRating,
                          count: app.ratingStats.count,
                          size: 18,
                        ),
                        const SizedBox(width: 8),
                      ],
                      const Spacer(),
                      Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 10,
                          vertical: 4,
                        ),
                        decoration: BoxDecoration(
                          color: app.priceType == 'free'
                              ? AppTheme.success.withValues(alpha: 0.1)
                              : AppTheme.primary.withValues(alpha: 0.1),
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Text(
                          app.priceType.toUpperCase(),
                          style: TextStyle(
                            fontSize: 11,
                            fontWeight: FontWeight.w600,
                            color: app.priceType == 'free'
                                ? AppTheme.success
                                : AppTheme.primary,
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  Text(
                    app.shortDescription,
                    style: const TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.w600,
                      color: AppTheme.text,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    app.longDescription,
                    style: const TextStyle(
                      fontSize: 14,
                      color: AppTheme.textSecondary,
                      height: 1.5,
                    ),
                  ),
                  const SizedBox(height: 16),
                  if (app.categories.isNotEmpty) ...[
                    Wrap(
                      spacing: 6,
                      runSpacing: 4,
                      children: app.categories
                          .map(
                            (cat) => Container(
                              padding: const EdgeInsets.symmetric(
                                horizontal: 10,
                                vertical: 4,
                              ),
                              decoration: BoxDecoration(
                                color: AppTheme.primary.withValues(alpha: 0.1),
                                borderRadius: BorderRadius.circular(8),
                              ),
                              child: Text(
                                cat,
                                style: const TextStyle(
                                  fontSize: 12,
                                  color: AppTheme.primary,
                                  fontWeight: FontWeight.w500,
                                ),
                              ),
                            ),
                          )
                          .toList(),
                    ),
                    const SizedBox(height: 16),
                  ],
                  if (app.screenshots.isNotEmpty) ...[
                    const Text(
                      'Screenshots',
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                        color: AppTheme.text,
                      ),
                    ),
                    const SizedBox(height: 8),
                    SizedBox(
                      height: 200,
                      child: ListView.separated(
                        scrollDirection: Axis.horizontal,
                        itemCount: app.screenshots.length,
                        separatorBuilder: (_, _) => const SizedBox(width: 8),
                        itemBuilder: (_, i) => ClipRRect(
                          borderRadius: BorderRadius.circular(12),
                          child: Image.network(
                            app.screenshots[i].url,
                            width: 120,
                            fit: BoxFit.cover,
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(height: 16),
                  ],
                  if (app.features.isNotEmpty)
                    _buildListSection(
                      'Features',
                      app.features,
                      Icons.check_circle,
                      AppTheme.success,
                    ),
                  if (app.pros.isNotEmpty)
                    _buildListSection(
                      'Pros',
                      app.pros,
                      Icons.thumb_up,
                      AppTheme.success,
                    ),
                  if (app.cons.isNotEmpty)
                    _buildListSection(
                      'Cons',
                      app.cons,
                      Icons.thumb_down,
                      AppTheme.error,
                    ),
                  const SizedBox(height: 8),
                  Row(
                    children: [
                      Expanded(
                        child: ElevatedButton.icon(
                          onPressed: () async {
                            final uri = Uri.parse(app.playStoreUrl);
                            if (await canLaunchUrl(uri)) {
                              await launchUrl(
                                uri,
                                mode: LaunchMode.externalApplication,
                              );
                            }
                          },
                          icon: const Icon(Icons.download, size: 18),
                          label: const Text('Download'),
                        ),
                      ),
                      const SizedBox(width: 12),
                      IconButton.filled(
                        onPressed: () => favProv.toggle(app.id),
                        icon: Icon(
                          favProv.isFavorited(app.id)
                              ? Icons.favorite
                              : Icons.favorite_border,
                          color: favProv.isFavorited(app.id)
                              ? Colors.white
                              : AppTheme.primary,
                        ),
                        style: IconButton.styleFrom(
                          backgroundColor: favProv.isFavorited(app.id)
                              ? AppTheme.error
                              : AppTheme.primary.withValues(alpha: 0.1),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(12),
                          ),
                        ),
                      ),
                      const SizedBox(width: 8),
                      IconButton.filled(
                        tooltip: 'Share app',
                        onPressed: () => _shareApp(app.playStoreUrl, app.name),
                        icon: const Icon(Icons.share_outlined),
                        style: IconButton.styleFrom(
                          backgroundColor: AppTheme.primary.withValues(
                            alpha: 0.1,
                          ),
                          foregroundColor: AppTheme.primary,
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(12),
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 24),
                  const Text(
                    'Rating & Reviews',
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                      color: AppTheme.text,
                    ),
                  ),
                  const SizedBox(height: 12),
                  if (app.ratingStats.count > 0)
                    _buildRatingSummary(app)
                  else
                    const Text(
                      'No reviews yet',
                      style: TextStyle(color: AppTheme.textSecondary),
                    ),
                  const SizedBox(height: 20),
                  _buildReviews(),
                  const SizedBox(height: 20),
                  _buildReviewForm(),
                  const SizedBox(height: 24),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildListSection(
    String title,
    List<String> items,
    IconData icon,
    Color color,
  ) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            title,
            style: const TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.bold,
              color: AppTheme.text,
            ),
          ),
          const SizedBox(height: 8),
          ...items.map(
            (item) => Padding(
              padding: const EdgeInsets.only(bottom: 6),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Icon(icon, size: 16, color: color),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      item,
                      style: const TextStyle(
                        fontSize: 14,
                        color: AppTheme.textSecondary,
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildRatingSummary(dynamic app) {
    return Row(
      children: [
        Column(
          children: [
            Text(
              app.ratingStats.average.toStringAsFixed(1),
              style: const TextStyle(
                fontSize: 36,
                fontWeight: FontWeight.bold,
                color: AppTheme.text,
              ),
            ),
            StarRating(
              rating: app.ratingStats.average,
              count: app.ratingStats.count,
              size: 14,
            ),
          ],
        ),
        const SizedBox(width: 16),
        Expanded(
          child: Column(
            children: [5, 4, 3, 2, 1].map((star) {
              return Padding(
                padding: const EdgeInsets.symmetric(vertical: 2),
                child: Row(
                  children: [
                    Text(
                      '$star',
                      style: const TextStyle(
                        fontSize: 12,
                        color: AppTheme.textSecondary,
                      ),
                    ),
                    const SizedBox(width: 4),
                    Expanded(
                      child: ClipRRect(
                        borderRadius: BorderRadius.circular(4),
                        child: LinearProgressIndicator(
                          value: 0.5,
                          backgroundColor: AppTheme.border,
                          color: AppTheme.accent,
                        ),
                      ),
                    ),
                  ],
                ),
              );
            }).toList(),
          ),
        ),
      ],
    );
  }

  Widget _buildReviews() {
    if (_reviewsLoading) {
      return const Center(
        child: Padding(
          padding: EdgeInsets.all(12),
          child: CircularProgressIndicator(),
        ),
      );
    }
    if (_reviews.isEmpty) {
      return const Text(
        'Be the first to share your experience.',
        style: TextStyle(color: AppTheme.textSecondary),
      );
    }
    return Column(
      children: _reviews
          .map(
            (review) => Container(
              width: double.infinity,
              margin: const EdgeInsets.only(bottom: 10),
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                border: Border.all(color: AppTheme.border),
                borderRadius: BorderRadius.circular(12),
                color: AppTheme.border,
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      CircleAvatar(
                        radius: 15,
                        backgroundColor: AppTheme.primary.withValues(alpha: .1),
                        child: Text(
                          (review.userName ?? 'U')[0].toUpperCase(),
                          style: const TextStyle(color: AppTheme.primary),
                        ),
                      ),
                      const SizedBox(width: 10),
                      Expanded(
                        child: Text(
                          review.userName ?? 'Mak Tech user',
                          style: const TextStyle(fontWeight: FontWeight.w600),
                        ),
                      ),
                      StarRating(
                        rating: review.rating.toDouble(),
                        count: 0,
                        size: 14,
                      ),
                    ],
                  ),
                  if (review.comment.isNotEmpty) ...[
                    const SizedBox(height: 10),
                    Text(
                      review.comment,
                      style: const TextStyle(
                        color: AppTheme.textSecondary,
                        height: 1.4,
                      ),
                    ),
                  ],
                ],
              ),
            ),
          )
          .toList(),
    );
  }

  Widget _buildReviewForm() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppTheme.border,
        border: Border.all(color: AppTheme.border),
        borderRadius: BorderRadius.circular(14),
      ),
      child: Form(
        key: _formKey,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Write an honest review',
              style: TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.bold,
                color: AppTheme.text,
              ),
            ),
            const SizedBox(height: 10),
            Row(
              children: List.generate(
                5,
                (index) => IconButton(
                  tooltip: '${index + 1} stars',
                  padding: EdgeInsets.zero,
                  constraints: const BoxConstraints(minWidth: 36),
                  onPressed: () => setState(() => _rating = index + 1),
                  icon: Icon(
                    index < _rating ? Icons.star : Icons.star_border,
                    color: AppTheme.accent,
                  ),
                ),
              ),
            ),
            TextFormField(
              controller: _commentController,
              minLines: 3,
              maxLines: 5,
              maxLength: 1000,
              validator: (value) => value == null || value.trim().length < 5
                  ? 'Write at least 5 characters.'
                  : null,
              decoration: const InputDecoration(
                hintText: 'Tell other users about your experience.',
              ),
            ),
            const SizedBox(height: 8),
            Align(
              alignment: Alignment.centerRight,
              child: ElevatedButton.icon(
                onPressed: _submittingReview ? null : _submitReview,
                icon: _submittingReview
                    ? const SizedBox.square(
                        dimension: 16,
                        child: CircularProgressIndicator(
                          strokeWidth: 2,
                          color: Colors.white,
                        ),
                      )
                    : const Icon(Icons.send_outlined),
                label: const Text('Submit review'),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
