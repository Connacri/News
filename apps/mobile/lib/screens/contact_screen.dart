import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';

class ContactScreen extends StatelessWidget {
  const ContactScreen({super.key});

  Future<void> _open(String url) async {
    final uri = Uri.parse(url);
    if (await canLaunchUrl(uri)) await launchUrl(uri);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Nous contacter')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('DZ News', style: TextStyle(fontSize: 28, fontWeight: FontWeight.bold)),
            const SizedBox(height: 8),
            const Text(
              'Pour toute question, demande d\'assistance, signalement d\'erreur '
              'ou demande de correction concernant un article, vous pouvez nous joindre :',
            ),
            const SizedBox(height: 20),
            ListTile(
              leading: const Icon(Icons.email_outlined),
              title: const Text('E-mail'),
              subtitle: const Text('forslog@gmail.com'),
              onTap: () => _open('mailto:forslog@gmail.com'),
            ),
            ListTile(
              leading: const Icon(Icons.phone_outlined),
              title: const Text('Téléphone'),
              subtitle: const Text('+213696410953'),
              onTap: () => _open('tel:+213696410953'),
            ),
            ListTile(
              leading: const Icon(Icons.language),
              title: const Text('Site officiel'),
              subtitle: const Text('https://device-streaming-ccab91bb.web.app'),
              onTap: () => _open('https://device-streaming-ccab91bb.web.app'),
            ),
            const SizedBox(height: 16),
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: const Color(0xFF0F172A),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: const Color(0xFF1E293B)),
              ),
              child: const Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('Éditeur légal : Forslog Ltd', style: TextStyle(fontWeight: FontWeight.bold, color: Colors.white, fontSize: 13)),
                  SizedBox(height: 6),
                  Text(
                    'Application déclarée en catégorie Actualités & Magazines sur Google Play. '
                    'Chaque article comporte un horodatage récent vérifiable (< 30 jours), '
                    'l\'identification de l\'auteur ou de la rédaction, et un lien direct vers la source originale.',
                    style: TextStyle(fontSize: 12, color: Colors.white70, height: 1.4),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
