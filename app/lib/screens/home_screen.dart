import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/auth_provider.dart';
import '../providers/app_provider.dart';
import '../providers/favorite_provider.dart';
import '../services/api_service.dart';
import '../models/category_model.dart';
import '../models/app_model.dart';
import '../theme/app_theme.dart';
import 'search_screen.dart';
import 'app_detail_screen.dart';
import 'category_apps_screen.dart';
import 'favorites_screen.dart';
import 'recently_viewed_screen.dart';
import 'notifications_screen.dart';
import 'login_screen.dart';
import '../widgets/app_card.dart';
import '../widgets/category_chip.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  List<CategoryModel> _categories = [];

  @override
  void initState() {
    super.initState();
    context.read<AppProvider>().loadHomeData();
    _loadCategories();
    if (context.read<AuthProvider>().isLoggedIn) {
      context.read<FavoriteProvider>().loadFavorites();
    }
  }

  Future<void> _loadCategories() async {
    try {
      final res = await ApiService().get('/categories');
      if (mounted) setState(() => _categories = (res as List).map((c) => CategoryModel.fromJson(c)).toList());
    } catch (_) {}
  }

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthProvider>();
    final appProv = context.watch<AppProvider>();
    final favProv = context.watch<FavoriteProvider>();

    return Scaffold(
      appBar: AppBar(
        title: const Text('Mak Tech'),
        actions: [
          IconButton(
            icon: const Icon(Icons.search),
            onPressed: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const SearchScreen())),
          ),
          IconButton(
            icon: const Icon(Icons.notifications_outlined),
            onPressed: () {
              if (auth.isLoggedIn) {
                Navigator.push(context, MaterialPageRoute(builder: (_) => const NotificationsScreen()));
              } else {
                Navigator.push(context, MaterialPageRoute(builder: (_) => const LoginScreen()));
              }
            },
          ),
          if (!auth.isLoggedIn)
            IconButton(
              icon: const Icon(Icons.person_outline),
              onPressed: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const LoginScreen())),
            )
          else
            PopupMenuButton(
              icon: CircleAvatar(
                radius: 14,
                backgroundColor: AppTheme.primary.withValues(alpha: 0.1),
                child: Text(auth.user!.name[0].toUpperCase(), style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: AppTheme.primary)),
              ),
              itemBuilder: (_) => [
                const PopupMenuItem(value: 'logout', child: Text('Logout')),
              ],
              onSelected: (v) {
                if (v == 'logout') {
                  auth.logout();
                }
              },
            ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: () async {
          await context.read<AppProvider>().loadHomeData();
          await _loadCategories();
        },
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              if (appProv.dailyFeatured != null) _buildDailyFeatured(appProv.dailyFeatured!),
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
              if (auth.isLoggedIn) ...[
                _buildSectionHeader('Recently Viewed', () => Navigator.push(context, MaterialPageRoute(builder: (_) => const RecentlyViewedScreen()))),
                const SizedBox(height: 12),
                _buildAppList(appProv.recentlyViewed.take(5).toList(), favProv),
                const SizedBox(height: 24),
                _buildSectionHeader('Favorites', () => Navigator.push(context, MaterialPageRoute(builder: (_) => const FavoritesScreen()))),
                const SizedBox(height: 12),
                _buildAppList(favProv.favorites.take(5).toList(), favProv),
              ],
            ],
          ),
        ),
      ),
      bottomNavigationBar: auth.isLoggedIn ? _buildBottomNav() : null,
    );
  }

  Widget _buildBottomNav() {
    final auth = context.watch<AuthProvider>();
    return Container(
      decoration: const BoxDecoration(
        border: Border(top: BorderSide(color: AppTheme.border)),
        color: Colors.white,
      ),
      child: SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceAround,
            children: [
              _navItem(Icons.home, 'Home', () {}),
              _navItem(Icons.favorite_outline, 'Favorites', () => Navigator.push(context, MaterialPageRoute(builder: (_) => const FavoritesScreen()))),
              _navItem(Icons.history, 'Recent', () => Navigator.push(context, MaterialPageRoute(builder: (_) => const RecentlyViewedScreen()))),
              _navItem(Icons.notifications_outlined, 'Alerts', () => Navigator.push(context, MaterialPageRoute(builder: (_) => const NotificationsScreen()))),
              _navItem(Icons.person_outline, auth.user?.name ?? 'Profile', () {
                auth.logout();
                Navigator.pushReplacement(context, MaterialPageRoute(builder: (_) => const LoginScreen()));
              }),
            ],
          ),
        ),
      ),
    );
  }

  Widget _navItem(IconData icon, String label, VoidCallback onTap) {
    return GestureDetector(
      onTap: onTap,
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: 4),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(icon, size: 22, color: AppTheme.textSecondary),
            const SizedBox(height: 2),
            Text(label, style: const TextStyle(fontSize: 10, color: AppTheme.textSecondary)),
          ],
        ),
      ),
    );
  }

  Widget _buildDailyFeatured(AppModel app) {
    return GestureDetector(
      onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => AppDetailScreen(appId: app.id))),
      child: Container(
        width: double.infinity,
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          gradient: const LinearGradient(colors: [AppTheme.primary, AppTheme.primaryDark]),
          borderRadius: BorderRadius.circular(16),
        ),
        child: Row(
          children: [
            ClipRRect(
              borderRadius: BorderRadius.circular(12),
              child: Image.network(app.iconUrl, width: 64, height: 64, fit: BoxFit.cover),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                    decoration: BoxDecoration(
                      color: Colors.white.withValues(alpha: 0.2),
                      borderRadius: BorderRadius.circular(6),
                    ),
                    child: const Text("Today's Pick", style: TextStyle(fontSize: 10, color: Colors.white, fontWeight: FontWeight.w600)),
                  ),
                  const SizedBox(height: 6),
                  Text(app.name, style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Colors.white)),
                  const SizedBox(height: 2),
                  Text(app.shortDescription, style: TextStyle(fontSize: 12, color: Colors.white.withValues(alpha: 0.8)), maxLines: 1, overflow: TextOverflow.ellipsis),
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
        Text(title, style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: AppTheme.text)),
        if (title != 'Categories')
          GestureDetector(
            onTap: onSeeAll,
            child: const Text('See all', style: TextStyle(fontSize: 13, color: AppTheme.primary, fontWeight: FontWeight.w500)),
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
        separatorBuilder: (_, __) => const SizedBox(width: 10),
        itemBuilder: (_, i) => CategoryChip(
          category: _categories[i],
          onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => CategoryAppsScreen(category: _categories[i]))),
        ),
      ),
    );
  }

  Widget _buildAppList(List<AppModel> apps, FavoriteProvider favProv) {
    if (apps.isEmpty) {
      return const Padding(
        padding: EdgeInsets.symmetric(vertical: 24),
        child: Center(child: Text('No apps yet', style: TextStyle(color: AppTheme.textSecondary))),
      );
    }
    return Column(
      children: apps.map((app) => Padding(
        padding: const EdgeInsets.only(bottom: 8),
        child: AppCard(
          app: app,
          onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => AppDetailScreen(appId: app.id))),
          onFavorite: context.read<AuthProvider>().isLoggedIn ? () => favProv.toggle(app.id) : null,
          isFavorited: favProv.isFavorited(app.id),
        ),
      )).toList(),
    );
  }
}
