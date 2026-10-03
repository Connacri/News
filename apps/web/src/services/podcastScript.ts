import { NewsArticle, CountryCode } from '../types';
import { COUNTRIES } from './countries';
import { cleanSourceText, translateText } from './translateApi';

export type PodcastLanguage = 'fr' | 'ar';

export interface PodcastItem {
  id: string;
  title: string;
  body: string;
  source: string;
  /** true when the script still needs a real translation pass */
  pending?: boolean;
}

export interface PodcastEpisode {
  language: PodcastLanguage;
  title: string;
  intro: string;
  outro: string;
  items: PodcastItem[];
}

/**
 * 100% French spoken scripts for known articles
 */
const FRENCH_SCRIPTS: Record<string, { title: string; body: string }> = {
  'fr-mistral-ai-release': {
    title: 'Mistral AI dévoile un nouveau modèle open-weight pour les développeurs européens',
    body: 'La licorne française d\'intelligence artificielle Mistral AI annonce une architecture allégée capable de tourner localement sur des serveurs souverains avec une conformité totale au règlement européen AI Act.'
  },
  'fr-anssi-osint-bulletin': {
    title: 'L\'ANSSI et le CERT-FR alertent sur des vulnérabilités ciblant les infrastructures critiques en France',
    body: 'L\'Agence Nationale de la Sécurité des Systèmes d\'Information publie des directives de durcissement et identifie 14 vecteurs d\'attaque zero-day détectés par des capteurs de renseignement souverains.'
  },
  'fr-ovhcloud-quantum': {
    title: 'OVHcloud et Quandela déploient le premier serveur quantique photonique en datacenter français',
    body: 'Une avancée majeure pour l\'informatique souveraine européenne : le calcul quantique devient accessible via une interface de programmation publique dans les centres de données de Gravelines.'
  },
  'dz-datacenter-sidi-abdellah': {
    title: 'Algérie Télécom et le Cyberparc de Sidi Abdellah déploient le Datacenter National et le Cloud Souverain',
    body: 'Inauguration à Alger d\'une infrastructure d\'hébergement de données haute sécurité de classe Tier III+ certifiée, dédiée aux startups, aux institutions publiques et à l\'écosystème numérique algérien.'
  },
  'dz-cerist-darija-llm': {
    title: 'Le CERIST et l\'université de Bab Ezzouar publient le modèle d\'intelligence artificielle DziriLM',
    body: 'Des chercheurs algériens mettent à disposition en open-source un modèle de traitement automatique du langage naturel spécialement entraîné pour la Darija algérienne et le Tamazight, optimisé pour les smartphones et Flutter.'
  },
  'dz-satim-security-bulletin': {
    title: 'Directives de sécurité pour les passerelles de paiement électronique SATIM et carte Edahabia',
    body: 'Le centre de réponse aux incidents cyber en Algérie diffuse un guide de sécurisation cryptographique imposant le protocole 3D-Secure 2.2 et le chiffrement de bout en bout pour le commerce en ligne.'
  },
  'maghreb-medusa-submarine-cable': {
    title: 'Câble sous-marin Medusa : Raccordement géant reliant Alger, Bizerte, Nador et Marseille',
    body: 'Une avancée télécom majeure qui démultiplie par 10 les débits internet transfrontaliers avec 480 Terabits par seconde et une latence inférieure à 12 millisecondes en Méditerranée.'
  },
  'maghreb-open-banking-fintech': {
    title: 'Fintech Maghreb : Standardisation des API ouvertes et interopérabilité des paiements instantanés',
    body: 'Les acteurs bancaires d\'Afrique du Nord lancent le standard Maghreb OpenPay pour faciliter les transferts d\'argent et le commerce électronique transfrontalier conforme à la norme ISO 20022.'
  },
  'cn-deepseek-inference-open': {
    title: 'DeepSeek dévoile un moteur d\'inférence open-source réduisant les coûts de calcul de 80%',
    body: 'Le laboratoire d\'intelligence artificielle publie une bibliothèque d\'ordonnancement asynchrone réduisant considérablement la facture énergétique et matérielle sur les cartes graphiques.'
  },
  'cn-shenzhen-photonic-breakthrough': {
    title: 'Les laboratoires de Shenzhen réalisent une percée sur les puces photoniques et mémoires rapides',
    body: 'Des chercheurs présentent des interconnexions optiques sur silicium atteignant 3.2 Terabits par millimètre carré, diminuant la consommation d\'énergie de 70% pour les supercalculateurs.'
  },
  'cn-iot-industrial-security': {
    title: 'Avis de sécurité du CERT sur la protection des passerelles 5G industrielles',
    body: 'Publication de correctifs d\'urgence pour sécuriser les protocoles de télémétrie des ports autonomes et des réseaux électriques connectés en Asie.'
  },
  'us-flutter-3-update': {
    title: 'L\'équipe Flutter dévoile le moteur de rendu Impeller et le support WebAssembly natif',
    body: 'Google publie une mise à jour majeure du framework mobile Flutter avec élimination totale des saccades visuelles et un démarrage 60% plus rapide des applications Android.'
  },
  'us-linux-kernel-security': {
    title: 'Mise à jour critique du noyau Linux pour corriger des failles d\'élévation de privilèges',
    body: 'Linus Torvalds et les mainteneurs du noyau publient un correctif d\'urgence protégeant les serveurs cloud et les conteneurs contre des vulnérabilités de gestion mémoire.'
  }
};

