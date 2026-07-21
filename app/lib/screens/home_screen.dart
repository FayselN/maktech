import 'package:flutter/material.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:provider/provider.dart';
import '../providers/app_provider.dart';
import '../providers/favorite_provider.dart';
import '../services/api_service.dart';
import '../services/cache_service.dart';
import '../models/category_model.dart';
import '../models/app_model.dart';
import '../theme/app_theme.dart';
import 'search_screen.dart';
import 'app_detail_screen.dart';
import 'category_apps_screen.dart';
import 'favorites_screen.dart';
import 'recently_viewed_screen.dart';
import 'notifications_screen.dart';
import '../widgets/app_card.dart';
import '../widgets/category_chip.dart';

class HomeScreen extends StatefulWidget {
  final bool isTab;
  const HomeScreen({super.key, this.isTab = false});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  List<CategoryModel> _categories = [];

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (!mounted) return;
      context.read<AppProvider>().loadHomeData();
      context.read<AppProvider>().loadRecentlyViewed();
      _loadCategories();
      context.read<FavoriteProvider>().loadFavorites();
    });
  }

  Future<void> _loadCategories({bool forceRefresh = false}) async {
    try {
      final data = await CacheService().fetchWithCache<List<CategoryModel>>(
        cacheKey: 'categories_data',
        fetchFunction: () => ApiService().get('/categories'),
        fromJson: (json) => (json as List).map((c) => CategoryModel.fromJson(c)).toList(),
        forceRefresh: forceRefresh,
      );
      if (mounted) {
        setState(() => _categories = data);
      }
    } catch (_) {}
  }

  Widget _buildErrorState(ApiException error, VoidCallback onRetry) {
    String message = 'Something went wrong';
    IconData icon = Icons.error_outline;

    switch (error.type) {
      case ApiErrorType.noInternet:
        message = 'No internet connection';
        icon = Icons.wifi_off;
        break;
      case ApiErrorType.timeout:
        message = 'Taking longer than usual — please try again';
        icon = Icons.hourglass_empty;
        break;
      case ApiErrorType.serverUnreachable:
        message = 'Server is temporarily unavailable';
        icon = Icons.cloud_off;
        break;
      default:
        message = error.message.isNotEmpty ? error.message : 'Something went wrong';
    }

    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(icon, size: 64, color: context.appTextSecondary),
          const SizedBox(height: 16),
          Text(message, style: TextStyle(fontSize: 16, color: context.appText)),
          const SizedBox(height: 24),
          ElevatedButton(
            onPressed: onRetry,
            style: ElevatedButton.styleFrom(
              backgroundColor: AppTheme.primary,
              foregroundColor: Colors.white,
              padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
            ),
            child: const Text('Retry'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final appProv = context.watch<AppProvider>();
    final favProv = context.watch<FavoriteProvider>();

    return Scaffold(
      appBar: AppBar(
        title: const Text('Mak Tech'),
        actions: [
          IconButton(
            icon: const Icon(Icons.search),
            onPressed: () => Navigator.push(
              context,
              MaterialPageRoute(builder: (_) => const SearchScreen()),
            ),
          ),
          IconButton(
            icon: const Icon(Icons.notifications_outlined),
            onPressed: () => Navigator.push(
              context,
              MaterialPageRoute(builder: (_) => const NotificationsScreen()),
            ),
          ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: () async {
          await context.read<AppProvider>().loadHomeData(forceRefresh: true);
          await _loadCategories(forceRefresh: true);
        },
        child: appProv.loading && appProv.trending.isEmpty 
            ? const Center(child: CircularProgressIndicator()) 
            : appProv.apiError != null 
                ? _buildErrorState(appProv.apiError!, () {
                    context.read<AppProvider>().loadHomeData(forceRefresh: true);
                    _loadCategories(forceRefresh: true);
                  })
                : SingleChildScrollView(
                    physics: const AlwaysScrollableScrollPhysics(),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        if (appProv.isOfflineMode)
                          Container(
                            width: double.infinity,
                            color: Colors.orange.shade100,
                            padding: const EdgeInsets.symmetric(vertical: 8),
                            child: const Center(
                              child: Text(
                                'You\'re offline — showing saved content', 
                                style: TextStyle(fontSize: 12, color: Colors.orange)
                              ),
                            ),
                          ),
                        Padding(
                          padding: const EdgeInsets.all(16),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              if (appProv.dailyFeatured != null)
                                _buildDailyFeatured(appProv.dailyFeatured!),
                              const SizedBox(height: 20),
                              _buildSectionHeader('Categories', () {}),
                              const SizedBox(height: 12),
                              _buildCategories(),
                              const SizedBox(height: 24),
                              _buildSectionHeader('Trending', () {}),
                              const SizedBox(height: 12),
                              _buildAppList(appProv.trending, favProv),
                              const SizedBox(height: 24),
                              _buildSectionHeader('New Apps', () {}),
                              const SizedBox(height: 12),
                              _buildAppList(appProv.newApps, favProv),
                              const SizedBox(height: 24),
                              _buildSectionHeader(
                                'Recently Viewed',
                                () => Navigator.push(
                                  context,
                                  MaterialPageRoute(
                                    builder: (_) => const RecentlyViewedScreen(),
                                  ),
                                ),
                              ),
                              const SizedBox(height: 12),
                              _buildAppList(appProv.recentlyViewed.take(5).toList(), favProv),
                              const SizedBox(height: 24),
                              _buildSectionHeader(
                                'Favorites',
                                () => Navigator.push(
                                  context,
                                  MaterialPageRoute(builder: (_) => const FavoritesScreen()),
                                ),
                              ),
                              const SizedBox(height: 12),
                              _buildAppList(favProv.favorites.take(5).toList(), favProv),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
      ),
    );
  }

  Widget _buildDailyFeatured(AppModel app) {
    return GestureDetector(
      onTap: () => Navigator.push(
        context,
        MaterialPageRoute(builder: (_) => AppDetailScreen(appId: app.id)),
      ),
      child: Container(
        width: double.infinity,
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          gradient: const LinearGradient(
            colors: [AppTheme.primary, AppTheme.primaryDark],
          ),
          borderRadius: BorderRadius.circular(16),
        ),
        child: Row(
          children: [
            ClipRRect(
              borderRadius: BorderRadius.circular(12),
              child: Container(
                width: 64,
                height: 64,
                decoration: BoxDecoration(
                  color: Colors.white.withValues(alpha: 0.2),
                ),
                child: CachedNetworkImage(
                  imageUrl: app.iconUrl,
                  fit: BoxFit.cover,
                  placeholder: (context, url) => const Center(
                    child: SizedBox(
                      width: 24,
                      height: 24,
                      child: CircularProgressIndicator(
                        strokeWidth: 2,
                        valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                      ),
                    ),
                  ),
                  errorWidget: (context, url, error) => const Icon(
                    Icons.explore,
                    color: Colors.white,
                    size: 32,
                  ),
                ),
              ),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 8,
                      vertical: 3,
                    ),
                    decoration: BoxDecoration(
                      color: Colors.white.withValues(alpha: 0.2),
                      borderRadius: BorderRadius.circular(6),
                    ),
                    child: const Text(
                      "Today's Pick",
                      style: TextStyle(
                        fontSize: 10,
                        color: Colors.white,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ),
                  const SizedBox(height: 6),
                  Text(
                    app.curiosityTitle,
                    style: const TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                      color: Colors.white,
                    ),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    app.shortDescription,
                    style: TextStyle(
                      fontSize: 12,
                      color: Colors.white.withValues(alpha: 0.8),
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                ],
              ),
            ),
            const Icon(Icons.arrow_forward_ios, size: 16, color: Colors.white),
          ],
        ),
      ),
    );
  }

  Widget _buildSectionHeader(String title, VoidCallback onSeeAll) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(
          title,
          style: TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.bold,
            color: context.appText,
          ),
        ),
        if (title != 'Categories')
          GestureDetector(
            onTap: onSeeAll,
            child: const Text(
              'See all',
              style: TextStyle(
                fontSize: 13,
                color: AppTheme.primary,
                fontWeight: FontWeight.w500,
              ),
            ),
          ),
      ],
    );
  }

  Widget _buildCategories() {
    if (_categories.isEmpty) return const SizedBox.shrink();
    return SizedBox(
      height: 100,
      child: ListView.separated(
        scrollDirection: Axis.horizontal,
        itemCount: _categories.length,
        separatorBuilder: (context, index) => const SizedBox(width: 10),
        itemBuilder: (context, i) => CategoryChip(
          category: _categories[i],
          onTap: () => Navigator.push(
            context,
            MaterialPageRoute(
              builder: (_) => CategoryAppsScreen(category: _categories[i]),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildAppList(List<AppModel> apps, FavoriteProvider favProv) {
    if (apps.isEmpty) {
      return Padding(
        padding: const EdgeInsets.symmetric(vertical: 24),
        child: Center(
          child: Text(
            'No apps yet',
            style: TextStyle(color: context.appTextSecondary),
          ),
        ),
      );
    }
    return Column(
      children: apps
          .map(
            (app) => Padding(
              padding: const EdgeInsets.only(bottom: 8),
              child: AppCard(
                app: app,
                onTap: () => Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (_) => AppDetailScreen(appId: app.id),
                  ),
                ),
                onFavorite: () => favProv.toggle(app.id),
                isFavorited: favProv.isFavorited(app.id),
              ),
            ),
          )
          .toList(),
    );
  }
}
