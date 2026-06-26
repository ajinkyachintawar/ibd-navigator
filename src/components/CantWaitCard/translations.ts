export interface Translation {
  lang: string
  text: string
  rtl?: boolean
}

// Validated by agent — local clinical abbreviations used where standard
// (MICI=French, CED=German, NZJ=Polish, EII=Spanish)
export const TRANSLATIONS: Record<string, Translation> = {
  en: {
    lang: 'English',
    text: 'I have a medical condition called IBD (Inflammatory Bowel Disease) and I urgently need to use the toilet immediately. This is a medical emergency. Please help me. Thank you.',
  },
  ga: {
    lang: 'Irish',
    text: 'Tá riocht leighis orm ar a dtugtar IBD (Galar Athlastach Stéige) agus tá géarghá agam úsáid a bhaint as an leithreas láithreach bonn. Is éigeandáil leighis í seo. Cabhraigh liom, le do thoil. Go raibh maith agat.',
  },
  es: {
    lang: 'Spanish',
    text: 'Tengo una enfermedad llamada EII (Enfermedad Inflamatoria Intestinal) y necesito usar el baño de inmediato con urgencia. Esto es una emergencia médica. Por favor, ayúdeme. Muchas gracias.',
  },
  fr: {
    lang: 'French',
    text: "J'ai une maladie appelée MICI (Maladie Inflammatoire Chronique de l'Intestin) et j'ai un besoin urgent et immédiat d'utiliser les toilettes. C'est une urgence médicale. Veuillez m'aider. Merci.",
  },
  de: {
    lang: 'German',
    text: 'Ich habe eine Erkrankung namens CED (chronisch-entzündliche Darmerkrankung) und muss sofort dringend die Toilette benutzen. Dies ist ein medizinischer Notfall. Bitte helfen Sie mir. Vielen Dank.',
  },
  it: {
    lang: 'Italian',
    text: "Ho una malattia chiamata IBD (Malattia Infiammatoria Intestinale) e ho urgente bisogno di usare il bagno immediatamente. Questa è un'emergenza medica. Per favore, aiutatemi. Grazie.",
  },
  pl: {
    lang: 'Polish',
    text: 'Mam chorobę zwaną NZJ (nieswoiste zapalenie jelit) i pilnie potrzebuję skorzystać z toalety natychmiast. To jest nagły przypadek medyczny. Proszę mi pomóc. Dziękuję.',
  },
  ar: {
    lang: 'Arabic',
    rtl: true,
    text: 'أعاني من حالة طبية تُسمى IBD (مرض التهاب الأمعاء) وأحتاج بشكل عاجل إلى استخدام الحمام فوراً. هذه حالة طوارئ طبية. من فضلك ساعدني. شكراً جزيلاً.',
  },
  zh: {
    lang: 'Mandarin',
    text: '我患有一种叫做IBD（炎症性肠病）的疾病，我现在急需立即使用洗手间。这是医疗紧急情况。请帮助我。谢谢。',
  },
  hi: {
    lang: 'Hindi',
    text: 'मुझे IBD (इन्फ्लेमेटरी बाउल डिज़ीज़) नामक एक चिकित्सीय स्थिति है और मुझे तुरंत शौचालय का उपयोग करना अत्यंत आवश्यक है। यह एक चिकित्सीय आपातकाल है। कृपया मेरी सहायता करें। धन्यवाद।',
  },
}
