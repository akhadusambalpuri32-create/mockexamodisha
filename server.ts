import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import { initializeApp } from "firebase/app";
import { initializeFirestore, doc, getDoc, setDoc } from "firebase/firestore";

const app = express();
const PORT = 3000;

// Initialize Firebase App & db on server-side dynamically for dynamic exam and question persistence
let firebaseApp;
let serverDb: any = null;
try {
  const configPath = path.join(process.cwd(), "firebase-applet-config.json");
  if (fs.existsSync(configPath)) {
    const firebaseConfig = JSON.parse(fs.readFileSync(configPath, "utf-8"));
    firebaseApp = initializeApp(firebaseConfig);
    serverDb = initializeFirestore(firebaseApp, { 
      experimentalForceLongPolling: true 
    });
    console.log("🟢 [FIREBASE SERVER] Initialized successfully with experimentalForceLongPolling in backend.");
  }
} catch (error) {
  console.error("❌ [FIREBASE SERVER] Failed to initialize:", error);
}

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Initialize Gemini API Client safely (Lazy Initialization / Graceful check)
let aiClient: GoogleGenAI | null = null;
function getAi(): GoogleGenAI | null {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey && apiKey !== "MY_GEMINI_API_KEY") {
      aiClient = new GoogleGenAI({
        apiKey: apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });
    } else {
      console.warn("GEMINI_API_KEY is not set or using placeholder. Running in simulated AI mode.");
    }
  }
  return aiClient;
}

// ==========================================
// MOCK DATABASES (ODISHA EXAM PLATFORM)
// ==========================================

// Competitive & Academic Exams
let EXAMS_DATABASE = {
  board: [
    {
      id: "cbse-board",
      name: "CBSE - Central Board of Secondary Education",
      short: "CBSE",
      category: "board",
      subCategory: "cbse",
      durationMins: 90,
      totalQuestions: 5,
      difficulty: "Medium",
      marksPerQuestion: 1,
      negativeMarking: 0,
      tests: [
        { id: "cbse-10-mth", title: "CBSE Class 10th Mathematics Mock MCQ", isFree: true },
        { id: "cbse-10-sci", title: "CBSE Class 10th General Science Mock MCQ", isFree: true }
      ]
    },
    {
      id: "bse-board",
      name: "BSE - Board of Secondary Education, Odisha",
      short: "BSE",
      category: "board",
      subCategory: "bse",
      durationMins: 90,
      totalQuestions: 5,
      difficulty: "Medium",
      marksPerQuestion: 1,
      negativeMarking: 0,
      tests: [
        { id: "bse-9-mth", title: "BSE Odisha Class 9th Mathematics Mock", isFree: true },
        { id: "bse-10-mth", title: "BSE Odisha Class 10th Board practice paper", isFree: true }
      ]
    },
    {
      id: "chse-board",
      name: "CHSE - Council of Higher Secondary Education, Odisha",
      short: "CHSE",
      category: "board",
      subCategory: "chse",
      durationMins: 120,
      totalQuestions: 5,
      difficulty: "Hard",
      marksPerQuestion: 1,
      negativeMarking: 0,
      tests: [
        { id: "chse-12-phy", title: "CHSE Class 12th Physics (Electrostatics + Optics)", isFree: true },
        { id: "chse-12-mth", title: "CHSE Class 12th Calculus & Vectors", isFree: true }
      ]
    }
  ],
  teaching: [
    {
      id: "otet",
      name: "OTET - Odisha Teacher Eligibility Test",
      short: "OTET",
      category: "teaching",
      subCategory: "otet",
      durationMins: 150,
      totalQuestions: 5,
      difficulty: "Medium",
      marksPerQuestion: 1,
      negativeMarking: 0,
      tests: [
        { id: "otet-p1-arts", title: "OTET Paper-I (Arts Group) Child Development", isFree: true },
        { id: "otet-p1-sci", title: "OTET Paper-I (Science Group) Mathematics & EVS", isFree: true },
        { id: "otet-p2-arts", title: "OTET Paper-II (Arts Group) Social Studies", isFree: true },
        { id: "otet-p2-sci", title: "OTET Paper-II (Science Group) Science and Pedagogy", isFree: true }
      ]
    },
    {
      id: "osstet",
      name: "OSSTET - Secondary School Teacher Eligibility",
      short: "OSSTET",
      category: "teaching",
      subCategory: "osstet",
      durationMins: 150,
      totalQuestions: 5,
      difficulty: "Medium-Hard",
      marksPerQuestion: 1,
      negativeMarking: 0,
      tests: [
        { id: "osstet-tgt-arts", title: "OSSTET TGT ARTS - English & Odia Pedagogy", isFree: true },
        { id: "osstet-tgt-cbz", title: "OSSTET TGT CBZ - Botany, Zoology & Chemistry", isFree: true },
        { id: "osstet-tgt-pcm", title: "OSSTET TGT PCM - Physics, Chemistry & Math", isFree: true },
        { id: "osstet-tgt-sanskrit", title: "OSSTET TGT SANSKRIT - Grammar & Literature", isFree: true },
        { id: "osstet-tgt-hindi", title: "OSSTET TGT HINDI - Hindi Bhasa Vyakarana", isFree: true },
        { id: "osstet-tgt-odia", title: "OSSTET TGT ODIA - Sahitya and Lekhaka", isFree: true },
        { id: "osstet-tgt-pet", title: "OSSTET TGT P.ET - Physical Education & Health", isFree: true }
      ]
    },
    {
      id: "ossc-tgt",
      name: "OSSC TGT - Trained Graduate Teacher recruitment",
      short: "OSSC TGT",
      category: "teaching",
      subCategory: "ossc_tgt",
      durationMins: 150,
      totalQuestions: 5,
      difficulty: "Hard",
      marksPerQuestion: 1,
      negativeMarking: 0.25,
      tests: [
        { id: "ossc-tgt-arts", title: "OSSC TGT ARTS Specialist Test", isFree: true },
        { id: "ossc-tgt-cbz", title: "OSSC TGT CBZ Science Paper", isFree: true },
        { id: "ossc-tgt-pcm", title: "OSSC TGT PCM practice mock", isFree: true },
        { id: "ossc-tgt-sanskrit", title: "OSSC TGT Sanskrit Grammar", isFree: true },
        { id: "ossc-tgt-hindi", title: "OSSC TGT Hindi Literature Mock", isFree: true },
        { id: "ossc-tgt-odia", title: "OSSC TGT Odia Language Mock", isFree: true },
        { id: "ossc-tgt-pet", title: "OSSC TGT P.ET (Physical Education)", isFree: true }
      ]
    },
    {
      id: "ssb-tgt",
      name: "SSB TGT - State Selection Board Teacher recruitment",
      short: "SSB TGT",
      category: "teaching",
      subCategory: "ssb_tgt",
      durationMins: 150,
      totalQuestions: 5,
      difficulty: "Hard",
      marksPerQuestion: 1,
      negativeMarking: 0.25,
      tests: [
        { id: "ssb-tgt-arts", title: "SSB TGT ARTS - History, Civics & Land laws", isFree: true },
        { id: "ssb-tgt-cbz", title: "SSB TGT CBZ Science Paper", isFree: true },
        { id: "ssb-tgt-pcm", title: "SSB TGT PCM Core Math", isFree: true },
        { id: "ssb-tgt-sanskrit", title: "SSB TGT Sanskrit Bhasa paper", isFree: true },
        { id: "ssb-tgt-hindi", title: "SSB TGT Hindi Literature", isFree: true },
        { id: "ssb-tgt-odia", title: "SSB TGT Odia Vyakarana", isFree: true },
        { id: "ssb-tgt-pet", title: "SSB TGT P.ET Theoretical Mock Set", isFree: true }
      ]
    },
    {
      id: "jt",
      name: "JT - Junior Teacher Primary & Upper Primary",
      short: "JT",
      category: "teaching",
      subCategory: "jt",
      durationMins: 120,
      totalQuestions: 5,
      difficulty: "Medium",
      marksPerQuestion: 1,
      negativeMarking: 0.25,
      tests: [
        { id: "jt-p1-arts", title: "JT Paper-I Arts Section practice", isFree: true },
        { id: "jt-p1-sci", title: "JT Paper-I Science Section practices", isFree: true },
        { id: "jt-p2-arts", title: "JT Paper-II Higher Arts Section", isFree: true },
        { id: "jt-p2-sci", title: "JT Paper-II Higher Science Section", isFree: true }
      ]
    },
    {
      id: "pet",
      name: "P.ET - Physical Education Teacher specialization",
      short: "P.ET",
      category: "teaching",
      subCategory: "pet",
      durationMins: 90,
      totalQuestions: 5,
      difficulty: "Medium",
      marksPerQuestion: 1,
      negativeMarking: 0.25,
      tests: [
        { id: "pet-general", title: "P.ET - General Physical Education, Anatomy & Rules of Sports", isFree: true }
      ]
    },
    {
      id: "bed-entrance",
      name: "B.Ed. Entrance Exam - State quota seats",
      short: "B.ED Entrance",
      category: "teaching",
      subCategory: "bed_entrance",
      durationMins: 120,
      totalQuestions: 5,
      difficulty: "Medium-Hard",
      marksPerQuestion: 1,
      negativeMarking: 0.25,
      tests: [
        { id: "bed-arts", title: "B.ED Entrance Exam - Arts Section Mock", isFree: true },
        { id: "bed-sci", title: "B.ED Entrance Exam - Science Section MCQ", isFree: true }
      ]
    },
    {
      id: "deled-entrance",
      name: "D.El.Ed / CT Entrance - Primary teacher certification",
      short: "DELED / CT",
      category: "teaching",
      subCategory: "deled_entrance",
      durationMins: 90,
      totalQuestions: 5,
      difficulty: "Medium",
      marksPerQuestion: 1,
      negativeMarking: 0.25,
      tests: [
        { id: "ct-integrated", title: "CT/DELED Entrance General Ability integrated test", isFree: true }
      ]
    }
  ],
  competitive: [
    {
      id: "opsc-ocs",
      name: "OPSC - Odisha Civil Services (Pre)",
      short: "OPSC OCS",
      category: "competitive",
      subCategory: "opsc_ocs",
      durationMins: 120,
      totalQuestions: 5,
      difficulty: "Hard",
      marksPerQuestion: 2,
      negativeMarking: 0.33,
      tests: [
        { id: "ocs-pre-1", title: "OCS General Studies Paper-I (Mock 1)", isFree: true },
        { id: "ocs-pre-2", title: "OCS CSAT Paper-II Math & Decision making", isFree: true }
      ]
    },
    {
      id: "osssc-ri",
      name: "OSSSC Revenue Inspector (RI)",
      short: "OSSSC RI",
      category: "competitive",
      subCategory: "osssc_ri",
      durationMins: 90,
      totalQuestions: 3,
      difficulty: "Medium",
      marksPerQuestion: 1,
      negativeMarking: 0.25,
      tests: [
        { id: "ri-full-1", title: "Revenue Inspector Full Mock Test 1", isFree: true },
        { id: "ri-math-1", title: "Arithmetic & Mensuration Special", isFree: true }
      ]
    },
    {
      id: "ossc-cgl",
      name: "OSSC Combined Graduate Level",
      short: "OSSC CGL",
      category: "competitive",
      subCategory: "ossc_cgl",
      durationMins: 150,
      totalQuestions: 5,
      difficulty: "Medium",
      marksPerQuestion: 1,
      negativeMarking: 0.25,
      tests: [
        { id: "cgl-pre-1", title: "OSSC CGL Prelims Crack Full Mock", isFree: true }
      ]
    }
  ],
  others: [
    {
      id: "police-si",
      name: "Odisha Police SI & Constable",
      short: "Police SI",
      category: "others",
      subCategory: "police_si",
      durationMins: 120,
      totalQuestions: 5,
      difficulty: "Medium",
      marksPerQuestion: 1,
      negativeMarking: 0.25,
      tests: [
        { id: "police-si-1", title: "Odisha Police SI Mains Mock Test", isFree: true }
      ]
    },
    {
      id: "computer-skill",
      name: "OSSSC Computer Practical Mock",
      short: "Computer Skill",
      category: "others",
      subCategory: "computer_skill",
      durationMins: 60,
      totalQuestions: 5,
      difficulty: "Easy-Medium",
      marksPerQuestion: 1,
      negativeMarking: 0,
      tests: [
        { id: "comp-skill-1", title: "Windows & MS Office objective practice", isFree: true }
      ]
    }
  ]
};

