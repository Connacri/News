import { Language, NewsArticle } from '../types';

// Persistent client-side translation cache
const TRANSLATION_CACHE_KEY = 'flutternews_translation_cache_v2';
const TRANSLATION_PREF_KEY = 'flutternews_translate_active';
const SAVED_LANG_KEY = 'flutternews_language';

// In-memory cache loaded from localStorage
let memoryCache: Record<string, { title: string; description: string; content?: string }> = {};

try {
  const stored = localStorage.getItem(TRANSLATION_CACHE_KEY);
  if (stored) {
    memoryCache = JSON.parse(stored);
  }
} catch (e) {
  memoryCache = {};
}

export function getSavedLanguage(): Language {
  try {
    const saved = localStorage.getItem(SAVED_LANG_KEY);
    if (saved && ['fr', 'en', 'es', 'de', 'ar', 'ja'].includes(saved)) {
      return saved as Language;
    }
  } catch {}
  return 'fr';
}

export function setSavedLanguage(lang: Language): void {
  try {
    localStorage.setItem(SAVED_LANG_KEY, lang);
  } catch {}
}

export function getTranslationPreference(): boolean {
  try {
    const saved = localStorage.getItem(TRANSLATION_PREF_KEY);
    return saved !== null ? JSON.parse(saved) : true;
  } catch {
    return true;
  }
}

export function setTranslationPreference(active: boolean): void {
  try {
    localStorage.setItem(TRANSLATION_PREF_KEY, JSON.stringify(active));
  } catch {}
}

/**
 * High-quality, authentic Arabic technical translations for standard news baseline
 */
