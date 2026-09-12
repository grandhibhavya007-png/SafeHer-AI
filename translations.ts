export type Language = 'en' | 'hi' | 'te';

export interface Translations {
  // Navigation & General
  dashboard: string;
  reportProblem: string;
  myComplaints: string;
  adminPortal: string;
  
  // Quick Switch & Footer
  quickSwitch: string;
  projectHub: string;
  adminConsole: string;
  footerText: string;

  // 1-9 Grid Section (From Screenshot)
  gridTopBadge: string;
  gridMainTitle: string;
  gridMainSubtitle: string;
  executionStatusTitle: string;
  executionStatusDefault: string;

  // 1-9 Grid Categories
  cat1Title: string; cat1Desc: string;
  cat2Title: string; cat2Desc: string;
  cat3Title: string; cat3Desc: string;
  cat4Title: string; cat4Desc: string;
  cat5Title: string; cat5Desc: string;
  cat6Title: string; cat6Desc: string;
  cat7Title: string; cat7Desc: string;
  cat8Title: string; cat8Desc: string;
  cat9Title: string; cat9Desc: string;

  // Report Problem Bento Box
  engineBadge: string;
  nlpStatus: string;
  reportProblemTitle: string;
  reportProblemSubtitle: string;
  textMessageCard: string;
  textMessageDesc: string;
  voiceNoteCard: string;
  voiceNoteDesc: string;
  phoneCallCard: string;
  phoneCallDesc: string;

  // AI Analysis Feed Bento Box
  aiAnalysisTitle: string;
  liveBadge: string;
  suspiciousActivityTitle: string;
  suspiciousActivityDesc: string;
  highPriority: string;
  workplaceMisconductTitle: string;
  workplaceMisconductDesc: string;
  medPriority: string;
  modelInfo: string;
  triageSpeed: string;

  // Location Services Bento Box
  locationServicesTitle: string;
  locationServicesDesc: string;
  geolocationMode: string;
  userAuthorized: string;
  coordsSecurity: string;
  aesEncrypted: string;
  privacyFirst: string;

  // Recent Case Activity Bento Box
  recentActivityTitle: string;
  viewAll: string;
  sqliteStore: string;
  totalCases: string;
  noComplaintsYet: string;

  // System Status Bento Box
  systemStatusTitle: string;
  systemStatusSubtitle: string;
  systemStatusDesc: string;
}