// Exam Papers with Questions for Mock Test Interface
let QUESTIONS_DATABASE: Record<string, any[]> = {
  "ocs-pre-1": [
    {
      id: "ocs-q1",
      question: "Which legendary modern poet of Odisha wrote the historical patriotic ballad 'Bande Utkala Janani', which is the official state song of Odisha?",
      options: ["Radhanath Ray", "Laxmikanta Mohapatra", "Madhusudan Rao", "Gangadhar Meher"],
      correctIndex: 1,
      explanation: "Kantakabi Laxmikanta Mohapatra wrote 'Bande Utkala Janani' in 1912. It was officially adopted as the state anthem of Odisha in 2020.",
      shortExplanation: "Written by Kantakabi Laxmikanta Mohapatra in 1912.",
      subject: "Odisha GK",
      topic: "State Symbols & Literature"
    },
    {
      id: "ocs-q2",
      question: "The historic Kalinga War, which transformed Emperor Ashoka into a patron of Buddhism, was fought on the banks of which river in Odisha?",
      options: ["Mahanadi", "Baitarani", "Daya River", "Brahmani"],
      correctIndex: 2,
      explanation: "The Kalinga War was fought in 261 BC along the banks of the Daya River near Dhauli (Bhubaneswar). The blood filled the river, leading to Ashoka's remorse.",
      shortExplanation: "Daya River near Bhubaneswar, 261 BC.",
      subject: "Odisha GK",
      topic: "History of Odisha"
    },
    {
      id: "ocs-q3",
      question: "In which year did the famous maritime trade festival 'Bali Jatra' of Cuttack receive National Maritime Heritage Status?",
      options: ["2018", "2020", "2022", "2024"],
      correctIndex: 2,
      explanation: "Bali Jatra, the historic festival celebrating ancient maritime linkages with Southeast Asia (Bali, Java, Sumatra), was organized grandly and granted national recognition around 2022.",
      shortExplanation: "Recognized as a festival of National Maritime Heritage status.",
      subject: "Current Affairs",
      topic: "Odisha Culture & Trade"
    },
    {
      id: "ocs-q4",
      question: "Select the correct Odia translation of: 'Sincerity and hard work are the keys to crack competitive examinations.'",
      options: [
        "ନିଷ୍ଠା ଏବଂ କଠିନ ପରିଶ୍ରମ ହେଉଛି ପ୍ରତିଯୋଗିତାମୂଳକ ପରୀକ୍ଷାରେ ସଫଳତା ପାଇଁ ଚାବିକାଠି।",
        "ସତ୍ୟବାଦୀତା ଏବଂ ପ୍ରଚୁର କାମ କଲେ ଚାକିରି ଶୀଘ୍ର ମିଳିଥାଏ।",
        "ନିଷ୍କ୍ରିୟ ରହି କର୍ମ କଲେ ସବୁ କାର୍ଯ୍ୟ ସଫଳ ହୁଏ ନାହିଁ।",
        "କଠୋର ପରିଶ୍ରମ ଓ ପଢାପଢି ଖାଲି ସମୟ କାଟିବାର ମାଧ୍ୟମ ଅଟେ।"
      ],
      correctIndex: 0,
      explanation: "ନିଷ୍ଠା (sincerity) ଏବଂ କଠିନ ପରିଶ୍ରମ (hard work) ହେଉଛି ପ୍ରତିଯୋଗିତାମୂଳକ ପରୀକ୍ଷାରେ (competitive exams) ସଫଳତା ପାଇଁ ଚାବିକାଠି (keys). Option A is the most accurate translation.",
      shortExplanation: "Option A is the exact grammatical equivalent.",
      subject: "Odia Language",
      topic: "Translation & Grammar"
    },
    {
      id: "ocs-q5",
      question: "Which of the following wetlands in Odisha is listed under the Ramsar Convention and is the largest coastal lagoon in India?",
      options: ["Ansupa Lake", "Chilika Lake", "Bhitarakanika Mangroves", "Hirakud Reservoir"],
      correctIndex: 1,
      explanation: "Chilika Lake was designated the first Indian wetland of international importance under the Ramsar Convention in 1981. It is Asia's largest brackish lagoon.",
      shortExplanation: "Chilika brackish water lake was specified in 1981.",
      subject: "Geography",
      topic: "Odisha Wetlands"
    }
  ],
  "ri-full-1": [
    {
      id: "ri-q1",
      question: "The area of a rectangular village layout in Nayagarh is 480 sq meters. If its length is 24 meters, find the perimeter of this layout.",
      options: ["88 meters", "76 meters", "64 meters", "80 meters"],
      correctIndex: 0,
      explanation: "Area = Length x Width => 480 = 24 x Width => Width = 20 meters. Perimeter = 2(Length + Width) = 2(24 + 20) = 2(44) = 88 meters.",
      shortExplanation: "Width = 480 / 24 = 20 m. Perimeter = 2(24 + 19/1) = 88m.",
      subject: "Quantitative Aptitude",
      topic: "Mensuration 2D"
    },
    {
      id: "ri-q2",
      question: "Who was the leader of the famous 'Paika Rebellion' of 1817 in Khurda, Odisha?",
      options: ["Surendra Sai", "Baxi Jagabandhu", "Chakra Bisoyi", "Dharani Dhar Naik"],
      correctIndex: 1,
      explanation: "Baxi Jagabandhu Bidyadhar Mohapatra Bhramarbar Ray was the commander-of-forces of the King of Khurda who led the Paika Rebellion of 1817 against the British.",
      shortExplanation: "Led by Baxi Jagabandhu in Khurda in 1817.",
      subject: "Odisha GK",
      topic: "Modern History"
    },
    {
      id: "ri-q3",
      question: "In computer science, what does 'O' stand for in 'BIOS', a crucial system boot program?",
      options: ["Online", "Output", "Object", "Operation"],
      correctIndex: 1,
      explanation: "BIOS stands for Basic Input/Output System. It initialises hardware and boots up the operating system.",
      shortExplanation: "Basic Input/Output System.",
      subject: "Computer Awareness",
      topic: "Hardware & Booting"
    }
  ],
  "osstet-tgt-arts": [
    {
      id: "osstet-q1",
      question: "According to the author, what was the primary focus of traditional 'Pathasalas' in Odisha?",
      options: ["Purely technological vocational workshops", "Vocabulary training and scriptural learning", "Maritime trade sciences and navigation", "Advanced modern chemistry and mathematics"],
      correctIndex: 1,
      explanation: "The passage states 'the Pathasalas and Tolas served as local epicenters of vocabulary and scriptural training.'",
      shortExplanation: "Traditional school focused on vocabulary and scripture.",
      subject: "Pedagogy & English",
      topic: "Odisha Historical Education",
      passage: "The development of educational curriculum in Odisha has historically been deeply rooted in traditional art, language, and cultural pedagogy. Long before modern schools emerged, the 'Pathasalas' and 'Tolas' served as local epicenters of vocabulary and scriptural training. In the 21st century, the integration of digital technology with native Odia teaching modules has presented both extraordinary opportunities and unique pedagogical hurdles. Under the '5T Initiative' of the Odisha School Education Programme Authority (OSEPA), classrooms across the state have been transformed with smart boards and interactive digital laboratories.\n\nHowever, educational psychologists argue that technology cannot substitute the structural impact of bilingual classroom discussions. In a culturally rich state like Odisha, where tribal dialects like Santhali and Kui co-exist with mainstream Odia, a teacher's pedagogy must be highly adaptive. Culturally Responsive Pedagogy (CRP) suggests that teachers must connect school curriculum with local regional history, traditional folktale elements, and village agrarian science. When a child learns mathematics through local agricultural trade examples, or studies environmental sciences through Chilika's biodiversity, the conceptual retention is substantially heightened. Therefore, the contemporary challenge for Odisha's educators is not merely the adoption of smart classrooms, but synthesizing digital resources with cultural assets."
    },
    {
      id: "osstet-q2",
      question: "Under which state program have classrooms across Odisha been restructured with interactive smart boards?",
      options: ["Mo School Abhiyan Plan", "Odisha State Digital Hub Scheme", "The 5T Initiative of OSEPA", "Modern Gurukul Framework"],
      correctIndex: 2,
      explanation: "The text explicitly mentions 'Under the 5T Initiative of the Odisha School Education Programme Authority (OSEPA), classrooms across the state have been transformed with smart boards...'",
      shortExplanation: "Restructured under 5T Initiative.",
      subject: "Pedagogy & English",
      topic: "State Initiatives",
      passage: "The development of educational curriculum in Odisha has historically been deeply rooted in traditional art, language, and cultural pedagogy. Long before modern schools emerged, the 'Pathasalas' and 'Tolas' served as local epicenters of vocabulary and scriptural training. In the 21st century, the integration of digital technology with native Odia teaching modules has presented both extraordinary opportunities and unique pedagogical hurdles. Under the '5T Initiative' of the Odisha School Education Programme Authority (OSEPA), classrooms across the state have been transformed with smart boards and interactive digital laboratories.\n\nHowever, educational psychologists argue that technology cannot substitute the structural impact of bilingual classroom discussions. In a culturally rich state like Odisha, where tribal dialects like Santhali and Kui co-exist with mainstream Odia, a teacher's pedagogy must be highly adaptive. Culturally Responsive Pedagogy (CRP) suggests that teachers must connect school curriculum with local regional history, traditional folktale elements, and village agrarian science. When a child learns mathematics through local agricultural trade examples, or studies environmental sciences through Chilika's biodiversity, the conceptual retention is substantially heightened. Therefore, the contemporary challenge for Odisha's educators is not merely the adoption of smart classrooms, but synthesizing digital resources with cultural assets."
    },
    {
      id: "osstet-q3",
      question: "What does the concept of 'Culturally Responsive Pedagogy' (CRP) advocate for educators?",
      options: [
        "Avoiding local history to maintain uniform national textbook syllabus",
        "Synthesizing the school curriculum with regional history, local folktales, and agrarian science",
        "Shifting classroom discussions entirely to digital smart-board lectures without human interaction",
        "Forcing non-native languages as the absolute medium of primary primary education"
      ],
      correctIndex: 1,
      explanation: "The passage highlights that Culturally Responsive Pedagogy suggests connecting the school syllabus with local regional history, traditional folktales, and village agrarian sciences to heighten conceptual retention.",
      shortExplanation: "Integrates curriculum with regional culture.",
      subject: "Pedagogy & English",
      topic: "Modern Theories",
      passage: "The development of educational curriculum in Odisha has historically been deeply rooted in traditional art, language, and cultural pedagogy. Long before modern schools emerged, the 'Pathasalas' and 'Tolas' served as local epicenters of vocabulary and scriptural training. In the 21st century, the integration of digital technology with native Odia teaching modules has presented both extraordinary opportunities and unique pedagogical hurdles. Under the '5T Initiative' of the Odisha School Education Programme Authority (OSEPA), classrooms across the state have been transformed with smart boards and interactive digital laboratories.\n\nHowever, educational psychologists argue that technology cannot substitute the structural impact of bilingual classroom discussions. In a culturally rich state like Odisha, where tribal dialects like Santhali and Kui co-exist with mainstream Odia, a teacher's pedagogy must be highly adaptive. Culturally Responsive Pedagogy (CRP) suggests that teachers must connect school curriculum with local regional history, traditional folktale elements, and village agrarian science. When a child learns mathematics through local agricultural trade examples, or studies environmental sciences through Chilika's biodiversity, the conceptual retention is substantially heightened. Therefore, the contemporary challenge for Odisha's educators is not merely the adoption of smart classrooms, but synthesizing digital resources with cultural assets."
    },
    {
      id: "osstet-q4",
      question: "Why is a highly adaptive bilingual pedagogy considered vital inside Odisha's classrooms?",
      options: [
        "Because tribal dialects like Santhali and Kui co-exist with mainstream Odia",
        "Because student strength is extremely limited across coastal districts",
        "Because teachers are legally barred from using a single text language",
        "To decrease modern smart board operation dependency"
      ],
      correctIndex: 0,
      explanation: "'In a culturally rich state like Odisha, where tribal dialects like Santhali and Kui co-exist with mainstream Odia, a teacher's pedagogy must be highly adaptive.'",
      shortExplanation: "Essential due to linguistic diversity.",
      subject: "Pedagogy & English",
      topic: "Classroom Challenges",
      passage: "The development of educational curriculum in Odisha has historically been deeply rooted in traditional art, language, and cultural pedagogy. Long before modern schools emerged, the 'Pathasalas' and 'Tolas' served as local epicenters of vocabulary and scriptural training. In the 21st century, the integration of digital technology with native Odia teaching modules has presented both extraordinary opportunities and unique pedagogical hurdles. Under the '5T Initiative' of the Odisha School Education Programme Authority (OSEPA), classrooms across the state have been transformed with smart boards and interactive digital laboratories.\n\nHowever, educational psychologists argue that technology cannot substitute the structural impact of bilingual classroom discussions. In a culturally rich state like Odisha, where tribal dialects like Santhali and Kui co-exist with mainstream Odia, a teacher's pedagogy must be highly adaptive. Culturally Responsive Pedagogy (CRP) suggests that teachers must connect school curriculum with local regional history, traditional folktale elements, and village agrarian science. When a child learns mathematics through local agricultural trade examples, or studies environmental sciences through Chilika's biodiversity, the conceptual retention is substantially heightened. Therefore, the contemporary challenge for Odisha's educators is not merely the adoption of smart classrooms, but synthesizing digital resources with cultural assets."
    },
    {
      id: "osstet-q5",
      question: "What is described as the 'contemporary challenge' for Odisha's teachers in the 21st century?",
      options: [
        "Transitioning fully from science streams back to classical scripts",
        "Discarding smart boards to avoid technical dependency errors",
        "Synthesizing digital technology resources with cultural pedagogical assets",
        "Reducing the duration spent on local environmental geography field trips"
      ],
      correctIndex: 2,
      explanation: "'Therefore, the contemporary challenge for Odisha's educators is not merely the adoption of smart classrooms, but synthesizing digital resources with cultural assets.'",
      shortExplanation: "Synthesizing smart tools with culture assets.",
      subject: "Pedagogy & English",
      topic: "Contemporary Challenges",
      passage: "The development of educational curriculum in Odisha has historically been deeply rooted in traditional art, language, and cultural pedagogy. Long before modern schools emerged, the 'Pathasalas' and 'Tolas' served as local epicenters of vocabulary and scriptural training. In the 21st century, the integration of digital technology with native Odia teaching modules has presented both extraordinary opportunities and unique pedagogical hurdles. Under the '5T Initiative' of the Odisha School Education Programme Authority (OSEPA), classrooms across the state have been transformed with smart boards and interactive digital laboratories.\n\nHowever, educational psychologists argue that technology cannot substitute the structural impact of bilingual classroom discussions. In a culturally rich state like Odisha, where tribal dialects like Santhali and Kui co-exist with mainstream Odia, a teacher's pedagogy must be highly adaptive. Culturally Responsive Pedagogy (CRP) suggests that teachers must connect school curriculum with local regional history, traditional folktale elements, and village agrarian science. When a child learns mathematics through local agricultural trade examples, or studies environmental sciences through Chilika's biodiversity, the conceptual retention is substantially heightened. Therefore, the contemporary challenge for Odisha's educators is not merely the adoption of smart classrooms, but synthesizing digital resources with cultural assets."
    }
  ]
};

// Copy of default static exams representation for surgical merged recovery
const ORIGINAL_STATIC_EXAMS = JSON.parse(JSON.stringify(EXAMS_DATABASE));

function repairAndMergeExams(loadedExams: any): any {
  if (!loadedExams || typeof loadedExams !== "object") {
    return JSON.parse(JSON.stringify(ORIGINAL_STATIC_EXAMS));
  }

  const result: any = {
    board: [],
    teaching: [],
    competitive: [],
    others: []
  };

  const categories = ["board", "teaching", "competitive", "others"] as const;

  categories.forEach(cat => {
    const originalList = ORIGINAL_STATIC_EXAMS[cat] || [];
    const loadedList = Array.isArray(loadedExams[cat]) ? loadedExams[cat] : [];

    // 1. Maintain and repair each predefined original exam structure
    originalList.forEach((origExam: any) => {
      const loadedExam = loadedList.find((le: any) => le.id === origExam.id);
      const repairedExam = JSON.parse(JSON.stringify(origExam));

      if (loadedExam) {
        // Collect extra custom parsed tests that are not predefined
        const extraTests = (loadedExam.tests || []).filter((test: any) => {
          const isPredefined = (origExam.tests || []).some((ot: any) => ot.id === test.id);
          return !isPredefined;
        });

        if (!repairedExam.tests) repairedExam.tests = [];
        repairedExam.tests = [...repairedExam.tests, ...extraTests];

        if (typeof loadedExam.totalQuestions === "number") repairedExam.totalQuestions = loadedExam.totalQuestions;
        if (typeof loadedExam.durationMins === "number") repairedExam.durationMins = loadedExam.durationMins;
        if (typeof loadedExam.negativeMarking === "number") repairedExam.negativeMarking = loadedExam.negativeMarking;
        if (typeof loadedExam.marksPerQuestion === "number") repairedExam.marksPerQuestion = loadedExam.marksPerQuestion;
      }

      result[cat].push(repairedExam);
    });

    // 2. Protect and retain any fully custom series created by the user
    loadedList.forEach((loadedExam: any) => {
      const isPredefined = originalList.some((oe: any) => oe.id === loadedExam.id);
      if (!isPredefined) {
        result[cat].push(JSON.parse(JSON.stringify(loadedExam)));
      }
    });
  });

  return result;
}

// =========================================================================
// HYBRID FIRESTORE & DISK PERSISTENCE FOR ADMIN UPLOADS (EXAMS_DATABASE & QUESTIONS_DATABASE)
// =========================================================================
const EXAMS_FILE = path.join(process.cwd(), "custom_exams_db.json");
const QUESTIONS_FILE = path.join(process.cwd(), "custom_questions_db.json");

