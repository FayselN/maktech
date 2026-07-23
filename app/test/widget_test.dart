import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:hive_flutter/hive_flutter.dart';
import 'package:provider/provider.dart';
import 'package:maktech/providers/app_provider.dart';
import 'package:maktech/providers/favorite_provider.dart';
import 'package:maktech/providers/theme_provider.dart';
import 'package:maktech/services/cache_service.dart';
import 'package:maktech/screens/main_screen.dart';
import 'dart:io';

import 'package:maktech/providers/notification_provider.dart';

Widget createApp() {
  return MaterialApp(
    home: MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => AppProvider()),
        ChangeNotifierProvider(create: (_) => FavoriteProvider()),
        ChangeNotifierProvider(create: (_) => ThemeProvider()),
        ChangeNotifierProvider(create: (_) => NotificationProvider()),
      ],
      child: const MainScreen(),
    ),
  );
}

void main() {
  setUpAll(() async {
    TestWidgetsFlutterBinding.ensureInitialized();
    final dir = Directory.systemTemp.createTempSync('hive_test_');
    Hive.init(dir.path);
    await CacheService().init();
  });

  testWidgets('MainScreen renders bottom navigation', (WidgetTester tester) async {
    await tester.pumpWidget(createApp());
    await tester.pump();
    expect(find.text('Home'), findsOneWidget);
    expect(find.text('Categories'), findsOneWidget);
    expect(find.text('Favorites'), findsOneWidget);
    expect(find.text('Recent'), findsOneWidget);
    expect(find.text('Settings'), findsOneWidget);
  });
}
