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
        'cve': 'CVE-2024-3094',
        'severity': 'CRITIQUE (CVSS 10.0)',
        'title': 'Porte dérobée et injection de code dans les bibliothèques amont de compression XZ / liblzma',
        'source': 'NIST NVD & OpenSSF',
        'author': 'Équipe de Recherche OpenSSF & NIST',
        'publishedAt': fmtDate(now.subtract(const Duration(days: 1))),
        'url': 'https://nvd.nist.gov/vuln/detail/CVE-2024-3094',
        'scope': 'Systèmes Linux, daemons OpenSSH et distributions de serveurs cloud',
        'mitigation': 'Mettre à jour immédiatement vers une version saine et auditer les binaires système.'
      },
      {
        'cve': 'CVE-2024-21413',
        'severity': 'CRITIQUE (CVSS 9.8)',
        'title': 'Contournement de protection et exécution de code à distance via Moniker Link',
        'source': 'CISA KEV Catalog & Microsoft Security',
        'author': 'CISA Cybersecurity Division',
        'publishedAt': fmtDate(now.subtract(const Duration(days: 2))),
        'url': 'https://www.cisa.gov/known-exploited-vulnerabilities-catalog',
        'scope': 'Clients de messagerie et protocoles d\'authentification NTLM',
        'mitigation': 'Appliquer les correctifs de sécurité mensuels et bloquer le trafic SMB sortant vers Internet.'
      },
      {
        'cve': 'CERTFR-2024-ACT-001',
        'severity': 'ÉLEVÉE (ANSSI)',
        'title': 'Bulletin d\'actualité ANSSI : Campagnes ciblant les équipements périmétriques SSL-VPN',
        'source': 'CERT-FR / ANSSI',
        'author': 'Cellule Veille & Alerte CERT-FR',
        'publishedAt': fmtDate(now.subtract(const Duration(days: 4))),
        'url': 'https://www.cert.ssi.gouv.fr/',
        'scope': 'Passerelles de télétravail d\'entreprises et routeurs industriels',
        'mitigation': 'Restreindre l\'accès à l\'interface d\'administration et activer l\'authentification multifacteur.'
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
                Text('Périmètre : ${a['scope']}', style: const TextStyle(color: Colors.white70, fontSize: 12)),
                const SizedBox(height: 8),
                Container(
                  padding: const EdgeInsets.all(10),
                  decoration: BoxDecoration(
                    color: const Color(0xFF0F172A),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Text('Recommandation : ${a['mitigation']}', style: const TextStyle(fontSize: 12, color: Color(0xFF38BDF8))),
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
                    label: const Text('Consulter l\'avis officiel'),
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
