import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:url_launcher/url_launcher.dart';
import '../services/news_api_service.dart';
import 'patents_screen.dart';
import 'osint_screen.dart';
import 'about_screen.dart';
import 'contact_screen.dart';

class HomeScreen extends StatefulWidget {
  final Function(Locale) onLocaleChange;
  const HomeScreen({super.key, required this.onLocaleChange});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  int _currentTabIndex = 0;
  final String _selectedCountry = 'all';
  String _selectedCategory = 'all';

  final List<Map<String, String>> _categories = [
    {'id': 'all', 'label': '🌐 À la une'},
    {'id': 'world', 'label': '🌍 Monde'},
    {'id': 'local', 'label': '📍 Local'},
    {'id': 'politics', 'label': '🏛️ Politique'},
    {'id': 'business', 'label': '💼 Entreprises'},
    {'id': 'economy', 'label': '📈 Économie'},
    {'id': 'society', 'label': '👥 Société'},
    {'id': 'sports', 'label': '⚽ Sports'},
    {'id': 'culture', 'label': '🎭 Culture'},
    {'id': 'entertainment', 'label': '🎬 Divertissement'},
    {'id': 'science', 'label': '🔬 Science'},
    {'id': 'health', 'label': '🩺 Santé'},
    {'id': 'environment', 'label': '🌱 Environnement'},
    {'id': 'education', 'label': '🎓 Éducation'},
    {'id': 'technology', 'label': '💻 Technologie'},
    {'id': 'ai', 'label': '🤖 IA'},
    {'id': 'cyber', 'label': '🛡️ Cybersécurité'},
    {'id': 'travel', 'label': '✈️ Voyage'},
    {'id': 'lifestyle', 'label': '✨ Lifestyle'},
    {'id': 'opensource', 'label': '⭐ Open Source'},
    {'id': 'mobile', 'label': '📱 Mobile'},
    {'id': 'cloud', 'label': '☁️ Cloud'},
    {'id': 'patents', 'label': '📜 Brevets'},
    {'id': 'blueprints', 'label': '📐 Blueprints'},
  ];
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<NewsApiService>().fetchNews(country: 'all', category: 'all');
    });
  }

  @override
  Widget build(BuildContext context) {
    final news = context.watch<NewsApiService>();

    return Scaffold(
      appBar: AppBar(
        title: const Row(
          children: [
            Icon(Icons.radar, color: Color(0xFF38BDF8)),
            SizedBox(width: 8),
            Flexible(
              child: Text(
                'DZ News',
                overflow: TextOverflow.ellipsis,
                style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
              ),
            ),
          ],
        ),
        actions: [
          PopupMenuButton<String>(
            icon: const Icon(Icons.language),
            tooltip: 'Changer la langue',
            onSelected: (code) {
              if (code == 'ar') widget.onLocaleChange(const Locale('ar', 'AE'));
              if (code == 'fr') widget.onLocaleChange(const Locale('fr', 'FR'));
              if (code == 'en') widget.onLocaleChange(const Locale('en', 'US'));
            },
            itemBuilder: (_) => const [
              PopupMenuItem(value: 'fr', child: Text('🇫🇷 Français')),
              PopupMenuItem(value: 'en', child: Text('🇺🇸 English')),
              PopupMenuItem(value: 'ar', child: Text('🇦🇪 العربية (RTL)')),
            ],
          ),
          IconButton(
            icon: const Icon(Icons.refresh),
            tooltip: 'Actualiser',
            onPressed: news.isLoading
                ? null
                : () => news.fetchNews(country: _selectedCountry, category: _selectedCategory),
          ),
          PopupMenuButton<String>(
            icon: const Icon(Icons.more_vert),
            tooltip: 'Menu',
            onSelected: (value) {
              if (value == 'about') {
                Navigator.of(context).push(MaterialPageRoute(builder: (_) => const AboutScreen()));
              } else if (value == 'contact') {
                Navigator.of(context).push(MaterialPageRoute(builder: (_) => const ContactScreen()));
              } else if (value == 'privacy') {
                launchUrl(Uri.parse('https://device-streaming-ccab91bb.web.app/security-policy'));
              }
            },
            itemBuilder: (_) => const [
              PopupMenuItem(value: 'about', child: Text('À propos')),
              PopupMenuItem(value: 'contact', child: Text('Nous contacter')),
              PopupMenuItem(value: 'privacy', child: Text('Confidentialité')),
            ],
          ),
        ],
      ),
      body: LayoutBuilder(
        builder: (context, constraints) {
          final width = constraints.maxWidth;
          final useRail = width >= 1000;
          final contentWidth = width >= 1200 ? 1120.0 : width;

          Widget content = _currentTabIndex == 1
              ? const PatentsScreen()
              : _currentTabIndex == 2
                  ? const OsintScreen()
                  : _buildNewsList(news);

          content = Align(
            alignment: Alignment.topCenter,
            child: ConstrainedBox(
              constraints: BoxConstraints(maxWidth: contentWidth),
              child: content,
            ),
          );

          return Row(
            children: [
              if (useRail)
                NavigationRail(
                  selectedIndex: _currentTabIndex,
                  onDestinationSelected: (idx) => setState(() => _currentTabIndex = idx),
                  labelType: NavigationRailLabelType.all,
                  destinations: const [
                    NavigationRailDestination(icon: Icon(Icons.newspaper), label: Text('News')),
                    NavigationRailDestination(icon: Icon(Icons.menu_book), label: Text('Brevets')),
                    NavigationRailDestination(icon: Icon(Icons.shield), label: Text('OSINT')),
                  ],
                ),
              Expanded(child: content),
            ],
          );
        },
      ),
      bottomNavigationBar: LayoutBuilder(
        builder: (context, constraints) => constraints.maxWidth < 1000
            ? NavigationBar(
                selectedIndex: _currentTabIndex,
                onDestinationSelected: (idx) => setState(() => _currentTabIndex = idx),
                destinations: const [
                  NavigationDestination(icon: Icon(Icons.newspaper), label: 'News'),
                  NavigationDestination(icon: Icon(Icons.menu_book), label: 'Brevets'),
                  NavigationDestination(icon: Icon(Icons.shield), label: 'OSINT'),
                ],
               )
            : const SizedBox.shrink(),
      ),
    );
  }

  Widget _buildNewsList(NewsApiService news) {
    return Column(
      children: [
        // Filtres par Catégorie Horizontal
        Container(
          height: 48,
          padding: const EdgeInsets.symmetric(horizontal: 12),
          child: ListView.separated(
            scrollDirection: Axis.horizontal,
            itemCount: _categories.length,
            separatorBuilder: (_, __) => const SizedBox(width: 8),
            itemBuilder: (context, index) {
              final cat = _categories[index];
              final isSelected = cat['id'] == _selectedCategory;
              return ChoiceChip(
                label: Text(cat['label']!),
                selected: isSelected,
                onSelected: (selected) {
                  if (selected) {
                    setState(() => _selectedCategory = cat['id']!);
                    news.fetchNews(country: _selectedCountry, category: cat['id']!);
                  }
                },
              );
            },
          ),
        ),

        // Liste d'articles
        Expanded(
          child: news.isLoading
              ? const Center(child: CircularProgressIndicator())
              : ListView.builder(
                  itemCount: news.articles.length,
                  itemBuilder: (context, index) {
                    final article = news.articles[index];
                    return Card(
                      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
                      child: ListTile(
                        title: Text(article.title, style: const TextStyle(fontWeight: FontWeight.bold)),
                        subtitle: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const SizedBox(height: 4),
                            Text(article.description, maxLines: 2, overflow: TextOverflow.ellipsis),
                            const SizedBox(height: 6),
                            Text(
                              'Source : ${article.source}'
                              '${article.author != null && article.author!.isNotEmpty ? ' · ${article.author}' : ''}'
                              ' · ${article.publishedAt.day}/${article.publishedAt.month}/${article.publishedAt.year}',
                              style: Theme.of(context).textTheme.bodySmall?.copyWith(color: Colors.cyanAccent),
                            ),
                          ],
                        ),
                        trailing: IconButton(
                          icon: const Icon(Icons.open_in_new),
                          onPressed: () async {
                            final uri = Uri.parse(article.googlePatentsUrl ?? article.url);
                            if (await canLaunchUrl(uri)) launchUrl(uri);
                          },
                        ),
                      ),
                    );
                  },
                ),
        ),
      ],
    );
  }
}