export const translations: Record<Language, Translations> = {
  en: {
    dashboard: "Dashboard",
    reportProblem: "Report a Problem",
    myComplaints: "My Reports",
    adminPortal: "Admin Portal",

    quickSwitch: "Quick Switch:",
    projectHub: "Project Hub",
    adminConsole: "Admin Console",
    footerText: "SafeHer AI • Incident Triage & Emergency Response System • SQLite Database Secured",

    gridTopBadge: "Instant Complaint Generation & Direct Emergency Dispatch",
    gridMainTitle: "Quick 1–9 Number Emergency Grid",
    gridMainSubtitle: "Clicking any button instantly creates a formal complaint card with Priority Level, Google Maps location, and Timestamp. It automatically populates in \"My Reports\" and the Admin Dashboard while placing a direct call.",
    executionStatusTitle: "Execution Status",
    executionStatusDefault: "Click any number (1–9) to generate the report, save it to My Reports, and dial emergency.",

    cat1Title: "Street Harassment", cat1Desc: "Eve-teasing or unwelcome comments in public areas.",
    cat2Title: "Stalking", cat2Desc: "Being followed or monitored suspiciously.",
    cat3Title: "Domestic Distress", cat3Desc: "Violence, threats, or harassment at home.",
    cat4Title: "Verbal Abuse/Threat", cat4Desc: "Direct threats of physical or psychological harm.",
    cat5Title: "Transport Safety", cat5Desc: "Unsafe conditions inside a cab, auto, or public transit.",
    cat6Title: "Workplace Harassment", cat6Desc: "Inappropriate behavior or misconduct at work/college.",
    cat7Title: "Unsafe Area Alert", cat7Desc: "Trapped or isolated in a dark/isolated location.",
    cat8Title: "Medical Emergency", cat8Desc: "Sudden physical injury, illness, or fainting.",
    cat9Title: "Critical SOS / Police", cat9Desc: "Immediate physical danger requiring police dispatch.",

    engineBadge: "SafeHer AI Incident Engine",
    nlpStatus: "Real-Time NLP Active",
    reportProblemTitle: "Report a Problem",
    reportProblemSubtitle: "Your safety is our priority. Submit a detailed report via text, voice notes, or call logs for immediate AI processing and rapid dispatch.",
    textMessageCard: "Text Message",
    textMessageDesc: "Type incident details",
    voiceNoteCard: "Voice Note",
    voiceNoteDesc: "Record live audio",
    phoneCallCard: "Phone Call",
    phoneCallDesc: "Log call metadata",

    aiAnalysisTitle: "AI Analysis Feed",
    liveBadge: "Live",
    suspiciousActivityTitle: "Suspicious Activity",
    suspiciousActivityDesc: "Subject reporting being followed near North Transit Station. AI suggested immediate patrol dispatch.",
    highPriority: "High Priority",
    workplaceMisconductTitle: "Workplace Misconduct",
    workplaceMisconductDesc: "Automated transcript analysis identifies repeated verbal harassment & intimidating behavior.",
    medPriority: "Med Priority",
    modelInfo: "Model: Gemini 2.5 NLP",
    triageSpeed: "Triage: < 850ms",

    locationServicesTitle: "Location Services",
    locationServicesDesc: "Consensual GPS geotagging captures verified coordinates, timestamp, and nearby landmark data only with explicit user permission.",
    geolocationMode: "Geolocation Mode:",
    userAuthorized: "User-Authorized",
    coordsSecurity: "Coordinates Security:",
    aesEncrypted: "AES-256 Encrypted",
    privacyFirst: "Privacy First",

    recentActivityTitle: "Recent Case Activity",
    viewAll: "View All",
    sqliteStore: "SQLite Persistent Store",
    totalCases: "Total Cases",
    noComplaintsYet: "No complaints filed yet.",

    systemStatusTitle: "SYSTEM STATUS",
    systemStatusSubtitle: "AI Analysis Uptime & Police Dispatch",
    systemStatusDesc: "Operating with zero data telemetry leakage. Real-time emergency escalation available 24/7.",
  },
  hi: {
    dashboard: "डैशबोर्ड",
    reportProblem: "समस्या रिपोर्ट करें",
    myComplaints: "मेरी रिपोर्ट्स",
    adminPortal: "एडमिन पोर्टल",

    quickSwitch: "त्वरित स्विच:",
    projectHub: "प्रोजेक्ट हब",
    adminConsole: "एडमिन कंसोल",
    footerText: "सेफहर एआई • घटना ट्राइएज और आपातकालीन प्रतिक्रिया प्रणाली • एसक्यूएललाइट डेटाबेस सुरक्षित",

    gridTopBadge: "त्वरित शिकायत सृजन और प्रत्यक्ष आपातकालीन प्रेषण",
    gridMainTitle: "त्वरित 1–9 आपातकालीन नंबर ग्रिड",
    gridMainSubtitle: "किसी भी बटन पर क्लिक करने से प्राथमिकता स्तर, गूगल मैप्स लोकेशन और टाइमस्टैम्प के साथ एक औपचारिक शिकायत कार्ड तुरंत बन जाता है और \"मेरी रिपोर्ट्स\" में जुड़ जाता है।",
    executionStatusTitle: "निष्पादन स्थिति",
    executionStatusDefault: "रिपोर्ट बनाने, मेरी रिपोर्ट्स में सहेजने और आपातकालीन नंबर पर कॉल करने के लिए किसी भी नंबर (1–9) पर क्लिक करें।",

    cat1Title: "सड़क उत्पीड़न", cat1Desc: "सार्वजनिक स्थानों पर फब्तियां कसना या अवांछित टिप्पणियां।",
    cat2Title: "पीछा करना (स्टॉकिंग)", cat2Desc: "संदेहजनक रूप से पीछा किया जाना या निगरानी किया जाना।",
    cat3Title: "घरेलू संकट", cat3Desc: "घर पर हिंसा, धमकियां या उत्पीड़न।",
    cat4Title: "मौखिक दुर्व्यवहार / धमकी", cat4Desc: "शारीरिक या मानसिक नुकसान की सीधी धमकियां।",
    cat5Title: "परिवहन सुरक्षा", cat5Desc: "कैब, ऑटो या सार्वजनिक परिवहन के अंदर असुरक्षित स्थिति।",
    cat6Title: "कार्यस्थल उत्पीड़न", cat6Desc: "काम या कॉलेज में अनुचित व्यवहार या दुराचार।",
    cat7Title: "असुरक्षित क्षेत्र चेतावनी", cat7Desc: "अंधेरे या सुनसान स्थान पर फंसे होना।",
    cat8Title: "चिकित्सा आपातकाल", cat8Desc: "अचानक शारीरिक चोट, बीमारी या बेहोशी।",
    cat9Title: "गंभीर एसओएस / पुलिस", cat9Desc: "तत्काल शारीरिक खतरा जिसके लिए पुलिस की आवश्यकता है।",

    engineBadge: "सेफहर एआई इंसिडेंट इंजन",
    nlpStatus: "रियल-टाइम एनएलपी सक्रिय",
    reportProblemTitle: "समस्या रिपोर्ट करें",
    reportProblemSubtitle: "आपकी सुरक्षा हमारी प्राथमिकता है। तत्काल एआई प्रोसेसिंग के लिए टेक्स्ट, वॉयस नोट्स या कॉल लॉग के माध्यम से विस्तृत रिपोर्ट सबमिट करें।",
    textMessageCard: "टेक्स्ट संदेश",
    textMessageDesc: "घटना का विवरण टाइप करें",
    voiceNoteCard: "वॉयस नोट",
    voiceNoteDesc: "लाइव ऑडियो रिकॉर्ड करें",
    phoneCallCard: "फ़ोन कॉल",
    phoneCallDesc: "कॉल मेटाडेटा लॉग करें",

    aiAnalysisTitle: "एआई विश्लेषण फ़ीड",
    liveBadge: "लाइव",
    suspiciousActivityTitle: "संदिग्ध गतिविधि",
    suspiciousActivityDesc: "नॉर्थ ट्रांजिट स्टेशन के पास पीछा किए जाने की सूचना। एआई ने तुरंत गश्त भेजने का सुझाव दिया।",
    highPriority: "उच्च प्राथमिकता",
    workplaceMisconductTitle: "कार्यस्थल दुराचार",
    workplaceMisconductDesc: "स्वचालित प्रतिलेख विश्लेषण से बार-बार मौखिक उत्पीड़न और धमकाने वाले व्यवहार की पहचान होती है।",
    medPriority: "मध्यम प्राथमिकता",
    modelInfo: "मॉडल: जेमिनी 2.5 एनएलपी",
    triageSpeed: "ट्राइएज: < 850ms",

    locationServicesTitle: "स्थान सेवाएँ",
    locationServicesDesc: "सहमति आधारित जीपीएस जियोटैगिंग केवल स्पष्ट उपयोगकर्ता अनुमति के साथ सत्यापित निर्देशांक और समय दर्ज करती है।",
    geolocationMode: "स्थान मोड:",
    userAuthorized: "उपयोगकर्ता-अधिकृत",
    coordsSecurity: "निर्देशांक सुरक्षा:",
    aesEncrypted: "AES-256 एन्क्रिप्टेड",
    privacyFirst: "गोपनीयता पहले",

    recentActivityTitle: "हाल की केस गतिविधियाँ",
    viewAll: "सभी देखें",
    sqliteStore: "एसक्यूलाइट परसिस्टेंट स्टोर",
    totalCases: "कुल मामले",
    noComplaintsYet: "अभी तक कोई शिकायत दर्ज नहीं की गई है।",

    systemStatusTitle: "सिस्टम स्थिति",
    systemStatusSubtitle: "एआई विश्लेषण अपटाइम और पुलिस प्रेषण",
    systemStatusDesc: "शून्य डेटा टेलीमेट्री लीक के साथ संचालन। वास्तविक समय आपातकालीन वृद्धि 24/7 उपलब्ध है।",
  },
  te: {
    dashboard: "డాష్‌బోర్డ్",
    reportProblem: "సమస్యను నివేదించండి",
    myComplaints: "నా రిపోర్ట్‌లు",
    adminPortal: "అడ్మిన్ పోర్టల్",

    quickSwitch: "త్వరిత మార్పు:",
    projectHub: "ప్రాజెక్ట్ వర్క్",
    adminConsole: "అడ్మిన్ కన్సోల్",
    footerText: "సేఫ్‌హెర్ ఏఐ • ఇన్సిడెంట్ ట్రైయేజ్ & ఎమర్జెన్సీ రెస్పాన్స్ సిస్టమ్ • ఎస్‌క్యూఎల్‌లైట్ డేటాబేస్ సెక్యూర్డ్",

    gridTopBadge: "క్షుణమైన కంప్లైంట్ జనరేషన్ & డైరెక్ట్ ఎమర్జెన్సీ డిస్పాచ్",
    gridMainTitle: "త్వరిత 1–9 నంబర్ అత్యవసర గ్రిడ్",
    gridMainSubtitle: "ఏదైనా నంబర్‌ను నొక్కగానే ప్రయారిటీ స్థాయి, గూగుల్ మ్యాప్స్ లొకేషన్ మరియు టైమ్‌స్టాంప్‌తో కూడిన అధికారిక కంప్లైంట్ కార్డ్ తయారై \"నా రిపోర్ట్‌లు\" మరియు అడ్మిన్ డాష్‌బోర్డ్‌లో సేవ్ అవుతుంది.",
    executionStatusTitle: "అమలు స్థితి",
    executionStatusDefault: "రిపోర్ట్ జనరేట్ చేయడానికి, నా రిపోర్ట్‌లలో సేవ్ చేయడానికి మరియు ఎమర్జెన్సీ కాల్ చేయడానికి 1 నుండి 9 వరకు ఏదైనా నంబర్‌ను క్లిక్ చేయండి.",

    cat1Title: "వీధి వేధింపులు", cat1Desc: "ప్రజా ప్రదేశాలలో అసభ్యకరమైన వ్యాఖ్యలు లేదా వేధింపులు.",
    cat2Title: "స్టాల్కింగ్", cat2Desc: "అనుమానాస్పదంగా వెంబడించడం లేదా గమనించడం.",
    cat3Title: "కుటుంబ వేధింపులు", cat3Desc: "ఇంట్లో హింస, బెదిరింపులు లేదా వేధింపులు.",
    cat4Title: "మౌఖిక దుర్వినియోగం", cat4Desc: "శారీరక లేదా మానసిక హాని కలిగించే ప్రత్యక్ష బెదిరింపులు.",
    cat5Title: "రవాణా భద్రత", cat5Desc: "క్యాబ్, ఆటో లేదా పబ్లిక్ ట్రాన్సిట్‌లో असुरక్షిత పరిస్థితులు.",
    cat6Title: "వర్క్‌ప్లేస్ వేధింపులు", cat6Desc: "పనిచేసే చోట లేదా కాలేజీలో అనుచిత ప్రవర్తన.",
    cat7Title: "అభద్రతా ప్రాంత హెచ్చరిక", cat7Desc: "చీకటి లేదా నిర్జన ప్రదేశంలో చిక్కుకుపోవడం.",
    cat8Title: "వైద్య అత్యవసర పరిస్థితి", cat8Desc: "అకస్మాత్తుగా శారీరక గాయం, అనారోగ్యం లేదా స్పృహ కోల్పోవడం.",
    cat9Title: "క్రిటికల్ SOS / పోలీసు", cat9Desc: "పోలీసుల అత్యవసర సహాయం అవసరమైన ప్రత్యక్ష ప్రమాదం.",

    engineBadge: "సేఫ్‌హెర్ ఏఐ ఇన్సిడెంట్ ఇంజిన్",
    nlpStatus: "రియల్ టైమ్ ఎన్ఎల్‌పి యాక్టివ్",
    reportProblemTitle: "సమస్యను నివేదించండి",
    reportProblemSubtitle: "మీ భద్రతే మా ప్రాధాన్యత. తక్షణ AI ప్రాసెసింగ్ మరియు వేగవంతమైన రెస్పాన్స్ కోసం టెక్స్ట్, వాయిస్ నోట్స్ లేదా కాల్ లాగ్స్ ద్వారా వివరాలను పంపండి.",
    textMessageCard: "టెక్స్ట్ మెసేజ్",
    textMessageDesc: "సంఘటన వివరాలను టైప్ చేయండి",
    voiceNoteCard: "వాయిస్ నోట్",
    voiceNoteDesc: "లైవ్ ఆడియోను రికార్డ్ చేయండి",
    phoneCallCard: "ఫోన్ కాల్",
    phoneCallDesc: "కాల్ మెటాడేటాను లాగ్ చేయండి",

    aiAnalysisTitle: "AI విశ్లేషణ ఫీడ్",
    liveBadge: "లైవ్",
    suspiciousActivityTitle: "అనుమానాస్పద కార్యాచరణ",
    suspiciousActivityDesc: "నార్త్ ట్రాన్సిట్ స్టేషన్ సమీపంలో వెంబడిస్తున్నట్లు బాధితురాలి ఫిర్యాదు. తక్షణ పెట్రోలింగ్ పంపాలని AI సూచించింది.",
    highPriority: "అధిక ప్రాధాన్యత",
    workplaceMisconductTitle: "వర్క్‌ప్లేస్ దుర్వర్తన",
    workplaceMisconductDesc: "పునరావృత మౌఖిక వేధింపులు మరియు భయపెట్టే ప్రవర్తనను ఆటోమేటెడ్ ట్రాన్స్‌క్రిప్ట్ విశ్లేషణ గుర్తిస్తుంది.",
    medPriority: "మధ్యస్థ ప్రాధాన్యత",
    modelInfo: "మోడల్: జెమిని 2.5 NLP",
    triageSpeed: "ట్రైయేజ్: < 850ms",

    locationServicesTitle: "లొకేషన్ సర్వీసెస్",
    locationServicesDesc: "వినియోగదారు స్పష్టమైన అనుమతితో మాత్రమే లొకేషన్ కోఆర్డినేట్లు, సమయం మరియు ల్యాండ్‌మార్క్ డేటా సేకరించబడతాయి.",
    geolocationMode: "జియోలొకేషన్ మోడ్:",
    userAuthorized: "యూజర్-అధికారికం",
    coordsSecurity: "కోఆర్డినేట్స్ భద్రత:",
    aesEncrypted: "AES-256 ఎన్‌క్రిప్ట్ చేయబడింది",
    privacyFirst: "గోప్యతకు మొదటి ప్రాధాన్యత",

    recentActivityTitle: "ఇటీవలి కేసు కార్యకలాపాలు",
    viewAll: "అన్నీ చూడండి",
    sqliteStore: "SQLite పర్సిస్టెంట్ స్టోర్",
    totalCases: "మొత్తం కేసులు",
    noComplaintsYet: "ఇంకా ఎలాంటి ఫిర్యాదులు చేయలేదు.",

    systemStatusTitle: "సిస్టమ్ స్థితి",
    systemStatusSubtitle: "AI విశ్లేషణ సమయం & పోలీసు డిస్పాచ్",
    systemStatusDesc: "డేటా లీకేజ్ లేకుండా ఆపరేట్ అవుతోంది. రియల్ టైమ్ ఎమర్జెన్సీ రెస్పాన్స్ 24/7 అందుబాటులో ఉంది.",
  }
};