import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../providers/app_provider.dart';
import '../providers/favorite_provider.dart';
import '../models/category_model.dart';
import '../theme/app_theme.dart';
import 'app_detail_screen.dart';
import '../widgets/app_card.dart';

class CategoryAppsScreen extends StatefulWidget {
  final CategoryModel category;
  const CategoryAppsScreen({super.key, required this.category});

  @override
  State<CategoryAppsScreen> createState() => _CategoryAppsScreenState();
}

class _CategoryAppsScreenState extends State<CategoryAppsScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (!mounted) return;
      context.read<AppProvider>().loadCategoryApps(widget.category.slug);
    });
  }

  @override
  Widget build(BuildContext context) {
    final appProv = context.watch<AppProvider>();
    final favProv = context.watch<FavoriteProvider>();

    return Scaffold(
      appBar: AppBar(
        title: Row(
          children: [
            ClipRRect(
              borderRadius: BorderRadius.circular(8),
              child: CachedNetworkImage(
                imageUrl: widget.category.iconUrl ?? '', width: 28, height: 28, fit: BoxFit.cover,
                errorWidget: (_, _, _) => const Icon(Icons.category, size: 20, color: AppTheme.primary),
              ),
            ),
            const SizedBox(width: 8),
            Text(widget.category.name),
          ],
        ),
      ),
      body: appProv.loading
        ? const Center(child: CircularProgressIndicator())
        : appProv.categoryApps.isEmpty
          ? Center(child: Text('No apps in this category', style: TextStyle(color: context.appTextSecondary)))
          : ListView(
              padding: const EdgeInsets.all(16),
              children: appProv.categoryApps.map((app) => Padding(
                padding: const EdgeInsets.only(bottom: 8),
                child: AppCard(
                  app: app,
                  onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => AppDetailScreen(appId: app.id))),
                  onFavorite: () => favProv.toggle(app.id),
                  isFavorited: favProv.isFavorited(app.id),
                ),
              )).toList(),
            ),
    );
  }
}