const PRETRANSLATED_ARABIC: Record<string, { title: string; description: string; content: string }> = {
  'fr-mistral-ai-release': {
    title: 'ميسترال للذكاء الاصطناعي تطلق نموذجها الجديد مفتوح الأوزان للمطورين الأوروبيين',
    description: 'شركة الذكاء الاصطناعي الفرنسية تعلن عن معمارية خفيفة الوزن قادرة على العمل محلياً على خوادم سيادية بتوافق تام مع قانون الذكاء الاصطناعي الأوروبي.',
    content: `باريس، فرنسا — أعلنت شركة ميسترال للذكاء الاصطناعي (Mistral AI)، الرائدة ومقرها باريس، رسمياً عن إطلاق معماريتها الجديدة للنماذج مفتوحة الأوزان (open-weights).

صُمم هذا النموذج خصيصاً لتلبية المعايير الصارمة لسيادة البيانات وقانون الذكاء الاصطناعي الأوروبي (AI Act)، حيث يدمج آلية انتباه متقدمة (FlashAttention-3) تقلل من استهلاك ذاكرة الرسوميات VRAM بأكثر من 45% مقارنة بالإصدارات السابقة.

النقاط الرئيسية للإعلان:
1. النشر المحلي والسيادة التامة: يمكن تشغيل النموذج بالكامل على خوادم محلية دون تسريب أي بيانات إلى خارج الاتحاد الأوروبي.
2. الاستدلال عبر الهواتف والأجهزة الطرفية: بفضل تقنيات التكميم الحديثة (INT4 و FP8)، يتوافق النموذج مباشرة مع محركات تطبيقات فلاتر (Flutter) و ONNX Runtime للتشغيل على الهواتف دون الحاجة إلى اتصال دائم بالإنترنت.
3. التوافق الأخلاقي والتنظيمي: توفير وثائق كاملة ومفصلة لبيانات التدريب لضمان الشفافية ومطابقة معايير الهيئات التنظيمية.`
  },
  'fr-anssi-osint-bulletin': {
    title: 'وكالة أنسي وCERT-FR: تقرير عاجل حول ثغرات تستهدف البنى التحتية الحيوية',
    description: 'الوكالة الوطنية الفرنسية لأمن نظم المعلومات تنشر إرشادات الحماية وتحدد 14 ناقل هجوم يوم الصفر تم رصدها بمجسات أوسينت السيادية.',
    content: `باريس — أصدر المركز الحكومي لمراقبة وإنذار ومساعدة نظم المعلومات (CERT-FR) التابع لوكالة أنسي نشرة أمنية عالية الخطورة.

رصدت مجسات استخبارات المصادر المفتوحة (OSINT) حملة اختراقات موجهة تستغل ثغرات يوم الصفر في بوابات الوصول عن بُعد وأجهزة الشبكات الافتراضية الخاصة (VPN).

توصيات فورية:
- عزل مسارات الإدارة على شبكات VLAN مفصولة بالكامل.
- تطبيق قواعد التصفية والتحديثات الأمنية العاجلة خلال أقل من 24 ساعة وفقاً للتوجيهات التنظيمية NIS 2.`
  },
  'fr-ovhcloud-quantum': {
    title: 'OVHcloud وكانديلا تنشران أول خادم حوسبة كمية فوتونية في مركز بيانات أوروبي',
    description: 'إنجاز كبير للحوسبة السيادية: معالجة كمية متاحة عبر واجهة برمجة التطبيقات API ومدمجة في مجموعات الحوسبة فائقة الأداء.',
    content: `روبيه، فرنسا — خطت شركة OVHcloud خطوة تاريخية بدمج الحاسوب الكمي الفوتوني "MosaiQ" المصنع من شركة Quandela داخل مركز بياناتها.

يعمل هذا الحاسوب في درجة حرارة الغرفة دون الحاجة إلى أنظمة التبريد المعقدة بالهيليوم، مما يتيح للمطورين والباحثين تنفيذ خوارزميات المحاكاة الكيميائية والتشفير المتقدم عبر واجهات REST API.`
  },
  'dz-datacenter-sidi-abdellah': {
    title: 'اتصالات الجزائر والقطب السيبراني لسيدي عبد الله يدشنان مركز البيانات الوطني والسحابة السيادية',
    description: 'تدشين بنية تحتية عالية الأمان لاستضافة البيانات مصنفة Tier III/IV في الجزائر العاصمة، مخصصة للشركات الناشئة والمؤسسات والمنظومة الرقمية.',
    content: `الجزائر العاصمة — دشنت وزارة البريد والمواصلات السلكية واللاسلكية، بالشراكة مع اتصالات الجزائر والوكالة الوطنية لتطوير الحظائر التكنولوجية (ANPT)، مجمع مركز البيانات الوطني بالقطب التكنولوجي سيدي عبد الله.

أبرز الأهداف الاستراتيجية:
1. السيادة الرقمية الكاملة: استضافة البيانات البنكية والحكومية الحساسة محلياً على الأراضي الجزائرية.
2. سحابة للشركات الناشئة: توفير بيئات كوبرنيتيس (Kubernetes) وحوسبة سحابية لأكثر من 5000 شركة ناشئة جزائرية بفوترة بالدينار الجزائري (DZD).
3. ربط دولي فائق السرعة: اتصال مباشر بالكوابل البحرية الدولية في عنابة والجزائر العاصمة لتأمين سرعات اتصال قياسية نحو العالم.`
  },
  'dz-cerist-darija-llm': {
    title: 'سيريست وجامعة باب الزوار: إطلاق نموذج لغوي مفتوح المصدر للدارجة الجزائرية والأمازيغية',
    description: 'باحثون من جامعة هواري بومدين ومركز البحث في الإعلام العلمي والتقني بالجزائر يطلقون نموذج ذكاء اصطناعي مدرب على اللهجات واللغات المحلية.',
    content: `الجزائر العاصمة، باب الزوار — أطلقت فرق البحث بمركز سيريست وجامعة العلوم والتكنولوجيا هواري بومدين (USTHB) نموذج الذكاء الاصطناعي "DziriLM" مفتوح المصدر لمعالجة اللغات الطبيعية بالدارجة الجزائرية والأمازيغية.

المواصفات التقنية:
- تم التدريب على أكثر من 4 مليارات رمز من النصوص العامية والمكتوبة بالحروف العربية واللاتينية (العربيزي).
- معمارية موجهة للاستخدام الخفيف مع توافق كامل لتطبيقات الهاتف المحمول وإطار فلاتر (Flutter) دون استهلاك مفرط للموارد.`
  },
  'dz-satim-security-bulletin': {
    title: 'فريق الاستجابة السيبرانية بالجزائر: إرشادات أمنية لبوابات الدفع الإلكتروني ساتيم والبطاقة الذهبية',
    description: 'المركز الوطني للاستجابة لحوادث الأمن السيبراني ينشر دليلاً للتأمين التشفيري لتطبيقات التجارة الإلكترونية والمعاملات المالية عبر الهاتف.',
    content: `الجزائر العاصمة — مع تجاوز المعاملات الإلكترونية عبر بطاقة الذهبية وشبكة ساتيم لحاجز 100 مليون معاملة، أصدر الفريق الوطني للأمن السيبراني إرشادات أمنية إلزامية لتطبيقات الدفع.

تشمل التوجيهات تفعيل المصادقة الثنائية 3D-Secure 2.2، وتشفير بيانات البطاقات من النهاية إلى النهاية (E2EE) مع حظر تخزين أرقام البطاقات ورموز الأمان على خوادم التطبيقات.`
  },
  'maghreb-medusa-submarine-cable': {
    title: 'الكابل البحري ميدوزا: ربط ضخم بالألياف الضوئية يصل بين الجزائر، بنزرت، الناظور ومارسيليا',
    description: 'نقلة نوعية في قطاع الاتصالات تضاعف سرعات الإنترنت بمقدار 10 أضعاف وتعزز السيادة الرقمية لمنطقة المغرب العربي.',
    content: `مارسيليا / الجزائر / تونس / الرباط — حقق مشروع الكابل البحري Medusa إنجازاً استراتيجياً بإنزال خطوط الألياف الضوئية عالية الكثافة الرابطة بين محطات الإنزال في الجزائر العاصمة، بنزرت، الناظور ومارسيليا.

يوفر النظام سعة فائقة تتجاوز 480 تيرابت في الثانية، مما يدعم البنية التحتية للحوسبة السحابية ومراكز البيانات الإقليمية.`
  },
  'maghreb-open-banking-fintech': {
    title: 'المصرفية المفتوحة بالمغرب العربي: واجهات API مشتركة للدفع الفوري بين البنوك المغاربية',
    description: 'تكتل مصرفي مغاربي يطلق واجهة برمجة موحدة لمعاملات التكنولوجيا المالية والتحويلات المالية الفورية عبر الحدود.',
    content: `أعلنت جمعيات البنوك ومؤسسات التكنولوجيا المالية في المنطقة المغاربية عن إطلاق مبادرة المصرفية المفتوحة الموحدة (Maghreb Open Banking API). تتيح المبادرة للمطورين ربط تطبيقات الدفع والتجارة الإلكترونية عبر واجهات موحدة وآمنة.`
  },
  'cn-deepseek-inference-open': {
    title: 'ديب سيك تطلق محرك الاستدلال فائق السرعة مفتوح المصدر لمطوري فلاتر والأنظمة المدمجة',
    description: 'المختبر الصيني يشارك شفرة مصدرية متطورة لتسريع نماذج اللغة الكبيرة على بطاقات الرسوميات الاستهلاكية مع تخفيض تكلفة الاستدلال بنسبة 80%.',
    content: `هانغتشو، الصين — أعلنت شركة ديب سيك (DeepSeek) عن إتاحة محركها المتقدم للاستدلال السريع مفتوح المصدر للمطورين حول العالم.

المحرك مصمم لتسريع معالجة النماذج اللغوية على الحواسيب والهواتف الذكية مع تقليل استهلاك الذاكرة العشوائية وتوفير تكامل سلس مع تطبيقات فلاتر.`
  },
  'cn-shenzhen-photonic-breakthrough': {
    title: 'معهد شنتشن يسجل رقماً قياسياً عالمياً في شرائح المعالجة الضوئية للذكاء الاصطناعي',
    description: 'شريحة معالجة ضوئية متطورة تكسر حاجز سرعة الحسابات الرياضية بفضل نقل البيانات بالفوتونات الضوئية بدلاً من الإلكترونات.',
    content: `شنتشن، الصين — كشف باحثون في معهد التكنولوجيا المتقدمة عن شريحة معالجة ضوئية ثورية قادرة على إجراء العمليات الحسابية لمصفوفات الذكاء الاصطناعي بسرعة الضوء وبأقل استهلاك ممكن للطاقة.`
  },
  'cn-iot-industrial-security': {
    title: 'تحالف إنترنت الأشياء الصناعي ينشر إطاراً مفتوحاً لأمان أجهزة الحوسبة الطرفية Edge',
    description: 'مواصفة تقنية جديدة لمكافحة هجمات البرمجيات الخبيثة وشبكات البوت نت على أجهزة التحكم الذكية والمصانع المؤتمتة.',
    content: `بكين — أصدر التحالف الوطني لإنترنت الأشياء الصناعي معياراً برمجياً مفتوح المصدر لتأمين أجهزة الحوسبة الطرفية في المصانع وشبكات الطاقة ضد محاولات الاختراق وحقن البرمجيات الخبيثة.`
  },
  'us-flutter-3-update': {
    title: 'فريق فلاتر يطلق التحديث الثوري: دعم محرك Impeller ثلاثي الأبعاد والتحويل إلى WASM',
    description: 'إصدار جديد ومحسّن من إطار عمل فلاتر يقدم أداءً فائق السلاسة بمعدل 120 إطاراً في الثانية على أندرويد و iOS مع تحسينات جوهرية للمطورين.',
    content: `ماونتن فيو، كاليفورنيا — أعلن فريق فلاتر في جوجل عن التحديث الرئيسي الجديد للإطار.

الميزات الجديدة:
- محرك الرسوميات Impeller أصبح افتراضياً بالكامل لمنع التقطيع الرسومي وضمان 120 إطاراً بالثانية.
- دعم التحويل المباشر إلى WebAssembly (WASM) في تطبيقات الويب لتقديم أداء مقارب لتطبيقات سطح المكتب الأصلية.`
  },
  'us-cisa-advisory-cve': {
    title: 'وكالة CISA الأمريكية تصدر تحذيراً عاجلاً بشأن ثغرة استغلال عن بُعد في خوادم المؤسسات',
    description: 'إلزام جميع الهيئات والشركات بتطبيق التحديثات الأمنية فوراً لمواجهة ثغرة تؤثر على بروتوكولات المصادقة الشبكية.',
    content: `واشنطن — أدرجت وكالة الأمن السيبراني وأمن البنية التحتية الأمريكية (CISA) ثغرة جديدة في دليل الثغرات المعروفة والمستغلة، مؤكدة ضرورة تحديث الخوادم لتفادي استغلالها من قبل القراصنة.`
  },
  'us-github-copilot-workspace': {
    title: 'جيت هب تعلن عن مساحة عمل كوبايلوت المستقلة لتطوير المشاريع البرمجية كاملة',
    description: 'بيئة تطوير ذكية متكاملة تعتمد على الذكاء الاصطناعي لتحويل المشكلات البرمجية إلى خطط عمل وشفرات برمجية قابلة للاختبار والتطبيق المباشر.',
    content: `سان فرانسيسكو — أطلقت منصة GitHub مساحة العمل البرمجية الذكية "Copilot Workspace" التي تسمح للمبرمجين بالانتقال من مجرد فكرة أو بلاغ خطأ برمجية (Issue) إلى كود كامل ومختبر بخطوة واحدة.`
  },
  'de-bsi-quantum-crypto': {
    title: 'المكتب الاتحادي الألماني BSI يفرض معايير التشفير المقاوم للحوسبة الكمية',
    description: 'توجيهات جديدة تلزم بتحديث خوارزميات التشفير عبر البنوك والاتصالات لحماية البيانات ضد الهجمات المستقبلية للحواسيب الكمومية.',
    content: `بون، ألمانيا — نشر المكتب الاتحادي لأمن تكنولوجيا المعلومات دليلاً شاملاً يحدد خوارزميات التشفير ما بعد الكم (Post-Quantum Cryptography) الإلزامية للمؤسسات المالية والحكومية.`
  },
  'de-sap-open-source-kernel': {
    title: 'إس إيه بي تفتح مصدر نواة معالجة البيانات الضخمة عالية الأداء لمطوري السحابة',
    description: 'محرك قواعد بيانات مفتوح المصدر فائق السرعة يعتمد على معالجة البيانات في الذاكرة الحية (In-Memory) مع دعم بيئات كوبرنيتيس.',
    content: `فالدورف، ألمانيا — أعلنت شركة SAP عن تحويل نواة معالجة البيانات في الذاكرة إلى مشروع مفتوح المصدر لدعم مجتمع البرمجيات الحرة وتطبيقات الحوسبة السحابية الكبرى.`
  },
  'gb-deepmind-alpha-discovery': {
    title: 'ديب مايند في لندن تكشف عن خوارزمية ذكاء اصطناعي تكتشف مواد جديدة للبطاريات',
    description: 'استخدام نماذج التعلم العميق المتقدمة للتنبؤ بتركيبات بلورية مستقرة تفتح آفاقاً جديدة في تكنولوجيا الطاقة النظيفة والتخزين الكهربائي.',
    content: `لندن، المملكة المتحدة — كشف فريق أبحاث ديب مايند (Google DeepMind) عن خوارزمية جديدة قادرة على التنبؤ ببنى بلورية ومواد فائقة التوصيل تساهم في تسريع تطوير بطاريات الجيل القادم.`
  },
  'jp-tokyo-robotics-open-framework': {
    title: 'جامعة طوكيو تطلق إطار عمل مفتوح المصدر للروبوتات المستقلة والتحكم الحركي الدقيق',
    description: 'برمجيات مفتوحة المصدر تمكن المطورين من بناء وتوجيه روبوتات الخدمة الصناعية والطبية باستخدام مكتبات الذكاء الاصطناعي التوليدي ومحركات المحاكاة.',
    content: `طوكيو، اليابان — أطلق مختبر الروبوتات بجامعة طوكيو إطار عمل برمجي حر يربط بين الذكاء الاصطناعي البصري وأذرع الروبوتات الصناعية لتنفيذ مهام جراحية وصناعية بدقة متناهية.`
  },
  'osint-1': {
    title: 'حملة استغلال ثغرة تنفيذ الشفرات عن بُعد في خوادم المؤسسات',
    description: 'رصد هجمات استغلال أوتوماتيكية تستهدف بروتوكولات إدارة الشبكات في قطاعات حيوية.',
    content: 'يوصى بعزل الخوادم المتأثرة وتطبيق التحديث الأمني الصادر فوراً.'
  },
  'osint-2': {
    title: 'تسريب مفاتيح واجهات برمجة التطبيقات API في حزم البرمجيات مفتوحة المصدر',
    description: 'رصد مفاتيح سحابية مسربة في حزم تم نشرها مؤخراً على مستودعات عامة.',
    content: 'قم بإلغاء وتدوير جميع المفاتيح السرية واستخدام متغيرات البيئة المشفرة حصراً.'
  },
  'osint-3': {
    title: 'حملة تصيد متطورة تستهدف مطوري الهواتف وتطبيقات فلاتر',
    description: 'توزيع حزم دارت وهمية تهدف لسرقة بيانات المصادقة وبيانات الاعتماد.',
    content: 'تحقق من بصمة الحزم والمطورين المعتمدين على منصة pub.dev قبل تثبيت أي مكتبة.'
  }
};

