export type LanguageCode = "hi" | "mr" | "en" | "ta" | "bn" | "te";

export interface Language {
  code: LanguageCode;
  label: string; // native script
  english: string;
  speech: string; // BCP-47 code for Web Speech API
}

export const LANGUAGES: Language[] = [
  { code: "hi", label: "हिन्दी", english: "Hindi", speech: "hi-IN" },
  { code: "mr", label: "मराठी", english: "Marathi", speech: "mr-IN" },
  { code: "en", label: "English", english: "English", speech: "en-IN" },
  { code: "ta", label: "தமிழ்", english: "Tamil", speech: "ta-IN" },
  { code: "bn", label: "বাংলা", english: "Bengali", speech: "bn-IN" },
  { code: "te", label: "తెలుగు", english: "Telugu", speech: "te-IN" },
];

export interface Strings {
  appName: string;
  tagline: string;
  chooseLanguage: string;
  talkPrompt: string;
  tapAndSpeak: string;
  listening: string;
  stopListening: string;
  orType: string;
  moreAboutYou: string;
  moreAboutYouHint: string;
  findSchemes: string;
  needSomething: string;
  checking: string;
  checkingHint: string;
  yourSchemes: string;
  whyYouQualify: string;
  documentsNeeded: string;
  readAloud: string;
  stopReading: string;
  askAgain: string;
  noMatches: string;
  noMatchesHint: string;
  somethingWentWrong: string;
  tryAgain: string;
  checkIn: string;
  checkInGreeting: (name?: string) => string;
  imWell: string;
  needHelp: string;
  wellReply: string;
  helpReply: string;
  helpline: string;
  callHelpline: string;
  notify: (name: string) => string;
  notifyWhatsApp: (name: string) => string;
  notifyMessage: (name?: string) => string;
  home: string;
  name: string;
  age: string;
  gender: string;
  male: string;
  female: string;
  other: string;
  widow: string;
  disabilityPercent: string;
  bpl: string;
  annualIncome: string;
  phone: string;
  familyContactName: string;
  familyContactPhone: string;
  yes: string;
  no: string;
  tellUsSomething: string;
  orDivider: string;
  voiceNotAvailable: string;
  back: string;
}

const en: Strings = {
  appName: "Bharat Saathi AI",
  tagline: "Your friendly helper for government schemes",
  chooseLanguage: "Choose your language",
  talkPrompt:
    "Tell me about yourself — your age, family situation, and anything else — and I'll find schemes you may qualify for.",
  tapAndSpeak: "Tap and speak",
  listening: "Listening… speak now",
  stopListening: "Stop",
  orType: "Or type your situation here",
  moreAboutYou: "Or fill in these details",
  moreAboutYouHint: "Name and age are enough if you would rather not type above. Other fields are optional.",
  findSchemes: "Find My Schemes",
  needSomething: "Please speak or type a few words, or fill in your name and age.",
  checking: "Saathi is checking your eligibility…",
  checkingHint: "This can take up to a minute. Please stay on this screen.",
  yourSchemes: "Schemes for you",
  whyYouQualify: "Why you qualify",
  documentsNeeded: "Documents needed",
  readAloud: "Read this to me",
  stopReading: "Stop reading",
  askAgain: "Ask Saathi something else",
  noMatches: "I could not find a scheme for you just yet.",
  noMatchesHint:
    "Please tell me a little more about yourself — your age, income or family — and try once more.",
  somethingWentWrong: "I could not reach Saathi just now.",
  tryAgain: "Try again",
  checkIn: "Saathi Check-In",
  checkInGreeting: (name) =>
    name ? `Namaste ${name}, how are you feeling today?` : "Namaste, how are you feeling today?",
  imWell: "I'm doing well 🙂",
  needHelp: "I need help 🙁",
  wellReply: "That is wonderful to hear. Saathi is always here for you.",
  helpReply: "You are not alone. Help is one tap away.",
  helpline: "National Elder Line",
  callHelpline: "Call 14567 now",
  notify: (name) => `Notify ${name}`,
  notifyWhatsApp: (name) => `WhatsApp ${name}`,
  notifyMessage: (name) =>
    name
      ? `I'm checking in — ${name} may need some help, could you reach out to them?`
      : "I'm checking in — someone you care for may need some help, could you reach out to them?",
  home: "Home",
  name: "Name",
  age: "Age",
  gender: "Gender",
  male: "Male",
  female: "Female",
  other: "Other",
  widow: "Are you a widow?",
  disabilityPercent: "Disability (%)",
  bpl: "Do you have a BPL card?",
  annualIncome: "Yearly income (₹)",
  phone: "Phone number",
  familyContactName: "Family contact name",
  familyContactPhone: "Family contact phone",
  yes: "Yes",
  no: "No",
  tellUsSomething: "Your situation",
  orDivider: "OR",
  voiceNotAvailable: "Speaking is not available in this browser. Please type instead.",
  back: "Back",
};

