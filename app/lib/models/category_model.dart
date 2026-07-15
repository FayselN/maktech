class CategoryModel {
  final String id;
  final String name;
  final String slug;
  final String? iconUrl;
  final int sortOrder;

  CategoryModel({
    required this.id,
    required this.name,
    required this.slug,
    this.iconUrl,
    required this.sortOrder,
  });

  factory CategoryModel.fromJson(Map<String, dynamic> json) {
    return CategoryModel(
      id: json['_id'] as String,
      name: json['name'] as String,
      slug: json['slug'] as String,
      iconUrl: json['iconUrl'] as String?,
      sortOrder: json['sortOrder'] as int? ?? 0,
    );
  }
}