/**
 * Returns persistently translated title and description for an article in target language
 */
export function getPersistentTranslation(
  article: NewsArticle,
  targetLang: Language
): { title: string; description: string; content?: string } {
  const cacheKey = `${article.id}_${targetLang}`;

  // 1. Check memory cache (loaded from localStorage)
  if (memoryCache[cacheKey]) {
    return memoryCache[cacheKey];
  }

  // 2. Check built-in Arabic translations
  if (targetLang === 'ar' && PRETRANSLATED_ARABIC[article.id]) {
    const res = PRETRANSLATED_ARABIC[article.id];
    saveToCache(cacheKey, res);
    return res;
  }

  // 3. If target is French
  if (targetLang === 'fr') {
    const res = {
      title: article.title,
      description: article.description,
      content: article.fullContent
    };
    saveToCache(cacheKey, res);
    return res;
  }

  // 4. If target is English
  if (targetLang === 'en') {
    const res = {
      title: article.translatedTitle || article.title,
      description: article.translatedDescription || article.description,
      content: article.translatedFullContent || article.fullContent
    };
    saveToCache(cacheKey, res);
    return res;
  }

  // 5. If translation has not been loaded yet, initiate dynamic server-side translation
  // and return high quality fallback while translation completes in background
  initiateBackgroundTranslation(article, targetLang);

  if (targetLang === 'ar') {
    // Elegant fallback while AI translates
    const fallbackTitle = PRETRANSLATED_ARABIC[article.id]?.title || article.title;
    const fallbackDesc = PRETRANSLATED_ARABIC[article.id]?.description || article.description;
    return {
      title: fallbackTitle,
      description: fallbackDesc,
      content: article.fullContent
    };
  }

  return {
    title: article.translatedTitle || article.title,
    description: article.translatedDescription || article.description,
    content: article.translatedFullContent || article.fullContent
  };
}

