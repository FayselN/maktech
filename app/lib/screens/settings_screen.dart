import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/theme_provider.dart';
import '../theme/app_theme.dart';
import 'privacy_policy_screen.dart';

class SettingsScreen extends StatefulWidget {
  const SettingsScreen({super.key});

  @override
  State<SettingsScreen> createState() => _SettingsScreenState();
}

class _SettingsScreenState extends State<SettingsScreen> {
  bool _notificationsEnabled = true;
  bool _offlineModeEnabled = false;
  String _selectedLanguage = 'English';

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Settings'),
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          _buildSection('App Settings', [
            _buildSettingsTile(
              'Notifications',
              Icons.notifications_outlined,
              _notificationsEnabled,
              (value) => setState(() => _notificationsEnabled = value),
            ),
            Consumer<ThemeProvider>(
              builder: (context, themeProv, _) => _buildSettingsTile(
                'Dark Mode',
                Icons.dark_mode_outlined,
                themeProv.isDarkMode,
                (value) => themeProv.setDarkMode(value),
              ),
            ),
            _buildSettingsTile(
              'Offline Mode',
              Icons.cloud_off_outlined,
              _offlineModeEnabled,
              (value) => setState(() => _offlineModeEnabled = value),
            ),
          ]),
          _buildSection('Language', [
            _buildLanguageTile('English', 'en'),
            _buildLanguageTile('Español', 'es'),
            _buildLanguageTile('Français', 'fr'),
            _buildLanguageTile('Deutsch', 'de'),
          ]),
          _buildSection('About & Support', [
            _buildSettingsTile(
              'Privacy Policy',
              Icons.privacy_tip_outlined,
              false,
              null,
              onTap: () => Navigator.push(
                context,
                MaterialPageRoute(builder: (_) => const PrivacyPolicyScreen()),
              ),
            ),
            _buildSettingsTile(
              'About Mak Tech',
              Icons.info_outline,
              false,
              null,
              onTap: () => _showAboutDialog(context),
            ),
          ]),
        ],
      ),
    );
  }

  Widget _buildSection(String title, List<Widget> tiles) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.fromLTRB(16, 24, 16, 8),
          child: Text(
            title,
            style: TextStyle(
              fontSize: 14,
              fontWeight: FontWeight.w600,
              color: context.appTextSecondary,
            ),
          ),
        ),
        Card(
          elevation: 1,
          margin: const EdgeInsets.symmetric(vertical: 4),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
          child: Column(children: tiles),
        ),
        const SizedBox(height: 16),
      ],
    );
  }

  Widget _buildSettingsTile(
    String title,
    IconData icon,
    bool value,
    Function(bool)? onChanged, {
    VoidCallback? onTap,
  }) {
    return ListTile(
      leading: Icon(icon, color: AppTheme.primary),
      title: Text(title),
      trailing: Switch(
        value: value,
        onChanged: onChanged,
        activeColor: AppTheme.primary,
      ),
      onTap: onTap,
    );
  }

  Widget _buildLanguageTile(String name, String code) {
    final isSelected = _selectedLanguage == name;
    return ListTile(
      leading: Icon(Icons.language, color: AppTheme.primary),
      title: Text(name),
      trailing: isSelected
          ? Icon(Icons.check_circle, color: AppTheme.primary)
          : null,
      onTap: () => setState(() => _selectedLanguage = name),
    );
  }

  void _showAboutDialog(BuildContext context) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Row(
          children: [
            Icon(Icons.info_outline, color: AppTheme.primary, size: 24),
            SizedBox(width: 12),
            Text('About Mak Tech'),
          ],
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _buildAboutRow('Version:', 'v2.0.0'),
            _buildAboutRow('Build:', '1.0.0+1'),
            _buildAboutRow('Developer:', 'Mak Tech Team'),
            _buildAboutRow('License:', 'MIT License'),
            _buildAboutRow('Last Updated:', 'July 2026'),
            const SizedBox(height: 12),
            const Text(
              'Mak Tech is a curated Android application directory featuring AI-powered recommendations, security analysis, and offline support. Your privacy is important to us.',
              style: TextStyle(fontSize: 14, height: 1.4),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('OK'),
          ),
        ],
      ),
    );
  }

  Widget _buildAboutRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 90,
            child: Text(
              label,
              style: TextStyle(
                fontSize: 13,
                color: context.appTextSecondary,
                fontWeight: FontWeight.w500,
              ),
            ),
          ),
          Expanded(
            child: Text(
              value,
              style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w500),
            ),
          ),
        ],
      ),
    );
  }
}
