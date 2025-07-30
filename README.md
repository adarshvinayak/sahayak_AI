# 🎓 SahayakAI - Multi-Grade Teaching Assistant

**An AI-powered educational platform designed specifically for rural Indian teachers managing multi-grade classrooms**

[![Firebase](https://img.shields.io/badge/Frontend-Firebase-orange)](https://console.firebase.google.com/project/maverics4agenticai)
[![Cloud Run](https://img.shields.io/badge/Backend-Cloud%20Run-blue)](https://agentic-ai-backend-1055718553765.us-central1.run.app)
[![React](https://img.shields.io/badge/Frontend-React-blue)](https://reactjs.org/)
[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-green)](https://fastapi.tiangolo.com/)
[![Google ADK](https://img.shields.io/badge/AI-Google%20ADK-red)](https://developers.google.com/adk)

## 🌟 Overview

SahayakAI is a comprehensive educational technology solution that empowers rural teachers in India to effectively manage multi-grade classrooms using AI-powered tools. The platform provides intelligent curriculum planning, lesson preparation, real-time teaching assistance, and multilingual support.

### 🎯 Mission
To bridge the educational gap in rural India by providing teachers with AI-powered tools that make multi-grade teaching more effective and engaging.

### 🏫 Target Audience
- Rural primary and secondary school teachers
- Multi-grade classroom educators
- Educational administrators
- Government school systems

## 🏗️ System Architecture

### Frontend (React Application)
```
Frontend/sahayak/
├── src/
│   ├── components/
│   │   ├── AI/              # AI Assistant components
│   │   ├── Auth/            # Authentication & user setup
│   │   ├── Curriculum/      # Curriculum planning tools
│   │   ├── Learning/        # Concept explanation tools
│   │   ├── Preparation/     # Lesson planning tools
│   │   └── UI/              # Reusable UI components
│   ├── context/             # React context for state management
│   ├── hooks/               # Custom React hooks
│   ├── services/            # API integration services
│   └── utils/               # Utility functions and constants
├── public/
│   └── assets/
│       └── ncert-books/     # NCERT curriculum PDFs
└── firebase.json           # Firebase hosting configuration
```

### Backend (FastAPI Application)
```
Backend/agentic_ai/
├── root_agent/
│   ├── agent.py             # Main AI agent orchestrator
│   ├── fastapi_endpoint.py  # FastAPI server with all endpoints
│   ├── rag_agent.py         # RAG agents for NCERT/KTS curriculum
│   ├── search_agent.py      # Web search capabilities
│   ├── imagen_agent.py      # AI image generation
│   ├── tts.py               # Text-to-speech functionality
│   └── tools/               # Additional AI tools
├── requirements.txt         # Python dependencies
├── Dockerfile              # Container configuration
└── .dockerignore           # Docker ignore patterns
```

## ✨ Key Features

### 🤖 AI-Powered Teaching Assistant
- **Smart Agent Orchestration**: Utilizes Google's ADK (Agent Development Kit) to route queries to appropriate specialized agents
- **Multi-Agent System**: 
  - Root Agent: Query dispatcher and coordinator
  - RAG Agents: NCERT and KTS curriculum-specific knowledge retrieval
  - Search Agent: Real-time web search capabilities
  - Imagen Agent: Educational diagram and image generation

### 📚 Curriculum & Lesson Planning
- **Intelligent Schedule Generation**: AI analyzes curriculum content to create optimal 5-day lesson plans
- **Multi-Grade Support**: Handles simultaneous teaching across grades 2-12
- **Curriculum Integration**: 
  - NCERT (National Council of Educational Research and Training)
  - KTS (Kendriya Vidyalaya Sangathan)
- **Resource Management**: Direct access to curriculum PDFs and supplementary materials

### 🌐 Multilingual Support
- **14+ Languages**: Hindi, Kannada, Telugu, Tamil, Malayalam, Bengali, Gujarati, Marathi, Punjabi, Odia, Assamese, and more
- **Real-time Translation**: Powered by Google Translate API with fallback translations
- **Language-Aware AI**: AI responses adapt to user's preferred language
- **Batch Translation**: Optimized translation for UI elements and content

### 🎓 Educational Tools

#### Learning Concepts
- **Concept Explanation**: Grade-appropriate explanations using RAG-first approach
- **Interactive Activities**: Generated based on curriculum standards
- **Visual Learning**: AI-generated diagrams and illustrations
- **Assessment Integration**: Built-in understanding checks

#### Lesson Preparation
- **Comprehensive Lesson Plans**: Include objectives, activities, and assessments
- **Material Generation**: Study materials, worksheets, and practice exercises
- **Time Management**: Structured lesson timing and pacing guides
- **Multi-Grade Strategies**: Specific techniques for teaching multiple grades simultaneously

### 🔊 Audio & Voice Features
- **Text-to-Speech**: Google Cloud TTS for audio content generation
- **Voice Input**: Support for audio queries and commands
- **Pronunciation Guides**: Helps with correct pronunciation of complex terms

### 🎨 Visual Content Generation
- **Educational Diagrams**: AI-generated flowcharts, process diagrams, and illustrations
- **Concept Visualization**: Visual representations of abstract concepts
- **Custom Images**: Generate specific educational imagery based on topics

## 🚀 Getting Started

### Prerequisites
- **Node.js** (v16 or later)
- **Python** (v3.11 or later)
- **Google Cloud Account** with enabled APIs:
  - Text-to-Speech API
  - Translate API
  - Vertex AI API
  - Cloud Run API
- **Firebase Project** for authentication and hosting

### 🛠️ Installation & Setup

#### 1. Clone the Repository
```bash
git clone <your-repository-url>
cd SahayakAI
```

#### 2. Backend Setup

```bash
# Navigate to backend directory
cd Backend/agentic_ai

# Install Python dependencies
pip install -r requirements.txt

# Set up Google Cloud credentials
export GOOGLE_APPLICATION_CREDENTIALS="path/to/your/service-account-key.json"

# Navigate to the FastAPI application directory
cd root_agent

# Run the development server
python fastapi_endpoint.py
```

**Backend Environment Variables:**
```bash
GOOGLE_APPLICATION_CREDENTIALS=path/to/service-account.json
PROJECT_ID=your-google-cloud-project-id
```

#### 3. Frontend Setup

```bash
# Navigate to frontend directory
cd Frontend/sahayak

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
```

**Frontend Environment Variables (`.env.local`):**
```bash
REACT_APP_API_URL=http://localhost:8000
REACT_APP_FIREBASE_API_KEY=your-firebase-api-key
REACT_APP_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your-project-id
REACT_APP_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
REACT_APP_FIREBASE_APP_ID=your-app-id
```

```bash
# Start the development server
npm start
```

### 🌐 Running the Application

1. **Backend**: Visit `http://localhost:8000` for API documentation
2. **Frontend**: Visit `http://localhost:3000` for the React application
3. **API Health Check**: `http://localhost:8000/health`

## 📦 Deployment

### 🏃‍♀️ Backend Deployment (Google Cloud Run)

```bash
# Build and deploy to Cloud Run
cd Backend/agentic_ai

# Build Docker image
docker build -t gcr.io/YOUR_PROJECT_ID/sahayak-backend .

# Push to Google Container Registry
docker push gcr.io/YOUR_PROJECT_ID/sahayak-backend

# Deploy to Cloud Run
gcloud run deploy sahayak-backend \
  --image gcr.io/YOUR_PROJECT_ID/sahayak-backend \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --port 8080 \
  --memory 2Gi \
  --cpu 1 \
  --timeout 900
```

### 🔥 Frontend Deployment (Firebase Hosting)

```bash
# Build the React application
cd Frontend/sahayak
npm run build

# Deploy to Firebase
npm install -g firebase-tools
firebase login
firebase deploy --only hosting
```

### 🌍 Live Deployment URLs
- **Frontend**: [Firebase Hosting](https://console.firebase.google.com/project/maverics4agenticai)
- **Backend**: [Cloud Run Service](https://agentic-ai-backend-1055718553765.us-central1.run.app)

## 📡 API Documentation

### Core Endpoints

#### 🤖 AI Chat & Assistant
```http
POST /chat
Content-Type: multipart/form-data

Fields:
- query: string (optional) - Text query
- user_id: string - User identifier
- session_id: string (optional) - Session identifier
- language: string - Response language (default: "en")
- audio_file: file (optional) - Audio input
- image_file: file (optional) - Image input
```

#### 📚 Learning & Education
```http
POST /learning/concept
POST /learning/activities
POST /lesson/prepare
POST /lesson/materials
POST /curriculum/generate
POST /assessment/generate
```

#### 🎨 Content Generation
```http
POST /image/generate
POST /image/generate-diagram
POST /synthesize_speech
```

#### 🌐 Translation Services
```http
POST /api/translate-text
POST /api/translate-batch
GET /api/translations/{language_code}
```

#### 📖 Curriculum Resources
```http
GET /api/corpus/books/{curriculum}/{grade}
POST /api/schedule/generate
GET /ncert/resources
```

### Response Formats
All API responses follow a consistent JSON format:
```json
{
  "response": "AI-generated content",
  "session_id": "unique-session-id",
  "user_id": "user-identifier",
  "additional_data": {}
}
```

## 🎨 User Interface

### Key Components

#### 🏠 Dashboard
- Multi-grade classroom overview
- Quick access to all teaching tools
- User profile and preferences
- Recent activities and notifications

#### 📖 Learning Concepts Window
- Search and explain educational concepts
- Grade-appropriate explanations
- Interactive activities and examples
- Visual aids and diagrams

#### 📝 Lesson Preparation Window
- Comprehensive lesson planning
- Resource generation and management
- Assessment creation tools
- Multi-grade teaching strategies

#### 📅 Curriculum Builder
- AI-powered schedule generation
- Monthly and weekly planning
- Resource allocation and tracking
- Curriculum standards alignment

#### 🤖 AI Assistant (Floating)
- Context-aware chat interface
- Voice input and audio output
- Multi-language conversation
- Educational content generation

## 🧠 AI Technology Stack

### Google Agent Development Kit (ADK)
- **Agent Orchestration**: Smart routing of user queries
- **Session Management**: Persistent conversation contexts
- **Tool Integration**: Seamless integration of specialized agents

### Retrieval Augmented Generation (RAG)
- **Vector Database**: Embedded curriculum content for intelligent retrieval
- **Knowledge Bases**: NCERT and KTS curriculum corpuses
- **Contextual Responses**: Curriculum-aware answers and explanations

### Large Language Models
- **Primary Model**: Gemini 2.5 Flash for fast, intelligent responses
- **Specialized Processing**: Domain-specific educational content generation
- **Multi-language Support**: Native understanding of Indian languages

## 🔐 Security & Privacy

### Data Protection
- **Firebase Authentication**: Secure user management
- **Session Encryption**: Protected conversation data
- **GDPR Compliance**: Privacy-first data handling
- **Local Storage**: Minimal data persistence

### API Security
- **CORS Configuration**: Controlled cross-origin requests
- **Rate Limiting**: Protection against abuse
- **Input Validation**: Secure data processing
- **Error Handling**: Safe error responses

## 🤝 Contributing

### Development Workflow
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Test thoroughly
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

### Code Standards
- **Frontend**: ESLint + Prettier for React/JavaScript
- **Backend**: Black + isort for Python formatting
- **Documentation**: Comprehensive docstrings and comments
- **Testing**: Unit tests for critical functionality

## 📊 Performance & Scalability

### Frontend Optimization
- **Code Splitting**: Lazy loading of components
- **Image Optimization**: Compressed assets and responsive images
- **Caching Strategy**: Browser and CDN caching
- **Bundle Analysis**: Optimized JavaScript bundles

### Backend Performance
- **Async Operations**: Non-blocking I/O for all endpoints
- **Caching**: Redis for session and content caching
- **Database Optimization**: Efficient vector database queries
- **Auto-scaling**: Google Cloud Run automatic scaling

## 🐛 Troubleshooting

### Common Issues

#### Backend Connection Issues
```bash
# Check if backend is running
curl http://localhost:8000/health

# Verify Google Cloud credentials
echo $GOOGLE_APPLICATION_CREDENTIALS

# Check logs
docker logs <container-id>
```

#### Frontend Build Errors
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install

# Check environment variables
cat .env.local
```

#### Authentication Problems
- Verify Firebase configuration
- Check API keys and project IDs
- Ensure proper CORS settings

## 📈 Roadmap

### Upcoming Features
- **Offline Mode**: Basic functionality without internet
- **Mobile App**: React Native application
- **Advanced Analytics**: Teacher performance insights
- **Collaborative Tools**: Teacher community features
- **Parent Portal**: Student progress sharing

### Technical Improvements
- **Performance Optimization**: Faster AI response times
- **Enhanced RAG**: Improved curriculum understanding
- **Voice Recognition**: Better audio input processing
- **Accessibility**: Screen reader and keyboard navigation support

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Google Cloud**: AI and infrastructure services
- **Firebase**: Authentication and hosting platform
- **NCERT**: Educational curriculum content
- **React Community**: Frontend framework and ecosystem
- **FastAPI Community**: Backend framework and tools

## 📞 Support

### Getting Help
- **Documentation**: Check this README and inline code comments
- **Issues**: Report bugs and feature requests on GitHub
- **Community**: Join our teacher community forums

### Contact Information
- **Project Lead**: [Your Name]
- **Email**: [contact@sahayakai.edu]
- **Website**: [https://sahayakai.edu]

---

**Built with ❤️ for Indian educators**

*Empowering rural teachers through intelligent technology*
