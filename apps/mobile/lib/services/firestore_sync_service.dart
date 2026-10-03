import 'package:flutter/foundation.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';
import '../models/article.dart';

class FirestoreSyncService extends ChangeNotifier {
  final FirebaseFirestore _db = FirebaseFirestore.instance;
  final FirebaseAuth _auth = FirebaseAuth.instance;

  List<NewsArticle> _bookmarks = [];
  List<NewsArticle> get bookmarks => _bookmarks;

  User? get currentUser => _auth.currentUser;

  FirestoreSyncService() {
    _auth.authStateChanges().listen((user) {
      if (user != null) {
        _listenToUserBookmarks(user.uid);
      } else {
        _bookmarks = [];
        notifyListeners();
      }
    });
  }

  void _listenToUserBookmarks(String userId) {
    _db.collection('users').doc(userId).collection('bookmarks')
       .orderBy('savedAt', descending: true)
       .snapshots()
       .listen((snapshot) {
         _bookmarks = snapshot.docs.map((doc) => NewsArticle.fromFirestore(doc.data())).toList();
         notifyListeners();
       });
  }

  Future<void> toggleBookmark(NewsArticle article) async {
    final user = _auth.currentUser;
    if (user == null) return;

    final docRef = _db.collection('users').doc(user.uid).collection('bookmarks').doc(article.id);
    final exists = _bookmarks.any((b) => b.id == article.id);

    if (exists) {
      await docRef.delete();
    } else {
      await docRef.set(article.toFirestore(user.uid));
    }
  }
}
