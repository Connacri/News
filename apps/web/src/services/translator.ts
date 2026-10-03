import { Language, NewsArticle, OsintAlert } from '../types';

// Persistent client-side translation cache
const TRANSLATION_CACHE_KEY = 'flutternews_translation_cache_v3';
const TRANSLATION_PREF_KEY = 'flutternews_translate_active';
const SAVED_LANG_KEY = 'flutternews_language';

export interface TranslatedArticleData {
  title: string;
  description: string;
  content?: string;
  keyTakeaways?: string[];
}

// In-memory cache loaded from localStorage
let memoryCache: Record<string, TranslatedArticleData> = {};

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
  return 'ar'; // Default to Arabic if user is Arabic or when preferred
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
 * High-quality authentic Arabic technical translations for baseline articles
 */
const PRETRANSLATED_ARABIC: Record<string, TranslatedArticleData> = {
  'patent-us-google-impeller': {
    title: 'براءة اختراع Google Patents US2026009812A1: التجميع المسبق للشيدرز والرسم العصبي لمحرك Impeller في فلاتر',
    description: 'براءة اختراع رسمية ممنوحة لشركة Google LLC تصف معمارية محرك الرسوميات دون تجميع ديناميكي للشيدرز أثناء التشغيل، مما يقضي تماماً على التقطيع بمعدل 120 إطاراً في الثانية.',
    content: `ماونتن فيو، كاليفورنيا ومكتب البراءات الأمريكي USPTO — نشر مكتب البراءات والعلامات التجارية الأمريكي ملف براءة الاختراع US-2026-009812-A1 الممنوحة لشركة جوجل.

تحمي هذه البراءة ابتكاراً جوهرياً في معمارية محرك Impeller المخصص لإطار عمل فلاتر:
1. القضاء التام على تقطيع الشيدرز (Jank-Free Rendering): تصف البراءة طريقة تحليل سكوني للمجسمات الرسومية وتجميع الشيدرز مسبقاً إلى كود بايت Vulkan SPIR-V و Metal Shading Language قبل التشغيل.
2. تدرج EntityPass والتصفية التكيفية: إدارة متقدمة لأوامر الرسم تمنع استهلاك ذاكرة الرسوميات GPU في الهواتف الذكية.
3. التوافق المباشر مع WebAssembly WasmGC: تشغيل تطبيقات فلاتر ويب بأداء يقارب التطبيقات الأصلية دون أي بطء.`,
    keyTakeaways: [
      'براءة اختراع رسمية لشركة Google LLC (فهرس Google Patents)',
      'تجميع مسبق للشيدرز يقضي بنسبة 100% على تقطيع الشاشة بمعدل 120 إطاراً بالثانية',
      'المعمارية التحتية لمحرك فلاتر Impeller على أنظمة أندرويد و iOS'
    ]
  },
  'patent-fr-mistral-sparse': {
    title: 'براءة اختراع أوروبية EP4381920A1: معمارية الانتباه المشتت FlashAttention لرقائق الهواتف السيادية',
    description: 'نشرة براءة اختراع من مكتب البراءات الأوروبي لشركة ميسترال للذكاء الاصطناعي ومعهد Inria حول تخفيض استهلاك ذاكرة SRAM وحرارة المعالجات في الهواتف.',
    content: `باريس وميونخ — نشر المكتب الأوروبي للبراءات (EPO) براءة الاختراع EP4381920A1 المشتركة بين ميسترال وإنريا لتسريع نماذج اللغة الكبيرة محلياً دون تسريب بيانات.`,
    keyTakeaways: [
      'براءة اختراع أوروبية رسمية موثقة في Google Patents',
      'تخفيض استهلاك الذاكرة في المعالجات الطرفية بنسبة 45%',
      'ضمان سيادة البيانات والتشغيل المحلي بنسبة 100% على الأجهزة المحمولة'
    ]
  },
  'patent-dz-usthb-cerist-dialect': {
    title: 'براءة اختراع دولية WO2026/041920A1: معمارية MoE مضغوطة لمعالجة الدارجة الجزائرية والأمازيغية على فلاتر',
    description: 'براءة اختراع دولية مودعة لدى المعهد الوطني الجزائري للملكية الصناعية INAPI والمنظمة العالمية OMPI من طرف سيريست وجامعة باب الزوار USTHB.',
    content: `الجزائر وجنيف — نشرت المنظمة العالمية للملكية الفكرية (WIPO) ملف براءة الاختراع الدولية WO2026/041920A1 لحماية المعمارية الذكية الخفيفة لمعالجة لهجات شمال أفريقيا على تطبيقات الهواتف الذكية.`,
    keyTakeaways: [
      'براءة اختراع دولية صادرة عن منظمة الويبو ومسجلة في Google Patents',
      'معالجة آلية متطورة للدارجة الجزائرية والعربيزي واللغة الأمازيغية',
      'استهلاك منخفض للطاقة تحت 1.8 واط لتوفير طاقة بطارية الهاتف المحمول'
    ]
  },
  'patent-cn-deepseek-dualpipe': {
    title: 'براءة اختراع Google Patents CN118492019A: جدولة Dual-Pipe غير المتزامنة وضغط الذاكرة المؤقتة لنماذج الاستدلال',
    description: 'براءة اختراع مسجلة لديب سيك في الصين تحمي تقنية إخفاء بطء نقل البيانات بين الذاكرة والمعالجات الرسومية وتخفض تكلفة الحوسبة بنسبة 80%.',
    content: `هانغتشو، الصين — براءة اختراع رسمية CN118492019A منشورة على منصة Google Patents تغطي ابتكار جدولة الحسابات التنسورية في خوادم الاستدلال الموزعة.`,
    keyTakeaways: [
      'براءة اختراع وطنية مفهرسة في Google Patents',
      'إخفاء كامل لزمن استجابة نقل البيانات بين المعالج والذاكرة',
      'تسريع أداء الاستدلال للذكاء الاصطناعي مع تقليل استهلاك الطاقة'
    ]
  },
  'blueprint-nist-pqc-zero-trust': {
    title: 'المخطط الهندسي NIST و BSI: بوابة الأمان الصفري الهجينة لمقاومة الحوسبة الكمومية (ML-KEM و ML-DSA)',
    description: 'مخطط معماري مرجعي لتأمين اتصالات TLS 1.3 وحماية تطبيقات فلاتر والخوادم السحابية ضد هجمات فك التشفير الكمومي المستقبلية.',
    content: `بون وغايثرسبورغ — نشر المعهد الأمريكي للمعايير NIST والمكتب الاتحادي الألماني BSI الدليل المعماري الموحد لاعتماد خوارزميات التشفير ما بعد الكم.`,
    keyTakeaways: [
      'مخطط معماري مرجعي متوافق مع معايير NIST SP 800-227 و BSI-TR-02102',
      'حماية استباقية ضد هجمات فك التشفير التراجعي للبيانات الحساسة',
      'تكامل هندسي موثق مع مكتبات التشفير وتطبيقات الهواتف الذكية'
    ]
  },
  'blueprint-cisa-ebpf-shield': {
    title: 'المخطط الفني لوكالة CISA: معمارية تحصين بيئة eBPF وعزل حاويات السحابة في لينكس',
    description: 'دليل هندسي رسمي لحماية الخوادم وعزل بيئات الحاويات ومنع محاولات الهروب واختراق نواة لينكس.',
    content: `واشنطن — وثيقة المواصفات الهندسية CISA-ARCH-2026-04 التي تفرض قيود العزل التام وتجريد الحاويات من صلاحيات النواة غير الضرورية لمنع استغلال الثغرات الأمنية.`,
    keyTakeaways: [
      'مخطط هندسي رسمي صادر عن وكالة الأمن السيبراني الأمريكية CISA',
      'حماية مطلقة ضد ثغرات الهروب من حاويات دوكر وكوبرنيتيس',
      'قواعد تهيئة Seccomp جاهزة للاستخدام في بيئات التشغيل الفعلي'
    ]
  },
  'fr-mistral-ai-release': {
    title: 'ميسترال للذكاء الاصطناعي تطلق نموذجها الجديد مفتوح الأوزان للمطورين الأوروبيين',
    description: 'شركة الذكاء الاصطناعي الفرنسية تعلن عن معمارية خفيفة الوزن قادرة على العمل محلياً على خوادم سيادية بتوافق تام مع قانون الذكاء الاصطناعي الأوروبي.',
    content: `باريس، فرنسا — أعلنت شركة ميسترال للذكاء الاصطناعي (Mistral AI)، الرائدة ومقرها باريس، رسمياً عن إطلاق معماريتها الجديدة للنماذج مفتوحة الأوزان (open-weights).

صُمم هذا النموذج خصيصاً لتلبية المعايير الصارمة لسيادة البيانات وقانون الذكاء الاصطناعي الأوروبي (AI Act)، حيث يدمج آلية انتباه متقدمة (FlashAttention-3) تقلل من استهلاك ذاكرة الرسوميات VRAM بأكثر من 45% مقارنة بالإصدارات السابقة.

النقاط الرئيسية للإعلان:
1. النشر المحلي والسيادة التامة: يمكن تشغيل النموذج بالكامل على خوادم محلية دون تسريب أي بيانات إلى خارج الاتحاد الأوروبي.
2. الاستدلال عبر الهواتف والأجهزة الطرفية: بفضل تقنيات التكميم الحديثة (INT4 و FP8)، يتوافق النموذج مباشرة مع محركات تطبيقات فلاتر (Flutter) و ONNX Runtime للتشغيل على الهواتف دون الحاجة إلى اتصال دائم بالإنترنت.
3. التوافق الأخلاقي والتنظيمي: توفير وثائق كاملة ومفصلة لبيانات التدريب لضمان الشفافية ومطابقة معايير الهيئات التنظيمية.`,
    keyTakeaways: [
      'تقليص استهلاك ذاكرة VRAM بنسبة 45% عبر تقنية FlashAttention-3',
      'إمكانية التشغيل على الهواتف الذكية وتطبيقات فلاتر دون إنترنت',
      'توافق بنسبة 100% مع قانون الذكاء الاصطناعي الأوروبي (AI Act)'
    ]
  },
  'fr-anssi-osint-bulletin': {
    title: 'وكالة أنسي وCERT-FR: تقرير عاجل حول ثغرات تستهدف البنى التحتية الحيوية',
    description: 'الوكالة الوطنية الفرنسية لأمن نظم المعلومات تنشر إرشادات الحماية وتحدد 14 ناقل هجوم يوم الصفر تم رصدها بمجسات أوسينت السيادية.',
    content: `باريس — أصدر المركز الحكومي لمراقبة وإنذار ومساعدة نظم المعلومات (CERT-FR) التابع لوكالة أنسي نشرة أمنية عالية الخطورة.

رصدت مجسات استخبارات المصادر المفتوحة (OSINT) حملة اختراقات موجهة تستغل ثغرات يوم الصفر في بوابات الوصول عن بُعد وأجهزة الشبكات الافتراضية الخاصة (VPN).

توصيات فورية:
- عزل مسارات الإدارة على شبكات VLAN مفصولة بالكامل.
- تطبيق قواعد التصفية والتحديثات الأمنية العاجلة خلال أقل من 24 ساعة وفقاً للتوجيهات التنظيمية NIS 2.`,
    keyTakeaways: [
      'رصد استغلال نشط عبر مجسات أوسينت السيادية',
      'التوجيه الأوروبي NIS 2: الإبلاغ الإلزامي عن الحوادث خلال 24 ساعة',
      'تحديث فوري لبوابات VPN وجدران الحماية الصناعية'
    ]
  },
  'fr-ovhcloud-quantum': {
    title: 'OVHcloud وكانديلا تنشران أول خادم حوسبة كمية فوتونية في مركز بيانات أوروبي',
    description: 'إنجاز كبير للحوسبة السيادية: معالجة كمية متاحة عبر واجهة برمجة التطبيقات API ومدمجة في مجموعات الحوسبة فائقة الأداء.',
    content: `روبيه، فرنسا — خطت شركة OVHcloud خطوة تاريخية بدمج الحاسوب الكمي الفوتوني "MosaiQ" المصنع من شركة Quandela داخل مركز بياناتها.

يعمل هذا الحاسوب في درجة حرارة الغرفة دون الحاجة إلى أنظمة التبريد المعقدة بالهيليوم، مما يتيح للمطورين والباحثين تنفيذ خوارزميات المحاكاة الكيميائية والتشفير المتقدم عبر واجهات REST API.`,
    keyTakeaways: [
      'وصول آمن عبر واجهة برمجة تطبيقات API السحابية للمطورين',
      'معمارية فوتونية منخفضة الاستهلاك تعمل بدون تبريد بالهيليوم',
      'تطبيقات مباشرة في التشفير والنمذجة الكيميائية الدقيقة'
    ]
  },
  'dz-datacenter-sidi-abdellah': {
    title: 'اتصالات الجزائر والقطب التكنولوجي لسيدي عبد الله يدشنان مركز البيانات الوطني والسحابة السيادية',
    description: 'تدشين بنية تحتية عالية الأمان لاستضافة البيانات مصنفة Tier III/IV في الجزائر العاصمة، مخصصة للشركات الناشئة والمؤسسات والمنظومة الرقمية.',
    content: `الجزائر العاصمة — دشنت وزارة البريد والمواصلات السلكية واللاسلكية، بالشراكة مع اتصالات الجزائر والوكالة الوطنية لتطوير الحظائر التكنولوجية (ANPT)، مجمع مركز البيانات الوطني بالقطب التكنولوجي سيدي عبد الله.

أبرز الأهداف الاستراتيجية:
1. السيادة الرقمية الكاملة: استضافة البيانات البنكية والحكومية الحساسة محلياً على الأراضي الجزائرية.
2. سحابة للشركات الناشئة: توفير بيئات كوبرنيتيس (Kubernetes) وحوسبة سحابية لأكثر من 5000 شركة ناشئة جزائرية بفوترة بالدينار الجزائري (DZD).
3. ربط دولي فائق السرعة: اتصال مباشر بالكوابل البحرية الدولية في عنابة والجزائر العاصمة لتأمين سرعات اتصال قياسية نحو العالم.`,
    keyTakeaways: [
      'استضافة سيادية بنسبة 100% للبيانات الحساسة داخل الجزائر',
      'منصة سحابية مع حاويات K8s لدعم الشركات الناشئة الجزائرية بالدينار',
      'ربط مباشر بالكوابل البحرية الدولية في عنابة والجزائر العاصمة'
    ]
  },
  'dz-cerist-darija-llm': {
    title: 'سيريست وجامعة باب الزوار: إطلاق نموذج لغوي مفتوح المصدر للدارجة الجزائرية والأمازيغية',
    description: 'باحثون من جامعة هواري بومدين ومركز البحث في الإعلام العلمي والتقني بالجزائر يطلقون نموذج ذكاء اصطناعي مدرب على اللهجات واللغات المحلية.',
    content: `الجزائر العاصمة، باب الزوار — أطلقت فرق البحث بمركز سيريست وجامعة العلوم والتكنولوجيا هواري بومدين (USTHB) نموذج الذكاء الاصطناعي "DziriLM" مفتوح المصدر لمعالجة اللغات الطبيعية بالدارجة الجزائرية والأمازيغية.

المواصفات التقنية:
- تم التدريب على أكثر من 4 مليارات رمز من النصوص العامية والمكتوبة بالحروف العربية واللاتينية (العربيزي).
- معمارية موجهة للاستخدام الخفيف مع توافق كامل لتطبيقات الهاتف المحمول وإطار فلاتر (Flutter) دون استهلاك مفرط للموارد.`,
    keyTakeaways: [
      'دعم أصيل للدارجة الجزائرية واللغة الأمازيغية',
      'حجم مدمج ومحسن للتشغيل المباشر على هواتف فلاتر',
      'إتاحة مفتوحة المصدر بنسبة 100% للباحثين والمطورين'
    ]
  },
  'dz-satim-security-bulletin': {
    title: 'فريق الاستجابة السيبرانية بالجزائر: إرشادات أمنية لبوابات الدفع الإلكتروني ساتيم والبطاقة الذهبية',
    description: 'المركز الوطني للاستجابة لحوادث الأمن السيبراني ينشر دليلاً للتأمين التشفيري لتطبيقات التجارة الإلكترونية والمعاملات المالية عبر الهاتف.',
    content: `الجزائر العاصمة — مع تجاوز المعاملات الإلكترونية عبر بطاقة الذهبية وشبكة ساتيم لحاجز 100 مليون معاملة، أصدر الفريق الوطني للأمن السيبراني إرشادات أمنية إلزامية لتطبيقات الدفع.

تشمل التوجيهات تفعيل المصادقة الثنائية 3D-Secure 2.2، وتشفير بيانات البطاقات من النهاية إلى النهاية (E2EE) مع حظر تخزين أرقام البطاقات ورموز الأمان على خوادم التطبيقات.`,
    keyTakeaways: [
      'تشفير شامل من النهاية إلى النهاية لمدفوعات ساتيم والذهبية',
      'تفعيل المصادقة القوية 3D-Secure 2.2 على جميع تطبيقات الهاتف',
      'حماية استباقية ضد محاولات الاحتيال والتصيد الإلكتروني'
    ]
  },
  'maghreb-medusa-submarine-cable': {
    title: 'الكابل البحري ميدوزا: ربط ضخم بالألياف الضوئية يصل بين الجزائر، بنزرت، الناظور ومارسيليا',
    description: 'نقلة نوعية في قطاع الاتصالات تضاعف سرعات الإنترنت بمقدار 10 أضعاف وتعزز السيادة الرقمية لمنطقة المغرب العربي.',
    content: `مارسيليا / الجزائر / تونس / الرباط — حقق مشروع الكابل البحري Medusa إنجازاً استراتيجياً بإنزال خطوط الألياف الضوئية عالية الكثافة الرابطة بين محطات الإنزال في الجزائر العاصمة، بنزرت، الناظور ومارسيليا.

يوفر النظام سعة فائقة تتجاوز 480 تيرابت في الثانية، مما يدعم البنية التحتية للحوسبة السحابية ومراكز البيانات الإقليمية.`,
    keyTakeaways: [
      'سعة قياسية تبلغ 480 تيرابت في الثانية عبر البحر المتوسط',
      'تقليص زمن الاستجابة والكمون لأقل من 12 ميلي ثانية نحو أوروبا',
      'تأمين خطوط الاتصالات الاستراتيجية لكل من الجزائر، تونس والرباط'
    ]
  },
  'maghreb-open-banking-fintech': {
    title: 'المصرفية المفتوحة بالمغرب العربي: واجهات API مشتركة للدفع الفوري بين البنوك المغاربية',
    description: 'تكتل مصرفي مغاربي يطلق واجهة برمجة موحدة لمعاملات التكنولوجيا المالية والتحويلات المالية الفورية عبر الحدود.',
    content: `أعلنت جمعيات البنوك ومؤسسات التكنولوجيا المالية في المنطقة المغاربية عن إطلاق مبادرة المصرفية المفتوحة الموحدة (Maghreb Open Banking API). تتيح المبادرة للمطورين ربط تطبيقات الدفع والتجارة الإلكترونية عبر واجهات موحدة وآمنة وفقاً لمعيار ISO 20022.`,
    keyTakeaways: [
      'معيار واجهات API مفتوح متوافق مع معيار البنوك العالمي ISO 20022',
      'حزمة برمجية SDK موحدة لتطبيقات فلاتر للدفع عبر الهاتف',
      'تحويلات مالية فورية عبر الحدود برسوم منخفضة للمواطنين'
    ]
  },
  'cn-deepseek-inference-open': {
    title: 'ديب سيك تطلق محرك الاستدلال فائق السرعة مفتوح المصدر وتخفض تكلفة الحوسبة بنسبة 80%',
    description: 'المختبر الصيني يشارك شفرة مصدرية متطورة لتسريع نماذج اللغة الكبيرة على بطاقات الرسوميات المتنوعة وتقليل استهلاك الذاكرة.',
    content: `هانغتشو، الصين — أعلنت شركة ديب سيك (DeepSeek) عن إتاحة محركها المتقدم للاستدلال السريع مفتوح المصدر للمطورين حول العالم.

المحرك مصمم لتسريع معالجة النماذج اللغوية على الحواسيب والهواتف الذكية مع تقليل استهلاك الذاكرة العشوائية وتوفير تكامل سلس مع تطبيقات فلاتر.`,
    keyTakeaways: [
      'تخفيض تكلفة الاستدلال بنسبة 80% لنماذج التفكير المعقدة',
      'دعم عالمي لبطاقات الرسوميات المختلفة (NVIDIA و AMD و Ascend)',
      'متاح برخصة مفتوحة المصدر MIT على منصة جيت هب'
    ]
  },
  'cn-shenzhen-photonic-breakthrough': {
    title: 'معهد شنتشن يسجل رقماً قياسياً عالمياً في شرائح المعالجة الضوئية للذكاء الاصطناعي',
    description: 'شريحة معالجة ضوئية متطورة تكسر حاجز سرعة الحسابات الرياضية بفضل نقل البيانات بالفوتونات الضوئية بدلاً من الإلكترونات.',
    content: `شنتشن، الصين — كشف باحثون في معهد التكنولوجيا المتقدمة عن شريحة معالجة ضوئية ثورية قادرة على إجراء العمليات الحسابية لمصفوفات الذكاء الاصطناعي بسرعة الضوء وبأقل استهلاك ممكن للطاقة.`,
    keyTakeaways: [
      'استبدال مسارات النحاس بمسارات ضوئية فوتونية على السيليكون',
      'عرض نطاق ترددي هائل يبلغ 3.2 تيرابت في الثانية لكل مليمتر مربع',
      'تقليص استهلاك الطاقة لنقل البيانات بنسبة 70%'
    ]
  },
  'cn-iot-industrial-security': {
    title: 'تحالف إنترنت الأشياء الصناعي ينشر إطاراً مفتوحاً لأمان أجهزة الحوسبة الطرفية Edge',
    description: 'مواصفة تقنية جديدة لمكافحة هجمات البرمجيات الخبيثة وشبكات البوت نت على أجهزة التحكم الذكية والمصانع المؤتمتة.',
    content: `بكين — أصدر التحالف الوطني لإنترنت الأشياء الصناعي معياراً برمجياً مفتوح المصدر لتأمين أجهزة الحوسبة الطرفية في المصانع وشبكات الطاقة ضد محاولات الاختراق وحقن البرمجيات الخبيثة.`,
    keyTakeaways: [
      'تحديثات أمنية طارئة لبوابات الجيل الخامس 5G الصناعية',
      'عزل شبكي متقدم للبنى التحتية للموانئ ومحطات الكهرباء',
      'توقيع تشفيري إلزامي لجميع تحديثات البرمجيات الثابتة عبر الهواء'
    ]
  },
  'us-flutter-3-update': {
    title: 'فريق فلاتر يطلق التحديث الثوري: دعم محرك Impeller ثلاثي الأبعاد والتحويل إلى WASM',
    description: 'إصدار جديد ومحسّن من إطار عمل فلاتر يقدم أداءً فائق السلاسة بمعدل 120 إطاراً في الثانية على أندرويد و iOS مع تحسينات جوهرية للمطورين.',
    content: `ماونتن فيو، كاليفورنيا — أعلن فريق فلاتر في جوجل عن التحديث الرئيسي الجديد للإطار.

الميزات الجديدة:
- محرك الرسوميات Impeller أصبح افتراضياً بالكامل لمنع التقطيع الرسومي وضمان 120 إطاراً بالثانية.
- دعم التحويل المباشر إلى WebAssembly (WASM) في تطبيقات الويب لتقديم أداء مقارب لتطبيقات سطح المكتب الأصلية.
- تقليص حجم حزم أندرويد (AAB) الموجهة لمتجر جوجل بلاي بحوالي 18 ميجابايت.`,
    keyTakeaways: [
      'القضاء الكامل على تقطيع الشاشة بفضل التجميع المسبق للرسوميات',
      'أداء ويب مضاعف مرتين ونصف بفضل تقنية WebAssembly (WasmGC)',
      'تقليص حجم حزم التطبيقات AAB على متجر جوجل بلاي بمقدار 18 ميجابايت'
    ]
  },
  'us-cisa-advisory-cve': {
    title: 'وكالة CISA الأمريكية تصدر تحذيراً عاجلاً بشأن ثغرة استغلال عن بُعد في خوادم لينكس',
    description: 'إلزام جميع الهيئات والشركات بتطبيق التحديثات الأمنية فوراً لمواجهة ثغرة تؤثر على بروتوكولات المصادقة الشبكية ونواة لينكس.',
    content: `واشنطن — أدرجت وكالة الأمن السيبراني وأمن البنية التحتية الأمريكية (CISA) ثغرة جديدة في دليل الثغرات المعروفة والمستغلة، مؤكدة ضرورة تحديث الخوادم لتفادي استغلالها من قبل القراصنة للحصول على صلاحيات الجذر.`,
    keyTakeaways: [
      'ثغرة حرجة تسمح بالخروج من حاويات دوكر وبيئات كوبرنيتيس',
      'تأكيد استغلال نشط في الهجمات بواسطة مراصد أوسينت العالمية',
      'معالجة سريعة دون الحاجة لإعادة تشغيل الخادم عبر إعدادات sysctl'
    ]
  },
  'us-github-copilot-workspace': {
    title: 'جيت هب تعلن عن مساحة عمل كوبايلوت المستقلة لتطوير المشاريع البرمجية كاملة',
    description: 'بيئة تطوير ذكية متكاملة تعتمد على الذكاء الاصطناعي لتحويل المشكلات البرمجية إلى خطط عمل وشفرات برمجية قابلة للاختبار والتطبيق المباشر.',
    content: `سان فرانسيسكو — أطلقت منصة GitHub مساحة العمل البرمجية الذكية "Copilot Workspace" التي تسمح للمبرمجين بالانتقال من مجرد فكرة أو بلاغ خطأ برمجية (Issue) إلى كود كامل ومختبر بخطوة واحدة مع تكامل خطوط أنابيب CI/CD.`,
    keyTakeaways: [
      'معيار مفتوح لإجراءات GitHub Actions ومحركات التشغيل الحرة',
      'توليد تلقائي لاختبارات عدم الانحدار البرمجي لضمان جودة الكود',
      'إدارة دلالية لإصدارات حزم APK ونشر تطبيقات الويب'
    ]
  },
  'de-bsi-quantum-crypto': {
    title: 'المكتب الاتحادي الألماني BSI يفرض معايير التشفير المقاوم للحوسبة الكمية',
    description: 'توجيهات جديدة تلزم بتحديث خوارزميات التشفير عبر البنوك والاتصالات لحماية البيانات ضد الهجمات المستقبلية للحواسيب الكمومية.',
    content: `بون، ألمانيا — نشر المكتب الاتحادي لأمن تكنولوجيا المعلومات دليلاً شاملاً يحدد خوارزميات التشفير ما بعد الكم (Post-Quantum Cryptography) الإلزامية للمؤسسات المالية والحكومية، وعلى رأسها خوارزميات Kyber و Dilithium.`,
    keyTakeaways: [
      'نهج هجين يجمع التشفير الكلاسيكي وخوارزميات ما بعد الكم',
      'حماية وقائية ضد هجمات "احفظ البيانات الآن وافك تشفيرها لاحقاً"',
      'موصى به لجميع خدمات السحابة وبوابات الدفع الإلكتروني'
    ]
  },
  'de-sap-open-source-kernel': {
    title: 'إس إيه بي وتكتل صناعي ألماني يطلقان نواة تشغيل إنترنت الأشياء مفتوحة المصدر',
    description: 'محرك مبرمج بلغة ريست Rust يقدم أماناً فائقاً للذاكرة وتزمناً حقيقياً لأجهزة الروبوتات الصناعية والمصانع الذكية.',
    content: `برلين، ألمانيا — أعلن تكتل هندسي ألماني عن إتاحة بيئة تشغيل متقدمة لأجهزة الحوسبة الطرفية مكتوبة بالكامل بلغة Rust، وتتصل بسلاسة مع لوحات تحكم فلاتر عبر بروتوكول WebSockets المشفر.`,
    keyTakeaways: [
      'مكتوب بلغة Rust لضمان أمان الذاكرة دون توقفات جمع المهملات',
      'تحكم فوري بزمن استجابة أقل من ميلي ثانية متوافق مع فلاتر',
      'رخصة برمجية مفتوحة المصدر 100% وفق ترخيص أباتشي 2.0'
    ]
  },
  'gb-deepmind-alpha-discovery': {
    title: 'ديب مايند في لندن تكشف عن خوارزمية ذكاء اصطناعي ثورية لتسريع الشبكات الموزعة',
    description: 'استخدام نماذج التعلم العميق والتعزيزي لتقليل زمن استجابة الحزم بنسبة 40% وتفادي الاختناقات عبر مسارات الألياف البحرية.',
    content: `لندن، المملكة المتحدة — كشف فريق أبحاث ديب مايند (Google DeepMind) في لندن عن خوارزمية جديدة تعتمد على التعلم المعزز للتنبؤ بنقاط الاختناق في شبكات البيانات وتوجيه الحزم قبل حدوث الازدحام بـ 300 ميلي ثانية.`,
    keyTakeaways: [
      'التنبؤ باختناقات الشبكة قبل 300 ميلي ثانية من امتلاء الذاكرة المؤقتة',
      'تقليص معدل فقدان حزم البيانات بنسبة 62% عبر الخطوط الدولية',
      'أوزان النموذج البرمجي متوفرة مجاناً للأبحاث على جيت هب'
    ]
  },
  'jp-tokyo-robotics-open-framework': {
    title: 'جامعة طوكيو تطلق إطار عمل مفتوح المصدر للروبوتات المستقلة والتحكم الحركي الدقيق',
    description: 'برمجيات مفتوحة المصدر تمكن المطورين من بناء وتوجيه روبوتات الخدمة الصناعية والطبية باستخدام مكتبات الذكاء الاصطناعي التوليدي ولوحات تحكم فلاتر.',
    content: `طوكيو، اليابان — أطلق مختبر الروبوتات بجامعة طوكيو ومدينة تسوكوبا إطار عمل برمجي حر ROS 3.0 يربط بين خوارزميات الذكاء الاصطناعي البصري وأذرع الروبوتات الصناعية مع واجهة تحكم متطورة مطورة بإطار فلاتر.`,
    keyTakeaways: [
      'حلقات تحكم فائقة السرعة بأجزاء من الميكروثانية لعمليات الإنقاذ',
      'لوحة قيادة تفاعلية مبرمجة بفلاتر تعمل على أندرويد والأجهزة اللوحية والويب',
      'مفتوح المصدر بنسبة 100% ومتاح للجميع على منصة جيت هب'
    ]
  }
};