// Track ongoing requests to avoid duplicate network calls
const ongoingRequests = new Set<string>();

/**
 * Calls /api/translate in the background using Gemini AI and caches the result
 */
export async function initiateBackgroundTranslation(
  article: NewsArticle,
  targetLang: Language
): Promise<{ title: string; description: string; content?: string } | null> {
  const cacheKey = `${article.id}_${targetLang}`;

  if (memoryCache[cacheKey] || ongoingRequests.has(cacheKey)) {
    return memoryCache[cacheKey] || null;
  }

  ongoingRequests.add(cacheKey);

  try {
    const res = await fetch('/api/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: article.translatedTitle || article.title,
        description: article.translatedDescription || article.description,
        content: article.translatedFullContent || article.fullContent,
        targetLang
      })
    });

    if (res.ok) {
      const data = await res.json();
      if (data.title && data.description) {
        const result = {
          title: data.title,
          description: data.description,
          content: data.content || article.fullContent
        };
        saveToCache(cacheKey, result);

        // Notify UI to re-render in place smoothly
        if (typeof window !== 'undefined') {
          window.dispatchEvent(
            new CustomEvent('translation_updated', {
              detail: { articleId: article.id, lang: targetLang }
            })
          );
        }
        return result;
      }
    }
  } catch (err) {
    console.warn(`Dynamic translation failed for article [${article.id}]:`, err);
  } finally {
    ongoingRequests.delete(cacheKey);
  }

  return null;
}

function saveToCache(key: string, data: { title: string; description: string; content?: string }) {
  memoryCache[key] = data;
  try {
    localStorage.setItem(TRANSLATION_CACHE_KEY, JSON.stringify(memoryCache));
  } catch (e) {
    // Gently ignore storage quota
  }
}
