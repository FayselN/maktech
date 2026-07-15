class NotificationModel {
  final String id;
  final String title;
  final String body;
  final String? appId;
  final String type;
  final bool isRead;
  final String sentAt;

  NotificationModel({
    required this.id,
    required this.title,
    required this.body,
    this.appId,
    required this.type,
    required this.isRead,
    required this.sentAt,
  });

  factory NotificationModel.fromJson(Map<String, dynamic> json) {
    return NotificationModel(
      id: json['userNotificationId'] as String? ?? json['_id'] as String,
      title: json['title'] as String,
      body: json['body'] as String,
      appId: json['appId'] as String?,
      type: json['type'] as String? ?? 'general',
      isRead: json['isRead'] as bool? ?? false,
      sentAt: json['sentAt'] as String? ?? '',
    );
  }
}