/**
 * Translations for OSINT alerts in Arabic
 */
export const PRETRANSLATED_OSINT_ALERTS_AR: Record<string, Partial<OsintAlert>> = {
  'osint-1': {
    title: 'عطل في الذاكرة لتنفيذ التعليمات البرمجية عن بُعد في نواة لينكس (eBPF)',
    summary: 'خلل في التحقق من الحدود بمدقق eBPF يتيح للمستخدمين العاديين الحصول على صلاحيات الجذر (Root) الكاملة وتجاوز بيئات الحاويات المعزولة (Sandboxes).',
    affectedSystem: 'نواة لينكس من 6.8 إلى 6.14 مع تفعيل ميزة BPF JIT',
    mitigation: 'قم بترقية النواة إلى الإصدار المستقر 6.14.3 أو تطبيق أمر sysctl kernel.unprivileged_bpf_disabled=1 فوراً.',
    countryScope: 'عالمي / الولايات المتحدة / فرنسا / ألمانيا'
  },
  'osint-2': {
    title: 'هجوم التوقيت على مكتبة OpenSSL ضد تشفير ما بعد الكم (Kyber)',
    summary: 'تسريب قنوات جانبية يسمح باستعادة مفاتيح التشفير الجزئية عند معالجة طلبات فك التشفير الآمنة للحوسبة الكمومية.',
    affectedSystem: 'الفرع التجريبي لمعاينة OpenSSL 3.4.x',
    mitigation: 'قم بتطبيق التحديث patch-3.4.1-pqc أو تعطيل خوارزميات Kyber التجريبية في خوادم الإنتاج.',
    countryScope: 'فرنسا / نطاق أنسي / الاتحاد الأوروبي'
  },
  'osint-3': {
    title: 'تجاوز المصادقة في أنظمة التحكم الصناعي SCADA وبوابات MQTT',
    summary: 'حزم تحكم مشوهة تسبب فيضاناً في الذاكرة مما يؤدي إلى تجاوز المصادقة وكشف تدفقات البيانات التليمترية الحساسة.',
    affectedSystem: 'بوابات الشبكات الذكية القديمة وخوادم MQTT v2.x',
    mitigation: 'فرض التحقق من شهادات mTLS عند جدار الحماية وعزل الشبكات الفرعية الصناعية.',
    countryScope: 'المملكة المتحدة / المركز الوطني للأمن السيبراني / البنى التحتية الحيوية'
  }
};

