/// Service de traduction en langue Arabe pour DZ News
/// Règle absolue obligatoire :
/// Conserver TOUS les termes techniques, scientifiques, matériels, logiciels,
/// acronymes et spécifications (Flutter, Android, iOS, Impeller, Vulkan, Metal,
/// WasmGC, WebAssembly, eBPF, CVE, Linux, API, LLM, CUDA, GPU, CPU, NPU, NIST,
/// CISA, VRAM, RAM, INT4, FP8, Cloud, Kubernetes, Docker, Python, Rust, FTTH,
/// LiDAR, InSAR, GNSS, Nature Geoscience, CRAAG, etc.) STRICTEMENT NON TRADUITS
/// en caractères latins / alphanumériques.
library;

class ArticleTranslator {
  static final RegExp _technicalTermsRegex = RegExp(
    r'\b(Flutter|Android|iOS|Impeller|Vulkan|Metal|WasmGC|WebAssembly|Wasm|eBPF|CVE[-0-9A-Za-z]*|Linux|API|REST API|LLM|MoE|FlashAttention|SRAM|DRAM|VRAM|INT4|FP8|INT8|FP16|GPU|CPU|NPU|TPU|Docker|Kubernetes|K8s|Python|Rust|C\+\+|Go|Node\.js|TypeScript|Dart|NIST|CISA|CERT-FR|ANSSI|USPTO|EPO|WIPO|INAPI|FTTH|Gbps|Mbps|LiDAR|InSAR|GNSS|CRAAG|Nature Geoscience|WiFi|5G|4G|Bluetooth|TCP|IP|HTTP|HTTPS|DNS|SSL|TLS|mTLS|RAM|ROM|SSD|SQL|NoSQL|PostgreSQL|Firebase|Firestore|FCM|Git|GitHub|GitLab|DeepSeek|Mistral AI|OpenAI|ChatGPT|Gemini|Claude|Llama|Hugging Face|Kaggle|TensorFlow|PyTorch|ONNX|GGUF|CUDA|AMD|NVIDIA|Qualcomm|ARM|Intel|Apple Silicon|Air Algérie|Algérie Télécom|Sidi Abdellah|USTHB|CERIST|SATIM|Edahabia|APS|TSA|El Watan|France 24|Reuters|BBC|Wired|Le Monde|MW)\b',
    caseSensitive: false,
  );

