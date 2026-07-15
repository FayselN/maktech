class UserModel {
  final String id;
  final String name;
  final String email;
  final String? profileImage;
  final String role;

  UserModel({
    required this.id,
    required this.name,
    required this.email,
    this.profileImage,
    required this.role,
  });

  factory UserModel.fromJson(Map<String, dynamic> json) {
    return UserModel(
      id: json['id'] as String,
      name: json['name'] as String,
      email: json['email'] as String,
      profileImage: json['profileImage'] as String?,
      role: json['role'] as String? ?? 'user',
    );
  }
}
