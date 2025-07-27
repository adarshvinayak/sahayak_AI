import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { GRADES, DEFAULT_TOPICS } from '../../utils/constants';
import Button from '../UI/Button';
import LoadingSpinner from '../UI/LoadingSpinner';
import { curriculumService, generateSessionId, handleAPIError } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';

const CreateCurriculum = () => {
  const { user, setLoading, loading } = useApp();
  const { user: authUser } = useAuth();
  const { currentLanguage } = useLanguage();
  const [selectedOption, setSelectedOption] = useState('');
  const [customGrade, setCustomGrade] = useState('');
  const [customTopics, setCustomTopics] = useState([]);
  const [newTopic, setNewTopic] = useState('');
  const [generatedCurriculum, setGeneratedCurriculum] = useState(null);
  const [sessionId, setSessionId] = useState(generateSessionId('curriculum'));
  
  // New state variables for book selection and schedule generation
  const [availableBooks, setAvailableBooks] = useState([]);
  const [showBookSelection, setShowBookSelection] = useState(false);
  const [generatedSchedule, setGeneratedSchedule] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState('');

  // Get user preferences
  const userGrades = authUser?.teachingGrades || [9];
  const curriculumType = authUser?.curriculumType || 'ncert';
  
  // Set default grade to first user grade if not set
  const selectedGrade = customGrade || userGrades[0];

  const curriculumOptions = [
    {
      id: 'automatic',
      title: 'Create Automatic Curriculum',
      description: 'Generate a complete year-long curriculum based on your grade level',
      icon: '🤖',
      color: 'bg-primary-500',
      features: ['AI-Generated', 'Grade-Specific', 'Month-wise Planning', 'Subject Integration']
    },
    {
      id: 'custom',
      title: 'Customize Curriculum',
      description: 'Build your own curriculum by selecting specific topics and subjects',
      icon: '✏️',
      color: 'bg-secondary-500',
      features: ['Flexible Topics', 'Custom Timeline', 'Subject Selection', 'Personal Touch']
    }
  ];

  const handleOptionSelect = (optionId) => {
    setSelectedOption(optionId);
    setGeneratedCurriculum(null);
  };

  const handleAddTopic = () => {
    if (newTopic.trim() && !customTopics.includes(newTopic.trim())) {
      setCustomTopics([...customTopics, newTopic.trim()]);
      setNewTopic('');
    }
  };

  const handleRemoveTopic = (topicToRemove) => {
    setCustomTopics(customTopics.filter(topic => topic !== topicToRemove));
  };

  const generateAutomaticCurriculum = async () => {
    try {
      setLoading(true);
      
      // Get user preferences for enhanced prompts
      const userGrades = authUser?.teachingGrades || [9];
      const curriculumType = authUser?.curriculumType || 'ncert';
      
      // Create enhanced prompt with user preferences
      const enhancedGrade = customGrade !== 'not-selected' ? parseInt(customGrade) : userGrades[0];
      const enhancedSubjects = Object.keys(DEFAULT_TOPICS[enhancedGrade] || DEFAULT_TOPICS[2]);
      
      // Try to get response from backend first
      const response = await curriculumService.generateCurriculum(
        enhancedGrade,
        enhancedSubjects,
        curriculumType, // Use user's curriculum type
        '2024-25', // academic year
        authUser?.id || 'default_user'
      );
      
      // Parse the AI response and structure it
      const curriculum = parseCurriculumResponse(response.response, enhancedGrade);
      setGeneratedCurriculum(curriculum);
      
    } catch (error) {
      console.error('Failed to generate curriculum:', error);
      setGeneratedCurriculum(null);
    } finally {
      setLoading(false);
    }
  };

  const generateCustomCurriculum = async () => {
    if (customTopics.length === 0) {
      alert('Please add at least one topic');
      return;
    }

    try {
      setLoading(true);
      
      // Get user preferences for enhanced prompts
      const userGrades = authUser?.teachingGrades || [9];
      const curriculumType = authUser?.curriculumType || 'ncert';
      
      // Create enhanced prompt with user preferences
      const enhancedGrade = customGrade !== 'not-selected' ? parseInt(customGrade) : userGrades[0];
      const enhancedTopics = customTopics.map(topic => {
        if (customGrade !== 'not-selected') {
          return `${topic} for Grade ${enhancedGrade} following ${curriculumType.toUpperCase()} curriculum`;
        } else {
          return `${topic} following ${curriculumType.toUpperCase()} curriculum`;
        }
      });
      
      // Try to get response from backend first
      const response = await curriculumService.generateCurriculum(
        enhancedGrade,
        enhancedTopics,
        curriculumType, // Use user's curriculum type
        '2024-25', // academic year
        authUser?.id || 'default_user'
      );
      
      // Parse the AI response and structure it
      const curriculum = parseCustomCurriculumResponse(response.response, enhancedGrade);
      setGeneratedCurriculum(curriculum);
      
    } catch (error) {
      console.error('Failed to create curriculum:', error);
      setGeneratedCurriculum(null);
    } finally {
      setLoading(false);
    }
  };

  const parseCurriculumResponse = (response, grade) => {
    // Parse the AI response and convert it to the expected format
    try {
      // For now, return a structured format based on the response
      return {
        grade: grade,
        subjects: Object.keys(DEFAULT_TOPICS[grade] || DEFAULT_TOPICS[2]),
        generatedAt: new Date().toISOString(),
        content: response,
        monthlyPlan: generateMonthlyPlan(DEFAULT_TOPICS[grade] || DEFAULT_TOPICS[2]),
        resources: generateResourceLinks(grade, Object.keys(DEFAULT_TOPICS[grade] || DEFAULT_TOPICS[2]))
      };
    } catch (error) {
      console.error('Error parsing curriculum response:', error);
      return {
        grade: grade,
        subjects: Object.keys(DEFAULT_TOPICS[grade] || DEFAULT_TOPICS[2]),
        generatedAt: new Date().toISOString(),
        content: response,
        monthlyPlan: generateMonthlyPlan(DEFAULT_TOPICS[grade] || DEFAULT_TOPICS[2]),
        resources: generateResourceLinks(grade, Object.keys(DEFAULT_TOPICS[grade] || DEFAULT_TOPICS[2]))
      };
    }
  };

  const parseCustomCurriculumResponse = (response, grade) => {
    // Parse the AI response for custom curriculum
    try {
      return {
        grade: parseInt(grade),
        topics: customTopics,
        generatedAt: new Date().toISOString(),
        content: response,
        monthlyPlan: generateCustomMonthlyPlan(customTopics)
      };
    } catch (error) {
      console.error('Error parsing custom curriculum response:', error);
      return {
        grade: parseInt(grade),
        topics: customTopics,
        generatedAt: new Date().toISOString(),
        content: response,
        monthlyPlan: generateCustomMonthlyPlan(customTopics)
      };
    }
  };

  const generateMonthlyPlan = (topics) => {
    const months = ['April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December', 'January', 'February', 'March'];
    const monthlyPlan = {};
    
    Object.keys(topics).forEach((subject, subjectIndex) => {
        const subjectTopics = topics[subject];
        const topicsPerMonth = Math.ceil(subjectTopics.length / 12);
      
      months.forEach((month, monthIndex) => {
        if (!monthlyPlan[month]) {
          monthlyPlan[month] = {};
        }
        
        const startIndex = monthIndex * topicsPerMonth;
        const endIndex = Math.min(startIndex + topicsPerMonth, subjectTopics.length);
        
        if (startIndex < subjectTopics.length) {
          monthlyPlan[month][subject] = subjectTopics.slice(startIndex, endIndex);
        }
      });
    });
    
    return monthlyPlan;
  };

  const generateCustomMonthlyPlan = (topics) => {
    const months = ['April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December', 'January', 'February', 'March'];
    const monthlyPlan = {};
    const topicsPerMonth = Math.ceil(topics.length / 12);
    
    months.forEach((month, monthIndex) => {
      const startIndex = monthIndex * topicsPerMonth;
      const endIndex = Math.min(startIndex + topicsPerMonth, topics.length);
      
      if (startIndex < topics.length) {
        monthlyPlan[month] = topics.slice(startIndex, endIndex);
      }
    });
    
    return monthlyPlan;
  };

  const generateResourceLinks = (grade, subjects) => {
    const resources = {};
    subjects.forEach(subject => {
      const subjectKey = subject.toLowerCase().replace(/\s+/g, '');
      resources[subject] = `/assets/ncert-books/grade-${grade}-${subjectKey}-en.pdf`;
    });
    return resources;
  };

  const handlePrint = () => {
    if (!generatedCurriculum) return;
    
    const printContent = document.createElement('div');
    printContent.innerHTML = `
      <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #1f2937; text-align: center; margin-bottom: 10px;">🎓 Sahayak Curriculum Plan</h1>
        <p style="text-align: center; color: #6b7280; margin-bottom: 30px;">AI-Powered Multi-Grade Teaching Assistant</p>
        
        <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h2 style="color: #1f2937; margin-bottom: 10px;">Curriculum Details</h2>
          <p><strong>Grade:</strong> ${generatedCurriculum.grade}</p>
          <p><strong>Generated:</strong> ${new Date(generatedCurriculum.generatedAt).toLocaleDateString()}</p>
          ${generatedCurriculum.subjects ? `<p><strong>Subjects:</strong> ${generatedCurriculum.subjects.join(', ')}</p>` : ''}
          ${generatedCurriculum.topics ? `<p><strong>Topics:</strong> ${generatedCurriculum.topics.join(', ')}</p>` : ''}
        </div>
        
        <div style="margin-bottom: 20px;">
          <h2 style="color: #1f2937; margin-bottom: 15px;">Monthly Planning</h2>
          ${Object.entries(generatedCurriculum.monthlyPlan).map(([month, content]) => `
            <div style="border: 1px solid #e5e7eb; border-radius: 8px; padding: 15px; margin-bottom: 15px;">
              <h3 style="color: #374151; margin-bottom: 10px;">${month}</h3>
              ${typeof content === 'object' && !Array.isArray(content) 
                ? Object.entries(content).map(([subject, topics]) => `
                    <div style="margin-bottom: 10px;">
                      <strong>${subject}:</strong> ${Array.isArray(topics) ? topics.join(', ') : topics}
                    </div>
                  `).join('')
                : `<p>${Array.isArray(content) ? content.join(', ') : content}</p>`
              }
            </div>
          `).join('')}
        </div>
        
        ${generatedCurriculum.resources ? `
          <div style="margin-bottom: 20px;">
            <h2 style="color: #1f2937; margin-bottom: 15px;">Resources</h2>
            ${Object.entries(generatedCurriculum.resources).map(([subject, link]) => `
              <p><strong>${subject}:</strong> <a href="${link}" style="color: #3b82f6;">Download PDF</a></p>
            `).join('')}
          </div>
        ` : ''}
        
        ${generatedCurriculum.content ? `
          <div style="margin-bottom: 20px;">
            <h2 style="color: #1f2937; margin-bottom: 15px;">AI-Generated Content</h2>
            <div style="background: #f9fafb; padding: 15px; border-radius: 8px; white-space: pre-wrap; font-size: 14px;">
              ${generatedCurriculum.content}
            </div>
          </div>
        ` : ''}
      </div>
    `;
    
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Sahayak Curriculum Plan</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
            @media print { body { padding: 0; } }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="main-title">🎓 Sahayak Curriculum Plan</div>
            <div class="subtitle">AI-Powered Multi-Grade Teaching Assistant</div>
            <div class="grade-info">Grade ${generatedCurriculum.grade} • Generated on ${new Date(generatedCurriculum.generatedAt).toLocaleDateString()}</div>
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

  // New function to handle Auto Create Schedule
  const handleAutoCreateSchedule = async () => {
    try {
      setLoading(true);
      
      // Get selected grade and curriculum
      const grade = selectedGrade;
      const curriculum = curriculumType;
      
      // Fetch available books from RAG corpus
      const response = await fetch(`http://localhost:8000/api/corpus/books/${curriculum}/${grade}`);
      const data = await response.json();
      
      if (data.error) {
        console.error('Error fetching books:', data.error);
        alert('Failed to fetch available books. Please try again.');
        return;
      }
      
      setAvailableBooks(data.books);
      setShowBookSelection(true);
    } catch (error) {
      console.error('Failed to fetch books:', error);
      alert('Failed to fetch available books. Please try again.');
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
      setShowBookSelection(false);
    } catch (error) {
      console.error('Failed to generate schedule:', error);
      alert('Failed to generate schedule. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="large" message="Generating your detailed curriculum..." />
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
            value={customGrade}
            onChange={(e) => setCustomGrade(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Select Grade</option>
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

      {!generatedCurriculum ? (
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
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Add Topics</label>
                  <div className="flex gap-2">
                      <input
                        type="text"
                        value={newTopic}
                        onChange={(e) => setNewTopic(e.target.value)}
                      placeholder="Enter topic name..."
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    <button
                      onClick={handleAddTopic}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Add
                    </button>
                    </div>
                  </div>

                  {customTopics.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Selected Topics</label>
                      <div className="flex flex-wrap gap-2">
                        {customTopics.map((topic, index) => (
                          <span
                            key={index}
                          className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                          >
                            {topic}
                            <button
                              onClick={() => handleRemoveTopic(topic)}
                            className="ml-2 text-blue-600 hover:text-blue-800"
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <Button 
                    onClick={generateCustomCurriculum} 
                    size="large"
                  disabled={customTopics.length === 0}
                  >
                  🚀 Generate Custom Curriculum
                  </Button>
                </div>
              )}
            </div>
        </div>
      ) : showBookSelection ? (
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
          
          <div className="mb-6">
            <h4 className="font-medium text-gray-700 mb-2">Working Days:</h4>
            <div className="flex flex-wrap gap-2">
              {generatedSchedule.working_days?.map((day, index) => (
                <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                  {day}
                </span>
              ))}
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-3">AI-Generated Schedule:</h4>
              <div className="prose max-w-none">
                <pre className="whitespace-pre-wrap text-sm text-gray-700 font-sans">
                  {generatedSchedule.schedule}
                </pre>
              </div>
            </div>
          </div>
          
          <div className="mt-6 flex gap-4 justify-center">
            <Button 
              onClick={() => {
                setGeneratedSchedule(null);
                setShowBookSelection(true);
              }}
            >
              Generate New Schedule
            </Button>
            <Button 
              onClick={() => {
                setGeneratedSchedule(null);
                setShowBookSelection(false);
                setSelectedOption('');
              }}
              variant="outline"
            >
              Back to Options
            </Button>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl p-8 shadow-lg">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Generated Curriculum</h2>
            <Button onClick={handlePrint} size="medium">
              🖨️ Print Curriculum
            </Button>
          </div>
          
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-semibold text-blue-900">Grade</h3>
                <p className="text-blue-700">Grade {generatedCurriculum.grade}</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="font-semibold text-green-900">Generated</h3>
                <p className="text-green-700">{new Date(generatedCurriculum.generatedAt).toLocaleDateString()}</p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <h3 className="font-semibold text-purple-900">Type</h3>
                <p className="text-purple-700">{generatedCurriculum.subjects ? 'NCERT' : 'Custom'}</p>
              </div>
            </div>

            {generatedCurriculum.subjects && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Subjects</h3>
                <div className="flex flex-wrap gap-2">
                  {generatedCurriculum.subjects.map((subject, index) => (
                    <span key={index} className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm">
                      {subject}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            {generatedCurriculum.topics && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Topics</h3>
                <div className="flex flex-wrap gap-2">
                  {generatedCurriculum.topics.map((topic, index) => (
                    <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                      {topic}
                  </span>
                  ))}
                </div>
              </div>
            )}
            
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Monthly Plan</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(generatedCurriculum.monthlyPlan).map(([month, content]) => (
                  <div key={month} className="border border-gray-200 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-2">{month}</h4>
                    {typeof content === 'object' && !Array.isArray(content) ? (
                      Object.entries(content).map(([subject, topics]) => (
                        <div key={subject} className="mb-2">
                          <p className="text-sm font-medium text-gray-700">{subject}:</p>
                          <p className="text-sm text-gray-600">{Array.isArray(topics) ? topics.join(', ') : topics}</p>
                      </div>
                      ))
                    ) : (
                      <p className="text-sm text-gray-600">{Array.isArray(content) ? content.join(', ') : content}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
            
            {generatedCurriculum.content && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">AI-Generated Content</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <pre className="whitespace-pre-wrap text-sm text-gray-700">{generatedCurriculum.content}</pre>
                </div>
              </div>
            )}
            
            {generatedCurriculum.resources && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Resources</h3>
                <div className="space-y-2">
                  {Object.entries(generatedCurriculum.resources).map(([subject, link]) => (
                    <div key={subject} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="font-medium text-gray-700">{subject}</span>
                      <a 
                        href={link} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        Download PDF
                      </a>
                    </div>
                    ))}
                </div>
              </div>
            )}
          </div>
          
          <div className="mt-8 flex justify-center">
            <Button 
              onClick={() => {
                setGeneratedCurriculum(null);
                setSelectedOption('');
                setSessionId(generateSessionId('curriculum'));
              }} 
              size="large"
              variant="outline"
            >
              🆕 Create New Curriculum
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateCurriculum;