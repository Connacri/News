class NewsArticle {
  final String id;
  final String title;
  final String description;
  final String url;
  final String source;
  final String sourceType;
  final DateTime publishedAt;
  final String country;
  final String category;
  final int upvotes;
  final int commentsCount;
  final List<String> tags;

  // Renseignement Cyber & OSINT
  final String? cveId;
  final String? osintSeverity;

  // Brevets Google Patents & Architecture Blueprints
  final String? publicationType; // 'patent' | 'blueprint' | 'rfc' | 'news'
  final String? patentNumber;
  final String? googlePatentsUrl;
  final String? assignee;
  final List<String>? inventors;
  final String? filingDate;
  final String? blueprintArchitecture;
  final List<String>? claimsSummary;

  NewsArticle({
    required this.id,
    required this.title,
    required this.description,
    required this.url,
    required this.source,
    this.sourceType = 'news',
    required this.publishedAt,
    required this.country,
    required this.category,
    this.upvotes = 0,
    this.commentsCount = 0,
    this.tags = const [],
    this.cveId,
    this.osintSeverity,
    this.publicationType,
    this.patentNumber,
    this.googlePatentsUrl,
    this.assignee,
    this.inventors,
    this.filingDate,
    this.blueprintArchitecture,
    this.claimsSummary,
  });

  factory NewsArticle.fromHackerNews(Map<String, dynamic> json, {String country = 'all'}) {
    return NewsArticle(
      id: 'hn-${json['objectID']}',
      title: json['title'] ?? 'Titre inconnu',
      description: json['story_text'] ?? 'Discussion et analyse technique de la communauté Hacker News.',
      url: json['url'] ?? 'https://news.ycombinator.com/item?id=${json['objectID']}',
      source: 'Hacker News',
      sourceType: 'hackernews',
      publishedAt: DateTime.tryParse(json['created_at'] ?? '') ?? DateTime.now(),
      country: country,
      category: 'tech',
      upvotes: json['points'] ?? 0,
      commentsCount: json['num_comments'] ?? 0,
      tags: ['Tech', 'HackerNews', 'OpenSource'],
    );
  }

  factory NewsArticle.fromFirestore(Map<String, dynamic> json) {
    return NewsArticle(
      id: json['articleId'] ?? '',
      title: json['title'] ?? '',
      description: json['description'] ?? '',
      url: json['url'] ?? '',
      source: json['source'] ?? 'Cloud Bookmark',
      publishedAt: DateTime.tryParse(json['savedAt'] ?? '') ?? DateTime.now(),
      country: json['country'] ?? 'all',
      category: json['category'] ?? 'all',
      patentNumber: json['patentNumber'],
      googlePatentsUrl: json['googlePatentsUrl'],
      publicationType: json['publicationType'],
    );
  }

  Map<String, dynamic> toFirestore(String userId) {
    return {
      'articleId': id,
      'userId': userId,
      'title': title,
      'category': category,
      'source': source,
      'savedAt': DateTime.now().toIso8601String(),
      'patentNumber': patentNumber,
      'googlePatentsUrl': googlePatentsUrl,
      'publicationType': publicationType,
    };
  }
}
