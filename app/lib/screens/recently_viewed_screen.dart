import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/app_provider.dart';
import '../providers/favorite_provider.dart';
import '../providers/auth_provider.dart';
import '../theme/app_theme.dart';
import 'app_detail_screen.dart';
import '../widgets/app_card.dart';

class RecentlyViewedScreen extends StatefulWidget {
  const RecentlyViewedScreen({super.key});

  @override
  State<RecentlyViewedScreen> createState() => _RecentlyViewedScreenState();
}

class _RecentlyViewedScreenState extends State<RecentlyViewedScreen> {
  @override
  void initState() {
    super.initState();
    context.read<AppProvider>().loadRecentlyViewed();
  }

  @override
  Widget build(BuildContext context) {
    final appProv = context.watch<AppProvider>();
    final favProv = context.watch<FavoriteProvider>();

    return Scaffold(
      appBar: AppBar(title: const Text('Recently Viewed')),
      body: appProv.loading
        ? const Center(child: CircularProgressIndicator())
        : appProv.recentlyViewed.isEmpty
          ? const Center(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(Icons.history, size: 48, color: AppTheme.textSecondary),
                  SizedBox(height: 12),
                  Text('No recently viewed apps', style: TextStyle(fontSize: 16, color: AppTheme.textSecondary)),
                ],
              ),
            )
          : ListView(
              padding: const EdgeInsets.all(16),
              children: appProv.recentlyViewed.map((app) => Padding(
                padding: const EdgeInsets.only(bottom: 8),
                child: AppCard(
                  app: app,
                  onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => AppDetailScreen(appId: app.id))),
                  onFavorite: context.read<AuthProvider>().isLoggedIn ? () => favProv.toggle(app.id) : null,
                  isFavorited: favProv.isFavorited(app.id),
                ),
              )).toList(),
            ),
    );
  }
}