// Direct Promise racing to enforce strict bounds on Cloud Firestore operations, 
// completely preventing backend hanging or Gateway Timeouts on serverless Vercel Lambdas.
async function withTimeout<T>(promise: Promise<T>, ms: number = 1200): Promise<T> {
  let timeoutId: any;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new Error(`Firestore query exceeded deadline limit of ${ms}ms`));
    }, ms);
  });
  return Promise.race([promise, timeoutPromise]).finally(() => {
    if (timeoutId) clearTimeout(timeoutId);
  });
}

async function loadPersistedData() {
  // 1. Read files locally from disk as base/initial fallback
  try {
    if (fs.existsSync(EXAMS_FILE)) {
      const data = fs.readFileSync(EXAMS_FILE, "utf-8");
      const parsed = JSON.parse(data);
      if (parsed && typeof parsed === "object") {
        EXAMS_DATABASE = repairAndMergeExams(parsed);
        console.log("🟢 [PERSISTENCE] Loaded and repaired EXAMS_DATABASE from disk.");
      } else {
        EXAMS_DATABASE = JSON.parse(JSON.stringify(ORIGINAL_STATIC_EXAMS));
      }
    } else {
      EXAMS_DATABASE = JSON.parse(JSON.stringify(ORIGINAL_STATIC_EXAMS));
    }
  } catch (err) {
    console.error("❌ [PERSISTENCE] Error loading EXAMS_DATABASE from disk:", err);
    EXAMS_DATABASE = JSON.parse(JSON.stringify(ORIGINAL_STATIC_EXAMS));
  }

  try {
    if (fs.existsSync(QUESTIONS_FILE)) {
      const data = fs.readFileSync(QUESTIONS_FILE, "utf-8");
      const parsed = JSON.parse(data);
      if (parsed && typeof parsed === "object") {
        QUESTIONS_DATABASE = parsed;
        console.log("🟢 [PERSISTENCE] Loaded custom QUESTIONS_DATABASE from disk.");
      }
    }
  } catch (err) {
    console.error("❌ [PERSISTENCE] Error loading QUESTIONS_DATABASE from disk:", err);
  }

  // 2. Fetch live config overrides from Firestore Cloud Database (extremely robust withTimeout constraints)
  if (serverDb) {
    try {
      const examsDoc = await withTimeout(getDoc(doc(serverDb, "admin_config", "exams")), 1200);
      if (examsDoc.exists()) {
        const cloudExams = examsDoc.data();
        if (cloudExams && typeof cloudExams === "object") {
          // Merge custom data arrays safely and repair against original predefined definitions
          EXAMS_DATABASE = repairAndMergeExams(cloudExams);
          console.log("🟢 [PERSISTENCE] Synced & surgically repaired EXAMS_DATABASE from Cloud Firestore.");
          // Instantly sync the merged/repaired version back to Firestore to heal any stale structures
          await savePersistedData();
        }
      }
    } catch (cloudErr) {
      console.warn("⚠️ [PERSISTENCE] Failed to load EXAMS_DATABASE from Cloud Firestore (Enforcing safety fallback):", cloudErr);
    }

    try {
      const questionsDoc = await withTimeout(getDoc(doc(serverDb, "admin_config", "questions")), 1200);
      if (questionsDoc.exists()) {
        const cloudQuestions = questionsDoc.data();
        if (cloudQuestions && typeof cloudQuestions === "object") {
          QUESTIONS_DATABASE = {
            ...QUESTIONS_DATABASE,
            ...cloudQuestions
          };
          console.log("🟢 [PERSISTENCE] Synced dynamic QUESTIONS_DATABASE from Cloud Firestore.");
        }
      }
    } catch (cloudErr) {
      console.warn("⚠️ [PERSISTENCE] Failed to load QUESTIONS_DATABASE from Cloud Firestore (Enforcing safety fallback):", cloudErr);
    }
  }
}

async function savePersistedData() {
  // 1. Write to local disk file system
  try {
    fs.writeFileSync(EXAMS_FILE, JSON.stringify(EXAMS_DATABASE, null, 2), "utf-8");
    fs.writeFileSync(QUESTIONS_FILE, JSON.stringify(QUESTIONS_DATABASE, null, 2), "utf-8");
    console.log("💾 [PERSISTENCE] Successfully saved EXAMS_DATABASE & QUESTIONS_DATABASE to disk.");
  } catch (err) {
    console.error("❌ [PERSISTENCE] Error saving databases to disk:", err);
  }

  // 2. Save/Push live arrays to Cloud Firestore for high-availability
  if (serverDb) {
    try {
      await withTimeout(setDoc(doc(serverDb, "admin_config", "exams"), EXAMS_DATABASE, { merge: true }), 1500);
      await withTimeout(setDoc(doc(serverDb, "admin_config", "questions"), QUESTIONS_DATABASE, { merge: true }), 1500);
      console.log("☁️ [PERSISTENCE] Successfully synced EXAMS_DATABASE & QUESTIONS_DATABASE to Cloud Firestore.");
    } catch (cloudErr) {
      console.error("❌ [PERSISTENCE] Error syncing databases to Cloud Firestore:", cloudErr);
    }
  }
}

let wasLoaded = false;
let loadPromise: Promise<void> | null = null;

async function ensureDataLoaded() {
  if (wasLoaded) return;
  if (!loadPromise) {
    loadPromise = loadPersistedData().then(() => {
      wasLoaded = true;
    }).catch(err => {
      console.error("❌ ensureDataLoaded failed to load persisted data:", err);
      loadPromise = null; // Reset cache so next request retries
      throw err;
    });
  }
  await loadPromise;
}

// Perform initial load in background on boot
ensureDataLoaded().catch(err => {
  console.error("❌ Background persistence loading failed on boot:", err);
});

// Daily Current Affairs (Odisha & national)
const CURRENT_AFFAIRS = [
  {
    id: "ca-1",
    pubDate: "May 22, 2026",
    title: "Odisha Government Announces 'Mo Ghara' Renovation Subsidy Upgrade",
    category: "Odisha Schemes",
    summary: "The state cabinet sanctioned an enhancement in interest subsidy amounts for rural houses under the housing scheme to empower local families.",
    details: "This measure will benefit over 4 lakh rural families in interior districts like Kalahandi, Bolangir, and Koraput. The subsidy cap is raised from ₹60,000 to ₹95,000."
  },
  {
    id: "ca-2",
    pubDate: "May 21, 2026",
    title: "Chilika Development Authority (CDA) Starts Annual Irrawaddy Dolphin Census",
    category: "Environment",
    summary: "The census counts the rare Irrawaddy dolphin populations in Chilika Lake using modern hydrophone sensor arrays.",
    details: "Last year's count registered 173 dolphins. Scientists are anticipating stable numbers owing to the proactive removal of illegal shrimp gherries."
  },
  {
    id: "ca-3",
    pubDate: "May 20, 2026",
    title: "Bhubaneswar Selected as Center of Excellence for Emerging Educational Technologies",
    category: "Education & Tech",
    summary: "The Union Ministry is establishing a multi-crore specialized center to foster AI research in local languages including Odia speech synthesis.",
    details: "The center will collaborate with premium institutions like IIT Bhubaneswar and NIT Rourkela to produce personalized academic models."
  }
];

// Jobs Alerts & Recruitment Calendar
const JOB_ALERTS = [
  {
    id: "job-1",
    title: "OSSSC Statistical Field Surveyor (SFS) Recruitment 2026",
    posts: "870 Posts",
    deadline: "June 25, 2026",
    qual: "12th Standard Pass with Computer proficiency",
    link: "https://www.osssc.gov.in"
  },
  {
    id: "job-2",
    title: "OPSC Junior Assistant (Group C) Posts",
    posts: "142 Posts",
    deadline: "June 18, 2026",
    qual: "Graduate with DCA certificate from registered institute",
    link: "https://www.opsc.gov.in"
  },
  {
    id: "job-3",
    title: "Odisha Police Constable Recruitment Call",
    posts: "2,450 Posts",
    deadline: "July 05, 2026",
    qual: "10th Class (Board of Secondary Education, Odisha)",
    link: "https://odishapolice.gov.in"
  }
];

// Mock Leaderboard (Odisha Toppers - Multi-district)
const LEADERBOARD_DATA = [
  { rank: 1, name: "Pranjya Paramita Sahu", district: "Khordha", points: 4890, testCount: 42, activeStreak: 18 },
  { rank: 2, name: "Sushree Subhalaxmi", district: "Sambalpur", points: 4720, testCount: 39, activeStreak: 12 },
  { rank: 3, name: "Ansuman Mohapatra", district: "Cuttack", points: 4610, testCount: 35, activeStreak: 25 },
  { rank: 4, name: "Debashis Pradhan", district: "Balasore", points: 4450, testCount: 31, activeStreak: 9 },
  { rank: 5, name: "Alok Kumar Behera", district: "Ganjam", points: 4320, testCount: 33, activeStreak: 15 },
  { rank: 6, name: "Subhadra Priyadarshini", district: "Puri", points: 4250, testCount: 28, activeStreak: 7 },
  { rank: 7, name: "Rakesh Ranjan Panda", district: "Mayurbhanj", points: 4180, testCount: 30, activeStreak: 10 }
];

// In-Memory discussion thread storage (Doubt Forum)
const FORUM_POSTS = [
  {
    id: "fp-1",
    author: "Sipra Muduli",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80",
    exam: "OPSC OCS",
    text: "Can someone confirm the exact date when the British force entered Puri during the Khurda occupation? Is it October or September 1803?",
    time: "2 hours ago",
    likes: 12,
    replies: [
      { author: "Satya Jena", text: "Colonel Harcourt's forces reached Puri on September 18, 1803, without meeting resistance from Marathas." }
    ]
  },
  {
    id: "fp-2",
    author: "Jagannath Das",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80",
    exam: "OSSSC RI",
    text: "Is negative marking applicable in OSSSC RI 2026? The prospectus says 0.25, but some teachers say it has been raised to 0.33.",
    time: "5 hours ago",
    likes: 4,
    replies: [
      { author: "Admin", text: "Yes, it is officially 0.25 deduction for every wrong answer. Check our blueprint calculator in the app target section." }
    ]
  }
];