  static final Map<String, String> _exactTranslations = {
    // 📍 LOCAL & ALGÉRIE
    "Algérie : Modernisation des services publics locaux et déploiement de la fibre dans 58 wilayas":
        "الجزائر: تحديث الخدمات العامة المحلية ونشر شبكة Fibre في 58 ولاية",
    "Le ministère de l'Intérieur et Algérie Télécom finalisent la numérisation complète de l'état civil et le raccordement haut débit des communes enclavées.":
        "وزارة الداخلية و Algérie Télécom تضعان اللمسات الأخيرة على رقمنة الحالة المدنية وتوصيل البلديات المعزولة بالإنترنت فائق السرعة.",
    "Grand Alger : Extension du réseau de métro et inauguration des nouvelles stations intermodales":
        "الجزائر الكبرى: توسيع شبكة المترو وتدشين محطات جديدة متعددة الوسائط",
    "Entrée en service des nouvelles rames automatisées et des passerelles d'accès reliant l'aéroport d'Alger aux grands pôles universitaires de Bab Ezzouar.":
        "دخول قطارات آلية جديدة وممرات ربط مطار الجزائر بالأقطاب الجامعية الكبرى في Bab Ezzouar إلى الخدمة.",

    // 🏛️ POLITIQUE
    "Conseil des ministres : Nouvelles mesures pour l'appui aux startups et la transformation numérique":
        "مجلس الوزراء: تدابير جديدة لدعم الشركات الناشئة والتحول الرقمي",
    "Adoption de décrets exécutifs favorisant les exonérations fiscales pour les jeunes entreprises innovantes et l'exportation de services informatiques.":
        "المصادقة على مراسيم تنفيذية تقر إعفاءات ضريبية للشركات الناشئة المبتكرة وتصدير الخدمات البرمجية.",

    // 💼 ENTREPRISES & BUSINESS
    "Entrepreneuriat : Levée de fonds record pour les fintechs et plateformes de logistique maghrébines":
        "ريادة الأعمال: جولة تمويل قياسية لشركات Fintech والمنصات اللوجستية المغاربية",
    "Plusieurs fonds d'investissement régionaux annoncent la clôture de tours de table stratégiques pour accompagner la croissance des plateformes de paiement et de commerce en ligne.":
        "صناديق استثمار إقليمية تعلن إغلاق جولات تمويل استراتيجية لمواكبة نمو منصات الدفع والتجارة الإلكترونية.",

    // 📈 ÉCONOMIE
    "Banque d'Algérie : Hausse des exportations hors hydrocarbures et stabilité des réserves de change":
        "بنك الجزائر: ارتفاع الصادرات خارج المحروقات واستقرار احتياطي الصرف الأجنبي",
    "Rapport annuel : Les indicateurs macroéconomiques confirment la résilience financière et le renforcement de la production industrielle locale.":
        "التقرير السنوي: المؤشرات الاقتصادية الكلية تؤكد متانة المالية العامة وتعزيز الإنتاج الصناعي المحلي.",

    // ⚽ SPORT
    "Éliminatoires Mondial 2026 : Victoire éclatante de la sélection nationale à Alger":
        "تصفيات كأس العالم 2026: فوز مستحق للمنتخب الوطني في الجزائر العاصمة",
    "Les Verts consolident leur première place du groupe grâce à un jeu offensif séduisant devant plus de 40 000 supporters au stade Nelson Mandela.":
        "الخضر يعززون صدارتهم للمجموعة بفضل أداء هجومي مميز أمام أكثر من 40 ألف مشجع في ملعب Nelson Mandela.",

    // 🏛️ PATRIMOINE & CULTURE
    "Patrimoine saharien : Inscription de nouveaux sites géologiques et gravures rupestres au Tassili":
        "التراث الصحراوي: تصنيف مواقع جيولوجية ونقوش صخرية جديدة في طاسيلي",
    "L'UNESCO et le ministère de la Culture saluent les efforts de préservation durable des écosystèmes culturels et archéologiques de Djanet et Tamanrasset.":
        "اليونسكو ووزارة الثقافة تشيدان بجهود الحماية المستدامة للمواقع الأثرية والثقافية في جانت وتمنراست.",
    "Festival international du cinéma d'Alger : Hommage aux pionniers du 7e art méditerranéen":
        "المهرجان الدولي للسينما بالجزائر: تكريم رواد الفن السابع في البحر المتوسط",
    "Ouverture officielle de la 12e édition avec la projection de documentaires inédits sur l'histoire contemporaine et les luttes d'émancipation.":
        "الافتتاح الرسمي للدورة 12 بعرض أفلام وثائقية حصرية حول التاريخ المعاصر وقضايا التحرر.",

    // 🔬 SCIENCE & SANTÉ
    "Recherche spatiale : L'Agence Spatiale Algérienne (ASAL) présente les données environnementales d'Alsat":
        "أبحاث الفضاء: الوكالة الفضائية الجزائرية (ASAL) تعرض بيانات القمر الصناعي Alsat البيئية",
    "Cartographie de haute précision des nappes phréatiques et suivi satellitaire de la désertification en partenariat avec les centres universitaires du Sud.":
        "خرائط فضائية عالية الدقة للمياه الجوفية ومراقبة التصحر بالأقمار الصناعية بالشراكة مع جامعات الجنوب.",
    "CHU Mustapha Pacha : Déploiement de la télémédecine et des dossiers médicaux électroniques unifiés":
        "مستشفى مصطفى باشا الجامعي: إطلاق الطب الاتصالي والملفات الطبية الإلكترونية الموحدة",
    "Généralisation des téléconsultations spécialisées pour les wilayas du Sud et des Hauts-Plateaux, réduisant les délais de prise en charge chirurgicale.":
        "تعميم الاستشارات الطبية المتخصصة عن بُعد لولايات الجنوب والهضاب العليا لتقليص مواعيد الجراحة.",

    // ☀️ ÉNERGIE & ENVIRONNEMENT
    "Parc Solaire National : Raccordement des premières centrales photovoltaïques au réseau électrique":
        "مشروع الطاقة الشمسية الوطني: ربط أولى المحطات الكهروضوئية بالشبكة الكهربائية",
    "Mise en service de 500 MW de capacités solaires dans les wilayas de Djelfa et El Oued dans le cadre du programme national des énergies renouvelables.":
        "تشغيل 500 MW من قدرات الطاقة الشمسية في ولايتي الجلفة والوادي ضمن البرنامج الوطني للطاقات المتجددة.",

    // 🎓 ÉDUCATION & UNIVERSITÉ
    "Enseignement Supérieur : Création de 10 pôles d'excellence en intelligence artificielle et cybersécurité":
        "التعليم العالي: إنشاء 10 أقطاب امتياز في الذكاء الاصطناعي والأمن السيبراني",
    "Les écoles nationales supérieures d'Alger et d'Oran accueillent les premières promotions d'ingénieurs d'élite avec des cursus co-construits avec le secteur industriel.":
        "المدارس الوطنية العليا بالجزائر ووهران تستقبل أولى دفعات مهندسي النخبة بمناهج مشتركة مع الصناعة.",

    // 🌐 TÉLÉCOMS & TECH
    "Algérie Télécom : Déploiement massif du FTTH et franchissement du cap des 2 millions de foyers connectés":
        "Algérie Télécom: نشر مكثف لشبكات FTTH وتجاوز حاجز مليوني منزل موصول",
    "Multiplication des débits par quatre et modernisation des réseaux d'accès pour les professionnels et particuliers à travers le territoire national.":
        "مضاعفة سرعات التدفق 4 مرات وتحديث شبكات الوصول للشركات والأفراد عبر كامل التراب الوطني.",

    // ✈️ VOYAGE & TOURISME
    "Saison touristique saharienne : Afflux record de visiteurs internationaux à Djanet et Taghit":
        "الموسم السياحي الصحراوي: إقبال قياسي للسياح الدوليين على جانت وتاغيت",
    "Facilitation des visas à l'arrivée et multiplication des vols directs entre l'Europe et le grand Sud algérien pour soutenir l'artisanat et l'hôtellerie locale.":
        "تسهيل التأشيرات عند الوصول وتكثيف الرحلات المباشرة بين أوروبا والجنوب الجزائري لدعم السياحة والصناعات التقليدية.",

    // 🏺 ARTISANAT & DESIGN
    "Artisanat et design contemporain : Les tapis de Ghardaïa et la poterie de Kabylie à l'honneur":
        "الصناعات التقليدية والتصميم المعاصر: الاحتفاء بزربية غرداية وفخار منطقة القبائل",
    "Exposition internationale célébrant le savoir-faire ancestral algérien combiné aux techniques de modélisation 3D modernes pour conquérir les marchés d'export.":
        "معرض دولي يحتفي بالحرف التقليدية الجزائرية الأصيلة المدمجة مع تقنيات النمذجة 3D لغزو أسواق التصدير.",

    // 🌍 MONDE & INTERNATIONAL
    "Partenariats transméditerranéens : Accélération des échanges universitaires et technologiques":
        "شراكات عبر المتوسط: تسريع التبادل الأكاديمي والتكنولوجي",
  };

