import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:url_launcher/url_launcher.dart';
import '../providers/app_provider.dart';
import '../providers/favorite_provider.dart';
import '../providers/auth_provider.dart';
import '../theme/app_theme.dart';
import '../widgets/star_rating.dart';

class AppDetailScreen extends StatefulWidget {
  final String appId;
  const AppDetailScreen({super.key, required this.appId});

  @override
  State<AppDetailScreen> createState() => _AppDetailScreenState();
}

class _AppDetailScreenState extends State<AppDetailScreen> {
  @override
  void initState() {
    super.initState();
    context.read<AppProvider>().loadAppDetail(widget.appId);
  }

  @override
  Widget build(BuildContext context) {
    final appProv = context.watch<AppProvider>();
    final app = appProv.selectedApp;
    final favProv = context.watch<FavoriteProvider>();
    final auth = context.watch<AuthProvider>();

    if (appProv.loading && app == null) {
      return Scaffold(appBar: AppBar(), body: const Center(child: CircularProgressIndicator()));
    }
    if (app == null) {
      return Scaffold(appBar: AppBar(), body: const Center(child: Text('App not found')));
    }

    return Scaffold(
      body: CustomScrollView(
        slivers: [
          SliverAppBar(
            expandedHeight: 220,
            pinned: true,
            flexibleSpace: FlexibleSpaceBar(
              background: Stack(
                fit: StackFit.expand,
                children: [
                  Image.network(app.iconUrl, fit: BoxFit.cover, errorBuilder: (_, __, ___) => Container(color: Colors.grey[200])),
                  Container(
                    decoration: BoxDecoration(
                      gradient: LinearGradient(
                        begin: Alignment.topCenter,
                        end: Alignment.bottomCenter,
                        colors: [Colors.transparent, Colors.black.withValues(alpha: 0.7)],
                      ),
                    ),
                  ),
                  Positioned(
                    bottom: 16, left: 16,
                    child: Row(
                      children: [
                        ClipRRect(
                          borderRadius: BorderRadius.circular(12),
                          child: Image.network(app.iconUrl, width: 56, height: 56, fit: BoxFit.cover),
                        ),
                        const SizedBox(width: 12),
                        Column(
                          mainAxisSize: MainAxisSize.min,
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(app.name, style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: Colors.white)),
                            if (app.developerName != null)
                              Text(app.developerName!, style: TextStyle(fontSize: 13, color: Colors.white.withValues(alpha: 0.8))),
                          ],
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
                        StarRating(rating: app.playStoreRating, count: app.ratingStats.count, size: 18),
                        const SizedBox(width: 8),
                      ],
                      const Spacer(),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                        decoration: BoxDecoration(
                          color: app.priceType == 'free' ? AppTheme.success.withValues(alpha: 0.1) : AppTheme.primary.withValues(alpha: 0.1),
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Text(
                          app.priceType.toUpperCase(),
                          style: TextStyle(
                            fontSize: 11, fontWeight: FontWeight.w600,
                            color: app.priceType == 'free' ? AppTheme.success : AppTheme.primary,
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  Text(app.shortDescription, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w600, color: AppTheme.text)),
                  const SizedBox(height: 8),
                  Text(app.longDescription, style: const TextStyle(fontSize: 14, color: AppTheme.textSecondary, height: 1.5)),
                  const SizedBox(height: 16),
                  if (app.categories.isNotEmpty) ...[
                    Wrap(
                      spacing: 6,
                      runSpacing: 4,
                      children: app.categories.map((cat) => Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                        decoration: BoxDecoration(color: AppTheme.primary.withValues(alpha: 0.1), borderRadius: BorderRadius.circular(8)),
                        child: Text(cat, style: const TextStyle(fontSize: 12, color: AppTheme.primary, fontWeight: FontWeight.w500)),
                      )).toList(),
                    ),
                    const SizedBox(height: 16),
                  ],
                  if (app.screenshots.isNotEmpty) ...[
                    const Text('Screenshots', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: AppTheme.text)),
                    const SizedBox(height: 8),
                    SizedBox(
                      height: 200,
                      child: ListView.separated(
                        scrollDirection: Axis.horizontal,
                        itemCount: app.screenshots.length,
                        separatorBuilder: (_, __) => const SizedBox(width: 8),
                        itemBuilder: (_, i) => ClipRRect(
                          borderRadius: BorderRadius.circular(12),
                          child: Image.network(app.screenshots[i].url, width: 120, fit: BoxFit.cover),
                        ),
                      ),
                    ),
                    const SizedBox(height: 16),
                  ],
                  if (app.features.isNotEmpty) _buildListSection('Features', app.features, Icons.check_circle, AppTheme.success),
                  if (app.pros.isNotEmpty) _buildListSection('Pros', app.pros, Icons.thumb_up, AppTheme.success),
                  if (app.cons.isNotEmpty) _buildListSection('Cons', app.cons, Icons.thumb_down, AppTheme.error),
                  const SizedBox(height: 8),
                  Row(
                    children: [
                      Expanded(
                        child: ElevatedButton.icon(
                          onPressed: () async {
                            final uri = Uri.parse(app.playStoreUrl);
                            if (await canLaunchUrl(uri)) await launchUrl(uri, mode: LaunchMode.externalApplication);
                          },
                          icon: const Icon(Icons.download, size: 18),
                          label: const Text('Download'),
                        ),
                      ),
                      if (auth.isLoggedIn) ...[
                        const SizedBox(width: 12),
                        IconButton.filled(
                          onPressed: () => favProv.toggle(app.id),
                          icon: Icon(
                            favProv.isFavorited(app.id) ? Icons.favorite : Icons.favorite_border,
                            color: favProv.isFavorited(app.id) ? Colors.white : AppTheme.primary,
                          ),
                          style: IconButton.styleFrom(
                            backgroundColor: favProv.isFavorited(app.id) ? AppTheme.error : AppTheme.primary.withValues(alpha: 0.1),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                          ),
                        ),
                      ],
                    ],
                  ),
                  const SizedBox(height: 24),
                  const Text('Rating & Reviews', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: AppTheme.text)),
                  const SizedBox(height: 12),
                  if (app.ratingStats.count > 0)
                    _buildRatingSummary(app)
                  else
                    const Text('No reviews yet', style: TextStyle(color: AppTheme.textSecondary)),
                  const SizedBox(height: 24),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildListSection(String title, List<String> items, IconData icon, Color color) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(title, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: AppTheme.text)),
          const SizedBox(height: 8),
          ...items.map((item) => Padding(
            padding: const EdgeInsets.only(bottom: 6),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Icon(icon, size: 16, color: color),
                const SizedBox(width: 8),
                Expanded(child: Text(item, style: const TextStyle(fontSize: 14, color: AppTheme.textSecondary))),
              ],
            ),
          )),
        ],
      ),
    );
  }

  Widget _buildRatingSummary(dynamic app) {
    return Row(
      children: [
        Column(
          children: [
            Text(app.ratingStats.average.toStringAsFixed(1), style: const TextStyle(fontSize: 36, fontWeight: FontWeight.bold, color: AppTheme.text)),
            StarRating(rating: app.ratingStats.average, count: app.ratingStats.count, size: 14),
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
                    Text('$star', style: const TextStyle(fontSize: 12, color: AppTheme.textSecondary)),
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
}
