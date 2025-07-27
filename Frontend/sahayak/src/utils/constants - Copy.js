// Supported languages with their native names and codes
export const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी' },
  { code: 'ta', name: 'Tamil', nativeName: 'தমিழ்' },
  { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી' },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ' },
  { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം' },
  { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ' },
  { code: 'or', name: 'Odia', nativeName: 'ଓଡ଼ିଆ' },
  { code: 'as', name: 'Assamese', nativeName: 'অসমীয়া' },
];

// Grade levels
export const GRADES = [
  { value: 1, label: 'Grade 1 (Class I)' },
  { value: 2, label: 'Grade 2 (Class II)' },
  { value: 3, label: 'Grade 3 (Class III)' },
  { value: 4, label: 'Grade 4 (Class IV)' },
  { value: 5, label: 'Grade 5 (Class V)' },
  { value: 6, label: 'Grade 6 (Class VI)' },
  { value: 7, label: 'Grade 7 (Class VII)' },
  { value: 8, label: 'Grade 8 (Class VIII)' },
  { value: 9, label: 'Grade 9 (Class IX)' },
  { value: 10, label: 'Grade 10 (Class X)' },
  { value: 11, label: 'Grade 11 (Class XI)' },
  { value: 12, label: 'Grade 12 (Class XII)' },
];

// Indian states and UTs
export const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Andaman and Nicobar Islands', 'Chandigarh', 'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Lakshadweep', 'Puducherry'
];

// App configuration
export const APP_CONFIG = {
  NAME: 'Sahayak',
  TAGLINE: 'Empowering Teachers, Enriching Learning',
  VERSION: '1.0.0',
  SUPPORT_EMAIL: 'support@sahayak.edu',
  FEEDBACK_URL: 'https://forms.google.com/sahayak-feedback',
};

// Default curriculum topics by grade (sample data)
export const DEFAULT_TOPICS = {
  1: {
    Mathematics: ['Numbers 1-100', 'Addition', 'Subtraction', 'Shapes', 'Patterns'],
    English: ['Alphabets', 'Simple Words', 'Rhymes', 'Stories', 'Speaking'],
    Hindi: ['वर्णमाला', 'सरल शब्द', 'कविताएं', 'कहानियां', 'बोलना'],
    'Environmental Studies': ['My Family', 'My School', 'Animals', 'Plants', 'Weather']
  },
  2: {
    Mathematics: ['Numbers 1-1000', 'Addition', 'Subtraction', 'Multiplication Tables', 'Time'],
    English: ['Reading', 'Writing', 'Grammar Basics', 'Vocabulary', 'Comprehension'],
    Hindi: ['पढ़ना', 'लिखना', 'व्याकरण', 'शब्द भंडार', 'समझना'],
    'Environmental Studies': ['Community Helpers', 'Transport', 'Food', 'Health', 'Safety']
  },
  3: {
    Mathematics: ['Numbers to 10000', 'Multiplication', 'Division', 'Fractions', 'Geometry'],
    English: ['Stories', 'Poems', 'Grammar', 'Writing Skills', 'Speaking'],
    Hindi: ['कहानी', 'कविता', 'व्याकरण', 'लेखन', 'वाचन'],
    Science: ['Plants', 'Animals', 'Our Body', 'Food', 'Water'],
    'Social Studies': ['Our Neighborhood', 'Means of Transport', 'Our Country', 'Festivals']
  }
};

// Speech synthesis voices mapping
export const VOICE_MAPPING = {
  'en': 'en-US',
  'hi': 'hi-IN',
  'bn': 'bn-IN',
  'te': 'te-IN',
  'mr': 'mr-IN',
  'ta': 'ta-IN',
  'gu': 'gu-IN',
  'kn': 'kn-IN',
  'ml': 'ml-IN',
  'pa': 'pa-IN',
  'or': 'or-IN',
  'as': 'as-IN',
};