  /// Traduit le texte vers l'arabe en préservant strictement les termes techniques et scientifiques
  static String translateToArabic(String text) {
    if (text.isEmpty) return text;

    // Si le texte est déjà principalement en arabe, le renvoyer
    final arabicChars = RegExp(r'[\u0600-\u06FF]').allMatches(text).length;
    if (arabicChars > text.length * 0.3) {
      return text;
    }

    final trimmed = text.trim();
    if (_exactTranslations.containsKey(trimmed)) {
      return _exactTranslations[trimmed]!;
    }

    // 1. Extraire et masquer les termes techniques
    final preservedTerms = <String>[];
    String masked = text.replaceAllMapped(_technicalTermsRegex, (match) {
      preservedTerms.add(match.group(0)!);
      return '__TECH_${preservedTerms.length - 1}__';
    });

    // 2. Remplacer les expressions courantes
    final phraseMap = <Pattern, String>{
      RegExp(r"Dépêche publiée par\s*", caseSensitive: false): "برقية إخبارية صادرة عن ",
      RegExp(r"Consultez l'article complet sur la source originale\.", caseSensitive: false): "طالع المقال الأصلي كاملاً عبر المصدر المباشر.",
      RegExp(r"Discussion et analyse technique publiée par", caseSensitive: false): "نقاش وتحليل تقني صادر عن",
      RegExp(r"Actualité internationale", caseSensitive: false): "أخبار دولية",
      RegExp(r"Sommet mondial sur", caseSensitive: false): "قمة عالمية حول",
      RegExp(r"Déploiement du projet", caseSensitive: false): "إطلاق مشروع",
      RegExp(r"Levée de fonds record", caseSensitive: false): "جولة تمويلية قياسية",
      RegExp(r"Conseil des ministres", caseSensitive: false): "مجلس الوزراء",
      RegExp(r"Banque d'Algérie", caseSensitive: false): "بنك الجزائر",
      RegExp(r"Grand Alger", caseSensitive: false): "الجزائر الكبرى",
      RegExp(r"Ministère de l'Intérieur", caseSensitive: false): "وزارة الداخلية",
      RegExp(r"Ministère de la Santé", caseSensitive: false): "وزارة الصحة",
      RegExp(r"Enseignement Supérieur", caseSensitive: false): "التعليم العالي",
      RegExp(r"Sécurité nationale", caseSensitive: false): "الأمن القومي",
      RegExp(r"Transition énergétique", caseSensitive: false): "الانتقال الطاقوي",
      RegExp(r"Énergies renouvelables", caseSensitive: false): "الطاقات المتجددة",
      RegExp(r"vulnerability", caseSensitive: false): "ثغرة أمنية",
      RegExp(r"vulnerabilities", caseSensitive: false): "ثغرات أمنية",
      RegExp(r"open source", caseSensitive: false): "مفتوح المصدر",
      RegExp(r"open-source", caseSensitive: false): "مفتوح المصدر",
      RegExp(r"framework", caseSensitive: false): "إطار عمل",
      RegExp(r"releases", caseSensitive: false): "يطلق رسمياً",
      RegExp(r"released", caseSensitive: false): "تم إطلاقه",
      RegExp(r"announces", caseSensitive: false): "يعلن عن",
      RegExp(r"unveils", caseSensitive: false): "يكشف النقاب عن",
      RegExp(r"new model", caseSensitive: false): "نموذج جديد",
      RegExp(r"artificial intelligence", caseSensitive: false): "الذكاء الاصطناعي",
      RegExp(r"machine learning", caseSensitive: false): "التعلم الآلي",
      RegExp(r"cybersecurity", caseSensitive: false): "الأمن السيبراني",
      RegExp(r"cybersécurité", caseSensitive: false): "الأمن السيبراني",
      RegExp(r"technologie", caseSensitive: false): "تكنولوجيا",
      RegExp(r"technology", caseSensitive: false): "تكنولوجيا",
      RegExp(r"numérique", caseSensitive: false): "رقمي",
      RegExp(r"digital", caseSensitive: false): "رقمي",
      RegExp(r"économie", caseSensitive: false): "اقتصاد",
      RegExp(r"economy", caseSensitive: false): "اقتصاد",
      RegExp(r"politique", caseSensitive: false): "سياسة",
      RegExp(r"politics", caseSensitive: false): "سياسة",
      RegExp(r"santé", caseSensitive: false): "صحة",
      RegExp(r"health", caseSensitive: false): "صحة",
      RegExp(r"sport", caseSensitive: false): "رياضة",
      RegExp(r"sports", caseSensitive: false): "رياضة",
      RegExp(r"culture", caseSensitive: false): "ثقافة",
      RegExp(r"science", caseSensitive: false): "علوم",
      RegExp(r"environnement", caseSensitive: false): "بيئة",
      RegExp(r"environment", caseSensitive: false): "بيئة",
      RegExp(r"éducation", caseSensitive: false): "تعليم",
      RegExp(r"education", caseSensitive: false): "تعليم",
    };

    phraseMap.forEach((pattern, replacement) {
      masked = masked.replaceAll(pattern, replacement);
    });

    // 3. Restaurer les termes techniques
    for (int i = 0; i < preservedTerms.length; i++) {
      masked = masked.replaceAll('__TECH_${i}__', preservedTerms[i]);
    }

    return masked;
  }

  /// Formatage d'ancienneté d'article en Arabe
  static String formatAgeArabic(DateTime publishedAt) {
    final diff = DateTime.now().difference(publishedAt);
    if (diff.inMinutes < 1) {
      return "الآن";
    } else if (diff.inMinutes < 60) {
      return "منذ ${diff.inMinutes} دقيقة";
    } else if (diff.inHours < 24) {
      if (diff.inHours == 1) return "منذ ساعة";
      if (diff.inHours == 2) return "منذ ساعتين";
      if (diff.inHours <= 10) return "منذ ${diff.inHours} ساعات";
      return "منذ ${diff.inHours} ساعة";
    } else {
      if (diff.inDays == 1) return "أمس";
      if (diff.inDays == 2) return "منذ يومين";
      if (diff.inDays <= 10) return "منذ ${diff.inDays} أيام";
      return "منذ ${diff.inDays} يوماً";
    }
  }
}