// Static Study Material PDFs Mock
const STUDY_MATERIALS = [
  { id: "pdf-gk-odisha", title: "Comprehensive Odisha GK & History Chronology", size: "4.2 MB", type: "PDF", downloads: 1245 },
  { id: "pdf-mth-blueprint", title: "OSSSC Mathematics Short Hacks & Formula Book", size: "2.8 MB", type: "PDF", downloads: 890 },
  { id: "pdf-odia-vyakarana", title: "Odia Vyakarana Essentials for Competitive Exams", size: "1.9 MB", type: "PDF", downloads: 3410 },
  { id: "pdf-may-current", title: "May 2026 Integrated Odisha & India Monthly Magazine", size: "5.1 MB", type: "PDF", downloads: 720 }
];

// Dynamic test analytics and simulated battle logic
let activeBattleSessions: any[] = [];

// ==========================================
// API ROUTE DEFINITIONS
// ==========================================

// 1. Get Exams
app.get("/api/exams-data", async (req, res) => {
  try {
    await ensureDataLoaded();
    res.json(EXAMS_DATABASE);
  } catch (err) {
    console.error("Error loaded exams:", err);
    res.status(500).json({ error: "Failed to load database." });
  }
});

// 2. Get Mock Questions for specific Test with smart theme-relevant dynamic generator
app.get("/api/test-questions/:testId", async (req, res) => {
  const { testId } = req.params;
  
  try {
    await ensureDataLoaded();
  } catch (err) {
    console.error("Error loading questions fallback:", err);
  }
  
  if (QUESTIONS_DATABASE[testId]) {
    return res.json(QUESTIONS_DATABASE[testId]);
  }

  // Generate 5 custom questions based on the exam details
  const lowerId = testId.toLowerCase();
  let generatedQuestions: any[] = [];

  if (lowerId.includes("mth") || lowerId.includes("math")) {
    generatedQuestions = [
      {
        id: `${testId}-q1`,
        question: "Find the mean of prime numbers between 1 and 10 as per board syllabus rules.",
        options: ["4.15", "5.62", "4.25", "5.0"],
        correctIndex: 2,
        explanation: "Prime numbers between 1 and 10 are: 2, 3, 5, 7. Mean = (2+3+5+7)/4 = 17/4 = 4.25.",
        shortExplanation: "Mean of 2, 3, 5, 7 is 4.25.",
        subject: "Mathematics",
        topic: "Statistics / Algebra"
      },
      {
        id: `${testId}-q2`,
        question: "If log 2 = 0.3010 and log 3 = 0.4771, calculate the value of log 6.",
        options: ["0.1761", "0.7781", "0.6020", "1.4320"],
        correctIndex: 1,
        explanation: "log 6 = log (2 * 3) = log 2 + log 3 = 0.3010 + 0.4771 = 0.7781.",
        shortExplanation: "log 6 = log 2 + log 3 = 0.7781.",
        subject: "Mathematics",
        topic: "Logarithms"
      },
      {
        id: `${testId}-q3`,
        question: "If a circle has area 154 sq cm, find its circumference. (Use pi = 22/7)",
        options: ["33 cm", "22 cm", "44 cm", "55 cm"],
        correctIndex: 2,
        explanation: "Area = pi * r^2 = 154 => (22/7) * r^2 = 154 => r^2 = 49 => r = 7. Circumference = 2 * pi * r = 2 * (22/7) * 7 = 44 cm.",
        shortExplanation: "r = 7 cm. Circumference = 44 cm.",
        subject: "Mathematics",
        topic: "Mensuration"
      },
      {
        id: `${testId}-q4`,
        question: "Solve the quadratic equation x^2 - 5x + 6 = 0 for x.",
        options: ["x = 2 and x = 3", "x = -2 and x = -3", "x = 1 and x = 5", "x = 0 and x = 6"],
        correctIndex: 0,
        explanation: "x^2 - 3x - 2x + 6 = 0 => x(x-3) - 2(x-3) = 0 => (x-2)(x-3) = 0. Thus, x = 2 and x = 3.",
        shortExplanation: "Roots are 2 and 3.",
        subject: "Mathematics",
        topic: "Quadratic Equations"
      },
      {
        id: `${testId}-q5`,
        question: "In trigonometry, what is the value of (sin 30° + cos 60°)?",
        options: ["1.5", "0.5", "1.0", "0.0"],
        correctIndex: 2,
        explanation: "sin 30° = 0.5. cos 60° = 0.5. sum = 0.5 + 0.5 = 1.0.",
        shortExplanation: "sin 30° + cos 60° = 1/2 + 1/2 = 1.",
        subject: "Mathematics",
        topic: "Trigonometry"
      }
    ];
  } else if (lowerId.includes("sci") || lowerId.includes("phy") || lowerId.includes("pcm") || lowerId.includes("cbz")) {
    generatedQuestions = [
      {
        id: `${testId}-q1`,
        question: "Which of the following elements has the highest electrical conductivity under normal room temperatures?",
        options: ["Silver", "Copper", "Gold", "Aluminium"],
        correctIndex: 0,
        explanation: "Silver contains the largest number of free mobile electrons per unit volume, making it the finest conductor of electricity.",
        shortExplanation: "Silver has the highest known conductivity.",
        subject: "Physics",
        topic: "Electricity"
      },
      {
        id: `${testId}-q2`,
        question: "What is the chemical formula of 'Gypsum', a mineral commonly used in cement manufacturing in Jajpur and Odisha?",
        options: ["CaSO4 • 2H2O", "CaSO4 • 1/2 H2O", "CaCO3", "CaO"],
        correctIndex: 0,
        explanation: "Gypsum is Calcium Sulfate Dihydrate: CaSO4 • 2H2O. Plaster of Paris is CaSO4 • 1/2 H2O.",
        shortExplanation: "CaSO4 • 2H2O is Gypsum.",
        subject: "Chemistry",
        topic: "Compounds"
      },
      {
        id: `${testId}-q3`,
        question: "In biological cells, which organelle is referred to as the 'Powerhouse of the cell'?",
        options: ["Nucleus", "Ribosome", "Mitochondria", "Golgi apparatus"],
        correctIndex: 2,
        explanation: "Mitochondria convert nutrients into adenosine triphosphate (ATP), the chemical energy currency of the cell.",
        shortExplanation: "Mitochondria produce ATP.",
        subject: "Biology",
        topic: "Cell Structure"
      },
      {
        id: `${testId}-q4`,
        question: "The power of a lens is -2.0 Diopters. What is its focal length?",
        options: ["-50 cm", "-20 cm", "+50 cm", "+20 cm"],
        correctIndex: 0,
        explanation: "Focal length f = 1 / P. f = 1 / -2.0 meters = -0.5 meters = -50 cm. The negative sign denotes a concave lens.",
        shortExplanation: "f = 1/P = -0.5 m = -50 cm.",
        subject: "Physics",
        topic: "Optics"
      },
      {
        id: `${testId}-q5`,
        question: "Which of the following organic acids is naturally present in Tamarind?",
        options: ["Citric Acid", "Tartaric Acid", "Lactic Acid", "Oxalic Acid"],
        correctIndex: 1,
        explanation: "Tamarind fruit is rich in Tartaric Acid, which gives it its strong sour taste used in regional sour Kanji preparation.",
        shortExplanation: "Tartaric Acid.",
        subject: "Chemistry",
        topic: "Acids"
      }
    ];
  } else if (lowerId.includes("arts") || lowerId.includes("sanskrit") || lowerId.includes("hindi") || lowerId.includes("odia")) {
    generatedQuestions = [
      {
        id: `${testId}-q1`,
        question: "Who is traditionally regarded as the 'Aadi Kabi' of Odia literature, authoring the monumental Odia Mahabharata?",
        options: ["Achyutananda Das", "Sarala Das", "Jagannath Das", "Upendra Bhanja"],
        correctIndex: 1,
        explanation: "Sarala Das of Jhankada, Jagatsinghpur is the revered Aadi Kabi who composed the Mahabharat and Chandi Purana in regional language.",
        shortExplanation: "Aadi Kabi Sarala Das wrote the Odia Mahabharat.",
        subject: "Languages",
        topic: "Odia Literature"
      },
      {
        id: `${testId}-q2`,
        question: "In Sanskrit grammar, which case (Vibhakti) corresponds to the 'Apadana' karaka (instrument of separation/from)?",
        options: ["Tritiya", "Chaturthi", "Panchami", "Sasthi"],
        correctIndex: 2,
        explanation: "Panchami Vibhakti (5th Case) is used for Apadana Karaka, signaling separation, fear, or source (e.g., 'vriksat patrani patanti').",
        shortExplanation: "Panchami is used for Apadana.",
        subject: "Sanskrit",
        topic: "Vibhakti & Karaka"
      },
      {
        id: `${testId}-q3`,
        question: "Who wrote the famous Sanskrit text 'Gita Govinda', describing the divine love of Lord Krishna and Radha in Puri?",
        options: ["Jayadeva", "Kalidasa", "Banabhatta", "Visakhadatta"],
        correctIndex: 0,
        explanation: "Sri Jayadeva, a great Sanskrit poet of Kendrapara/Prachi Valley in Odisha, composed the Gita Govinds in the 12th century.",
        shortExplanation: "Composed by Poet Jayadeva.",
        subject: "Sanskrit",
        topic: "Literature"
      },
      {
        id: `${testId}-q4`,
        question: "According to the Indian Constitution, under which Article are standard guidelines for elementary education eligibility described?",
        options: ["Article 21A", "Article 19", "Article 32", "Article 44"],
        correctIndex: 0,
        explanation: "Article 21A provides the Right to Education, making free and compulsory education for children of age 6 to 14 a Fundamental Right.",
        shortExplanation: "Article 21A provides Right to Education.",
        subject: "Social Studies",
        topic: "Constitution"
      },
      {
        id: `${testId}-q5`,
        question: "Identify the correct antonym of the Hindi word 'Anurag' (affection/love).",
        options: ["Virag", "Prem", "Harsh", "Ghrina"],
        correctIndex: 0,
        explanation: "The direct semantic antonym of Anurag (affectionate attraction) is Virag (detached indifferency).",
        shortExplanation: "Virag is the opposite of Anurag.",
        subject: "Hindi Language",
        topic: "Antonyms"
      }
    ];
  } else if (lowerId.includes("pet")) {
    generatedQuestions = [
      {
        id: `${testId}-q1`,
        question: "In human physiology, which muscle of the body is commonly termed the 'calves'?",
        options: ["Gastrocnemius", "Biceps Femoris", "Gluteus Maximus", "Deltoid"],
        correctIndex: 0,
        explanation: "The Gastrocnemius muscle is located at the back of the lower leg, forming the bulk of the calf muscle group.",
        shortExplanation: "Gastrocnemius forms the calf muscle.",
        subject: "Physical Education",
        topic: "Human Anatomy"
      },
      {
        id: `${testId}-q2`,
        question: "What is the standard length of an international outdoor running athletics track?",
        options: ["200 meters", "300 meters", "400 meters", "500 meters"],
        correctIndex: 2,
        explanation: "Standard competition outdoor tracks are exactly 400 meters in circumference with 2 straights and 2 curves.",
        shortExplanation: "400 meters is standard.",
        subject: "Physical Education",
        topic: "Atheletics Rules"
      },
      {
        id: `${testId}-q3`,
        question: "How many active field players (excluding substitutes) are on the court per team in standard Handball?",
        options: ["5 players", "7 players", "9 players", "11 players"],
        correctIndex: 1,
        explanation: "A standard Handball team has 7 players on court (6 court runners and 1 goalkeeper).",
        shortExplanation: "7 players per team on court.",
        subject: "Sports GK",
        topic: "Handball"
      },
      {
        id: `${testId}-q4`,
        question: "Which vitamin is synthesized in the skin when exposed to radiant Sun ultraviolet rays?",
        options: ["Vitamin A", "Vitamin B12", "Vitamin C", "Vitamin D"],
        correctIndex: 3,
        explanation: "Vitamin D (Calciferol) is manufactured when dehydrocholesterol in the skin reacts with sunlight UV rays.",
        shortExplanation: "Vitamin D is solar-synthesized.",
        subject: "Health Education",
        topic: "Vitamins"
      },
      {
        id: `${testId}-q5`,
        question: "What is the primary target of 'Cardiorespiratory Endurance' training?",
        options: ["Muscular strength", "Lungs and Heart performance", "Flexibility", "Reaction time"],
        correctIndex: 1,
        explanation: "Cardiorespiratory training targets the stamina of the cardiovascular system (heart) and respiratory system (lungs) to stream oxygen to working muscles during activities.",
        shortExplanation: "Lungs and Heart capability.",
        subject: "Physical Training",
        topic: "Stamina"
      }
    ];
  } else {
    // General fallback matching pedagogy or general aptitude
    generatedQuestions = [
      {
        id: `${testId}-q1`,
        question: "Which educational psychologist introduced standard 'Trial and Error' theory of learning?",
        options: ["Edward Thorndike", "Jean Piaget", "Lev Vygotsky", "B.F. Skinner"],
        correctIndex: 0,
        explanation: "Edward Thorndike proposed the Trial and Error learning theory, illustrating that animals/humans learn patterns by trying options and registering physical feedback (Law of Effect).",
        shortExplanation: "Thorndike's trial & error connectionism.",
        subject: "Pedagogy",
        topic: "Learning Theories"
      },
      {
        id: `${testId}-q2`,
        question: "Which of the following is an example of formative assessment in classroom teaching?",
        options: ["Yearly Board Exams", "Weekly Class Quiz", "Semester Exams", "Certificate Verification Test"],
        correctIndex: 1,
        explanation: "Formative assessment is continuous check during the term to shape learning, such as weekly pop quizzes, as opposed to summative tests like yearly finals.",
        shortExplanation: "Weekly quiz is a formative assessment.",
        subject: "Pedagogy",
        topic: "Evaluation"
      },
      {
        id: `${testId}-q3`,
        question: "How should a teacher handle a candidate who frequently asks innovative out-of-syllabus questions?",
        options: ["Chide the candidate", "Answer after class or encourage self-research", "Ignore the question", "Direct them to principal"],
        correctIndex: 1,
        explanation: "A professional teacher nurtures intrinsic scientific curiosity by answering either during or after class, guiding candidates to self-directed library study.",
        shortExplanation: "Encourage curiosity constructively.",
        subject: "Pedagogy",
        topic: "Classroom Management"
      },
      {
        id: `${testId}-q4`,
        question: "According to Piaget's Cognitive stages, in which stage do children understand the law of 'Conservation' of mass / water quantities?",
        options: ["Sensory-motor", "Pre-operational", "Concrete Operational", "Formal Operational"],
        correctIndex: 2,
        explanation: "At the Concrete Operational stage (ages 7 to 11), children develop logic, realizing that spreading water into tall vs wide cups does not alter total amount.",
        shortExplanation: "Concrete Operational (7-11 years) conservation.",
        subject: "Pedagogy",
        topic: "Cognitive Development"
      },
      {
        id: `${testId}-q5`,
        question: "What is the primary instructional medium recommended by National Education Policy 2020 for early elementary learning?",
        options: ["English only", "Home Language / Mother Tongue", "National Language", "Sanskrit"],
        correctIndex: 1,
        explanation: "NEP 2020 specifies that, where possible, the medium of instruction till at least Class 5 should be the child's mother tongue / home regional language (like Odia in Odisha).",
        shortExplanation: "Home Language / Mother Tongue for early classes.",
        subject: "Pedagogy",
        topic: "Syllabus Policy"
      }
    ];
  }

  res.json(generatedQuestions);
});

