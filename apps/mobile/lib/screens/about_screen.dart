import 'package:flutter/material.dart';

class AboutScreen extends StatelessWidget {
  const AboutScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('À propos')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: const [
            Text('DZ News', style: TextStyle(fontSize: 28, fontWeight: FontWeight.bold)),
            SizedBox(height: 8),
            Text(
              'DZ News est une application d\'actualités éditée par Forslog Ltd. '
              'Elle agrège des articles provenant de sources publiques reconnues '
              '(Hacker News, dev.to, GitHub, NIST, CISA, Google Patents) et en '
              'affiche le titre, le résumé et le lien vers la publication originale.',
            ),
            SizedBox(height: 16),
            Text('Éditeur : Forslog Ltd', style: TextStyle(fontWeight: FontWeight.bold)),
            Text('E-mail : forslog@gmail.com'),
            Text('Téléphone : +213696410953'),
            SizedBox(height: 16),
            Text(
              'Chaque article conserve son URL originale, sa source et sa date de publication. '
              'DZ News ne prétend pas être l\'auteur des contenus agrégés.',
            ),
          ],
        ),
      ),
    );
  }
}
