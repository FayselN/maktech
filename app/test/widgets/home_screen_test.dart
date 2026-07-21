import 'dart:io';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:hive_flutter/hive_flutter.dart';
import 'package:provider/provider.dart';
import 'package:maktech/providers/app_provider.dart';
import 'package:maktech/providers/favorite_provider.dart';
import 'package:maktech/providers/theme_provider.dart';
import 'package:maktech/services/cache_service.dart';
import 'package:maktech/screens/home_screen.dart';

Widget createTestWidget() {
  return MaterialApp(
    home: MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => AppProvider()),
        ChangeNotifierProvider(create: (_) => FavoriteProvider()),
        ChangeNotifierProvider(create: (_) => ThemeProvider()),
      ],
      child: const HomeScreen(),
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

  testWidgets('HomeScreen shows Mak Tech title', (WidgetTester tester) async {
    await tester.pumpWidget(createTestWidget());
    await tester.pump();
    expect(find.text('Mak Tech'), findsOneWidget);
  });

  testWidgets('HomeScreen has search and notification buttons', (WidgetTester tester) async {
    await tester.pumpWidget(createTestWidget());
    await tester.pump();
    expect(find.byIcon(Icons.search), findsOneWidget);
    expect(find.byIcon(Icons.notifications_outlined), findsOneWidget);
  });
}