// 3. Current affairs feed
app.get("/api/current-affairs", (req, res) => {
  res.json(CURRENT_AFFAIRS);
});

// 4. Job Alerts feed
app.get("/api/job-alerts", (req, res) => {
  res.json(JOB_ALERTS);
});

// 5. Leaderboard feed
app.get("/api/leaderboard", (req, res) => {
  res.json(LEADERBOARD_DATA);
});

// 6. Discussion forum posts
app.get("/api/forum-posts", (req, res) => {
  res.json(FORUM_POSTS);
});

app.post("/api/forum-posts", (req, res) => {
  const { author, text, exam } = req.body;
  const newPost = {
    id: `fp-${Date.now()}`,
    author: author || "Ganesh Swain",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&auto=format&fit=crop&q=80",
    exam: exam || "General",
    text,
    time: "Just now",
    likes: 0,
    replies: []
  };
  FORUM_POSTS.unshift(newPost);
  res.json(newPost);
});

// 7. Study materials
app.get("/api/study-materials", (req, res) => {
  res.json(STUDY_MATERIALS);
});

// 8. AI Doubt Solver proxy with GoogleGenAI (@google/genai SDK)
app.post("/api/ai/doubt", async (req, res) => {
  const { chatHistory, userMessage, examTarget } = req.body;
  const ai = getAi();

  if (!ai) {
    // Simulated Offline AI Solver (gives professional answers if API is not setup yet)
    let simulatedResponse = `Namaskar! As your dedicated Odisha Exam AI Assistant, I’ve completed a quick retrieval of our Odia academic archives. Here is a comprehensive synthesis of your query:\n\n`;
    if (userMessage.toLowerCase().includes("baxi") || userMessage.toLowerCase().includes("paika")) {
      simulatedResponse += `**Paika Rebellion (1817):** Baxi Jagabandhu was the commander of the forces of the King of Khurda. The rebellion occurred against colonial land revenues and salt tax in Khurda. It's recognized proudly as one of the earliest freedom struggles of India.`;
    } else if (userMessage.toLowerCase().includes("bande") || userMessage.toLowerCase().includes("janani")) {
      simulatedResponse += `**Bande Utkala Janani:** Composed by Kantakabi Laxmikanta Mohapatra in 1912. It became the official State Anthem of Odisha on June 7, 2020. The lyric praises the sacred geography, beautiful oceans, green forests, and proud heritage of Utkala.`;
    } else if (userMessage.toLowerCase().includes("syllabus") || userMessage.toLowerCase().includes("pattern")) {
      simulatedResponse += `**Odisha RI Syllabus 2026:** Consists of 2 primary sections including: 
1. General Studies & Mathematics (100 MCQ marks / 2 hours)
2. English & Odia Language along with basic Computer Awareness (100 MCQ marks / 2 hours)
Total marks: 200, with a negative marking deduction penalty of **0.25** for every incorrect response.`;
    } else {
      simulatedResponse += `For your target **${examTarget || "Odisha Exams"}**, your query is very important. To answer effectively, please make sure you register your actual **GEMINI_API_KEY** inside the AI Studio Secrets panel. This will activate our massive LLM model! In the meantime, study hard, focus on your weak areas in Quantitative Aptitude, and score top ranks!`;
    }
    return res.json({ text: simulatedResponse, isSimulated: true });
  }

  try {
    const chatPrompt = `You are "Prerana AI", the legendary AI Academic Mentor & Tutor for the "Odisha Exam" prep platform. 
    You are professional, highly knowledgeable about Odisha history, culture, geography, and all competitive/boards syllabus (e.g. OPSC, OSSSC, OSSC, BSE Odisha 10th, CHSE Odisha).
    Answer clearly in a student-friendly format. If needed, give explanations both in clear English and simple Odia translations to give an authentic regional feeling.
    The student's target exam is: ${examTarget || "All Odisha Exams"}.
    Student's question: "${userMessage}"`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: chatPrompt,
    });

    const textOutput = response.text || "No response generated by AI model. Please try again.";
    res.json({ text: textOutput, isSimulated: false });
  } catch (err: any) {
    console.error("Gemini API Error in Server Doubt Solver:", err);
    res.status(500).json({ error: err.message || "Something went wrong in AI Doubt engine." });
  }
});