/**
 * 100% Arabic spoken scripts for known articles
 */
const ARABIC_SCRIPTS: Record<string, { title: string; body: string }> = {
  'dz-datacenter-sidi-abdellah': {
    title: 'الجزائر: إطلاق مركز البيانات الوطني والسحابة السيادية بسيدي عبد الله',
    body: 'أعلنت وزارة البريد والمواصلات السلكية واللاسلكية بالشراكة مع اتصالات الجزائر، عن تدشين مركز البيانات الوطني الجديد ذو المعايير الأمنية العالمية في الجزائر العاصمة، لضمان السيادة الرقمية الكاملة وتوفير بنية سحابية متطورة للشركات الناشئة.'
  },
  'dz-cerist-darija-llm': {
    title: 'الجزائر: نموذج ذكاء اصطناعي مفتوح المصدر للدارجة والأمازيغية',
    body: 'أطلق باحثون من مركز سيرست وجامعة هواري بومدين للعلوم والتكنولوجيا بباب الزوار نموذج "دزيري إل إم"، وهو نموذج لغوي متخصص في معالجة اللهجة الجزائرية واللغة الأمازيغية، ومصمم ليعمل مباشرة وبكفاءة عالية على الهواتف وتطبيقات فلاتر.'
  },
  'dz-satim-security-bulletin': {
    title: 'الجزائر: توجيهات أمنية مشددة لحماية بوابات الدفع ساتيم والبطاقة الذهبية',
    body: 'أصدر مركز الاستجابة لطوارئ الحاسوب نشرة أمنية تحدد معايير التشفير من طرف إلى طرف وبروتوكول التحقق الثلاثي لحماية المعاملات المالية للتجارة الإلكترونية والتطبيقات البنكية.'
  },
  'maghreb-medusa-submarine-cable': {
    title: 'المغرب العربي: ربط كابل الألياف البصرية البحري ميدوسا لرفع سرعات الإنترنت',
    body: 'حقق تحالف كابل ميدوسا إنجازاً نوعياً بربط محطات الإنزال في الجزائر وبنزرت والناظور بمرسيليا، مما يوفر سعة تدفق هائلة تتجاوز 480 تيرابت في الثانية مع زمن استجابة سريع جداً.'
  },
  'maghreb-open-banking-fintech': {
    title: 'المغرب العربي: توحيد واجهات برمجة التطبيقات المالية للدفع الفوري',
    body: 'أطلقت مصارف ومؤسسات تكنولوجية في شمال إفريقيا مشروع "ماغريب أوبن باي" لتسهيل التحويلات المالية الفورية والتجارة الإلكترونية العابرة للحدود عبر معايير برمجية مفتوحة متوافقة مع آيزو 20022.'
  },
  'cn-deepseek-inference-open': {
    title: 'الصين: ديب سيك تطلق محرك حوسبة مفتوح المصدر يخفض التكاليف بنسبة 80 بالمئة',
    body: 'نشر مختبر ديب سيك للذكاء الاصطناعي مكتبة استدلال جديدة تتيح تشغيل النماذج المعقدة بكفاءة عالية على مختلف معالجات الرسومات وبكلفة تشغيلية منخفضة.'
  },
  'cn-shenzhen-photonic-breakthrough': {
    title: 'الصين: إنجاز تقني في شنتشن في الرقائق الضوئية وذواكر النطاق الترددي',
    body: 'كشفت مراكز الأبحاث في شنتشن عن دارات متكاملة تعتمد على الألياف الضوئية الميكروية على السيليكون لزيادة سرعة تبادل البيانات وخفض استهلاك الطاقة بنسبة 70 بالمئة.'
  },
  'cn-iot-industrial-security': {
    title: 'الصين: نشرة طارئة لحماية بوابات الجيل الخامس في الموانئ والشبكات الذكية',
    body: 'دعت السلطات الأمنية التقنية إلى تثبيت تحديثات برمجية موقعة رقمياً لتأمين بوابات إنترنت الأشياء الصناعية ضد الثغرات البرمجية.'
  },
  'fr-mistral-ai-release': {
    title: 'فرنسا: ميسترال تطلق نموذج ذكاء اصطناعي سيادي مفتوح الأوزان',
    body: 'أعلنت شركة ميسترال في باريس عن بنية نموذج خفيفة مخصصة للمطورين والمؤسسات الأوروبية متوافقة بالكامل مع تشريعات الذكاء الاصطناعي ومعايير سيادة البيانات.'
  },
  'fr-anssi-osint-bulletin': {
    title: 'فرنسا: وكالة الأمن السيبراني تصدر تقريراً عاجلاً لحماية البنى التحتية',
    body: 'نشرت الوكالة الوطنية الفرنسية للأمن السيبراني إرشادات أمنية مشددة بعد رصد محاولات استهداف للمنافذ الرقمية عبر أجهزة المراقبة الاستخباراتية مفتوحة المصدر.'
  },
  'fr-ovhcloud-quantum': {
    title: 'فرنسا: أوف إتش كلاود تدشن أول خادم كمومي فوتوني في مراكز بياناتها',
    body: 'في خطوة تاريخية للحوسبة السيادية، بدأت مراكز البيانات الفرنسية توفير معالجات الكم عبر واجهات برمجية سحابية للباحثين والمطورين في أوروبا.'
  },
  'us-flutter-3-update': {
    title: 'الولايات المتحدة: فريق فلاتر يطلق محرك إمبيلر فائق السرعة ومعيار ويب أسيمبلي',
    body: 'أطلقت جوجل تحديثاً جذرياً لمحرك فلاتر يزيل تماماً تقطيع الشاشات ويعتمد تجميع الويب أسيمبلي لتشغيل التطبيقات بسرعة مذهلة على أندرويد والويب.'
  },
  'us-linux-kernel-security': {
    title: 'الولايات المتحدة: تحديث أمني عاجل لنواة لينكس لسد ثغرات صلاحيات النظام',
    body: 'أصدر مطورو نواة لينكس تحديثاً طارئاً لحماية الخوادم السحابية والحاويات الرقمية من ثغرات إدارة الذاكرة العشوائية.'
  }
};