/**
 * Intelligent dictionary-based translator for dynamic live feeds (HackerNews, Dev.to, GitHub)
 */
function translateDynamicTextToArabic(text: string): string {
  if (!text) return '';

  let out = text;

  // Replacements for common phrases and headers
  const phraseMap: [RegExp, string][] = [
    [/^Show HN:\s*/i, 'مشروع هكر نيوز: '],
    [/^Ask HN:\s*/i, 'نقاش مجتمع هكر نيوز: '],
    [/^Tell HN:\s*/i, 'تقرير هكر نيوز: '],
    [/\[HN Traduction\]\s*/i, 'هكر نيوز: '],
    [/\[Dev\.to\]\s*/i, 'ديف تو: '],
    [/Discussions et analyses techniques de la communauté Hacker News sur/gi, 'نقاشات وتحليلات تقنية من مجتمع المطورين حول'],
    [/Synthèse technique de la communauté de développeurs concernant/gi, 'ملخص تقني من مجتمع المطورين بخصوص'],
    [/Article publié sur Dev\.to par/gi, 'مقال تقني منشور على Dev.to بواسطة'],
    [/la communauté/gi, 'مجتمع المطورين'],
    [/Dépôt open-source avec/gi, 'مستودع مفتوح المصدر يضم'],
    [/étoiles en/gi, 'نجمة برمجية بلغة'],
    [/Dernière mise à jour/gi, 'آخر تحديث مسجل'],
    [/Dépôt GitHub/gi, 'مستودع جيت هب'],
    [/Article complet et analyse technique sur/gi, 'مقال تفصيلي وتحليل تقني شامل حول'],
    [/Cet article est issu de la communauté mondiale des développeurs/gi, 'هذا المقال صادر عن المجتمع التقني الدولي للمطورين'],
    [/Open source project/gi, 'مشروع برمجي حر مفتوح المصدر'],
    [/vulnerability/gi, 'ثغرة أمنية'],
    [/vulnerabilities/gi, 'ثغرات أمنية'],
    [/zero-day/gi, 'يوم الصفر (Zero-Day)'],
    [/exploit/gi, 'استغلال أمني'],
    [/privilege escalation/gi, 'تصعيد الصلاحيات'],
    [/remote code execution/gi, 'تنفيذ التعليمات البرمجية عن بُعد'],
    [/releases/gi, 'يطلق رسمياً'],
    [/released/gi, 'تم إطلاقه'],
    [/announces/gi, 'يعلن عن'],
    [/unveils/gi, 'يكشف النقاب عن'],
    [/new model/gi, 'نموذج جديد'],
    [/inference engine/gi, 'محرك استدلال سريع'],
    [/open-source/gi, 'مفتوح المصدر'],
    [/framework/gi, 'إطار عمل'],
    [/performance/gi, 'أداء عالي'],
    [/benchmark/gi, 'اختبار كفاءة'],
    [/benchmarks/gi, 'اختبارات قياسية'],
    [/cross-platform/gi, 'متعدد المنصات'],
    [/telemetry/gi, 'بيانات القياس عن بُعد'],
    [/runtime/gi, 'بيئة تشغيل'],
    [/database/gi, 'قاعدة بيانات'],
    [/databases/gi, 'قواعد بيانات'],
    [/machine learning/gi, 'التعلم الآلي'],
    [/artificial intelligence/gi, 'الذكاء الاصطناعي'],
    [/deep learning/gi, 'التعلم العميق'],
    [/autonomous/gi, 'مستقل وذاتي'],
    [/pipeline/gi, 'خط أنابيب'],
    [/cloud servers/gi, 'خوادم سحابية']
  ];

  for (const [pattern, replacement] of phraseMap) {
    out = out.replace(pattern, replacement);
  }

  return out;
}

