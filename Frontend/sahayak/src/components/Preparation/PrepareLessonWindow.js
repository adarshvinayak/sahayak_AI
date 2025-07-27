import React, { useState, useEffect } from 'react';
import { X, BookOpen, FileText, Download, ExternalLink } from 'lucide-react';
import { lessonService, assessmentService, imageService, generateSessionId, handleAPIError } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const SUBJECTS = [
  { id: 'physics', name: 'Physics', topics: ['Newton\'s Law of Motion', 'Gravity', 'Electricity', 'Magnetism', 'Light'] },
  { id: 'biology', name: 'Biology', topics: ['Cell Structure', 'Human Body', 'Plants', 'Animals', 'Ecosystem'] },
  { id: 'information-technology', name: 'Information Technology', topics: ['Computer Basics', 'Programming', 'Internet', 'Digital Safety', 'Software'] },
  { id: 'science', name: 'Science', topics: ['Scientific Method', 'Matter', 'Energy', 'Environment', 'Technology'] },
  { id: 'maths', name: 'Mathematics', topics: ['Algebra', 'Geometry', 'Arithmetic', 'Statistics', 'Calculus'] },
  { id: 'english', name: 'English', topics: ['Grammar', 'Literature', 'Comprehension', 'Writing Skills', 'Vocabulary'] },
  { id: 'social-science', name: 'Social Science', topics: ['History', 'Geography', 'Civics', 'Economics', 'Culture'] }
];