const hi: Strings = {
  ...en,
  tagline: "सरकारी योजनाओं के लिए आपका अपना साथी",
  chooseLanguage: "अपनी भाषा चुनें",
  talkPrompt:
    "अपने बारे में बताइए — आपकी उम्र, परिवार की स्थिति और जो भी कहना चाहें — मैं आपके लिए योजनाएँ खोजूँगा।",
  tapAndSpeak: "दबाइए और बोलिए",
  listening: "मैं सुन रहा हूँ… बोलिए",
  stopListening: "रोकें",
  orType: "या अपनी बात यहाँ लिखिए",
  moreAboutYou: "या ये विवरण भरें",
  moreAboutYouHint: "अगर ऊपर लिखना न हो तो नाम और उम्र काफी हैं। बाकी जानकारी वैकल्पिक है।",
  findSchemes: "मेरी योजनाएँ खोजें",
  needSomething: "कृपया कुछ बोलिए या लिखिए, या अपना नाम और उम्र भरिए।",
  checking: "साथी आपकी पात्रता देख रहा है…",
  checkingHint: "इसमें एक मिनट लग सकता है। कृपया इसी स्क्रीन पर रहें।",
  yourSchemes: "आपके लिए योजनाएँ",
  whyYouQualify: "आप क्यों पात्र हैं",
  documentsNeeded: "ज़रूरी कागज़",
  readAloud: "मुझे पढ़कर सुनाइए",
  stopReading: "पढ़ना रोकें",
  askAgain: "साथी से कुछ और पूछें",
  noMatches: "अभी मुझे आपके लिए कोई योजना नहीं मिली।",
  noMatchesHint: "कृपया अपनी उम्र, आमदनी या परिवार के बारे में थोड़ा और बताइए और फिर कोशिश कीजिए।",
  somethingWentWrong: "अभी साथी से बात नहीं हो पाई।",
  tryAgain: "फिर कोशिश करें",
  checkIn: "साथी हाल-चाल",
  checkInGreeting: (name) =>
    name ? `नमस्ते ${name}, आज आप कैसा महसूस कर रहे हैं?` : "नमस्ते, आज आप कैसा महसूस कर रहे हैं?",
  imWell: "मैं ठीक हूँ 🙂",
  needHelp: "मुझे मदद चाहिए 🙁",
  wellReply: "यह सुनकर बहुत अच्छा लगा। साथी हमेशा आपके साथ है।",
  helpReply: "आप अकेले नहीं हैं। मदद बस एक बटन दूर है।",
  helpline: "राष्ट्रीय एल्डर लाइन",
  callHelpline: "14567 पर अभी कॉल करें",
  notify: (name) => `${name} को बताएं`,
  notifyWhatsApp: (name) => `${name} को WhatsApp करें`,
  notifyMessage: (name) =>
    name
      ? `मैं हाल-चाल पूछ रहा हूँ — ${name} को कुछ मदद चाहिए हो सकती है, क्या आप उनसे बात कर सकते हैं?`
      : "मैं हाल-चाल पूछ रहा हूँ — आपके परिजन को कुछ मदद चाहिए हो सकती है, क्या आप उनसे बात कर सकते हैं?",
  home: "मुख्य पृष्ठ",
  name: "नाम",
  age: "उम्र",
  gender: "लिंग",
  male: "पुरुष",
  female: "महिला",
  other: "अन्य",
  widow: "क्या आप विधवा हैं?",
  disabilityPercent: "दिव्यांगता (%)",
  bpl: "क्या आपके पास बीपीएल कार्ड है?",
  annualIncome: "सालाना आमदनी (₹)",
  phone: "फ़ोन नंबर",
  familyContactName: "परिवार के सदस्य का नाम",
  familyContactPhone: "परिवार के सदस्य का फ़ोन",
  yes: "हाँ",
  no: "नहीं",
  tellUsSomething: "आपकी स्थिति",
  orDivider: "या",
  voiceNotAvailable: "इस ब्राउज़र में बोलना उपलब्ध नहीं है। कृपया लिखिए।",
  back: "पीछे",
};

