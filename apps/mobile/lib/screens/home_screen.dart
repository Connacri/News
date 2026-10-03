import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:url_launcher/url_launcher.dart';
import '../services/news_api_service.dart';
import 'patents_screen.dart';
import 'osint_screen.dart';

class HomeScreen extends StatefulWidget {
  final Function(Locale) onLocaleChange;
  const HomeScreen({super.key, required this.onLocaleChange});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  int _currentTabIndex = 0;
  String _selectedCountry = 'all';
  String _selectedCategory = 'all';

  final List<Map<String, String>> _categories = [
    {'id': 'all', 'label': 'Toutes'},
    {'id': 'patents', 'label': '📜 Brevets Google'},
    {'id': 'blueprints', 'label': '📐 Blueprints'},
    {'id': 'ai', 'label': '🤖 IA & LLM'},
    {'id': 'cyber', 'label': '🛡️ Cyber/OSINT'},
    {'id': 'opensource', 'label': '⭐ OpenSource'},
    {'id': 'mobile', 'label': '📱 Flutter 3.24'},
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
    final isDesktop = MediaQuery.of(context).size.width > 800;

    return Scaffold(
      appBar: AppBar(
        title: const Row(
          children: [
            Icon(Icons.radar, color: Color(0xFF38BDF8)),
            SizedBox(width: 8),
            Text('FlutterNews Multiplateforme', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
          ],
        ),
        actions: [
          // Sélecteur de Langue (Support RTL Arabe & Européen)
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
            onPressed: () => news.fetchNews(country: _selectedCountry, category: _selectedCategory),
          ),
        ],
      ),
      body: Row(
        children: [
          // Navigation Rail pour Desktop & Web Large
          if (isDesktop)
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

          // Contenu principal
          Expanded(
            child: _currentTabIndex == 1
                ? const PatentsScreen()
                : _currentTabIndex == 2
                    ? const OsintScreen()
                    : _buildNewsList(news),
          ),
        ],
      ),
      bottomNavigationBar: isDesktop
          ? null
          : NavigationBar(
              selectedIndex: _currentTabIndex,
              onDestinationSelected: (idx) => setState(() => _currentTabIndex = idx),
              destinations: const [
                NavigationDestination(icon: Icon(Icons.newspaper), label: 'News'),
                NavigationDestination(icon: Icon(Icons.menu_book), label: 'Brevets'),
                NavigationDestination(icon: Icon(Icons.shield), label: 'OSINT'),
              ],
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
                        subtitle: Text(article.description, maxLines: 2, overflow: TextOverflow.ellipsis),
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
