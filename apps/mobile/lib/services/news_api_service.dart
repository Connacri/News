import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;
import '../models/article.dart';

class NewsApiService extends ChangeNotifier {
  List<NewsArticle> _articles = [];
  bool _isLoading = false;

  List<NewsArticle> get articles => _articles;
  bool get isLoading => _isLoading;

  Future<void> fetchNews({String country = 'all', String category = 'all'}) async {
    _isLoading = true;
    notifyListeners();

    try {
      final categories = category == 'all' ? _generalCategories : [category];
      final countryCode = _gdeltCountryCode(country);
      final responses = await Future.wait(
        categories.map((editorialCategory) async {
          final topic = _generalTopic(editorialCategory);
          final query = Uri.encodeQueryComponent(
            [topic, if (countryCode.isNotEmpty) 'sourcecountry:$countryCode'].join(' '),
          );
          final uri = Uri.parse(
            'https://api.gdeltproject.org/api/v2/doc/doc?query=$query&mode=artlist&maxrecords=${category == 'all' ? 12 : 50}&format=json&sort=datedesc',
          );
          try {
            final res = await http.get(uri).timeout(const Duration(seconds: 10));
            if (res.statusCode != 200) return <NewsArticle>[];
            final data = json.decode(res.body) as Map<String, dynamic>;
            final items = data['articles'] as List? ?? [];
            return items.whereType<Map<String, dynamic>>()
                .where((item) => item['title'] != null && item['url'] != null)
                .map((item) => NewsArticle.fromGdelt(item, country: country, category: editorialCategory))
                .toList();
          } catch (_) {
            return <NewsArticle>[];
          }
        }),
      );

      final unique = <String, NewsArticle>{};
      for (final batch in responses) {
        for (final article in batch) {
          final key = article.url.replaceFirst(RegExp(r'#.*$'), '').replaceFirst(RegExp(r'/$'), '');
          unique.putIfAbsent(key.isEmpty ? article.id : key, () => article);
        }
      }

      _articles = unique.values.toList()..sort((a, b) => b.publishedAt.compareTo(a.publishedAt));
    } catch (e) {
      debugPrint('NewsApiService note: $e');
      _articles = [];
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  List<String> get _generalCategories => const [
    'world', 'local', 'politics', 'business', 'economy', 'society',
    'sports', 'culture', 'entertainment', 'science', 'health',
    'environment', 'education', 'technology', 'ai', 'cyber',
    'opensource', 'mobile', 'cloud', 'patents', 'blueprints',
    'travel', 'lifestyle',
  ];


  String _generalTopic(String category) {
    const topics = {
      'world': 'world OR international',
      'politics': 'politics OR government OR election',
      'business': 'business OR companies OR markets',
      'economy': 'economy OR inflation OR employment',
      'society': 'society OR community',
      'local': 'local OR regional',
      'sports': 'sports OR football OR soccer OR olympics',
      'culture': 'culture OR arts OR heritage',
      'entertainment': 'entertainment OR cinema OR music OR television',
      'science': 'science OR research OR discovery',
      'health': 'health OR medicine OR public-health',
      'environment': 'environment OR climate OR biodiversity',
      'education': 'education OR university OR school',
      'technology': 'technology OR digital OR innovation',
      'ai': 'artificial intelligence OR AI OR machine learning',
      'cyber': 'cybersecurity OR cyberattack OR vulnerability',
      'opensource': 'open source OR GitHub',
      'mobile': 'smartphone OR Android OR iOS OR mobile',
      'cloud': 'cloud computing OR data center OR Kubernetes',
      'patents': 'patent OR intellectual property',
      'blueprints': 'architecture OR infrastructure OR technical design',
      'travel': 'travel OR tourism OR aviation',
      'lifestyle': 'lifestyle OR food OR fashion OR wellness',
    };
    return topics[category] ?? 'news OR latest OR breaking';
  }

  String _gdeltCountryCode(String country) {
    const codes = {
      'fr': 'FR',
      'dz': 'AG',
      'cn': 'CH',
      'us': 'US',
      'de': 'GM',
      'gb': 'UK',
      'jp': 'JA',
      'ca': 'CA',
    };
    if (country == 'maghreb') return 'AG OR sourcecountry:MO OR sourcecountry:TS';
    return codes[country] ?? '';
  }
}