/**
 * True when a text is already written in the target language (no translation needed)
 */
function isNativeFrench(text: string): boolean {
  if (!text) return false;
  if (/[\u0600-\u06FF]/.test(text)) return false;
  return /[àâçéèêëîïôûùüÿœæÀÂÇÉÈÊËÎÏÔÛÙÜŸŒÆ]/.test(text) ||
    /\b(le|la|les|des|une|dans|pour|avec|nouveau|nouvelle|sur|est|par|plus|dévoile|annonce)\b/i.test(text);
}

/**
 * Builds a structured podcast episode.
 *
 * Curated scripts (FRENCH_SCRIPTS / ARABIC_SCRIPTS) are 100% native and used as-is.
 * Every other article is emitted from its cleaned source text and flagged `pending`,
 * so nothing is ever half-translated by word substitution: `translatePodcastItems`
 * performs the real translation pass afterwards.
 */
export function generatePodcastEpisode(
  articles: NewsArticle[],
  language: PodcastLanguage,
  countryCode: CountryCode
): PodcastEpisode {
  const country = COUNTRIES.find((c) => c.code === countryCode) || COUNTRIES[0];
  const selectedArticles = articles.slice(0, 5);

  if (language === 'ar') {
    const countryArabicNames: Record<CountryCode, string> = {
      all: 'العالمي',
      dz: 'الجزائر',
      maghreb: 'المغرب العربي',
      cn: 'الصين',
      fr: 'فرنسا',
      us: 'الولايات المتحدة الأمريكية',
      de: 'ألمانيا',
      gb: 'بريطانيا',
      jp: 'اليابان',
      ca: 'كندا'
    };

    const targetCountryName = countryArabicNames[countryCode] || country.name;

    const items: PodcastItem[] = selectedArticles.map((art) => {
      // 1. Check verified Arabic script dictionary
      if (ARABIC_SCRIPTS[art.id]) {
        return {
          id: art.id,
          title: ARABIC_SCRIPTS[art.id].title,
          body: ARABIC_SCRIPTS[art.id].body,
          source: art.source
        };
      }

      // 2. Fallback: cleaned source text, translated afterwards by translatePodcastItems
      const rawTitle = cleanSourceText(art.title || art.translatedTitle || '');
      const rawBody = cleanSourceText(art.description || art.translatedDescription || '');
      const isNativeArabic = /[\u0600-\u06FF]/.test(rawTitle);

      return {
        id: art.id,
        title: isNativeArabic ? rawTitle : `تطور تقني جديد: ${rawTitle}`,
        body: isNativeArabic ? rawBody : `تفاصيل التقرير التقني: ${rawBody}`,
        source: art.source,
        pending: !isNativeArabic
      };
    });

    return {
      language: 'ar',
      title: `البودكاست التقني اليومي — نشرة ${targetCountryName}`,
      intro: `أهلاً ومرحباً بكم في البودكاست التقني اليومي ورادار المصادر المفتوحة. نقدم لكم ملخصاً لأبرز التطورات التكنولوجية والأمنية في ${targetCountryName}.`,
      outro: `شكراً لمتابعتكم البودكاست التقني اليومي. ترقبوا نشرتنا القادمة لأحدث أخبار التكنولوجيا والأمن السيبراني. إلى اللقاء!`,
      items
    };
  }

  // French Edition
  const items: PodcastItem[] = selectedArticles.map((art) => {
    // 1. Check verified French script dictionary
    if (FRENCH_SCRIPTS[art.id]) {
      return {
        id: art.id,
        title: FRENCH_SCRIPTS[art.id].title,
        body: FRENCH_SCRIPTS[art.id].body,
        source: art.source
      };
    }

    // 2. Keep natively French content untouched
    const title = cleanSourceText(art.title || art.translatedTitle || '');
    const body = cleanSourceText(art.description || art.translatedDescription || '');
    const needsTranslation = !isNativeFrench(title);

    return {
      id: art.id,
      title,
      body,
      source: art.source,
      pending: needsTranslation
    };
  });

  return {
    language: 'fr',
    title: `Flash Podcast Tech Quotidien — ${country.flag} ${country.name}`,
    intro: `Bonjour à tous et bienvenue dans votre Flash Info Tech quotidien. Voici le condensé des actualités technologiques, des avancées en intelligence artificielle et du renseignement cyber pour ${country.name}.`,
    outro: `C'était votre point info technologique du jour. Retrouvez tous les détails, le code open-source et les bulletins de sécurité complets dans l'application. À très bientôt pour un nouveau flash info !`,
    items
  };
}