// 9. AI Study Plan Generator
app.post("/api/ai/study-plan", async (req, res) => {
  const { examName, targetHours, weakTopics } = req.body;
  const ai = getAi();

  if (!ai) {
    // Return structured offline plan
    const simulatedPlan = `Based on your chosen test path **${examName}**, here is a robust **7-Day Master Preparation Blueprint**:
- **Day 1-2 (General Studies - 2.5 hrs):** focus on ${weakTopics ? weakTopics : "Odisha Geography and rivers (Baitarani, Budhabalanga)"}. Solve previous years' papers.
- **Day 3 (Logic & Math - 2 hrs):** solve 20 Mensuration formulas and complete a Speed Mathematics module.
- **Day 4 (Language Pedagogy - 1.5 hrs):** evaluate Odia sandhi vichheda rules and typical vyakarana idioms.
- **Day 5-6 (Practice Battle):** Sit for 2 Full Syllabus Mock Exams under actual time limits on the Odisha Exam app.
- **Day 7 (Revision):** Redraw formula sheets and test review palette.
*Tip: Study consistently in English + Odia dual streams.*`;
    return res.json({ text: simulatedPlan, isSimulated: true });
  }

  try {
    const planPrompt = `Create a weekly structured, highly specific study schedule for an Odisha student preparing for "${examName}". 
    They can commit "${targetHours} hours per day" and their weak areas are "${weakTopics || "general topics"}".
    Deliver the response as a clean, structured schedule with daily bullet points, specific Odisha focus references (such as Odisha History, BSE books, regional current affairs), and an encouraging tone. Keep the answer structured using standard Markdown.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: planPrompt,
    });

    res.json({ text: response.text, isSimulated: false });
  } catch (err: any) {
    console.error("Gemini API Error in Study Planner:", err);
    res.status(500).json({ error: err.message });
  }
});

// 10. AI Scorecard Performance Analyzer
app.post("/api/ai/analyze-performance", async (req, res) => {
  const { scorecard } = req.body;
  // scorecard: { testTitle, marks, totalMarks, correct, wrong, accuracy, timeSpent, weakAreaSubject }
  const ai = getAi();

  if (!ai) {
    const explanation = `**AI Insights for ${scorecard.testTitle}:**
1. **Accuracy Threshold:** Your accuracy was **${scorecard.accuracy}%**. A high rate (>85%) is required for OSSSC/OPSC screening due to competitive cut-offs.
2. **Negative Penalty Impact:** You lost valuable marks on ${scorecard.wrong} incorrect answers. Since negative marking is ${scorecard.negativeMarking || '0.25'}, guessing without logic impairs your merit ranking.
3. **Regional Focus recommendation:** Dedicate next 48 hours strictly to **${scorecard.weakAreaSubject || "Odisha Ancient History"}**. Practice daily chapter-wise MCQ tests!`;
    return res.json({ text: explanation, isSimulated: true });
  }

  try {
    const analysisPrompt = `A student has just completed a mock test titled "${scorecard.testTitle}" on our platform. 
    Here are their metrics:
    - Marks Scored: ${scorecard.marks} / ${scorecard.totalMarks}
    - Correct Answers: ${scorecard.correct}
    - Wrong Answers: ${scorecard.wrong}
    - Accuracy percentage: ${scorecard.accuracy}%
    - Time spent: ${scorecard.timeSpent} seconds
    - Weak subject specified: ${scorecard.weakAreaSubject || "Mixed topics"}

    Analyze these stats as an elite Bihar and Odisha exam strategist. Give them:
    1. A bulleted assessment of their accuracy vs speed.
    2. Specific remedial actions they must take relating to negative markings.
    3. An inspirational quote reference from Odisha high-achievers or standard motivational tips. Use bold headers for each section.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: analysisPrompt,
    });

    res.json({ text: response.text, isSimulated: false });
  } catch (err: any) {
    console.error("Gemini API Error in Performance Analysis:", err);
    res.status(500).json({ error: err.message });
  }
});

// 11. Custom Admin AI Word Document/Text Sheet MCQ Mock Test Parser
app.post("/api/admin/parse-test", async (req, res) => {
  try {
    await ensureDataLoaded();
  } catch (err) {
    console.error("ensureDataLoaded failure in parse-test:", err);
  }

  const {
    rawText,
    examCategory, // board | teaching | competitive | others
    examId,       // e.g. cbse-board
    testId,       // existing testId or "new"
    newTestTitle, // parsed title
    durationMins,
    negativeMarking,
    marksPerQuestion
  } = req.body;

  if (!rawText || !rawText.trim()) {
    return res.status(400).json({ error: "Missing mock test sheet raw text content." });
  }

  const ai = getAi();
  let parsedQuestions: any[] = [];
  let mode = "AI";

  if (!ai) {
    console.warn("GEMINI_API_KEY placeholder or unassigned. Falling back manually to regex-based local text parser.");
    parsedQuestions = parseWithRegexFallback(rawText);
    mode = "Regex Sim Parser";
  } else {
    try {
      const systemInstruction = 
        "You are an elite, highly precise educational content converter for Odisha state examinations (OPSC, OSSSC, OSSC, BSE, CHSE). " +
        "You convert raw typed exam questionnaires, study sheets, or copy-pasted Word documents containing MCQs into perfectly structured JSON format. " +
        "Strictly adhere to the provided schema.";

      const promptText = `Please parse the following copied MCQ test sheets into JSON questions conforming to the requested schema. 
Each question MUST have exactly 4 choices (options). 
Extract the 0-based key correctIndex where A=0, B=1, C=2, D=3.
If there are minor explanations in the text, clean them up and use them. Otherwise, write a highly descriptive explanation yourself.
Process the entire list, generating up to 100-150 valid MCQ records if they exist in the raw text.

Raw text document content:
---
${rawText}
---`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: promptText,
        config: {
          systemInstruction,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              questions: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    question: { type: Type.STRING },
                    options: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING }
                    },
                    correctIndex: { type: Type.INTEGER, description: "0-based correct choice (A=0, B=1, C=2, D=3)" },
                    explanation: { type: Type.STRING },
                    subject: { type: Type.STRING },
                    topic: { type: Type.STRING }
                  },
                  required: ["question", "options", "correctIndex", "explanation"]
                }
              }
            },
            required: ["questions"]
          }
        }
      });

      const parsedJson = JSON.parse(response.text.trim());
      if (parsedJson && Array.isArray(parsedJson.questions)) {
        parsedQuestions = parsedJson.questions;
      } else {
        throw new Error("Returned JSON did not match expected 'questions' list schema.");
      }
    } catch (err: any) {
      console.warn("Gemini Parsing error. Engaging intelligent Regex parser to prevent application disruption:", err);
      parsedQuestions = parseWithRegexFallback(rawText);
      mode = "Regex Recovery Parser";
    }
  }

  // Sanitize / Add IDs
  const finalQuestions = parsedQuestions.map((q, idx) => {
    // Generate standard schema conforming values
    const safeOptions = Array.isArray(q.options) && q.options.length >= 2 
      ? q.options.slice(0, 4) 
      : ["Option A", "Option B", "Option C", "Option D"];
    while (safeOptions.length < 4) {
      safeOptions.push(`Option ${String.fromCharCode(65 + safeOptions.length)}`);
    }

    return {
      id: `${examId || "parsed"}-q-${idx + 1}-${Math.floor(Math.random() * 1000)}`,
      question: q.question || "Parsed Mock Practice Question",
      options: safeOptions,
      correctIndex: typeof q.correctIndex === "number" && q.correctIndex >= 0 && q.correctIndex < 4 ? q.correctIndex : 0,
      explanation: q.explanation || "Direct curriculum reference evaluated.",
      shortExplanation: q.explanation || "Direct curriculum reference.",
      subject: q.subject || "General Syllabus",
      topic: q.topic || "Core Practice",
      passage: q.passage || undefined
    };
  });

  // Apply to Database
  const finalQuantity = finalQuestions.length;
  if (finalQuantity === 0) {
    return res.status(422).json({ error: "Failed to recognize any valid MCQs in the provided text. Please verify formatting: '1. Question...', 'A)...', 'Answer: A'" });
  }

  let finalTargetTestId = testId;

  // Locate or Create dynamically inside EXAMS_DATABASE
  const activeExams: any = EXAMS_DATABASE;
  const categoriesList = ["board", "teaching", "competitive", "others"];
  let matchedExamBlock: any = null;

  for (const cat of categoriesList) {
    if (activeExams[cat]) {
      const match = activeExams[cat].find((e: any) => e.id === examId);
      if (match) {
        matchedExamBlock = match;
        break;
      }
    }
  }

  if (testId === "new") {
    finalTargetTestId = `${examId}-parsed-${Math.floor(Math.random() * 900) + 100}`;
    const newTestObj = {
      id: finalTargetTestId,
      title: newTestTitle || "General Practice MCQ Mock Set",
      isFree: true,
      isCustom: true,
      questionsCount: finalQuantity,
      durationMins: Number(durationMins) || 90,
      negativeMarking: Number(negativeMarking) || 0,
      marksPerQuestion: Number(marksPerQuestion) || 1,
      uploadedAt: new Date().toISOString(),
      category: examCategory,
      examId: examId
    };

    if (matchedExamBlock) {
      if (!matchedExamBlock.tests) matchedExamBlock.tests = [];
      matchedExamBlock.tests.push(newTestObj);
      matchedExamBlock.totalQuestions = finalQuantity;
      matchedExamBlock.durationMins = Number(durationMins) || 90;
      matchedExamBlock.negativeMarking = Number(negativeMarking) || 0;
      matchedExamBlock.marksPerQuestion = Number(marksPerQuestion) || 1;
    }
  } else {
    // Modify existing test
    if (matchedExamBlock) {
      const test = matchedExamBlock.tests?.find((t: any) => t.id === testId);
      if (test) {
        if (newTestTitle) {
          test.title = newTestTitle;
        }
        test.isCustom = true;
        test.questionsCount = finalQuantity;
        test.durationMins = Number(durationMins) || 90;
        test.negativeMarking = Number(negativeMarking) || 0;
        test.marksPerQuestion = Number(marksPerQuestion) || 1;
        test.uploadedAt = new Date().toISOString();
        test.category = examCategory;
        test.examId = examId;

        matchedExamBlock.totalQuestions = finalQuantity;
        matchedExamBlock.durationMins = Number(durationMins) || 90;
        matchedExamBlock.negativeMarking = Number(negativeMarking) || 0;
        matchedExamBlock.marksPerQuestion = Number(marksPerQuestion) || 1;
      }
    }
  }

  // Populate actual active mock test questions list in-memory!
  QUESTIONS_DATABASE[finalTargetTestId] = finalQuestions;

  await savePersistedData();

  res.json({
    success: true,
    mode,
    testId: finalTargetTestId,
    questionsCount: finalQuantity,
    category: examCategory,
    examId,
    questions: finalQuestions,
    exams_database: EXAMS_DATABASE
  });
});

