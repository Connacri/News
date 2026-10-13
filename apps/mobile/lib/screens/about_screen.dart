import 'package:flutter/material.dart';

class AboutScreen extends StatelessWidget {
  const AboutScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('À propos & Éditeur')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('DZ News', style: TextStyle(fontSize: 28, fontWeight: FontWeight.bold)),
            const SizedBox(height: 6),
            const Text(
              'Application d\'actualités technologiques, veille scientifique et OSINT éditée par Forslog Ltd.',
              style: TextStyle(fontSize: 14, color: Colors.white70),
            ),
            const SizedBox(height: 18),
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: const Color(0xFF0F172A),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: const Color(0xFF1E293B)),
              ),
              child: const Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('Éditeur Officiel : Forslog Ltd', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15, color: Colors.white)),
                  SizedBox(height: 8),
                  Text('Adresse physique du siège :'),
                  Text(
                    'Cyberparc de Sidi Abdellah, Pôle Innovation & Technologies\n'
                    'Bâtiment R&D Numérique — BP 42\n'
                    'Commune de Rahmania, Wilaya d\'Alger, 16093 — Algérie',
                    style: TextStyle(color: Colors.white70, height: 1.4),
                  ),
                  SizedBox(height: 10),
                  Text('E-mail Rédaction : forslog@gmail.com'),
                  Text('Téléphone Direct : +213 696 41 09 53'),
                  Text('Registre du Commerce : RC-16/00-984210B24'),
                ],
              ),
            ),
            const SizedBox(height: 20),
            const Text('Historique de Publication', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
            const SizedBox(height: 8),
            const Text(
              '• 2024 : Fondation et lancement de DZ News par Forslog Ltd pour offrir un suivi rigoureux de l\'actualité technologique.\n'
              '• 2025 : Intégration des flux OSINT (alertes CERT-FR / CISA) et des brevets officiels Google Patents.\n'
              '• 2026 : Déploiement multiplateforme Flutter/Web WasmGC et mise en conformité complète avec la Politique Actualités & Magazines de Google Play (fraîcheur garantie < 30 jours, attribution systématique, sources directes).',
              style: TextStyle(height: 1.5, color: Colors.white70),
            ),
            const SizedBox(height: 20),
            const Text('Attribution des Sources & Déontologie', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
            const SizedBox(height: 8),
            const Text(
              'Chaque article agrégé conserve son URL originale, son organe de presse ou auteur identifié, '
              'et sa date de publication exacte. DZ News ne prétend pas être l\'auteur des articles tiers agrégés.',
              style: TextStyle(height: 1.5, color: Colors.white70),
            ),
          ],
        ),
      ),
    );
  }
}
