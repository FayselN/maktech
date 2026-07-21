import 'package:flutter_test/flutter_test.dart';
import 'package:maktech/models/review_model.dart';

void main() {
  group('ReviewModel.fromJson', () {
    test('parses complete JSON with populated user object', () {
      final json = {
        '_id': 'rev-001',
        'userId': {
          '_id': 'user-001',
          'name': 'John Doe',
          'profileImage': 'https://example.com/john.png',
        },
        'rating': 5,
        'comment': 'Amazing app!',
        'createdAt': '2025-07-15T12:00:00.000Z',
      };

      final review = ReviewModel.fromJson(json);

      expect(review.id, 'rev-001');
      expect(review.userId, 'user-001');
      expect(review.userName, 'John Doe');
      expect(review.userImage, 'https://example.com/john.png');
      expect(review.rating, 5);
      expect(review.comment, 'Amazing app!');
      expect(review.createdAt, '2025-07-15T12:00:00.000Z');
    });

    test('handles null userId (anonymous/device-based review)', () {
      final json = {
        '_id': 'rev-002',
        'userId': null,
        'rating': 3,
        'comment': 'Decent app',
        'createdAt': '2025-07-16T12:00:00.000Z',
      };

      final review = ReviewModel.fromJson(json);

      expect(review.userId, isNull);
      expect(review.userName, 'Mak Tech user'); // default fallback
      expect(review.userImage, isNull);
    });

    test('handles missing userId key entirely', () {
      final json = {
        '_id': 'rev-003',
        'rating': 4,
      };

      final review = ReviewModel.fromJson(json);

      expect(review.userId, isNull);
      expect(review.userName, 'Mak Tech user');
      expect(review.userImage, isNull);
    });

    test('defaults comment to empty string when missing', () {
      final json = {
        '_id': 'rev-004',
        'rating': 2,
      };

      final review = ReviewModel.fromJson(json);

      expect(review.comment, '');
    });

    test('defaults createdAt to empty string when missing', () {
      final json = {
        '_id': 'rev-005',
        'rating': 1,
      };

      final review = ReviewModel.fromJson(json);

      expect(review.createdAt, '');
    });

    test('user with name but no profileImage', () {
      final json = {
        '_id': 'rev-006',
        'userId': {
          '_id': 'user-006',
          'name': 'Jane',
        },
        'rating': 4,
        'comment': 'Good',
        'createdAt': '2025-07-17T08:00:00.000Z',
      };

      final review = ReviewModel.fromJson(json);

      expect(review.userName, 'Jane');
      expect(review.userImage, isNull);
    });
  });
}
