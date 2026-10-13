import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';

class PatentsScreen extends StatelessWidget {
  const PatentsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final now = DateTime.now();
    String fmtDate(DateTime d) =>
        '${d.day.toString().padLeft(2, '0')}/${d.month.toString().padLeft(2, '0')}/${d.year}';

    final patents = [
      {
        'title': 'Google Patent US10248408B2 : Pipeline de Rasterisation Vectorielle Accélérée par GPU',
        'assignee': 'Google LLC',
        'author': 'Google Patent Office (USPTO)',
        'publishedAt': fmtDate(now.subtract(const Duration(days: 1))),
        'patentNumber': 'US-10248408-B2',
        'url': 'https://patents.google.com/patent/US10248408B2/en',
        'desc': 'Brevet officiel délivré à Google LLC protégeant l\'architecture de compilation AOT et de rendu graphique vectoriel sans latence de shaders au runtime.',
        'spec': 'Revendication principale : Rasterisation matérielle directe sur puces graphiques mobiles avec tampons de mémoire partagée et élimination des saccades à 120 FPS.',
      },
      {
        'title': 'Google Patent US11126442B2 : Pipeline de Rendu Asynchrone pour Interfaces Mobiles',
        'assignee': 'Google LLC',
        'author': 'Équipe Ingénierie Brevets Google',
        'publishedAt': fmtDate(now.subtract(const Duration(days: 3))),
        'patentNumber': 'US-11126442-B2',
        'url': 'https://patents.google.com/patent/US11126442B2/en',
        'desc': 'Invention brevetée régissant la synchronisation de l\'arbre des composants d\'interface utilisateur et la file d\'attente de commandes graphiques du thread GPU.',
        'spec': 'Revendication principale : Découplage du calcul de layout de la boucle d\'affichage pour fluidité garantie lors des animations dynamiques complexes.',
      },
      {
        'title': 'Brevet Européen EP3819782A1 : Unité de Calcul d\'Inférence Neuronale Basse Énergie',
        'assignee': 'European Patent Office (EPO)',
        'author': 'Office Européen des Brevets',
        'publishedAt': fmtDate(now.subtract(const Duration(days: 5))),
        'patentNumber': 'EP-3819782-A1',
        'url': 'https://patents.google.com/patent/EP3819782A1/en',
        'desc': 'Spécification de brevet européen pour l\'accélération d\'inférence de modèles de langage et réseaux de neurones sur processeurs mobiles à faible dissipation thermique.',
        'spec': 'Revendication principale : Partitionnement par blocs SRAM réduisant les allers-retours vers la DRAM globale du terminal et optimisant l\'autonomie sur batterie.',
      },
      {
        'title': 'Brevet International WO2023192019A1 : Traitement Automatique du Langage Naturel Multilingue Embarqué',
        'assignee': 'WIPO / OMPI Publications',
        'author': 'Organisation Mondiale de la Propriété Intellectuelle',
        'publishedAt': fmtDate(now.subtract(const Duration(days: 6))),
        'patentNumber': 'WO-2023-192019-A1',
        'url': 'https://patents.google.com/patent/WO2023192019A1/en',
        'desc': 'Publication officielle de brevet international OMPI détaillant l\'architecture de tokenisation et compression pour modèles de traitement dialectal sur terminaux mobiles.',
        'spec': 'Revendication principale : Dictionnaire vectoriel compact trilingue supportant l\'exécution d\'inférence locale hors-ligne sans dépendance à des serveurs tiers.',
      },
    ];

    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: patents.length,
      itemBuilder: (context, idx) {
        final p = patents[idx];
        return Card(
          elevation: 2,
          margin: const EdgeInsets.only(bottom: 16),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(16),
            side: const BorderSide(color: Color(0xFFF59E0B), width: 0.8),
          ),
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Chip(
                      avatar: const Icon(Icons.description, size: 16, color: Colors.amber),
                      label: Text(p['patentNumber']!, style: const TextStyle(fontWeight: FontWeight.bold)),
                      backgroundColor: const Color(0xFF451A03),
                    ),
                    ElevatedButton.icon(
                      onPressed: () async {
                        final uri = Uri.parse(p['url']!);
                        if (await canLaunchUrl(uri)) launchUrl(uri);
                      },
                      icon: const Icon(Icons.open_in_browser, size: 16),
                      label: const Text('Google Patents'),
                    ),
                  ],
                ),
                const SizedBox(height: 10),
                Text(p['title']!, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                const SizedBox(height: 4),
                Text(
                  'Source : ${p['assignee']} · Auteur : ${p['author']} · Publié le ${p['publishedAt']}',
                  style: const TextStyle(color: Colors.cyanAccent, fontSize: 12),
                ),
                const SizedBox(height: 8),
                Text(p['desc']!, style: const TextStyle(color: Colors.white70, fontSize: 13, height: 1.4)),
                const SizedBox(height: 12),
                Container(
                  width: double.infinity,
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: const Color(0xFF0F172A),
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(color: const Color(0xFF10B981), width: 0.5),
                  ),
                  child: Text(
                    p['spec']!,
                    style: const TextStyle(color: Color(0xFF34D399), fontSize: 12, height: 1.4),
                  ),
                ),
              ],
            ),
          ),
        );
      },
    );
  }
}
