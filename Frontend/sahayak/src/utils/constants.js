// Supported languages with their native names and codes
export const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமিழ்' },
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
    'General Science': ['Plants', 'Animals', 'Our Body', 'Food', 'Water']
  },
  3: {
    Mathematics: ['Numbers to 10000', 'Multiplication', 'Division', 'Fractions', 'Geometry'],
    English: ['Stories', 'Poems', 'Grammar', 'Writing Skills', 'Speaking'],
    Hindi: ['कहानी', 'कविता', 'व्याकरण', 'लेखन', 'वाचन'],
    Science: ['Plants', 'Animals', 'Our Body', 'Food', 'Water'],
    'Social Studies': ['Our Neighborhood', 'Means of Transport', 'Our Country', 'Festivals']
  },
  4: {
    Mathematics: ['Large Numbers', 'Basic Operations', 'Fractions', 'Decimals', 'Geometry'],
    English: ['Reading Comprehension', 'Grammar', 'Writing', 'Vocabulary', 'Literature'],
    Hindi: ['गद्य', 'पद्य', 'व्याकरण', 'रचना', 'भाषा कौशल'],
    Science: ['Food', 'Shelter', 'Water', 'Travel', 'Things We Make'],
    'Social Studies': ['Maps', 'India', 'States', 'Culture', 'Heritage']
  },
  5: {
    Mathematics: ['Numbers', 'Operations', 'Fractions', 'Decimals', 'Data Handling'],
    English: ['Literature', 'Grammar', 'Writing', 'Speaking', 'Listening'],
    Hindi: ['साहित्य', 'व्याकरण', 'रचना', 'भाषा विकास', 'संवाद'],
    Science: ['Super Senses', 'A Snake Charmers Story', 'From Tasting to Digesting', 'Seeds and Seeds'],
    'Social Studies': ['Geography', 'History', 'Civics', 'Economics', 'Culture']
  },
  6: {
    Mathematics: ['Knowing Numbers', 'Whole Numbers', 'Playing with Numbers', 'Basic Geometry'],
    English: ['Prose', 'Poetry', 'Grammar', 'Writing', 'Speaking'],
    Hindi: ['वसंत', 'दूर्वा', 'व्याकरण', 'रचना', 'भाषा अध्ययन'],
    Science: ['Food Components', 'Sorting Materials', 'Separation of Substances', 'Getting to Know Plants'],
    'Social Studies': ['History', 'Geography', 'Political Science', 'Economics']
  },
  7: {
    Mathematics: ['Integers', 'Fractions', 'Data Handling', 'Simple Equations', 'Lines and Angles'],
    English: ['Honeycomb', 'An Alien Hand', 'Grammar', 'Writing', 'Literature'],
    Hindi: ['वसंत', 'दूर्वा', 'महाभारत', 'व्याकरण', 'रचना'],
    Science: ['Nutrition in Plants', 'Nutrition in Animals', 'Heat', 'Acids and Bases'],
    'Social Studies': ['Medieval India', 'Our Environment', 'Social and Political Life']
  },
  8: {
    Mathematics: ['Rational Numbers', 'Linear Equations', 'Quadrilaterals', 'Data Handling'],
    English: ['Honeydew', 'It So Happened', 'Grammar', 'Writing', 'Literature'],
    Hindi: ['वसंत', 'दूर्वा', 'भारत की खोज', 'व्याकरण', 'रचना'],
    'General Science': ['Crop Production', 'Microorganisms', 'Coal and Petroleum', 'Combustion'],
    'Social Studies': ['Modern India', 'Geography', 'Social and Political Life']
  },
  9: {
    'Mathematics Part1': ['Number Systems', 'Polynomials', 'Coordinate Geometry'],
    'Mathematics Part2': ['Linear Equations', 'Quadrilaterals', 'Areas of Parallelograms'],
    English: ['Beehive', 'Moments', 'Grammar', 'Writing', 'Literature'],
    Hindi: ['क्षितिज', 'कृतिका', 'स्पर्श', 'संचयन', 'व्याकरण'],
    'Science and Technology': ['Matter', 'Atoms and Molecules', 'Structure of Atom', 'Cell'],
    'Social Studies': ['India and Contemporary World', 'Contemporary India', 'Democratic Politics']
  },
  10: {
    Mathematics: ['Real Numbers', 'Polynomials', 'Linear Equations', 'Quadratic Equations'],
    English: ['First Flight', 'Footprints without Feet', 'Grammar', 'Writing'],
    Hindi: ['क्षितिज', 'कृतिका', 'स्पर्श', 'संचयन', 'व्याकरण'],
    Science: ['Light', 'Human Eye', 'Electricity', 'Magnetic Effects', 'Management of Natural Resources'],
    'Social Studies': ['India and Contemporary World', 'Contemporary India', 'Democratic Politics', 'Understanding Economic Development']
  },
  11: {
    Mathematics: ['Sets', 'Relations and Functions', 'Trigonometric Functions', 'Mathematical Induction'],
    English: ['Hornbill', 'Snapshots', 'Grammar', 'Writing', 'Literature'],
    Hindi: ['आरोह', 'वितान', 'अंतरा', 'अंतराल', 'व्याकरण'],
    Physics: ['Physical World', 'Units and Measurements', 'Motion in Straight Line', 'Motion in Plane'],
    Chemistry: ['Some Basic Concepts', 'Structure of Atom', 'Classification of Elements', 'Chemical Bonding'],
    Biology: ['Diversity of Living World', 'Structural Organisation', 'Cell Structure', 'Plant Physiology']
  },
  12: {
    Mathematics: ['Relations and Functions', 'Inverse Trigonometric Functions', 'Matrices', 'Determinants'],
    English: ['Flamingo', 'Vistas', 'Grammar', 'Writing', 'Literature'],
    Hindi: ['आरोह', 'वितान', 'अंतरा', 'अंतराल', 'व्याकरण'],
    Chemistry: ['Solid State', 'Solutions', 'Electrochemistry', 'Chemical Kinetics', 'Surface Chemistry'],
    Biology: ['Reproduction', 'Genetics and Evolution', 'Biology and Human Welfare', 'Biotechnology'],
    'Information Technology': ['Programming', 'Database Management', 'Web Development', 'Computer Networks']
  }
};

