import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/favorite_provider.dart';
import '../theme/app_theme.dart';
import 'app_detail_screen.dart';
import '../widgets/app_card.dart';

class FavoritesScreen extends StatefulWidget {
  const FavoritesScreen({super.key});

  @override
  State<FavoritesScreen> createState() => _FavoritesScreenState();
}

class _FavoritesScreenState extends State<FavoritesScreen> {
  @override
  void initState() {
    super.initState();
    context.read<FavoriteProvider>().loadFavorites();
  }

  @override
  Widget build(BuildContext context) {
    final favProv = context.watch<FavoriteProvider>();

    return Scaffold(
      appBar: AppBar(title: const Text('Favorites')),
      body: favProv.loading
        ? const Center(child: CircularProgressIndicator())
        : favProv.favorites.isEmpty
          ? Center(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(Icons.favorite_outline, size: 48, color: context.appTextSecondary),
                  Text('No favorites yet', style: TextStyle(fontSize: 16, color: context.appTextSecondary)),
                  Text('Tap the heart icon to save apps', style: TextStyle(fontSize: 13, color: context.appTextSecondary)),
                ],
              ),
            )
          : ListView(
              padding: const EdgeInsets.all(16),
              children: favProv.favorites.map((app) => Padding(
                padding: const EdgeInsets.only(bottom: 8),
                child: AppCard(
                  app: app,
                  onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => AppDetailScreen(appId: app.id))),
                  onFavorite: () => favProv.toggle(app.id),
                  isFavorited: true,
                ),
              )).toList(),
            ),
    );
  }
}
