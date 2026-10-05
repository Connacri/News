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
      final topic = _generalTopic(category);
      final countryCode = _gdeltCountryCode(country);
      final query = Uri.encodeQueryComponent([topic, if (countryCode.isNotEmpty) 'sourcecountry:$countryCode'].join(' '));
      final uri = Uri.parse(
        'https://api.gdeltproject.org/api/v2/doc/doc?query=$query&mode=artlist&maxrecords=50&format=json&sort=datedesc',
      );
      final res = await http.get(uri).timeout(const Duration(seconds: 10));

      final fetched = <NewsArticle>[];
      if (res.statusCode == 200) {
        final data = json.decode(res.body) as Map<String, dynamic>;
        final articles = data['articles'] as List? ?? [];
        for (final item in articles) {
          if (item is Map<String, dynamic> && item['title'] != null && item['url'] != null) {
            fetched.add(
              NewsArticle.fromGdelt(
                item,
                country: country,
                category: category == 'all' ? 'world' : category,
              ),
            );
          }
        }
      }

      _articles = fetched;
    } catch (e) {
      debugPrint('NewsApiService note: $e');
      _articles = [];
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

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
    return codes[country] ?? '';
  }
}
