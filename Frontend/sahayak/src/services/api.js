const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  async makeRequest(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  async makeFormRequest(endpoint, formData) {
    const url = `${this.baseURL}${endpoint}`;
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }
}

export const apiService = new ApiService();

// AI Chat Service
export class AIService extends ApiService {
  async chat(message, userId, sessionId, language = 'en') {
    const formData = new FormData();
    formData.append('query', message);
    formData.append('user_id', userId);
    formData.append('session_id', sessionId);
    formData.append('language', language);
    
    return this.makeFormRequest('/chat', formData);
  }

  async synthesizeSpeech(text) {
    const formData = new FormData();
    formData.append('text', text);
    
    return this.makeFormRequest('/synthesize_speech', formData);
  }
}

// Learning Service
export class LearningService extends ApiService {
  async explainConcept(concept, grade, language = 'en', userId = 'default_user', curriculumType = 'ncert') {
    const formData = new FormData();
    formData.append('concept', concept);
    formData.append('grade', grade);
    formData.append('language', language);
    formData.append('user_id', userId);
    formData.append('curriculum_type', curriculumType);
    
    return this.makeFormRequest('/learning/concept', formData);
  }

  async generateActivities(concept, grade, activityType = 'classroom', count = 3, userId = 'default_user') {
    const formData = new FormData();
    formData.append('concept', concept);
    formData.append('grade', grade);
    formData.append('activity_type', activityType);
    formData.append('count', count);
    formData.append('user_id', userId);
    
    return this.makeFormRequest('/learning/activities', formData);
  }
}

// Lesson Service
export class LessonService extends ApiService {
  async prepareLesson(topic, grade, subject, duration = 45, lessonType = 'comprehensive', userId = 'default_user') {
    const formData = new FormData();
    formData.append('topic', topic);
    formData.append('grade', grade);
    formData.append('subject', subject);
    formData.append('duration', duration);
    formData.append('lesson_type', lessonType);
    formData.append('user_id', userId);
    
    return this.makeFormRequest('/lesson/prepare', formData);
  }

  async generateStudyMaterials(topic, grade, subject, materialType = 'comprehensive', userId = 'default_user') {
    const formData = new FormData();
    formData.append('topic', topic);
    formData.append('grade', grade);
    formData.append('subject', subject);
    formData.append('material_type', materialType);
    formData.append('user_id', userId);
    
    return this.makeFormRequest('/lesson/materials', formData);
  }
}

// Curriculum Service
export class CurriculumService extends ApiService {
  async generateCurriculum(grade, subjects, curriculumType = 'ncert', academicYear = '2024-25', userId = 'default_user') {
    const formData = new FormData();
    formData.append('grade', grade);
    formData.append('subjects', JSON.stringify(subjects));
    formData.append('curriculum_type', curriculumType);
    formData.append('academic_year', academicYear);
    formData.append('user_id', userId);
    
    return this.makeFormRequest('/curriculum/generate', formData);
  }

  async generateMonthlyPlan(grade, subject, month, userId = 'default_user') {
    const formData = new FormData();
    formData.append('grade', grade);
    formData.append('subject', subject);
    formData.append('month', month);
    formData.append('user_id', userId);
    
    return this.makeFormRequest('/curriculum/monthly-plan', formData);
  }
}

// Assessment Service
export class AssessmentService extends ApiService {
  async generateAssessment(topic, grade, questionType = 'mcq', count = 5, difficulty = 'medium', userId = 'default_user') {
    const formData = new FormData();
    formData.append('topic', topic);
    formData.append('grade', grade);
    formData.append('question_type', questionType);
    formData.append('count', count);
    formData.append('difficulty', difficulty);
    formData.append('user_id', userId);
    
    return this.makeFormRequest('/assessment/generate', formData);
  }

  async generateQuiz(topics, grade, quizType = 'mixed', duration = 30, userId = 'default_user') {
    const formData = new FormData();
    formData.append('topics', JSON.stringify(topics));
    formData.append('grade', grade);
    formData.append('quiz_type', quizType);
    formData.append('duration', duration);
    formData.append('user_id', userId);
    
    return this.makeFormRequest('/assessment/quiz', formData);
  }
}

// Image Generation Service
export class ImageService extends ApiService {
  async generateEducationalImage(prompt, style = 'educational', aspectRatio = '9:16', userId = 'default_user') {
    const formData = new FormData();
    formData.append('prompt', prompt);
    formData.append('style', style);
    formData.append('aspect_ratio', aspectRatio);
    formData.append('user_id', userId);
    
    return this.makeFormRequest('/image/generate', formData);
  }

  async generateDiagram(concept, diagramType = 'flowchart', grade, userId = 'default_user') {
    const formData = new FormData();
    formData.append('concept', concept);
    formData.append('diagram_type', diagramType);
    formData.append('grade', grade);
    formData.append('user_id', userId);
    
    return this.makeFormRequest('/image/generate-diagram', formData);
  }
}

// Teacher Service
export class TeacherService extends ApiService {
  async getClassroomTips(topic, grade, classroomSize = 'medium', userId = 'default_user') {
    const formData = new FormData();
    formData.append('topic', topic);
    formData.append('grade', grade);
    formData.append('classroom_size', classroomSize);
    formData.append('user_id', userId);
    
    return this.makeFormRequest('/teacher/classroom-tips', formData);
  }

  async getMultiGradeStrategies(grades, subject, userId = 'default_user') {
    const formData = new FormData();
    formData.append('grades', JSON.stringify(grades));
    formData.append('subject', subject);
    formData.append('user_id', userId);
    
    return this.makeFormRequest('/teacher/multi-grade-strategies', formData);
  }
}

// Utility Service
export class UtilityService extends ApiService {
  async getNCERTResources(grade, subject = null) {
    const params = new URLSearchParams();
    params.append('grade', grade);
    if (subject) {
      params.append('subject', subject);
    }
    
    return this.makeRequest(`/ncert/resources?${params.toString()}`);
  }

  async continueSession(sessionId, userId) {
    const formData = new FormData();
    formData.append('session_id', sessionId);
    formData.append('user_id', userId);
    
    return this.makeFormRequest('/session/continue', formData);
  }

  async healthCheck() {
    return this.makeRequest('/health');
  }
}

// Export all services
export const aiService = new AIService();
export const learningService = new LearningService();
export const lessonService = new LessonService();
export const curriculumService = new CurriculumService();
export const assessmentService = new AssessmentService();
export const imageService = new ImageService();
export const teacherService = new TeacherService();
export const utilityService = new UtilityService();

// Error handling utility
export const handleAPIError = (error, fallbackData) => {
  console.error('API Error:', error);
  
  // Show user-friendly error message
  if (typeof window !== 'undefined' && window.toast) {
    window.toast.error('Unable to connect to AI service. Using offline content.');
  }
  
  // Return fallback data
  return fallbackData;
};

// Session management utility
export const generateSessionId = (prefix = 'session') => {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}; 