// NCERT Subject mapping by grade
export const NCERT_SUBJECTS_BY_GRADE = {
  1: {
    'Mathematics': 'mathematics',
    'English': 'english', 
    'Hindi': 'hindi',
    'Environmental Studies': 'environmental-studies'
  },
  2: {
    'Mathematics': 'mathematics',
    'English': 'english',
    'Hindi': 'hindi', 
    'General Science': 'generalscience'
  },
  3: {
    'Mathematics': 'mathematics',
    'English': 'english',
    'Hindi': 'hindi',
    'Science': 'science',
    'Social Studies': 'social-studies'
  },
  4: {
    'Mathematics': 'mathematics',
    'English': 'english',
    'Hindi': 'hindi',
    'Science': 'science',
    'Social Studies': 'social-studies'
  },
  5: {
    'Mathematics': 'mathematics',
    'English': 'english',
    'Hindi': 'hindi',
    'Science': 'science',
    'Social Studies': 'social-studies'
  },
  6: {
    'Mathematics': 'mathematics',
    'English': 'english',
    'Hindi': 'hindi',
    'Science': 'science',
    'Social Studies': 'social-studies'
  },
  7: {
    'Mathematics': 'mathematics',
    'English': 'english',
    'Hindi': 'hindi',
    'Science': 'science',
    'Social Studies': 'social-studies'
  },
  8: {
    'Mathematics': 'mathematics',
    'English': 'english',
    'Hindi': 'hindi',
    'General Science': 'generalscience',
    'Social Studies': 'social-studies'
  },
  9: {
    'Mathematics Part1': 'mathematicspart1',
    'Mathematics Part2': 'mathematicspart2',
    'English': 'english',
    'Hindi': 'hindi',
    'Science and Technology': 'scienceandtechnology',
    'Social Studies': 'social-studies'
  },
  10: {
    'Mathematics': 'mathematics',
    'English': 'english',
    'Hindi': 'hindi',
    'Science': 'science',
    'Social Studies': 'social-studies'
  },
  11: {
    'Mathematics': 'mathematics',
    'English': 'english',
    'Hindi': 'hindi',
    'Physics': 'physics',
    'Chemistry': 'chemistry',
    'Biology': 'biology'
  },
  12: {
    'Mathematics': 'mathematics',
    'English': 'english',
    'Hindi': 'hindi',
    'Chemistry': 'chemistry',
    'Biology': 'biology',
    'Information Technology': 'informationtechnology'
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