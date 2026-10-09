import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';

class OsintScreen extends StatelessWidget {
  const OsintScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final now = DateTime.now();
    String fmtDate(DateTime d) =>
        '${d.day.toString().padLeft(2, '0')}/${d.month.toString().padLeft(2, '0')}/${d.year}';

    final alerts = [
      {
        'cve': 'CVE-2026-2810',
        'severity': 'CRITIQUE (CVSS 9.8)',
        'title': 'Exécution de code à distance sans authentification sur serveurs cloud',
        'source': 'CERT-FR / ANSSI & NVD NIST',
        'author': 'Équipe Veille CERT-FR',
        'publishedAt': fmtDate(now.subtract(const Duration(days: 1))),
        'url': 'https://www.cert.ssi.gouv.fr/',
        'scope': 'Infrastructures Cloud & Routeurs Industriels',
        'mitigation': 'Appliquer le correctif de sécurité v2.4.1 ou isoler les flux entrants via passerelle eBPF.'
      },
      {
        'cve': 'CVE-2026-1934',
        'severity': 'ÉLEVÉE (CVSS 8.4)',
        'title': 'Dépassement de tampon dans la pile cryptographique TLS héritée',
        'source': 'CISA KEV & OpenSSF',
        'author': 'CISA Technical Directorate',
        'publishedAt': fmtDate(now.subtract(const Duration(days: 3))),
        'url': 'https://www.cisa.gov/known-exploited-vulnerabilities-catalog',
        'scope': 'Bibliothèques de communication réseau Linux et Android',
        'mitigation': 'Migrer vers OpenSSL 3.4 et activer la protection Stack-Canary à la compilation.'
      }
    ];

    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: alerts.length,
      itemBuilder: (context, idx) {
        final a = alerts[idx];
        return Card(
          elevation: 2,
          margin: const EdgeInsets.only(bottom: 16),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(16),
            side: const BorderSide(color: Colors.redAccent, width: 0.8),
          ),
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(a['cve']!, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Colors.redAccent)),
                    Chip(
                      label: Text(a['severity']!, style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
                      backgroundColor: const Color(0xFF4C0519),
                    ),
                  ],
                ),
                const SizedBox(height: 8),
                Text(a['title']!, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w600)),
                const SizedBox(height: 4),
                Text(
                  'Source : ${a['source']} · Auteur : ${a['author']} · Publié le ${a['publishedAt']}',
                  style: const TextStyle(color: Colors.cyanAccent, fontSize: 12),
                ),
                const SizedBox(height: 6),
                Text('Périmètre: ${a['scope']}', style: const TextStyle(color: Colors.grey, fontSize: 12)),
                const SizedBox(height: 8),
                Container(
                  padding: const EdgeInsets.all(10),
                  decoration: BoxDecoration(
                    color: const Color(0xFF0F172A),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Text('Recommandation: ${a['mitigation']}', style: const TextStyle(fontSize: 12, color: Color(0xFF38BDF8))),
                ),
                const SizedBox(height: 8),
                Align(
                  alignment: Alignment.centerRight,
                  child: TextButton.icon(
                    onPressed: () async {
                      final uri = Uri.parse(a['url']!);
                      if (await canLaunchUrl(uri)) launchUrl(uri);
                    },
                    icon: const Icon(Icons.open_in_new, size: 16),
                    label: const Text('Consulter la source officielle'),
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