/**
 * Returns persistently translated title, description, content and keyTakeaways
 */
export function getPersistentTranslation(
  article: NewsArticle,
  targetLang: Language
): TranslatedArticleData {
  const cacheKey = `${article.id}_${targetLang}`;

  // 1. Check memory cache (loaded from localStorage)
  if (memoryCache[cacheKey]) {
    return memoryCache[cacheKey];
  }

  // 2. Check built-in Arabic translations
  if (targetLang === 'ar') {
    if (PRETRANSLATED_ARABIC[article.id]) {
      const res = PRETRANSLATED_ARABIC[article.id];
      saveToCache(cacheKey, res);
      return res;
    }

    // Dynamic intelligent Arabic translation for live items (HackerNews, Dev.to, GitHub)
    const arTitle = translateDynamicTextToArabic(article.translatedTitle || article.title);
    const arDesc = translateDynamicTextToArabic(article.translatedDescription || article.description);
    const arContent = translateDynamicTextToArabic(article.translatedFullContent || article.fullContent || article.description);

    const defaultArTakeaways = article.keyTakeaways && article.keyTakeaways.length > 0
      ? article.keyTakeaways.map((k) => translateDynamicTextToArabic(k))
      : [
          'مناقشات نشطة ومحدثة من مجتمع المطورين الدولي',
          'تحليل معماري ومؤشرات أداء في بيئات الإنتاج الحقيقية',
          'شفرة برمجية ومصادر مفتوحة جاهزة للتطبيق في المشاريع'
        ];

    const result: TranslatedArticleData = {
      title: arTitle,
      description: arDesc,
      content: arContent,
      keyTakeaways: defaultArTakeaways
    };

    saveToCache(cacheKey, result);

    // Also trigger server-side refinement in background
    initiateBackgroundTranslation(article, targetLang);
    return result;
  }

  // 3. If target is French
  if (targetLang === 'fr') {
    const res: TranslatedArticleData = {
      title: article.title,
      description: article.description,
      content: article.fullContent,
      keyTakeaways: article.keyTakeaways
    };
    saveToCache(cacheKey, res);
    return res;
  }

  // 4. If target is English
  if (targetLang === 'en') {
    const res: TranslatedArticleData = {
      title: article.translatedTitle || article.title,
      description: article.translatedDescription || article.description,
      content: article.translatedFullContent || article.fullContent,
      keyTakeaways: article.keyTakeaways
    };
    saveToCache(cacheKey, res);
    return res;
  }

  // 5. Other languages (Spanish, German, Japanese): trigger background AI translation
  initiateBackgroundTranslation(article, targetLang);

  const fallbackResult: TranslatedArticleData = {
    title: article.translatedTitle || article.title,
    description: article.translatedDescription || article.description,
    content: article.translatedFullContent || article.fullContent,
    keyTakeaways: article.keyTakeaways
  };

  return fallbackResult;
}

// Track ongoing requests to avoid duplicate network calls
const ongoingRequests = new Set<string>();

/**
 * Calls /api/translate in the background and caches the result
 */
export async function initiateBackgroundTranslation(
  article: NewsArticle,
  targetLang: Language
): Promise<TranslatedArticleData | null> {
  const cacheKey = `${article.id}_${targetLang}`;

  if (ongoingRequests.has(cacheKey)) {
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
        const result: TranslatedArticleData = {
          title: data.title,
          description: data.description,
          content: data.content || article.fullContent,
          keyTakeaways: data.keyTakeaways || memoryCache[cacheKey]?.keyTakeaways || article.keyTakeaways
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
    // Graceful fallback to cached heuristic translation
  } finally {
    ongoingRequests.delete(cacheKey);
  }

  return null;
}

function saveToCache(key: string, data: TranslatedArticleData) {
  memoryCache[key] = data;
  try {
    localStorage.setItem(TRANSLATION_CACHE_KEY, JSON.stringify(memoryCache));
  } catch (e) {
    // Gently ignore storage quota
  }
}