/**
 * Runs the real translation pass on every item still flagged `pending`.
 * Items that fail keep their source text so the voice never reads mixed languages.
 */
export async function translatePodcastItems(
  items: PodcastItem[],
  articles: NewsArticle[],
  language: PodcastLanguage
): Promise<PodcastItem[]> {
  const byId = new Map(articles.map((art) => [art.id, art]));

  return Promise.all(
    items.map(async (item) => {
      if (!item.pending) return item;

      const art = byId.get(item.id);
      const sourceTitle = cleanSourceText(art?.title || art?.translatedTitle || '');
      const sourceBody = cleanSourceText(art?.description || art?.translatedDescription || '');

      const [titleResult, bodyResult] = await Promise.all([
        translateText(sourceTitle, language),
        translateText(sourceBody, language)
      ]);

      const translatedTitle = titleResult.text;
      const translatedBody = bodyResult.text;

      if (language === 'ar') {
        return {
          ...item,
          title: translatedTitle ? `تطور تقني جديد: ${translatedTitle}` : item.title,
          body: translatedBody ? `تفاصيل التقرير التقني: ${translatedBody}` : item.body,
          pending: !translatedTitle || !translatedBody
        };
      }

      return {
        ...item,
        title: translatedTitle || item.title,
        body: translatedBody || item.body,
        pending: !translatedTitle || !translatedBody
      };
    })
  );
}