const mr: Strings = {
  ...en,
  tagline: "सरकारी योजनांसाठी तुमचा साथी",
  chooseLanguage: "तुमची भाषा निवडा",
  talkPrompt:
    "तुमच्याबद्दल सांगा — तुमचे वय, कुटुंबाची स्थिती आणि जे काही सांगायचे आहे — मी तुमच्यासाठी योजना शोधतो.",
  tapAndSpeak: "दाबा आणि बोला",
  listening: "मी ऐकतो आहे… बोला",
  stopListening: "थांबा",
  orType: "किंवा इथे लिहा",
  moreAboutYou: "किंवा हे तपशील भरा",
  moreAboutYouHint: "वर लिहायचे नसेल तर नाव आणि वय पुरेसे आहेत. बाकी माहिती ऐच्छिक आहे.",
  findSchemes: "माझ्या योजना शोधा",
  needSomething: "कृपया थोडे बोला किंवा लिहा, किंवा तुमचे नाव आणि वय भरा.",
  checking: "साथी तुमची पात्रता तपासतो आहे…",
  checkingHint: "याला एक मिनिट लागू शकतो. कृपया याच स्क्रीनवर थांबा.",
  yourSchemes: "तुमच्यासाठी योजना",
  whyYouQualify: "तुम्ही का पात्र आहात",
  documentsNeeded: "लागणारी कागदपत्रे",
  readAloud: "मला वाचून दाखवा",
  stopReading: "वाचणे थांबवा",
  askAgain: "साथीला आणखी काही विचारा",
  noMatches: "सध्या मला तुमच्यासाठी योजना सापडली नाही.",
  noMatchesHint: "कृपया तुमचे वय, उत्पन्न किंवा कुटुंबाबद्दल थोडे अधिक सांगा आणि पुन्हा प्रयत्न करा.",
  somethingWentWrong: "आत्ता साथीशी संपर्क होऊ शकला नाही.",
  tryAgain: "पुन्हा प्रयत्न करा",
  checkIn: "साथी विचारपूस",
  checkInGreeting: (name) =>
    name ? `नमस्कार ${name}, आज कसे वाटते आहे?` : "नमस्कार, आज कसे वाटते आहे?",
  imWell: "मी ठीक आहे 🙂",
  needHelp: "मला मदत हवी 🙁",
  wellReply: "हे ऐकून खूप आनंद झाला. साथी नेहमी तुमच्यासोबत आहे.",
  helpReply: "तुम्ही एकटे नाही. मदत एका बटणावर आहे.",
  helpline: "राष्ट्रीय एल्डर लाईन",
  callHelpline: "आत्ता 14567 वर कॉल करा",
  notify: (name) => `${name} यांना कळवा`,
  notifyWhatsApp: (name) => `${name} यांना WhatsApp करा`,
  notifyMessage: (name) =>
    name
      ? `मी विचारपूस करतो आहे — ${name} यांना थोडी मदत लागू शकते, तुम्ही त्यांच्याशी संपर्क साधाल का?`
      : "मी विचारपूस करतो आहे — तुमच्या प्रिय व्यक्तीला थोडी मदत लागू शकते, तुम्ही त्यांच्याशी संपर्क साधाल का?",
  home: "मुख्यपृष्ठ",
  name: "नाव",
  age: "वय",
  gender: "लिंग",
  male: "पुरुष",
  female: "स्त्री",
  other: "इतर",
  widow: "तुम्ही विधवा आहात का?",
  disabilityPercent: "अपंगत्व (%)",
  bpl: "तुमच्याकडे बीपीएल कार्ड आहे का?",
  annualIncome: "वार्षिक उत्पन्न (₹)",
  phone: "फोन नंबर",
  familyContactName: "कुटुंबातील व्यक्तीचे नाव",
  familyContactPhone: "कुटुंबातील व्यक्तीचा फोन",
  yes: "होय",
  no: "नाही",
  tellUsSomething: "तुमची परिस्थिती",
  orDivider: "किंवा",
  voiceNotAvailable: "या ब्राउझरमध्ये बोलणे उपलब्ध नाही. कृपया लिहा.",
  back: "मागे",
};

