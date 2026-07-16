class ReviewModel {
  final String id;
  final String? userId;
  final String? userName;
  final String? userImage;
  final int rating;
  final String comment;
  final String createdAt;

  ReviewModel({
    required this.id,
    this.userId,
    this.userName,
    this.userImage,
    required this.rating,
    required this.comment,
    required this.createdAt,
  });

  factory ReviewModel.fromJson(Map<String, dynamic> json) {
    final user = json['userId'] as Map<String, dynamic>?;
    return ReviewModel(
      id: json['_id'] as String,
      userId: user?['_id'] as String?,
      // Reviews are tied to an anonymous device in the current API, rather
      // than to an account. Keep the UI useful for both API shapes.
      userName: user?['name'] as String? ?? 'Mak Tech user',
      userImage: user?['profileImage'] as String?,
      rating: json['rating'] as int,
      comment: json['comment'] as String? ?? '',
      createdAt: json['createdAt'] as String? ?? '',
    );
  }
}
