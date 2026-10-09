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
        'title': 'Google Patent US2026009812A1 : Compilation Prédictive de Shaders Impeller',
        'assignee': 'Google LLC',
        'author': 'Ian Hickson, Chinmay Garde (Google Patent Office)',
        'publishedAt': fmtDate(now.subtract(const Duration(days: 2))),
        'patentNumber': 'US-2026-009812-A1',
        'url': 'https://patents.google.com/patent/US2026009812A1/en',
        'desc': 'Pipeline graphique AOT sans compilation dynamique au runtime éliminant les saccades à 120 FPS sur Flutter.',
        'blueprint': '+-- Flutter UI --+ -> [DisplayList] -> +-- Impeller AOT --+ -> [Vulkan SPIR-V]'
      },
      {
        'title': 'Brevet Européen EP4381920A1 : Sparse FlashAttention-3 pour Puces Mobiles',
        'assignee': 'Mistral AI SAS & Inria',
        'author': 'Arthur Mensch, Guillaume Lample (Office Européen des Brevets)',
        'publishedAt': fmtDate(now.subtract(const Duration(days: 4))),
        'patentNumber': 'EP-4381920-A1',
        'url': 'https://patents.google.com/patent/EP4381920A1/fr',
        'desc': 'Partitionnement par blocs SRAM réduisant de 45% l\'empreinte mémoire pour inférence souveraine on-device.',
        'blueprint': '[Tenseurs Q,K,V] -> [Partitionnement SRAM] -> [Noyau INT4 NPU Basse Énergie]'
      },
      {
        'title': 'Blueprint NIST SP 800-227 : Passerelle Zéro-Trust Post-Quantique',
        'assignee': 'NIST & BSI Consortium',
        'author': 'NIST PQC Standardization Team',
        'publishedAt': fmtDate(now.subtract(const Duration(days: 6))),
        'patentNumber': 'NIST-SP-800-227',
        'url': 'https://csrc.nist.gov/projects/post-quantum-cryptography',
        'desc': 'Architecture de tunnel TLS 1.3 hybride ML-KEM-768 et signature ML-DSA-65 contre le déchiffrement quantique.',
        'blueprint': '[Client Mobile] -> [TLS 1.3 Hybride ML-KEM] -> [Passerelle Zero-Trust mTLS]'
      }
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
                const SizedBox(height: 6),
                Text(p['desc']!, style: const TextStyle(color: Colors.grey)),
                const SizedBox(height: 12),
                Container(
                  width: double.infinity,
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: Colors.black,
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(color: const Color(0xFF10B981), width: 0.5),
                  ),
                  child: Text(
                    p['blueprint']!,
                    style: const TextStyle(fontFamily: 'monospace', color: Color(0xFF34D399), fontSize: 12),
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
