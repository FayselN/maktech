class AppModel {
  final String id;
  final String name;
  final String slug;
  final String searchCode;
  final String curiosityTitle;
  final String shortDescription;
  final String longDescription;
  final String? developerName;
  final String packageName;
  final String playStoreUrl;
  final String iconUrl;
  final String priceType;
  final double playStoreRating;
  final List<String> categories;
  final List<Screenshot> screenshots;
  final List<String> features;
  final List<String> pros;
  final List<String> cons;
  final RatingStats ratingStats;
  final String status;
  final bool isNewApp;
  final int viewCount;
  final int favoriteCount;
  final String createdAt;
  final String updatedAt;

  AppModel({
    required this.id,
    required this.name,
    required this.slug,
    required this.searchCode,
    required this.curiosityTitle,
    required this.shortDescription,
    required this.longDescription,
    this.developerName,
    required this.packageName,
    required this.playStoreUrl,
    required this.iconUrl,
    required this.priceType,
    required this.playStoreRating,
    required this.categories,
    required this.screenshots,
    required this.features,
    required this.pros,
    required this.cons,
    required this.ratingStats,
    required this.status,
    required this.isNewApp,
    required this.viewCount,
    required this.favoriteCount,
    required this.createdAt,
    required this.updatedAt,
  });

  factory AppModel.fromJson(Map<String, dynamic> json) {
    return AppModel(
      id: json['_id'] as String,
      name: json['name'] as String,
      slug: json['slug'] as String,
      searchCode: json['searchCode'] as String? ?? '',
      curiosityTitle: json['curiosityTitle'] as String? ?? json['name'] as String,
      shortDescription: json['shortDescription'] as String,
      longDescription: json['longDescription'] as String? ?? '',
      developerName: json['developerName'] as String?,
      packageName: json['packageName'] as String,
      playStoreUrl: json['playStoreUrl'] as String,
      iconUrl: json['iconUrl'] as String,
      priceType: json['priceType'] as String? ?? 'free',
      playStoreRating: (json['playStoreRating'] as num?)?.toDouble() ?? 0,
      categories: List<String>.from(json['categories'] as List? ?? []),
      screenshots: (json['screenshots'] as List? ?? []).map((s) => Screenshot.fromJson(s)).toList(),
      features: List<String>.from(json['features'] as List? ?? []),
      pros: List<String>.from(json['pros'] as List? ?? []),
      cons: List<String>.from(json['cons'] as List? ?? []),
      ratingStats: RatingStats.fromJson(json['ratingStats'] as Map<String, dynamic>? ?? {}),
      status: json['status'] as String? ?? 'published',
      isNewApp: json['isNewApp'] as bool? ?? false,
      viewCount: json['viewCount'] as int? ?? 0,
      favoriteCount: json['favoriteCount'] as int? ?? 0,
      createdAt: json['createdAt'] as String? ?? '',
      updatedAt: json['updatedAt'] as String? ?? '',
    );
  }
}

class Screenshot {
  final String id;
  final String url;
  final int order;

  Screenshot({required this.id, required this.url, required this.order});

  factory Screenshot.fromJson(Map<String, dynamic> json) {
    return Screenshot(
      id: json['_id'] as String,
      url: json['url'] as String,
      order: json['order'] as int? ?? 0,
    );
  }
}

class RatingStats {
  final double average;
  final int count;

  RatingStats({required this.average, required this.count});

  factory RatingStats.fromJson(Map<String, dynamic> json) {
    return RatingStats(
      average: (json['average'] as num?)?.toDouble() ?? 0,
      count: json['count'] as int? ?? 0,
    );
  }
}
