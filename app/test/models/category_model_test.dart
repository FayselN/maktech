import 'package:flutter_test/flutter_test.dart';
import 'package:maktech/models/category_model.dart';

void main() {
  group('CategoryModel.fromJson', () {
    test('parses complete JSON correctly', () {
      final json = {
        '_id': 'cat001',
        'name': 'Productivity',
        'slug': 'productivity',
        'iconUrl': 'https://example.com/icon.png',
        'sortOrder': 5,
      };

      final category = CategoryModel.fromJson(json);

      expect(category.id, 'cat001');
      expect(category.name, 'Productivity');
      expect(category.slug, 'productivity');
      expect(category.iconUrl, 'https://example.com/icon.png');
      expect(category.sortOrder, 5);
    });

    test('handles null iconUrl', () {
      final json = {
        '_id': 'cat002',
        'name': 'Games',
        'slug': 'games',
        'sortOrder': 2,
      };

      final category = CategoryModel.fromJson(json);

      expect(category.iconUrl, isNull);
    });

    test('defaults sortOrder to 0 when missing', () {
      final json = {
        '_id': 'cat003',
        'name': 'Tools',
        'slug': 'tools',
      };

      final category = CategoryModel.fromJson(json);

      expect(category.sortOrder, 0);
    });

    test('preserves all fields independently', () {
      final json1 = {
        '_id': 'a',
        'name': 'Alpha',
        'slug': 'alpha',
        'sortOrder': 1,
      };
      final json2 = {
        '_id': 'b',
        'name': 'Beta',
        'slug': 'beta',
        'sortOrder': 2,
      };

      final cat1 = CategoryModel.fromJson(json1);
      final cat2 = CategoryModel.fromJson(json2);

      expect(cat1.id, isNot(equals(cat2.id)));
      expect(cat1.name, 'Alpha');
      expect(cat2.name, 'Beta');
    });
  });
}
