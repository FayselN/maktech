import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/app_provider.dart';
import '../providers/favorite_provider.dart';
import '../theme/app_theme.dart';
import 'app_detail_screen.dart';
import '../widgets/app_card.dart';

class SearchScreen extends StatefulWidget {
  final bool autofocus;
  const SearchScreen({super.key, this.autofocus = true});

  @override
  State<SearchScreen> createState() => _SearchScreenState();
}

class _SearchScreenState extends State<SearchScreen> {
  final _searchController = TextEditingController();

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final appProv = context.watch<AppProvider>();
    final favProv = context.watch<FavoriteProvider>();

    return Scaffold(
      appBar: AppBar(
        title: TextField(
          controller: _searchController,
          autofocus: widget.autofocus,
          style: const TextStyle(color: Colors.white),
          decoration: const InputDecoration(
            hintText: 'Search apps...',
            hintStyle: TextStyle(color: Colors.white54),
            border: InputBorder.none,
            filled: false,
          ),
          onChanged: (v) => appProv.search(v),
        ),
        actions: [
          if (_searchController.text.isNotEmpty)
            IconButton(
              icon: const Icon(Icons.clear),
              onPressed: () {
                _searchController.clear();
                appProv.search('');
              },
            ),
        ],
      ),
      body: _searchController.text.isEmpty
          ? const Center(
              child: Text(
                'Search for apps by name or description',
                style: TextStyle(color: AppTheme.textSecondary),
              ),
            )
          : appProv.loading
          ? const Center(child: CircularProgressIndicator())
          : appProv.searchResults.isEmpty
          ? const Center(
              child: Text(
                'No results found',
                style: TextStyle(color: AppTheme.textSecondary),
              ),
            )
          : ListView(
              padding: const EdgeInsets.all(16),
              children: appProv.searchResults
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
            ),
    );
  }
}
