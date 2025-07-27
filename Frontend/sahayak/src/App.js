import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LanguageProvider, useLanguage, usePageTranslation } from './context/LanguageContext';
import { useAutoTranslation } from './hooks/useAutoTranslation';
import { DEFAULT_TOPICS, NCERT_SUBJECTS_BY_GRADE, GRADES } from './utils/constants';
import AIAssistantFloating from './components/AI/AIAssistantFloating';
import LearningWindow from './components/Learning/LearningWindow';
import PrepareLessonWindow from './components/Preparation/PrepareLessonWindow';
import LoginForm from './components/Auth/LoginForm';
import WelcomeSetup from './components/Auth/WelcomeSetup';
import LanguageSwitcher from './components/UI/LanguageSwitcher';
import Button from './components/UI/Button';

// Simple Loading Spinner
const LoadingSpinner = ({ size = 'medium', message = 'Loading...' }) => {
  const sizeClasses = {
    small: 'w-4 h-4',
    medium: 'w-8 h-8',
    large: 'w-12 h-12'
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-2">
      <div className={`${sizeClasses[size]} border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin`}></div>
      {message && <p className="text-gray-600 text-sm">{message}</p>}
    </div>
  );
};



// Multi-Grade Selection Component
const GradeSelectionModal = ({ isOpen, onClose, onSave, selectedGrades, setSelectedGrades }) => {
  if (!isOpen) return null;

  const availableGrades = [2, 8, 9, 11, 12];

  const handleGradeToggle = (grade) => {
    if (selectedGrades.includes(grade)) {
      setSelectedGrades(selectedGrades.filter(g => g !== grade));
    } else {
      setSelectedGrades([...selectedGrades, grade]);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-8 max-w-md w-full mx-4">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">📚 Select Your Teaching Grades</h2>
        <p className="text-gray-600 mb-6">Choose the grades you teach in your multi-grade classroom:</p>
        
        <div className="space-y-3 mb-6">
          {availableGrades.map(grade => (
            <label key={grade} className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedGrades.includes(grade)}
                onChange={() => handleGradeToggle(grade)}
                className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
              />
              <span className="text-gray-700">
                Grade {grade} (Class {grade === 11 ? 'XI' : grade === 12 ? 'XII' : grade})
              </span>
            </label>
          ))}
        </div>

        <div className="flex space-x-3">
          <Button 
            onClick={onSave} 
            disabled={selectedGrades.length === 0}
            size="large" 
            className="flex-1"
          >
            ✅ Save Selection
          </Button>
          <Button 
            onClick={onClose} 
            variant="outline" 
            size="large"
          >
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
};

// Enhanced Mock Login Component
const MockLogin = () => {
  const { login } = useApp();
  const [selectedGrades, setSelectedGrades] = useState([2, 8, 9]);
  const [showGradeModal, setShowGradeModal] = useState(false);
  
  const handleMockLogin = () => {
    if (selectedGrades.length === 0) {
      setShowGradeModal(true);
      return;
    }

    const mockUser = {
      firstName: 'Priya',
      lastName: 'Sharma',
      phoneNumber: '9876543210',
      teachingGrades: selectedGrades,
      primaryGrade: selectedGrades[0],
      schoolName: 'Government Primary School',
      district: 'Rajgarh',
      state: 'Madhya Pradesh'
    };
    login(mockUser);
  };

  const handleGradeSave = () => {
    setShowGradeModal(false);
    if (selectedGrades.length > 0) {
      handleMockLogin();
    }
  };

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full mx-4">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl text-white">🎓</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome to Sahayak</h1>
            <p className="text-gray-600">Your Multi-Grade Teaching Assistant</p>
          </div>

          {/* Grade Selection Display */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Selected Teaching Grades:</h3>
            <div className="flex flex-wrap gap-2 mb-3">
              {selectedGrades.length > 0 ? selectedGrades.map(grade => (
                <span key={grade} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                  Grade {grade}
                </span>
              )) : (
                <span className="text-gray-500 text-sm">No grades selected</span>
              )}
            </div>
            <button
              onClick={() => setShowGradeModal(true)}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              ⚙️ Change Grade Selection
            </button>
          </div>
          
          <Button onClick={handleMockLogin} size="large" className="w-full">
            🚀 Start Teaching Journey
          </Button>
        </div>
      </div>

      <GradeSelectionModal
        isOpen={showGradeModal}
        onClose={() => setShowGradeModal(false)}
        onSave={handleGradeSave}
        selectedGrades={selectedGrades}
        setSelectedGrades={setSelectedGrades}
      />
    </>
  );
};

// Enhanced Curriculum Component for Multi-Grade
const CreateCurriculum = () => {
  const { user } = useApp();
  const { user: authUser } = useAuth();
  const { currentLanguage } = useLanguage();
  
  // Get user preferences first
  const userGrades = authUser?.teachingGrades || user?.teachingGrades || [9];
  const curriculumType = authUser?.curriculumType || 'ncert';
  
  const [selectedOption, setSelectedOption] = useState('');
  const [selectedGrade, setSelectedGrade] = useState(userGrades[0]);
  const [loading, setLoading] = useState(false);
  const [curriculum, setCurriculum] = useState(null);
  
  // New state variables for book selection and schedule generation
  const [availableBooks, setAvailableBooks] = useState([]);
  const [showBookSelection, setShowBookSelection] = useState(false);
  const [generatedSchedule, setGeneratedSchedule] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedDay, setSelectedDay] = useState(0); // Track which day is selected

  const generateResourceLinks = (grade, subjects) => {
    const resources = {};
    const gradeSubjects = NCERT_SUBJECTS_BY_GRADE[grade] || {};
    
    subjects.forEach(subject => {
      const subjectKey = gradeSubjects[subject] || subject.toLowerCase().replace(/\s+/g, '-');
      resources[subject] = {
        english: `/assets/ncert-books/grade-${grade}-${subjectKey}-en.pdf`,
        hindi: `/assets/ncert-books/grade-${grade}-${subjectKey}-hi.pdf`
      };
    });
    return resources;
  };

  const generateMonthlyPlan = (topics) => {
    const months = [
      'April', 'May', 'June', 'July', 'August', 'September',
      'October', 'November', 'December', 'January', 'February', 'March'
    ];
    
    const subjects = Object.keys(topics);
    const monthlyPlan = {};
    
    months.forEach((month, index) => {
      monthlyPlan[month] = {
        semester: index < 6 ? 1 : 2,
        subjects: {}
      };
      
      subjects.forEach(subject => {
        const subjectTopics = topics[subject];
        const topicsPerMonth = Math.ceil(subjectTopics.length / 12);
        const startIndex = index * topicsPerMonth;
        const endIndex = Math.min(startIndex + topicsPerMonth, subjectTopics.length);
        
        monthlyPlan[month].subjects[subject] = {
          topics: subjectTopics.slice(startIndex, endIndex),
          chapters: generateChapterNumbers(startIndex, endIndex)
        };
      });
    });
    
    return monthlyPlan;
  };

  const printMonthlyPlan = () => {
    const printContent = document.getElementById('monthly-teaching-plan');
    if (!printContent) return;

    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Sahayak Monthly Teaching Plan</title>
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            body { 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              margin: 8px;
              line-height: 1.3;
              color: #1f2937;
              background: #ffffff;
            }
            .header {
              text-align: center;
              margin-bottom: 16px;
              padding: 12px 0;
              background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
              color: white;
              border-radius: 8px;
            }
            .main-title {
              font-size: 20px;
              font-weight: 700;
              margin-bottom: 4px;
              letter-spacing: -0.025em;
            }
            .subtitle {
              font-size: 13px;
              opacity: 0.9;
              margin-bottom: 2px;
              font-weight: 400;
            }
            .grade-info {
              font-size: 12px;
              opacity: 0.8;
              font-weight: 300;
            }
            .month-grid {
              display: grid;
              grid-template-columns: repeat(3, 1fr);
              gap: 8px;
              margin-top: 8px;
            }
            .month-card {
              background: #ffffff;
              border: 1px solid #e5e7eb;
              border-radius: 6px;
              padding: 10px;
              page-break-inside: avoid;
              box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
            }
            .month-header {
              display: flex;
              justify-content: space-between;
              align-items: center;
              margin-bottom: 8px;
              padding-bottom: 4px;
              border-bottom: 1px solid #f3f4f6;
            }
            .month-title {
              font-size: 15px;
              font-weight: 600;
              color: #1f2937;
            }
            .semester-badge {
              padding: 2px 6px;
              border-radius: 8px;
              font-size: 10px;
              font-weight: 500;
              text-transform: uppercase;
              letter-spacing: 0.025em;
            }
            .semester-1 {
              background-color: #dcfce7;
              color: #166534;
            }
            .semester-2 {
              background-color: #dbeafe;
              color: #1e40af;
            }
            .subject-section {
              margin-bottom: 8px;
            }
            .subject-section:last-child {
              margin-bottom: 0;
            }
            .subject-title {
              font-weight: 600;
              color: #374151;
              font-size: 12px;
              margin-bottom: 3px;
              text-transform: uppercase;
              letter-spacing: 0.025em;
            }
            .topic-item {
              display: flex;
              align-items: flex-start;
              margin-bottom: 2px;
              font-size: 11px;
            }
            .topic-bullet {
              width: 3px;
              height: 3px;
              background-color: #3b82f6;
              border-radius: 50%;
              margin-top: 4px;
              margin-right: 6px;
              flex-shrink: 0;
            }
            .topic-content {
              flex: 1;
            }
            .topic-text {
              color: #374151;
              line-height: 1.2;
              font-weight: 400;
            }
            .chapter-text {
              color: #6b7280;
              font-size: 9px;
              margin-top: 1px;
              font-style: italic;
            }
            @media print {
              body { 
                margin: 0;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }
              .header {
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }
              .month-card { 
                break-inside: avoid;
                page-break-inside: avoid;
              }
              .month-grid {
                grid-template-columns: repeat(3, 1fr);
              }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="main-title">🎓 Sahayak Monthly Teaching Plan</div>
            <div class="subtitle">AI-Powered Multi-Grade Teaching Assistant</div>
            <div class="grade-info">Grade ${curriculum.grade} NCERT Curriculum • Generated on ${curriculum.generatedAt}</div>
          </div>
          ${printContent.innerHTML}
        </body>
      </html>
    `);
    
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  const generateChapterNumbers = (start, end) => {
    const chapters = [];
    for (let i = start + 1; i <= end; i++) {
      chapters.push(`Chapter ${i}`);
    }
    return chapters;
  };

  const generateCurriculum = async () => {
    setLoading(true);
    
    setTimeout(() => {
      const grade = selectedGrade;
      const topics = DEFAULT_TOPICS[grade] || DEFAULT_TOPICS[2];
      
      const detailedCurriculum = {
        grade: grade,
        subjects: Object.keys(topics),
        generatedAt: new Date().toLocaleDateString(),
        monthlyPlan: generateMonthlyPlan(topics),
        resources: generateResourceLinks(grade, Object.keys(topics))
      };
      
      setCurriculum(detailedCurriculum);
      setLoading(false);
    }, 2000);
  };

  // New function to handle Auto Create Schedule
  const handleAutoCreateSchedule = async () => {
    try {
      setLoading(true);
      
      // Get selected grade and curriculum
      const grade = selectedGrade;
      const curriculum = curriculumType;
      
      console.log(`Fetching books for curriculum: ${curriculum}, grade: ${grade}`);
      
      // Fetch available books from RAG corpus
      const response = await fetch(`http://localhost:8000/api/corpus/books/${curriculum}/${grade}`);
      
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        console.error('Response not ok:', response.status, response.statusText);
        alert(`Failed to fetch books: ${response.status} ${response.statusText}`);
        return;
      }
      
      const data = await response.json();
      console.log('Received data:', data);
      
      if (data.error) {
        console.error('Error in response:', data.error);
        alert(`Failed to fetch available books: ${data.error}`);
        return;
      }
      
      if (!data.books || data.books.length === 0) {
        console.log('No books found in response');
        alert(`No books found for Grade ${grade} ${curriculum.toUpperCase()} curriculum. Check the RAG corpus.`);
        return;
      }
      
      console.log('Setting available books:', data.books);
      setAvailableBooks(data.books);
      console.log('About to set showBookSelection to true');
      setShowBookSelection(true);
      console.log('showBookSelection should now be true');
    } catch (error) {
      console.error('Failed to fetch books:', error);
      alert(`Failed to fetch available books: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Function to handle book selection and generate schedule
  const handleBookSelect = async (subject) => {
    try {
      setLoading(true);
      setSelectedSubject(subject);
      
      const grade = selectedGrade;
      const curriculum = curriculumType;
      
      // Generate AI schedule based on vector DB analysis
      const formData = new FormData();
      formData.append('curriculum', curriculum);
      formData.append('grade', grade);
      formData.append('subject', subject);
      formData.append('language', currentLanguage);
      formData.append('user_id', authUser?.id || 'default_user');
      
      const response = await fetch('http://localhost:8000/api/schedule/generate', {
        method: 'POST',
        body: formData
      });
      
      const data = await response.json();
      
      if (data.error) {
        console.error('Error generating schedule:', data.error);
        alert('Failed to generate schedule. Please try again.');
        return;
      }
      
      setGeneratedSchedule(data);
      setSelectedDay(0); // Reset to first day
      setShowBookSelection(false);
    } catch (error) {
      console.error('Failed to generate schedule:', error);
      alert('Failed to generate schedule. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Function to parse schedule by days
  const parseScheduleByDays = (scheduleText) => {
    if (!scheduleText) return [];
    
    console.log('Parsing schedule text:', scheduleText.substring(0, 200) + '...'); // Debug log
    
    // Try multiple day pattern formats
    const patterns = [
      /\*\*DAY (\d+) - ([^:*]+):\*\*/gi,
      /\*\*DAY (\d+) - ([^*]+)\*\*/gi,
      /\*\*DAY (\d+):\*\*/gi,
      /DAY (\d+) - ([^:*\n]+)/gi,
      /DAY (\d+):/gi
    ];
    
    let dayMatches = [];
    let usedPattern = null;
    
    // Try each pattern until we find matches
    for (const pattern of patterns) {
      pattern.lastIndex = 0; // Reset regex
      const matches = [...scheduleText.matchAll(pattern)];
      if (matches.length > 0) {
        dayMatches = matches;
        usedPattern = pattern;
        console.log(`Found ${matches.length} day matches using pattern:`, pattern);
        break;
      }
    }
    
    if (dayMatches.length === 0) {
      console.log('No day patterns found, returning full content');
      return [{
        date: "Full Schedule",
        dayNumber: 1,
        content: scheduleText.trim()
      }];
    }
    
    const days = [];
    
    for (let i = 0; i < dayMatches.length; i++) {
      const match = dayMatches[i];
      const dayNumber = parseInt(match[1]);
      const date = match[2] ? match[2].trim() : `Day ${dayNumber}`;
      
      // Get content between this day and the next day (or end of text)
      const startIndex = match.index + match[0].length;
      const endIndex = i < dayMatches.length - 1 ? dayMatches[i + 1].index : scheduleText.length;
      const content = scheduleText.slice(startIndex, endIndex).trim();
      
      days.push({
        date: date,
        dayNumber: dayNumber,
        content: content
      });
    }
    
    console.log('Parsed days:', days.map(d => ({ dayNumber: d.dayNumber, date: d.date, contentLength: d.content.length })));
    
    return days;
  };

  // Function to render markdown content
  const renderMarkdown = (content) => {
    if (!content) return content;
    
    let processed = content
      // Bold text: **text** -> <strong>text</strong>
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      // Line breaks first
      .replace(/\n/g, '<br/>')
      // Bullet points: - item -> <li>item</li>
      .replace(/^- (.*$)/gm, '<li class="ml-4 mb-1">• $1</li>');
    
    // Special sections with colored backgrounds
    const sections = [
      { pattern: /<strong>Topic:<\/strong>/g, replacement: '<div class="bg-indigo-50 p-3 rounded-lg mt-3 mb-2"><strong class="text-indigo-800 text-lg">📚 Topic:</strong>' },
      { pattern: /<strong>Why this topic today:<\/strong>/g, replacement: '<div class="bg-gray-50 p-2 rounded mt-2"><strong class="text-gray-700">💡 Why this topic today:</strong>' },
      { pattern: /<strong>Learning Goals:<\/strong>/g, replacement: '<div class="bg-purple-50 p-2 rounded mt-2"><strong class="text-purple-800">🎯 Learning Goals:</strong>' },
      { pattern: /<strong>Fun Activities:<\/strong>/g, replacement: '<div class="bg-blue-50 p-2 rounded mt-2"><strong class="text-blue-800">🎪 Fun Activities:</strong>' },
      { pattern: /<strong>Practice:<\/strong>/g, replacement: '<div class="bg-orange-50 p-2 rounded mt-2"><strong class="text-orange-800">📝 Practice:</strong>' },
      { pattern: /<strong>Assessment:<\/strong>/g, replacement: '<div class="bg-green-50 p-2 rounded mt-2"><strong class="text-green-800">✅ Assessment:</strong>' },
      { pattern: /<strong>Pages\/References:<\/strong>/g, replacement: '<div class="bg-yellow-50 p-2 rounded mt-2"><strong class="text-yellow-800">📖 Pages/References:</strong>' }
    ];
    
    // Apply section styling
    sections.forEach(section => {
      processed = processed.replace(section.pattern, section.replacement);
    });
    
    // Close div tags at the end of each section (before next section or end)
    processed = processed.replace(/(<div class="bg-[^"]*"[^>]*>.*?)(?=<div class="bg-|$)/gs, '$1</div>');
    
    return processed;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="large" message="Generating your detailed NCERT curriculum..." />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">📚 Build Your Teaching Plan, Respected Teacher</h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Create a comprehensive curriculum with NCERT book integration for your multi-grade classroom.
        </p>
      </div>

      {/* Grade Selection for Curriculum */}
      <div className="bg-white rounded-xl p-6 shadow-lg">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">📋 Select Grade for Curriculum</h3>
        <div className="flex items-center space-x-4 mb-4">
          <label className="text-sm font-medium text-gray-700">Grade:</label>
          <select
            value={selectedGrade}
            onChange={(e) => setSelectedGrade(parseInt(e.target.value))}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {userGrades?.map(grade => (
              <option key={grade} value={grade}>
                Grade {grade}
              </option>
            ))}
          </select>
          <div className="text-sm text-gray-600">
            Curriculum: {curriculumType.toUpperCase()}
          </div>
        </div>
        <p className="text-sm text-gray-600">
          Currently creating curriculum for: <span className="font-medium">Grade {selectedGrade}</span>
        </p>
      </div>

      {showBookSelection ? (
        // Book Selection Component
        <div className="bg-white rounded-xl p-6 shadow-lg">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            📚 Choose a book to generate schedule
          </h3>
          <p className="text-gray-600 mb-6">
            Select a subject from the available books in the {curriculumType.toUpperCase()} Grade {selectedGrade} curriculum corpus:
          </p>
          
          {availableBooks.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600">No books found for Grade {selectedGrade} {curriculumType.toUpperCase()} curriculum.</p>
              <Button 
                onClick={() => setShowBookSelection(false)}
                className="mt-4"
                variant="outline"
              >
                Back to Options
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {availableBooks.map((book) => (
                <div key={book} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900">{book}</h4>
                      <p className="text-sm text-gray-600">
                        Grade {selectedGrade} • {curriculumType.toUpperCase()}
                      </p>
                    </div>
                    <Button 
                      onClick={() => handleBookSelect(book)}
                      size="small"
                      disabled={loading}
                    >
                      {loading ? 'Loading...' : 'Select'}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          <div className="mt-6 text-center">
            <Button 
              onClick={() => setShowBookSelection(false)}
              variant="outline"
            >
              Back to Options
            </Button>
          </div>
        </div>
      ) : generatedSchedule ? (
        // Schedule Display Component
        <div className="bg-white rounded-xl p-6 shadow-lg">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-xl font-semibold text-gray-900">
                📅 Your 5-Day Lesson Schedule
              </h3>
              <p className="text-gray-600">
                {selectedSubject} • Grade {selectedGrade} • {curriculumType.toUpperCase()}
              </p>
            </div>
            <Button 
              onClick={() => window.print()}
              variant="outline"
              size="small"
            >
              🖨️ Print
            </Button>
          </div>
          
          {(() => {
            const parsedDays = parseScheduleByDays(generatedSchedule.schedule);
            console.log('Rendering day buttons, parsedDays:', parsedDays);
            
            return (
              <>
                <div className="mb-6">
                  <h4 className="font-medium text-gray-700 mb-3">Select Day to View Schedule:</h4>
                  <div className="flex flex-wrap gap-2">
                                        {parsedDays.length > 0 ? parsedDays.map((day, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedDay(index)}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                          selectedDay === index 
                            ? 'bg-blue-600 text-white shadow-md' 
                            : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                        }`}
                      >
                        Day {day.dayNumber}: {day.date}
                      </button>
                    )) : generatedSchedule.working_days?.map((day, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedDay(index)}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                          selectedDay === index 
                            ? 'bg-blue-600 text-white shadow-md' 
                            : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                        }`}
                      >
                        {day}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-200">
                    {parsedDays.length > 0 && parsedDays[selectedDay] ? (
                      <div>
                        <h4 className="font-bold text-blue-900 mb-4 text-lg">
                          📅 Day {parsedDays[selectedDay].dayNumber} - {parsedDays[selectedDay].date}
                        </h4>
                        <div className="prose max-w-none">
                          <div 
                            className="text-sm text-gray-700 leading-relaxed"
                            dangerouslySetInnerHTML={{ __html: renderMarkdown(parsedDays[selectedDay].content) }}
                          />
                        </div>
                      </div>
                    ) : (
                      <div>
                        <h4 className="font-bold text-blue-900 mb-4 text-lg">
                          📅 Full Schedule
                        </h4>
                                                 <div className="prose max-w-none">
                           <div 
                             className="text-sm text-gray-700 leading-relaxed"
                             dangerouslySetInnerHTML={{ __html: renderMarkdown(generatedSchedule.schedule) }}
                           />
                         </div>
                      </div>
                    )}
                  </div>
                </div>
              </>
            );
          })()}
          
          <div className="mt-6 flex gap-4 justify-center">
            <Button 
              onClick={() => {
                setGeneratedSchedule(null);
                setSelectedDay(0);
                setShowBookSelection(true);
              }}
            >
              Generate New Schedule
            </Button>
            <Button 
              onClick={() => {
                setGeneratedSchedule(null);
                setSelectedDay(0);
                setShowBookSelection(false);
                setSelectedOption('');
              }}
              variant="outline"
            >
              Back to Options
            </Button>
          </div>
        </div>
      ) : !curriculum ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white rounded-xl p-6 shadow-lg cursor-pointer hover:shadow-xl transition-shadow"
               onClick={() => setSelectedOption('automatic')}>
            <div className="text-4xl mb-4">🤖</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">AI Curated Curriculum Schedule</h3>
            <p className="text-gray-600 mb-6">AI analyzes your curriculum books and creates intelligent 5-day lesson schedules based on vector embeddings</p>
            {selectedOption === 'automatic' && (
              <Button onClick={handleAutoCreateSchedule} size="large">
                🚀 Auto Create Schedule
              </Button>
            )}
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg cursor-pointer hover:shadow-xl transition-shadow"
               onClick={() => setSelectedOption('custom')}>
            <div className="text-4xl mb-4">✏️</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Custom Curriculum Schedule</h3>
            <p className="text-gray-600 mb-6">Build your own lesson schedule by selecting specific topics and creating custom timelines</p>
            {selectedOption === 'custom' && (
              <Button onClick={generateCurriculum} size="large">
                🎯 Create Custom Plan
              </Button>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Header */}
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  📋 Grade {curriculum.grade} NCERT Curriculum
                </h2>
                <p className="text-gray-600">Generated on {curriculum.generatedAt}</p>
              </div>
              <div className="flex space-x-3">
                <Button 
                  onClick={() => setCurriculum(null)}
                >
                  ✨ Create New
                </Button>
              </div>
            </div>

            {/* NCERT Books & Resources */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">📚 NCERT Books & Resources</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {curriculum.subjects.map((subject, index) => (
                  <div key={index} className="p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-semibold text-gray-800 mb-2">{subject}</h4>
                    <div className="flex space-x-2 mb-2">
                      <a 
                        href={curriculum.resources?.[subject]?.english}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition-colors"
                      >
                        📖 English PDF
                      </a>
                      <a 
                        href={curriculum.resources?.[subject]?.hindi}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1 bg-orange-500 text-white text-sm rounded hover:bg-orange-600 transition-colors"
                      >
                        📖 Hindi PDF
                      </a>
                    </div>
                    <p className="text-xs text-gray-600">
                      Click to download NCERT books • 
                      <span className="text-amber-600"> Some books may not be available</span>
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Monthly Plan */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-gray-900">📅 Monthly Teaching Plan</h3>
              <Button 
                onClick={printMonthlyPlan}
                variant="secondary"
                className="flex items-center space-x-2"
              >
                🖨️ Print Teaching Plan
              </Button>
            </div>
            <div id="monthly-teaching-plan" className="month-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Object.entries(curriculum.monthlyPlan).map(([month, plan]) => (
                <div key={month} className="month-card bg-white rounded-xl p-6 shadow-lg">
                  <div className="month-header flex items-center justify-between mb-4">
                    <h4 className="month-title text-lg font-semibold text-gray-900">{month}</h4>
                    <span className={`semester-badge px-2 py-1 rounded-full text-xs font-medium ${
                      plan.semester === 1 ? 'semester-1 bg-green-100 text-green-800' : 'semester-2 bg-blue-100 text-blue-800'
                    }`}>
                      Semester {plan.semester}
                    </span>
                  </div>
                  
                  <div className="space-y-4">
                    {Object.entries(plan.subjects).map(([subject, details]) => (
                      <div key={subject} className="subject-section">
                        <h5 className="subject-title font-medium text-gray-800 text-sm mb-2">{subject}</h5>
                        <div className="space-y-1">
                          {details.topics.map((topic, index) => (
                            <div key={index} className="topic-item flex items-start text-sm">
                              <span className="topic-bullet w-1 h-1 bg-gray-400 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                              <div className="topic-content flex-1">
                                <div className="topic-text text-gray-700">{topic}</div>
                                <div className="chapter-text text-gray-500 text-xs">{details.chapters[index]}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Enhanced Dashboard component
const Dashboard = ({ aiOpen, setAiOpen, onLearnConceptClick, onPrepareLessonClick }) => {
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const [currentView, setCurrentView] = useState('dashboard');

  const menuItems = [
    { id: 'dashboard', title: t('dashboard', 'Dashboard'), icon: '🏠' },
    { id: 'curriculum', title: t('create_curriculum', 'Create Curriculum'), icon: '📚' },
    { id: 'learn', title: t('learning_concepts', 'Learning Concepts'), icon: '🧠' },
    { id: 'prepare', title: t('prepare_lessons', 'Prepare Lessons'), icon: '📝' },
    { id: 'ai', title: t('ai_assistant', 'AI Assistant'), icon: '🤖' }
  ];

  const renderContent = () => {
    if (currentView === 'curriculum') {
      return <CreateCurriculum />;
    }
    
    return (
      <div>
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            {t('welcome', 'Welcome')} back, Respected Teacher {user?.firstName}! 👋
          </h2>
          <p className="text-gray-600">
            Multi-Grade Teacher at {user?.schoolName}
          </p>
          <div className="flex flex-wrap gap-2 mt-3">
            {user?.teachingGrades?.map(grade => (
              <span key={grade} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                Grade {grade}
              </span>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {menuItems.slice(1).map((item) => (
            <div 
              key={item.id} 
              className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow cursor-pointer"
              onClick={() => {
                if (item.id === 'ai') {
                  setAiOpen(true);
                } else if (item.id === 'learn') {
                  onLearnConceptClick();
                } else if (item.id === 'prepare') {
                  onPrepareLessonClick();
                } else {
                  setCurrentView(item.id);
                }
              }}
            >
              <div className="text-3xl mb-4">{item.icon}</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.title}</h3>
              <p className="text-gray-600 text-sm">{t('click_to_explore', 'Click to explore this teaching tool')}</p>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-xl p-8 shadow-lg">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">{t('your_teaching_profile', 'Your Teaching Profile')}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div><span className="font-medium">{t('name', 'Name')}:</span> Respected Teacher {user?.firstName} {user?.lastName}</div>
            <div><span className="font-medium">{t('teaching_grades', 'Teaching Grades')}:</span> {user?.teachingGrades?.join(', ')}</div>
            <div><span className="font-medium">{t('school_name', 'School')}:</span> {user?.schoolName}</div>
            <div><span className="font-medium">{t('district', 'District')}:</span> {user?.district}</div>
            <div><span className="font-medium">{t('phone', 'Phone')}:</span> {user?.phoneNumber}</div>
            <div><span className="font-medium">{t('classroom_type', 'Classroom Type')}:</span> Multi-Grade Teaching</div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gray-50 p-4">
      {/* Remove duplicate header since we have global header now */}
      {/* <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">🎓</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Sahayak</h1>
              <p className="text-sm text-gray-600">Multi-Grade Teaching Assistant</p>
            </div>
            
            <nav className="hidden md:flex space-x-1 ml-8">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    if (item.id === 'ai') {
                      setAiOpen(true);
                    } else if (item.id === 'learn') {
                      onLearnConceptClick();
                    } else if (item.id === 'prepare') {
                      onPrepareLessonClick();
                    } else {
                      setCurrentView(item.id);
                    }
                  }}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    currentView === item.id
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  {item.title}
                </button>
              ))}
            </nav>
          </div>
          
          <div className="flex items-center space-x-4">
            <LanguageSwitcher />
            <button
              onClick={logout}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              {t('logout', 'Logout')}
            </button>
          </div>
        </div>
      </header> */}

      <main className="max-w-7xl mx-auto">
        {renderContent()}
      </main>
    </div>
  );
};

// Grade and Curriculum Selection Screen
const GradeSelectionScreen = ({ onProceed }) => {
  const [selectedGrades, setSelectedGrades] = useState([]);
  const [selectedCurriculum, setSelectedCurriculum] = useState('ncert'); // 'ncert' or 'kts'
  const [userProfile, setUserProfile] = useState({
    firstName: 'Priya',
    lastName: 'Sharma',
    phoneNumber: '9876543210',
    schoolName: 'Government Primary School',
    district: 'Rajgarh',
    state: 'Madhya Pradesh'
  });

  const availableGrades = [5, 6, 7, 8, 9, 10];

  const handleGradeToggle = (grade) => {
    if (selectedGrades.includes(grade)) {
      setSelectedGrades(selectedGrades.filter(g => g !== grade));
    } else {
      setSelectedGrades([...selectedGrades, grade]);
    }
  };

  const handleProceed = () => {
    if (selectedGrades.length === 0) {
      alert('Please select at least one teaching grade.');
      return;
    }

    const completeProfile = {
      ...userProfile,
      teachingGrades: selectedGrades,
      primaryGrade: selectedGrades[0],
      curriculumType: selectedCurriculum,
      profileCompleted: true
    };

    onProceed(completeProfile);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-2xl w-full">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-3xl text-white">🎓</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-3">Welcome to Sahayak</h1>
          <p className="text-lg text-gray-600 mb-2">Your Multi-Grade Teaching Assistant</p>
          <p className="text-sm text-blue-600">Configure your teaching preferences to get started</p>
        </div>

        {/* Teaching Grades Selection */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">📚 Select Your Teaching Grades</h2>
          <p className="text-gray-600 mb-4">Choose the grades you teach in your multi-grade classroom:</p>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {availableGrades.map(grade => (
              <label key={grade} className="flex items-center space-x-3 cursor-pointer p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <input
                  type="checkbox"
                  checked={selectedGrades.includes(grade)}
                  onChange={() => handleGradeToggle(grade)}
                  className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                />
                <span className="text-gray-700 font-medium">
                  Grade {grade}
                </span>
              </label>
            ))}
          </div>
          
          {selectedGrades.length > 0 && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                <span className="font-medium">Selected:</span> Grade {selectedGrades.join(', ')}
              </p>
            </div>
          )}
        </div>

        {/* Curriculum Type Selection */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">📖 Choose Your Curriculum</h2>
          <p className="text-gray-600 mb-4">Select the curriculum you follow in your school:</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className={`cursor-pointer p-4 border-2 rounded-lg transition-colors ${
              selectedCurriculum === 'ncert' 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-200 hover:border-gray-300'
            }`}>
              <input
                type="radio"
                name="curriculum"
                value="ncert"
                checked={selectedCurriculum === 'ncert'}
                onChange={(e) => setSelectedCurriculum(e.target.value)}
                className="sr-only"
              />
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">📚</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">NCERT Curriculum</h3>
                  <p className="text-sm text-gray-600">National Council of Educational Research and Training</p>
                </div>
              </div>
            </label>

            <label className={`cursor-pointer p-4 border-2 rounded-lg transition-colors ${
              selectedCurriculum === 'kts' 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-200 hover:border-gray-300'
            }`}>
              <input
                type="radio"
                name="curriculum"
                value="kts"
                checked={selectedCurriculum === 'kts'}
                onChange={(e) => setSelectedCurriculum(e.target.value)}
                className="sr-only"
              />
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">🏫</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">KTS Curriculum</h3>
                  <p className="text-sm text-gray-600">Kendriya Vidyalaya Sangathan</p>
                </div>
              </div>
            </label>
          </div>
        </div>

        {/* Proceed Button */}
        <div className="text-center">
          <Button 
            onClick={handleProceed}
            disabled={selectedGrades.length === 0}
            size="large"
            className="w-full md:w-auto px-8"
          >
            🚀 Proceed to Dashboard
          </Button>
          
          {selectedGrades.length === 0 && (
            <p className="text-sm text-red-600 mt-2">Please select at least one teaching grade to continue</p>
          )}
        </div>
      </div>
    </div>
  );
};

// Main App component
const AppContent = ({ aiOpen, setAiOpen, onLearnConceptClick, onPrepareLessonClick }) => {
  const { isAuthenticated, profileCompleted, loading, completeProfile } = useAuth();
  const [showGradeSelection, setShowGradeSelection] = useState(true);

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <LoadingSpinner size="large" message="Loading Sahayak..." />
      </div>
    );
  }

  // Show grade selection screen first
  if (showGradeSelection) {
    return (
      <GradeSelectionScreen 
        onProceed={(profile) => {
          completeProfile(profile);
          setShowGradeSelection(false);
        }} 
      />
    );
  }

  // If profile is completed, show dashboard
  if (profileCompleted) {
    return <Dashboard aiOpen={aiOpen} setAiOpen={setAiOpen} onLearnConceptClick={onLearnConceptClick} onPrepareLessonClick={onPrepareLessonClick} />;
  }

  // Fallback - should not reach here
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
      <LoadingSpinner size="large" message="Setting up your profile..." />
    </div>
  );
};

// Enhanced App Content with Translation Support
const AppContentWithTranslation = ({ aiOpen, setAiOpen, onLearnConceptClick, onPrepareLessonClick }) => {
  const { currentLanguage, isTranslating } = useLanguage();
  const { triggerTranslation } = useAutoTranslation({
    enableAutoTranslation: true,
    excludeSelectors: [
      'script', 
      'style', 
      'noscript', 
      '.no-translate',
      '[data-no-translate]',
      'code',
      'pre'
    ],
    debounceDelay: 800,
    batchSize: 20
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Translation Loading Indicator */}
      {isTranslating && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-blue-600 text-white text-center py-2 text-sm">
          <div className="flex items-center justify-center space-x-2">
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            <span data-no-translate>Translating page content...</span>
          </div>
        </div>
      )}

      {/* Header with Language Switcher */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900">
                Sahayak AI
              </h1>
              <span className="text-sm text-gray-500" data-no-translate>
                Teaching Assistant
              </span>
            </div>
            
            {/* Language Switcher */}
            <div className="flex items-center space-x-4">
              <LanguageSwitcher />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main>
        <AppContent 
          aiOpen={aiOpen} 
          setAiOpen={setAiOpen} 
          onLearnConceptClick={onLearnConceptClick}
          onPrepareLessonClick={onPrepareLessonClick}
        />
      </main>
    </div>
  );
};

function App() {
  const [aiOpen, setAiOpen] = useState(false);
  const [learningWindowOpen, setLearningWindowOpen] = useState(false);
  const [prepareLessonOpen, setPrepareLessonOpen] = useState(false);
  
  const handleLearnConceptClick = () => {
    setLearningWindowOpen(true);
  };

  const handlePrepareLessonClick = () => {
    setPrepareLessonOpen(true);
  };
  
  return (
    <div className="App">
      <LanguageProvider>
        <AuthProvider>
          <AppProvider>
            <AppContentWithTranslation 
              aiOpen={aiOpen} 
              setAiOpen={setAiOpen} 
              onLearnConceptClick={handleLearnConceptClick}
              onPrepareLessonClick={handlePrepareLessonClick}
            />
            {/* Floating AI Assistant */}
            <AIAssistantFloating open={aiOpen} setOpen={setAiOpen} />
            {/* Learning Window */}
            <LearningWindow isOpen={learningWindowOpen} onClose={() => setLearningWindowOpen(false)} />
            {/* Prepare Lesson Window */}
            <PrepareLessonWindow 
              isOpen={prepareLessonOpen} 
              onClose={() => setPrepareLessonOpen(false)}
              selectedGrades={[2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]} // Mock grades, you can get this from user context
            />
          </AppProvider>
        </AuthProvider>
      </LanguageProvider>
    </div>
  );
}

export default App;