import 'package:flutter_test/flutter_test.dart';
import 'package:maktech/models/app_model.dart';

void main() {
  group('AppModel', () {
    final validJson = {
      '_id': 'abc123',
      'name': 'TestApp',
      'slug': 'testapp',
      'searchCode': 'TA',
      'curiosityTitle': 'Discover TestApp',
      'shortDescription': 'A test app',
      'longDescription': 'A longer description',
      'developerName': 'Test Dev',
      'packageName': 'com.test.app',
      'playStoreUrl': 'https://play.google.com/store/apps/details?id=com.test.app',
      'iconUrl': 'https://example.com/icon.png',
      'priceType': 'free',
      'playStoreRating': 4.5,
      'categories': ['productivity', 'tools'],
      'screenshots': [
        {'_id': 's1', 'url': 'https://example.com/s1.png', 'order': 1},
        {'_id': 's2', 'url': 'https://example.com/s2.png', 'order': 2},
      ],
      'features': ['Fast', 'Secure'],
      'pros': ['Easy to use'],
      'cons': ['Limited free tier'],
      'ratingStats': {'average': 4.2, 'count': 100},
      'status': 'published',
      'isNewApp': true,
      'viewCount': 500,
      'favoriteCount': 50,
      'createdAt': '2026-01-01T00:00:00Z',
      'updatedAt': '2026-06-01T00:00:00Z',
    };

    test('fromJson creates AppModel with all fields', () {
      final app = AppModel.fromJson(validJson);
      expect(app.id, 'abc123');
      expect(app.name, 'TestApp');
      expect(app.slug, 'testapp');
      expect(app.shortDescription, 'A test app');
      expect(app.longDescription, 'A longer description');
      expect(app.developerName, 'Test Dev');
      expect(app.packageName, 'com.test.app');
      expect(app.playStoreUrl, 'https://play.google.com/store/apps/details?id=com.test.app');
      expect(app.priceType, 'free');
      expect(app.playStoreRating, 4.5);
      expect(app.categories, ['productivity', 'tools']);
      expect(app.screenshots.length, 2);
      expect(app.features, ['Fast', 'Secure']);
      expect(app.pros, ['Easy to use']);
      expect(app.cons, ['Limited free tier']);
      expect(app.ratingStats.average, 4.2);
      expect(app.ratingStats.count, 100);
      expect(app.isNewApp, true);
      expect(app.viewCount, 500);
      expect(app.favoriteCount, 50);
    });

    test('fromJson handles missing optional fields with defaults', () {
      final minimalJson = {
        '_id': 'abc',
        'name': 'Minimal',
        'slug': 'minimal',
        'shortDescription': 'Minimal app',
        'packageName': 'com.minimal.app',
        'playStoreUrl': 'https://play.google.com/store/apps/details?id=com.minimal.app',
        'iconUrl': 'https://example.com/icon.png',
        'status': 'published',
      };
      final app = AppModel.fromJson(minimalJson);
      expect(app.searchCode, '');
      expect(app.curiosityTitle, 'Minimal');
      expect(app.longDescription, '');
      expect(app.developerName, null);
      expect(app.priceType, 'free');
      expect(app.playStoreRating, 0);
      expect(app.categories, []);
      expect(app.screenshots, []);
      expect(app.features, []);
      expect(app.pros, []);
      expect(app.cons, []);
      expect(app.ratingStats.average, 0);
      expect(app.ratingStats.count, 0);
      expect(app.isNewApp, false);
      expect(app.viewCount, 0);
      expect(app.favoriteCount, 0);
    });
  });
}