const ta: Strings = {
  ...en,
  tagline: "அரசு திட்டங்களுக்கான உங்கள் தோழன்",
  chooseLanguage: "உங்கள் மொழியைத் தேர்ந்தெடுங்கள்",
  talkPrompt:
    "உங்களைப் பற்றி சொல்லுங்கள் — வயது, குடும்ப நிலை மற்றும் மற்ற விவரங்கள் — நான் திட்டங்களைத் தேடுகிறேன்.",
  tapAndSpeak: "தொட்டுப் பேசுங்கள்",
  listening: "கேட்கிறேன்… பேசுங்கள்",
  stopListening: "நிறுத்து",
  orType: "அல்லது இங்கே தட்டச்சு செய்யுங்கள்",
  moreAboutYou: "அல்லது இந்த விவரங்களை நிரப்புங்கள்",
  moreAboutYouHint: "மேலே எழுத விரும்பவில்லை என்றால் பெயரும் வயதும் போதும்.",
  findSchemes: "எனது திட்டங்களைத் தேடு",
  needSomething: "பேசுங்கள் அல்லது எழுதுங்கள், அல்லது பெயரும் வயதும் நிரப்புங்கள்.",
  checking: "சாத்தி உங்கள் தகுதியைப் பார்க்கிறார்…",
  yourSchemes: "உங்களுக்கான திட்டங்கள்",
  whyYouQualify: "நீங்கள் ஏன் தகுதியானவர்",
  documentsNeeded: "தேவையான ஆவணங்கள்",
  readAloud: "எனக்குப் படித்துக் காட்டு",
  askAgain: "சாத்தியிடம் வேறு ஒன்று கேளுங்கள்",
  checkIn: "சாத்தி நலம் விசாரிப்பு",
  imWell: "நான் நலமாக இருக்கிறேன் 🙂",
  needHelp: "எனக்கு உதவி வேண்டும் 🙁",
  callHelpline: "இப்போது 14567 அழைக்கவும்",
  home: "முகப்பு",
  yes: "ஆம்",
  no: "இல்லை",
  orDivider: "அல்லது",
  back: "பின்",
};

const bn: Strings = {
  ...en,
  tagline: "সরকারি প্রকল্পের জন্য আপনার সাথী",
  chooseLanguage: "আপনার ভাষা বেছে নিন",
  talkPrompt: "নিজের সম্পর্কে বলুন — বয়স, পরিবারের অবস্থা — আমি আপনার জন্য প্রকল্প খুঁজে দেব।",
  tapAndSpeak: "চাপুন আর বলুন",
  listening: "আমি শুনছি… বলুন",
  stopListening: "থামুন",
  orType: "অথবা এখানে লিখুন",
  moreAboutYou: "অথবা এই তথ্য পূরণ করুন",
  findSchemes: "আমার প্রকল্প খুঁজুন",
  needSomething: "কিছু বলুন বা লিখুন, অথবা নাম ও বয়স পূরণ করুন।",
  checking: "সাথী আপনার যোগ্যতা দেখছে…",
  yourSchemes: "আপনার জন্য প্রকল্প",
  whyYouQualify: "আপনি কেন যোগ্য",
  documentsNeeded: "প্রয়োজনীয় কাগজপত্র",
  readAloud: "আমাকে পড়ে শোনান",
  askAgain: "সাথীকে আরও কিছু জিজ্ঞাসা করুন",
  checkIn: "সাথী খোঁজখবর",
  imWell: "আমি ভালো আছি 🙂",
  needHelp: "আমার সাহায্য দরকার 🙁",
  callHelpline: "এখনই 14567 এ কল করুন",
  home: "হোম",
  yes: "হ্যাঁ",
  no: "না",
  orDivider: "অথবা",
  back: "পিছনে",
};

const te: Strings = {
  ...en,
  tagline: "ప్రభుత్వ పథకాల కోసం మీ సాథి",
  chooseLanguage: "మీ భాషను ఎంచుకోండి",
  talkPrompt: "మీ గురించి చెప్పండి — వయస్సు, కుటుంబ పరిస్థితి — నేను పథకాలను వెతుకుతాను.",
  tapAndSpeak: "నొక్కి మాట్లాడండి",
  listening: "నేను వింటున్నాను… చెప్పండి",
  stopListening: "ఆపండి",
  orType: "లేదా ఇక్కడ టైప్ చేయండి",
  moreAboutYou: "లేదా ఈ వివరాలు నింపండి",
  findSchemes: "నా పథకాలను వెతకండి",
  needSomething: "మాట్లాడండి లేదా టైప్ చేయండి, లేదా పేరు మరియు వయస్సు నింపండి.",
  checking: "సాథి మీ అర్హతను చూస్తున్నారు…",
  yourSchemes: "మీ కోసం పథకాలు",
  whyYouQualify: "మీరు ఎందుకు అర్హులు",
  documentsNeeded: "అవసరమైన పత్రాలు",
  readAloud: "నాకు చదివి వినిపించండి",
  askAgain: "సాథిని మరేదైనా అడగండి",
  checkIn: "సాథి యోగక్షేమాలు",
  imWell: "నేను బాగున్నాను 🙂",
  needHelp: "నాకు సహాయం కావాలి 🙁",
  callHelpline: "ఇప్పుడే 14567 కు కాల్ చేయండి",
  home: "హోమ్",
  yes: "అవును",
  no: "కాదు",
  orDivider: "లేదా",
  back: "వెనుకకు",
};

export const STRINGS: Record<LanguageCode, Strings> = { en, hi, mr, ta, bn, te };

export function getStrings(code: LanguageCode): Strings {
  return STRINGS[code] ?? en;
}
