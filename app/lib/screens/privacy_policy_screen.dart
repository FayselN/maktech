import 'package:flutter/material.dart';
import '../theme/app_theme.dart';

class PrivacyPolicyScreen extends StatelessWidget {
  const PrivacyPolicyScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Privacy Policy')),
      body: const SingleChildScrollView(
        padding: EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Privacy Policy',
              style: TextStyle(
                fontSize: 22,
                fontWeight: FontWeight.bold,
                color: AppTheme.text,
              ),
            ),
            SizedBox(height: 8),
            Text(
              'Last updated: July 2026',
              style: TextStyle(color: AppTheme.textSecondary, fontSize: 13),
            ),
            SizedBox(height: 24),
            _Section(
              title: 'Information We Collect',
              body:
                  'We collect information you provide directly, such as your name and email when you contact us. '
                  'We also automatically collect device information (model, OS version), '
                  'FCM tokens for push notifications, and app usage data (apps viewed, favorites, search queries) '
                  'to improve your experience.',
            ),
            _Section(
              title: 'How We Use Your Information',
              body:
                  'We use the collected data to provide and maintain our service, send push notifications '
                  'about new apps and updates you might like, personalize your experience, and improve '
                  'our app discovery recommendations.',
            ),
            _Section(
              title: 'Data Sharing',
              body:
                  'We do not sell your personal data. We may share anonymized, aggregate data with third-party '
                  'analytics services to understand usage patterns. Push notifications are delivered via '
                  'Firebase Cloud Messaging (Google).',
            ),
            _Section(
              title: 'Data Retention',
              body:
                  'We retain your data as long as your account is active or as needed to provide the service. '
                  'You can request deletion of your data by contacting us.',
            ),
            _Section(
              title: 'Your Rights',
              body:
                  'You can disable push notifications at any time in your device settings. '
                  'You may also clear favorites and recently viewed data within the app. '
                  'For full data deletion requests, please contact us.',
            ),
            _Section(
              title: 'Contact',
              body: 'If you have questions about this policy, contact us at support@maktech.app',
            ),
            SizedBox(height: 32),
          ],
        ),
      ),
    );
  }
}

class _Section extends StatelessWidget {
  final String title;
  final String body;

  const _Section({required this.title, required this.body});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            title,
            style: const TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.w600,
              color: AppTheme.text,
            ),
          ),
          const SizedBox(height: 6),
          Text(
            body,
            style: const TextStyle(
              fontSize: 14,
              color: AppTheme.textSecondary,
              height: 1.5,
            ),
          ),
        ],
      ),
    );
  }
}