// 12. Edit uploaded custom mock test
app.post("/api/admin/edit-test", async (req, res) => {
  try {
    await ensureDataLoaded();
  } catch (err) {
    console.error("ensureDataLoaded failure in edit-test:", err);
  }
  const { category, examId, testId, title, durationMins, negativeMarking, marksPerQuestion } = req.body;
  if (!category || !examId || !testId) {
    return res.status(400).json({ error: "Missing required identifier fields." });
  }

  const activeExams: any = EXAMS_DATABASE;
  const targetExam = activeExams[category]?.find((e: any) => e.id === examId);
  if (!targetExam) {
    return res.status(404).json({ error: `Target exam series ${examId} not found in category ${category}.` });
  }

  const test = targetExam.tests?.find((t: any) => t.id === testId);
  if (!test) {
    return res.status(404).json({ error: `Mock test ${testId} not found.` });
  }

  if (title) test.title = title;
  if (durationMins !== undefined) {
    test.durationMins = Number(durationMins);
    targetExam.durationMins = Number(durationMins);
  }
  if (negativeMarking !== undefined) {
    test.negativeMarking = Number(negativeMarking);
    targetExam.negativeMarking = Number(negativeMarking);
  }
  if (marksPerQuestion !== undefined) {
    test.marksPerQuestion = Number(marksPerQuestion);
    targetExam.marksPerQuestion = Number(marksPerQuestion);
  }
  test.editedAt = new Date().toISOString();

  await savePersistedData();

  res.json({ success: true, test, exams_database: EXAMS_DATABASE });
});

// 13. Delete uploaded custom mock test
app.post("/api/admin/delete-test", async (req, res) => {
  try {
    await ensureDataLoaded();
  } catch (err) {
    console.error("ensureDataLoaded failure in delete-test:", err);
  }
  const { category, examId, testId } = req.body;
  if (!category || !examId || !testId) {
    return res.status(400).json({ error: "Missing required identifier fields." });
  }

  const activeExams: any = EXAMS_DATABASE;
  const targetExam = activeExams[category]?.find((e: any) => e.id === examId);
  if (!targetExam) {
    return res.status(404).json({ error: `Target exam series ${examId} not found.` });
  }

  const testIdx = targetExam.tests?.findIndex((t: any) => t.id === testId);
  if (testIdx === -1 || testIdx === undefined) {
    return res.status(404).json({ error: `Mock test ${testId} not found inside exam series.` });
  }

  // Remove test
  targetExam.tests.splice(testIdx, 1);
  
  // Clean up questions
  delete QUESTIONS_DATABASE[testId];

  await savePersistedData();

  res.json({ success: true, message: "Mock test series completely removed from live database.", exams_database: EXAMS_DATABASE });
});

// Helper regex parser for fallback or simulation
function parseWithRegexFallback(rawText: string): any[] {
  const parsed: any[] = [];
  // Split raw text by list number indicators
  const sections = rawText.split(/(?=\b\d+[\.\)\-\:\s])|(?=Question\s*\d+)/i);
  
  for (const item of sections) {
    if (!item.trim()) continue;
    const lines = item.split("\n").map(l => l.trim()).filter(Boolean);
    if (lines.length < 2) continue;

    // Detect question body: usually the first non-option line
    const questionLine = lines[0].replace(/^\d+[\.\)\-\:\s]*/, "").replace(/^Question\s*\d+[\.\)\-\:\s]*/i, "");
    
    // Find multiple choices
    const optionLines = lines.filter(l => /^[A-D][\.\)\-\s\:]/i.test(l));
    const finalOpts = optionLines.map(l => l.replace(/^[A-D][\.\)\-\s\:]+/i, "").trim());
    
    // Detect Correct choice
    let correctIdx = 0;
    const ansKeyLine = lines.find(l => /^(Answer|Ans|Correct|Key)\s*[\:\-\=]/i.test(l));
    if (ansKeyLine) {
      const match = ansKeyLine.match(/(?:Answer|Ans|Correct|Key)\s*[\:\-\=]\s*([A-D])/i);
      if (match) {
        correctIdx = match[1].toUpperCase().charCodeAt(0) - 65;
      }
    }

    // Detect explanation
    const expLine = lines.find(l => /^(Explanation|Explain|Exp)\s*[\:\-\=]/i.test(l));
    const finalExplanation = expLine 
      ? expLine.replace(/^(Explanation|Explain|Exp)\s*[\:\-\=]\s*/i, "").trim()
      : "Syllabus practice concept master set.";

    if (questionLine) {
      parsed.push({
        question: questionLine,
        options: finalOpts.length >= 2 ? finalOpts : ["A", "B", "C", "D"],
        correctIndex: correctIdx,
        explanation: finalExplanation
      });
    }
  }

  return parsed;
}

// Live Battle Room Status Simulator API
app.get("/api/battles/list", (req, res) => {
  res.json([
    { id: "bat-1", name: "Odisha GK Mega Battle [Bhadrak vs Cuttack]", players: 184, isLive: true, beginsInSecs: 0 },
    { id: "bat-2", name: "Odia Vyakarana Sandhi Battle", players: 92, isLive: false, beginsInSecs: 45 },
    { id: "bat-3", name: "Quantitative Aptitude Speed MCQ Race", players: 121, isLive: false, beginsInSecs: 180 }
  ]);
});

// Store for test results / custom rankings for student performance comparison
const TEST_SUBMISSIONS: Record<string, Array<{
  name: string;
  district: string;
  score: number;
  timeSpent: number;
  submittedAt: string;
  isUser?: boolean;
}>> = {};

const ODISHA_PEERS = [
  { name: "Siddharth Patnaik", district: "Khordha" },
  { name: "Debasis Mohapatra", district: "Puri" },
  { name: "Sasmita Samantaray", district: "Cuttack" },
  { name: "Satyabrata Dash", district: "Balasore" },
  { name: "Smrutirekha Barik", district: "Bhadrak" },
  { name: "Suman Kalyan Pradhan", district: "Sambalpur" },
  { name: "Sunil Kumar Naik", district: "Sundargarh" },
  { name: "Chinmay Behera", district: "Mayurbhanj" },
  { name: "Madhusmita Sahoo", district: "Ganjam" },
  { name: "Priyanka Priyadarshini", district: "Jajpur" },
  { name: "Rudra Narayan Mishra", district: "Angul" },
  { name: "Padmini Pujari", district: "Koraput" },
];

function getOrCreateSubmissions(testId: string, maxQuestions: number, marksPerQuestion: number, negativeMarking: number) {
  if (!TEST_SUBMISSIONS[testId] || TEST_SUBMISSIONS[testId].length === 0) {
    const peerCount = 5 + Math.floor(Math.random() * 5); // 5 to 9 peers
    const list: any[] = [];
    const shuffledPeers = [...ODISHA_PEERS].sort(() => 0.5 - Math.random());
    
    for (let i = 0; i < peerCount; i++) {
      const peer = shuffledPeers[i];
      // Generate realistic scores
      const correctRatio = 0.5 + (Math.random() * 0.45); // 50% to 95%
      const corr = Math.max(1, Math.floor(correctRatio * maxQuestions));
      const wrg = Math.floor(Math.random() * (maxQuestions - corr));
      const score = (corr * marksPerQuestion) - (wrg * negativeMarking);
      const timeSpent = Math.floor((0.3 + Math.random() * 0.7) * (90 * 60)); // 30% to 100% of standard 90 min

      list.push({
        name: peer.name,
        district: peer.district,
        score: Number(score.toFixed(2)),
        timeSpent,
        submittedAt: new Date(Date.now() - (i + 1) * 3600000).toISOString(),
        isUser: false
      });
    }
    TEST_SUBMISSIONS[testId] = list;
  }
  return TEST_SUBMISSIONS[testId];
}

// CBT Submission Route with leaderboard hierarchy & rank logic
app.post("/api/tests/:testId/submit", (req, res) => {
  const { testId } = req.params;
  const { name, district, score, timeSpent, correct, wrong, totalQuestions, marksPerQuestion, negativeMarking } = req.body;

  const currentNegative = negativeMarking !== undefined ? Number(negativeMarking) : 0.25;
  const currentMarks = marksPerQuestion !== undefined ? Number(marksPerQuestion) : 1;
  const finalTotalQuestions = totalQuestions ? Number(totalQuestions) : 5;

  // Retrieve or create standard list of candidates for this test
  const submissionsList = getOrCreateSubmissions(testId, finalTotalQuestions, currentMarks, currentNegative);

  // Remove previous user submissions (if any) to avoid duplicates
  const cleanList = submissionsList.filter(s => !s.isUser);

  // Add the user record
  const userRecord = {
    name: name || "Guest Scholar 🔓",
    district: district || "Khordha",
    score: Number(score !== undefined ? score : 0),
    timeSpent: Number(timeSpent !== undefined ? timeSpent : 120),
    submittedAt: new Date().toISOString(),
    isUser: true
  };

  cleanList.push(userRecord);

  // Sort: scores DESC, then timeSpent ASC (tie-breaker)
  cleanList.sort((a, b) => {
    if (b.score !== a.score) {
      return b.score - a.score;
    }
    return a.timeSpent - b.timeSpent;
  });

  // Re-save sorted list
  TEST_SUBMISSIONS[testId] = cleanList;

  // Find user's new rank (1-indexed)
  const userIndex = cleanList.findIndex(s => s.isUser);
  const rank = userIndex !== -1 ? userIndex + 1 : cleanList.length;

  res.json({
    success: true,
    rank,
    totalCandidates: cleanList.length,
    history: cleanList
  });
});

// ==========================================
// VITE DEV SERVER AND PRODUCTION SERVING
// ==========================================

async function start() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Odisha Exam Server] Running high-octane setup on http://0.0.0.0:${PORT}`);
  });
}

if (!process.env.VERCEL) {
  start();
}

export default app;