const PrepareLessonWindow = ({ isOpen, onClose, selectedGrades }) => {
  const { user } = useAuth();
  const [selectedSubject, setSelectedSubject] = useState('physics');
  const [selectedTopic, setSelectedTopic] = useState('Newton\'s Law of Motion');
  const [selectedGrade, setSelectedGrade] = useState('not-selected');
  const [studyMaterial, setStudyMaterial] = useState(null);
  const [assessmentQuestions, setAssessmentQuestions] = useState(null);
  const [generatedImage, setGeneratedImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState(generateSessionId('lesson'));

  // Get user preferences
  const userGrades = user?.teachingGrades || selectedGrades || [9];
  const curriculumType = user?.curriculumType || 'ncert';

  useEffect(() => {
    if (userGrades && userGrades.length > 0) {
      setSelectedGrade('not-selected'); // Default to "Not Selected"
    }
  }, [userGrades]);

  const getAvailableTopics = () => {
    const subject = SUBJECTS.find(s => s.id === selectedSubject);
    return subject ? subject.topics : [];
  };

  const handleGenerateMaterial = async () => {
    setIsLoading(true);
    
    try {
      // Create enhanced prompt with user preferences
      let enhancedTopic = selectedTopic;
      if (selectedGrade !== 'not-selected') {
        enhancedTopic = `${selectedTopic} for Grade ${selectedGrade} following ${curriculumType.toUpperCase()} curriculum`;
      } else {
        enhancedTopic = `${selectedTopic} following ${curriculumType.toUpperCase()} curriculum`;
      }
      
      const response = await lessonService.prepareLesson(
        enhancedTopic,
        selectedGrade !== 'not-selected' ? selectedGrade : userGrades[0], // Use selected grade or first user grade
        selectedSubject,
        45, // duration
        'comprehensive', // lesson type
        user?.id || 'default_user'
      );
      
      setStudyMaterial(response.response);
      
    } catch (error) {
      console.error('Failed to generate study material:', error);
      setStudyMaterial('Unable to generate study material at this time. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateAssessment = async () => {
    try {
      // Create enhanced prompt with user preferences
      let enhancedTopic = selectedTopic;
      if (selectedGrade !== 'not-selected') {
        enhancedTopic = `${selectedTopic} for Grade ${selectedGrade} following ${curriculumType.toUpperCase()} curriculum`;
      } else {
        enhancedTopic = `${selectedTopic} following ${curriculumType.toUpperCase()} curriculum`;
      }
      
      const response = await assessmentService.generateAssessment(
        enhancedTopic,
        selectedGrade !== 'not-selected' ? selectedGrade : userGrades[0], // Use selected grade or first user grade
        'mcq', // question type
        5, // count
        'medium', // difficulty
        user?.id || 'default_user'
      );
      
      setAssessmentQuestions(response.questions);
      
    } catch (error) {
      console.error('Failed to generate assessment:', error);
      setAssessmentQuestions('Unable to generate assessment questions at this time. Please try again later.');
    }
  };

  const handleGenerateImage = async () => {
    try {
      // Create enhanced prompt with user preferences
      let enhancedPrompt = `Generate educational diagram for ${selectedTopic}`;
      if (selectedGrade !== 'not-selected') {
        enhancedPrompt = `Generate educational diagram for ${selectedTopic} suitable for Grade ${selectedGrade} students following ${curriculumType.toUpperCase()} curriculum`;
      } else {
        enhancedPrompt = `Generate educational diagram for ${selectedTopic} following ${curriculumType.toUpperCase()} curriculum`;
      }
      
      const response = await imageService.generateEducationalImage(
        enhancedPrompt,
        'educational',
        '9:16',
        user?.id || 'default_user'
      );
      
      if (response.image_url) {
        setGeneratedImage(response.image_url);
      }
      
    } catch (error) {
      console.error('Failed to generate image:', error);
      setGeneratedImage(null);
    }
  };

  const handleClose = () => {
    onClose();
    setStudyMaterial(null);
    setAssessmentQuestions(null);
    setGeneratedImage(null);
    setSessionId(generateSessionId('lesson'));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-green-600 to-blue-600 rounded-t-2xl">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Prepare Lesson</h2>
              <p className="text-green-100 text-sm">
                Generate comprehensive lesson materials for {curriculumType.toUpperCase()} curriculum
              </p>
            </div>
          </div>
          <button 
            onClick={handleClose}
            className="text-white hover:text-gray-200 transition-colors"
            aria-label="Close"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Panel - Selection */}
            <div className="lg:col-span-1 space-y-6">
              {/* User Preferences Display */}
              <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                <h3 className="text-lg font-semibold text-blue-900 mb-2">👤 Your Teaching Profile</h3>
                <div className="space-y-1 text-sm">
                  <p><span className="font-medium">Curriculum:</span> {curriculumType.toUpperCase()}</p>
                  <p><span className="font-medium">Teaching Grades:</span> {userGrades.join(', ')}</p>
                  <p><span className="font-medium">Selected Grade:</span> {selectedGrade === 'not-selected' ? 'Not Selected' : `Grade ${selectedGrade}`}</p>
              </div>
              </div>

              {/* Subject Selection */}
              <div className="bg-gray-50 rounded-xl p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">📚 Select Subject</h3>
                <div className="space-y-2">
                  {SUBJECTS.map(subject => (
                    <button
                      key={subject.id}
                      onClick={() => {
                        setSelectedSubject(subject.id);
                        setSelectedTopic(subject.topics[0]);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                        selectedSubject === subject.id
                          ? 'bg-blue-600 text-white'
                          : 'bg-white text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {subject.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Topic Selection */}
              <div className="bg-gray-50 rounded-xl p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">📖 Select Topic</h3>
                <div className="space-y-2">
                  {getAvailableTopics().map(topic => (
                    <button
                      key={topic}
                      onClick={() => setSelectedTopic(topic)}
                      className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                        selectedTopic === topic
                          ? 'bg-green-600 text-white'
                          : 'bg-white text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {topic}
                    </button>
                  ))}
                </div>
              </div>

              {/* Grade Selection Dropdown */}
              <div className="bg-gray-50 rounded-xl p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">🎓 Select Grade (Optional)</h3>
                <p className="text-sm text-gray-600 mb-2">Choose which grade to generate materials for:</p>
                <select
                  value={selectedGrade}
                  onChange={(e) => setSelectedGrade(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="not-selected">Not Selected</option>
                  {userGrades?.map(grade => (
                    <option key={grade} value={grade}>
                      Grade {grade}
                    </option>
                  ))}
                </select>
              </div>

              {/* Action Buttons */}
              <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">🚀 Generate Materials</h3>
                
                <button
                  onClick={handleGenerateMaterial}
                  disabled={isLoading}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Generating...</span>
                    </>
                  ) : (
                    <>
                      <FileText size={18} />
                  <span>Generate Study Material</span>
                    </>
                  )}
                </button>

                <button
                  onClick={handleGenerateAssessment}
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
                >
                  <Download size={18} />
                  <span>Generate Assessment</span>
                </button>

                <button
                  onClick={handleGenerateImage}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
                >
                  <ExternalLink size={18} />
                  <span>Generate Diagram</span>
                </button>
              </div>
            </div>

            {/* Right Panel - Generated Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Study Material */}
              {studyMaterial && (
                <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">
                    📚 Study Material - {selectedGrade !== 'not-selected' ? `Grade ${selectedGrade}` : 'General'} ({curriculumType.toUpperCase()})
                  </h3>
                  <div className="prose prose-sm max-w-none">
                  <div 
                    dangerouslySetInnerHTML={{ 
                        __html: studyMaterial
                        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                        .replace(/\n/g, '<br>')
                          .replace(/## (.*?)/g, '<h2>$1</h2>')
                          .replace(/### (.*?)/g, '<h3>$1</h3>')
                      }} 
                    />
                  </div>
                </div>
              )}

              {/* Assessment Questions */}
              {assessmentQuestions && (
                <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">
                    📝 Assessment Questions - {selectedGrade !== 'not-selected' ? `Grade ${selectedGrade}` : 'General'} ({curriculumType.toUpperCase()})
                  </h3>
                  <div className="prose prose-sm max-w-none">
                    <div 
                      dangerouslySetInnerHTML={{ 
                        __html: assessmentQuestions
                        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                          .replace(/\n/g, '<br>')
                      }} 
                    />
                  </div>
                </div>
              )}

              {/* Generated Image */}
              {generatedImage && (
                <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">
                    🖼️ Generated Diagram - {selectedGrade !== 'not-selected' ? `Grade ${selectedGrade}` : 'General'} ({curriculumType.toUpperCase()})
                  </h3>
                  <div className="flex justify-center">
                    <img 
                      src={generatedImage} 
                      alt={`Educational diagram for ${selectedTopic}`}
                      className="max-w-full h-auto rounded-lg shadow-md"
                    />
                  </div>
                </div>
              )}

              {/* Empty State */}
              {!studyMaterial && !assessmentQuestions && !generatedImage && (
                <div className="bg-gray-50 rounded-xl p-12 text-center">
                  <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Ready to Generate Materials</h3>
                  <p className="text-gray-600">
                    Select your subject, topic, and optionally a grade, then click "Generate Study Material" to create comprehensive lesson materials for {curriculumType.toUpperCase()} curriculum.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrepareLessonWindow; 