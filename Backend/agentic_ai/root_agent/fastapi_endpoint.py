import io
import base64
import json
import uuid
from typing import Tuple, Optional, List
from fastapi.middleware.cors import CORSMiddleware
import os
import asyncio
import warnings
from typing import Optional
from PIL import Image
from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Query
from fastapi.responses import JSONResponse, StreamingResponse
from pydantic import BaseModel

# Suppress all warnings
warnings.filterwarnings("ignore")

# Import necessary ADK components
# Make sure 'agent.py' containing 'root_agent' is in the same directory
from google.adk.sessions import InMemorySessionService
from google.adk.runners import Runner
from google.genai import types # For creating message Content/Parts

# Assuming 'tts.py' contains the synthesize_text function
from tts import synthesize_text
from agent import root_agent

# Translation support (fallback if googletrans is not available)
try:
    from deep_translator import GoogleTranslator
    TRANSLATION_AVAILABLE = True
    print("Deep Translator loaded successfully")
except ImportError:
    print("Warning: deep-translator not available. Using fallback translation.")
    TRANSLATION_AVAILABLE = False
    GoogleTranslator = None

app = FastAPI(
    title="ADK Agent FastAPI",
    description="A FastAPI application for interacting with an ADK Agent, supporting text, audio, and image inputs.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods (GET, POST, PUT, DELETE, etc.)
    allow_headers=["*"],  # Allows all headers
)

# Translation fallback function
def translate_text(text, target_language):
    """Fallback translation function when googletrans is not available"""
    if not TRANSLATION_AVAILABLE or target_language == 'en':
        return text
    
    # Simple fallback translations for common UI elements
    fallback_translations = {
        'hi': {
            'dashboard': 'डैशबोर्ड',
            'learning_concepts': 'अवधारणाएं सीखें',
            'prepare_lessons': 'पाठ तैयार करें',
            'create_curriculum': 'पाठ्यक्रम बनाएं',
            'ai_assistant': 'एआई सहायक',
            'welcome': 'स्वागत है',
            'loading': 'लोड हो रहा है...',
            'save': 'सहेजें',
            'cancel': 'रद्द करें',
            'submit': 'सबमिट करें',
            'close': 'बंद करें',
            'next': 'अगला',
            'previous': 'पिछला',
            'search': 'खोजें',
            'filter': 'फ़िल्टर',
            'quick_actions': 'त्वरित कार्य',
            'recent_activities': 'हाल की गतिविधियां',
            'teaching_stats': 'शिक्षण आंकड़े',
            'grade_level': 'कक्षा स्तर',
            'curriculum_type': 'पाठ्यक्रम प्रकार',
            'explain_concept': 'अवधारणा समझाएं',
            'select_topic': 'विषय चुनें',
            'grade_optional': 'कक्षा (वैकल्पिक)',
            'not_selected': 'चयनित नहीं',
            'send_message': 'संदेश भेजें',
            'generate_materials': 'सामग्री उत्पन्न करें',
            'study_material': 'अध्ययन सामग्री',
            'assessment_questions': 'मूल्यांकन प्रश्न',
            'generated_diagram': 'उत्पन्न आरेख',
            'select_subject': 'विषय चुनें',
            'select_grade': 'कक्षा चुनें',
            'teaching_assistant': 'शिक्षण सहायक',
            'ask_question': 'प्रश्न पूछें...',
            'mentor_guidance': 'मार्गदर्शन',
            'welcome_message': 'सहायक में आपका स्वागत है, आपका एआई शिक्षण सहायक!',
            'how_can_i_help': 'मैं आपकी शिक्षण में कैसे मदद कर सकता हूं?',
            'processing': 'आपका अनुरोध संसाधित हो रहा है...',
            'error_message': 'एक त्रुटि हुई। कृपया पुनः प्रयास करें।',
            'profile': 'प्रोफ़ाइल',
            'settings': 'सेटिंग्स',
            'logout': 'लॉगआउट',
            'teaching_grades': 'शिक्षण कक्षाएं',
            'school_name': 'स्कूल का नाम',
            'district': 'जिला',
            'state': 'राज्य'
        },
        'kn': {
            'dashboard': 'ಡ್ಯಾಶ್‌ಬೋರ್ಡ್',
            'learning_concepts': 'ಕಲಿಕೆಯ ಪರಿಕಲ್ಪನೆಗಳು',
            'prepare_lessons': 'ಪಾಠಗಳನ್ನು ತಯಾರಿಸಿ',
            'create_curriculum': 'ಪಾಠ್ಯಕ್ರಮ ರಚಿಸಿ',
            'ai_assistant': 'ಎಐ ಸಹಾಯಕ',
            'welcome': 'ಸುಸ್ವಾಗತ',
            'loading': 'ಲೋಡ್ ಆಗುತ್ತಿದೆ...',
            'save': 'ಉಳಿಸಿ',
            'cancel': 'ರದ್ದುಮಾಡಿ',
            'submit': 'ಸಲ್ಲಿಸಿ',
            'close': 'ಮುಚ್ಚಿ',
            'next': 'ಮುಂದೆ',
            'previous': 'ಹಿಂದೆ',
            'search': 'ಹುಡುಕಿ',
            'filter': 'ಫಿಲ್ಟರ್',
            'quick_actions': 'ತ್ವರಿತ ಕ್ರಿಯೆಗಳು',
            'recent_activities': 'ಇತ್ತೀಚಿನ ಚಟುವಟಿಕೆಗಳು',
            'teaching_stats': 'ಅಧ್ಯಾಪನ ಅಂಕಿಅಂಶಗಳು',
            'grade_level': 'ತರಗತಿ ಮಟ್ಟ',
            'curriculum_type': 'ಪಾಠ್ಯಕ್ರಮ ಪ್ರಕಾರ',
            'explain_concept': 'ಪರಿಕಲ್ಪನೆಯನ್ನು ವಿವರಿಸಿ',
            'select_topic': 'ವಿಷಯವನ್ನು ಆಯ್ಕೆಮಾಡಿ',
            'grade_optional': 'ತರಗತಿ (ಐಚ್ಛಿಕ)',
            'not_selected': 'ಆಯ್ಕೆಮಾಡಲಾಗಿಲ್ಲ',
            'send_message': 'ಸಂದೇಶ ಕಳುಹಿಸಿ',
            'generate_materials': 'ಸಾಮಗ್ರಿಗಳನ್ನು ರಚಿಸಿ',
            'study_material': 'ಅಧ್ಯಯನ ಸಾಮಗ್ರಿ',
            'assessment_questions': 'ಮೌಲ್ಯಮಾಪನ ಪ್ರಶ್ನೆಗಳು',
            'generated_diagram': 'ರಚಿಸಲಾದ ರೇಖಾಚಿತ್ರ',
            'select_subject': 'ವಿಷಯವನ್ನು ಆಯ್ಕೆಮಾಡಿ',
            'select_grade': 'ತರಗತಿಯನ್ನು ಆಯ್ಕೆಮಾಡಿ',
            'teaching_assistant': 'ಅಧ್ಯಾಪನ ಸಹಾಯಕ',
            'ask_question': 'ಪ್ರಶ್ನೆಯನ್ನು ಕೇಳಿ...',
            'mentor_guidance': 'ಮಾರ್ಗದರ್ಶನ',
            'welcome_message': 'ಸಹಾಯಕಕ್ಕೆ ಸುಸ್ವಾಗತ, ನಿಮ್ಮ ಎಐ ಅಧ್ಯಾಪನ ಸಹಾಯಕ!',
            'how_can_i_help': 'ನಿಮ್ಮ ಅಧ್ಯಾಪನದಲ್ಲಿ ನಾನು ಹೇಗೆ ಸಹಾಯ ಮಾಡಬಹುದು?',
            'processing': 'ನಿಮ್ಮ ವಿನಂತಿಯನ್ನು ಸಂಸ್ಕರಿಸಲಾಗುತ್ತಿದೆ...',
            'error_message': 'ದೋಷ ಸಂಭವಿಸಿದೆ. ದಯವಿಟ್ಟು ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.',
            'profile': 'ಪ್ರೊಫೈಲ್',
            'settings': 'ಸೆಟ್ಟಿಂಗ್‌ಗಳು',
            'logout': 'ಲಾಗ್‌ಔಟ್',
            'teaching_grades': 'ಅಧ್ಯಾಪನ ತರಗತಿಗಳು',
            'school_name': 'ಶಾಲೆಯ ಹೆಸರು',
            'district': 'ಜಿಲ್ಲೆ',
            'state': 'ರಾಜ್ಯ'
        }
    }
    
    # Return fallback translation if available, otherwise return original text
    if target_language in fallback_translations:
        return fallback_translations[target_language].get(text, text)
    return text

# In-memory storage for session management (for demonstration purposes)
# In a production environment, consider a persistent store like Redis or a database
class SessionManager:
    def __init__(self):
        self.sessions = {} # user_id -> {session_id: runner}
        self.session_service = InMemorySessionService()

    async def get_or_create_runner(self, user_id: str, session_id: str) -> Runner:
        if user_id not in self.sessions:
            self.sessions[user_id] = {}

        if session_id not in self.sessions[user_id]:
            app_name = "fastapi_adk_chatbot"
            
            await self.session_service.create_session(
                app_name=app_name,
                user_id=user_id,
                session_id=session_id
            )
            
            runner = Runner(
                agent=root_agent,
                app_name=app_name,
                session_service=self.session_service
            )
            self.sessions[user_id][session_id] = runner
            print(f"Created new session and runner for user: {user_id}, session: {session_id}")
        return self.sessions[user_id][session_id]

session_manager = SessionManager()

async def get_agent_response_async(runner: Runner, user_id: str, session_id: str, query: str, audio_bytes: Optional[bytes] = None, image_bytes: Optional[bytes] = None):
    """
    Sends a query to the ADK agent and retrieves its final response.
    """
    if audio_bytes:
        audio_content = types.Blob(
            mime_type='audio/wav',
            data=audio_bytes,
        )
        content = types.Content(role='user', parts=[types.Part(inline_data=audio_content)])
    elif image_bytes:
        print(type(image_bytes))
        image_content = types.Blob(
            mime_type='image/png',
            data=image_bytes
        )
        content = types.Content(role='user', parts=[types.Part(text=query), types.Part(inline_data=image_content)])
    else:
        content = types.Content(role='user', parts=[types.Part(text=query)])

    final_response_text = "Agent did not produce a final response."

    async for event in runner.run_async(user_id=user_id, session_id=session_id, new_message=content):
        print(f"ADK Event: {event}")
        if event.is_final_response():
            if event.content and event.content.parts:
                final_response_text = event.content.parts[0].text
                break
            elif event.actions and event.actions.escalate:
                final_response_text = f"Agent escalated: {event.error_message or 'No specific message.'}"
            break

    # Check for generated images in artifacts
    generated_image_bytes = None
    try:
        artifact_list = runner.list_artifacts()
        print("Artifacts in context:", artifact_list)
        
        # Look for generated images in artifacts
        for artifact in artifact_list:
            if artifact.filename and "generated_image" in artifact.filename:
                generated_image_bytes = artifact.data
                break
    except Exception as e:
        print(f"Error checking artifacts: {e}")

    print("type of generated image_bytes: ", type(generated_image_bytes))
    if generated_image_bytes:
        encoded_bytes = base64.b64encode(generated_image_bytes).decode('utf-8')
    else:
        encoded_bytes = None
    print("type of encoded image_bytes: ", type(encoded_bytes))
    print("type of text is: ", type(final_response_text))
    # return final_response_text, encoded_bytes
    return {
        "text": final_response_text,
        "bytes_base64": encoded_bytes
    }

# --- FastAPI Endpoints ---

class ChatRequest(BaseModel):
    query: Optional[str] = None
    user_id: str = "default_user"
    session_id: Optional[str] = None

class ChatResponse(BaseModel):
    response: str
    session_id: str

@app.post("/api/translate-text")
async def translate_text_endpoint(request: dict):
    """Translate a single text to target language"""
    text = request.get('text', '')
    target_language = request.get('target_language', 'en')
    source_language = request.get('source_language', 'en')
    
    if not text or target_language == source_language:
        return {"translated_text": text}
    
    try:
        if TRANSLATION_AVAILABLE:
            translated = GoogleTranslator(source=source_language, target=target_language).translate(text)
            return {"translated_text": translated}
        else:
            # Use fallback translation
            return {"translated_text": translate_text(text, target_language)}
    except Exception as e:
        print(f"Translation error: {e}")
        return {"translated_text": text}

@app.post("/api/translate-batch")
async def translate_batch_endpoint(request: dict):
    """Translate multiple texts in a single request for better performance"""
    texts = request.get('texts', [])
    target_language = request.get('target_language', 'en')
    source_language = request.get('source_language', 'en')
    
    if not texts or target_language == source_language:
        return {"translated_texts": texts}
    
    translated_texts = []
    
    try:
        if TRANSLATION_AVAILABLE:
            # Deep translator processes each text individually
            translator_instance = GoogleTranslator(source=source_language, target=target_language)
            translated_texts = [translator_instance.translate(text) for text in texts]
        else:
            # Use fallback translation for each text
            translated_texts = [translate_text(text, target_language) for text in texts]
            
    except Exception as e:
        print(f"Batch translation error: {e}")
        translated_texts = texts  # Fallback to original texts
    
    return {"translated_texts": translated_texts}

@app.get("/api/translations/{language_code}")
async def get_translations(language_code: str):
    """Get translations for UI elements in the specified language"""
    
    # Base English translations (UI keys)
    english_translations = {
        # Navigation
        "dashboard": "Dashboard",
        "learning_concepts": "Learning Concepts",
        "prepare_lessons": "Prepare Lessons",
        "create_curriculum": "Create Curriculum",
        "ai_assistant": "AI Assistant",
        
        # Common UI
        "welcome": "Welcome",
        "loading": "Loading...",
        "save": "Save",
        "cancel": "Cancel",
        "submit": "Submit",
        "close": "Close",
        "next": "Next",
        "previous": "Previous",
        "search": "Search",
        "filter": "Filter",
        
        # Dashboard
        "quick_actions": "Quick Actions",
        "recent_activities": "Recent Activities",
        "teaching_stats": "Teaching Statistics",
        "grade_level": "Grade Level",
        "curriculum_type": "Curriculum Type",
        
        # Learning Concepts
        "explain_concept": "Explain Concept",
        "select_topic": "Select Topic",
        "grade_optional": "Grade (Optional)",
        "not_selected": "Not Selected",
        "send_message": "Send Message",
        
        # Prepare Lessons
        "generate_materials": "Generate Materials",
        "study_material": "Study Material",
        "assessment_questions": "Assessment Questions",
        "generated_diagram": "Generated Diagram",
        "select_subject": "Select Subject",
        "select_grade": "Select Grade",
        
        # AI Assistant
        "teaching_assistant": "Teaching Assistant",
        "ask_question": "Ask a question...",
        "mentor_guidance": "Mentor Guidance",
        
        # Messages
        "welcome_message": "Welcome to Sahayak, your AI teaching assistant!",
        "how_can_i_help": "How can I help you with your teaching today?",
        "processing": "Processing your request...",
        "error_message": "An error occurred. Please try again.",
        
        # User Profile
        "profile": "Profile",
        "settings": "Settings",
        "logout": "Logout",
        "teaching_grades": "Teaching Grades",
        "school_name": "School Name",
        "district": "District",
        "state": "State"
    }
    
    if language_code == 'en':
        return {"translations": english_translations}
    
    try:
        # Translate all keys to the target language
        translated_texts = {}
        for key, english_text in english_translations.items():
            try:
                if TRANSLATION_AVAILABLE:
                    translation = GoogleTranslator(source='en', target=language_code).translate(english_text)
                    translated_texts[key] = translation
                else:
                    # Use fallback translation
                    translated_texts[key] = translate_text(key, language_code)
            except Exception as e:
                print(f"Translation error for {key}: {e}")
                translated_texts[key] = english_text  # Fallback to English
        
        return {"translations": translated_texts}
        
    except Exception as e:
        print(f"Translation service error: {e}")
        return {"translations": english_translations}  # Fallback to English

@app.post("/chat", response_model=ChatResponse)
async def chat_with_agent(
    query: Optional[str] = Form(None),
    user_id: str = Form("default_user"),
    session_id: Optional[str] = Form(None),
    language: str = Form("en"),  # Add language parameter
    audio_file: Optional[UploadFile] = File(None),
    image_file: Optional[UploadFile] = File(None)
):
    """
    Endpoint for chatting with the ADK Agent using text, audio, or image input.
    """
    if not query and not audio_file and not image_file:
        raise HTTPException(status_code=400, detail="Either 'query', 'audio_file', or 'image_file' must be provided.")

    if session_id is None:
        session_id = str(uuid.uuid4())
    
    runner = await session_manager.get_or_create_runner(user_id, session_id)

    audio_bytes = None
    if audio_file:
        audio_bytes = await audio_file.read()

    image_bytes = None
    if image_file:
        # FastAPI handles file uploads in memory or as temporary files.
        # We need to read the bytes and potentially convert to PNG if not already.
        try:
            image_data = await image_file.read()
            # Attempt to open as PIL Image to ensure it's a valid image and convert to PNG
            img = Image.open(io.BytesIO(image_data))
            png_buffer = io.BytesIO()
            img.save(png_buffer, format='PNG')
            image_bytes = png_buffer.getvalue()
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Invalid image file: {e}")

    # Create enhanced prompt with system instructions for friendly mentor behavior
    enhanced_query = query or ""
    if enhanced_query:
        # Get language information for better AI understanding
        supported_languages = {
            'en': 'English', 'hi': 'Hindi', 'kn': 'Kannada', 'te': 'Telugu', 
            'ta': 'Tamil', 'ml': 'Malayalam', 'bn': 'Bengali', 'gu': 'Gujarati',
            'mr': 'Marathi', 'pa': 'Punjabi', 'or': 'Odia', 'as': 'Assamese',
            'fr': 'French', 'de': 'German', 'es': 'Spanish', 'pt': 'Portuguese',
            'ja': 'Japanese', 'ko': 'Korean', 'ar': 'Arabic', 'ru': 'Russian', 'zh': 'Chinese'
        }
        language_name = supported_languages.get(language, 'English')
        
        system_prompt = f"""You are Sahayak, an expert educational AI assistant and friendly mentor for teachers. 

CRITICAL INSTRUCTION: You MUST respond in {language_name} language only. If the language is not English, ensure your entire response is in {language_name}.

Your role is to:

🎓 **Be a Subject Expert**: Provide accurate, comprehensive knowledge across all subjects (Mathematics, Science, English, Social Studies, etc.)

🤝 **Be a Friendly Mentor**: Always respond in a warm, encouraging, and supportive manner. Use appropriate honorific phrases in {language_name} for addressing teachers respectfully.

💡 **Provide Practical Guidance**: Offer actionable teaching tips, classroom strategies, and real-world examples

📚 **Curriculum-Aware**: Consider the teacher's curriculum (NCERT/KTS) and grade level when providing advice

🎯 **Address Educational Needs**: Help with:
- Lesson planning and curriculum development
- Classroom management and student engagement
- Assessment strategies and evaluation methods
- Subject-specific teaching methodologies
- Student motivation and learning difficulties
- Professional development and teaching resources
- Multi-grade classroom strategies
- Technology integration in education

🌟 **Always Be**: 
- Polite, respectful, and encouraging
- Solution-oriented and practical
- Age-appropriate in your suggestions
- Culturally sensitive and inclusive
- Patient and understanding of teaching challenges

LANGUAGE REQUIREMENT: Your entire response must be in {language_name}. Do not mix languages or provide English translations unless specifically requested.

Now, please respond to the teacher's query in {language_name}: {enhanced_query}"""
        
        result = await get_agent_response_async(
            runner,
            user_id,
            session_id,
            system_prompt,
            audio_bytes,
            image_bytes
        )
        response_text = result["text"]
        
        # Additional translation if the AI didn't respond in the target language
        if language != 'en' and TRANSLATION_AVAILABLE:
            try:
                # Check if response needs translation (basic detection)
                if any(char in response_text for char in 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ') and language in ['hi', 'kn', 'te', 'ta', 'ml', 'bn', 'gu', 'mr', 'pa', 'or', 'as']:
                    # Looks like English text but should be in local language
                    translation = GoogleTranslator(source='en', target=language).translate(response_text)
                    response_text = translation
            except Exception as e:
                print(f"Post-processing translation error: {e}")
    else:
        # For audio/image inputs without text query
        result = await get_agent_response_async(
        runner,
        user_id,
        session_id,
            enhanced_query,
        audio_bytes,
        image_bytes
    )
        response_text = result["text"]
    
    return ChatResponse(response=response_text, session_id=session_id, user_id=user_id)

# --- New Educational Endpoints ---

@app.post("/learning/concept")
async def explain_concept(
    concept: str = Form(...),
    grade: int = Form(...),
    language: str = Form("en"),
    user_id: str = Form("default_user"),
    session_id: Optional[str] = Form(None),
    curriculum_type: str = Form("ncert")  # Add curriculum type parameter
):
    """
    Explain educational concept with RAG-first approach: check curriculum DB first, then fallback to Google search
    """
    if session_id is None:
        session_id = f"learning_{concept}_{grade}_{uuid.uuid4()}"
    
    try:
        print(f"Learning concept request: concept={concept}, grade={grade}, language={language}, curriculum_type={curriculum_type}")
        
        runner = await session_manager.get_or_create_runner(user_id, session_id)
        print(f"Got runner for session: {session_id}")
        
        # First, try to find the concept in the curriculum database
        rag_prompt = f"""First, search the {curriculum_type.upper()} curriculum database for Grade {grade} to find information about "{concept}".

IMPORTANT: Please respond in {language} language only.

If you find relevant information in the curriculum:
- Provide a comprehensive summary of what's found
- Include key points, definitions, and examples from the curriculum
- Format it appropriately for Grade {grade} students
- Include page references or chapter information if available
- Respond in {language} language

If NO information is found in the curriculum:
- Respond with "CURRICULUM_NOT_FOUND"
- Then proceed to search the web for general information about this concept

Search the curriculum database now."""
        
        print(f"Sending RAG prompt to agent...")
        # Get RAG response
        rag_result = await get_agent_response_async(runner, user_id, session_id, rag_prompt)
        print(f"RAG result received: {rag_result}")
        
        # Check if curriculum data was found
        if "CURRICULUM_NOT_FOUND" in rag_result["text"]:
            # Fallback to Google search with grade-specific tailoring
            search_prompt = f"""Since "{concept}" was not found in the {curriculum_type.upper()} curriculum for Grade {grade}, 
search the web for information about this concept and provide a grade-appropriate explanation.

IMPORTANT: Please respond in {language} language only.

Requirements:
1. Search for general information about "{concept}"
2. Tailor the explanation specifically for Grade {grade} students
3. Use simple, age-appropriate language
4. Include real-world examples relevant to {grade}-year-old students
5. Provide teaching tips for classroom delivery
6. Start your response with: "📚 **Curriculum Note**: The requested topic '{concept}' was not found in Grade {grade} {curriculum_type.upper()} curriculum. Below is a custom explanation tailored for your grade level."
7. Respond entirely in {language} language

Make the explanation engaging and suitable for classroom teaching."""
            
            search_result = await get_agent_response_async(runner, user_id, session_id, search_prompt)
            
            return {
                "response": search_result["text"],
                "session_id": session_id,
                "concept": concept,
                "grade": grade,
                "language": language,
                "curriculum_type": curriculum_type,
                "source": "web_search",
                "curriculum_found": False
            }
        else:
            # Curriculum data was found
            return {
                "response": rag_result["text"],
                "session_id": session_id,
                "concept": concept,
                "grade": grade,
                "language": language,
                "curriculum_type": curriculum_type,
                "source": "curriculum_db",
                "curriculum_found": True
            }
        
    except Exception as e:
        print(f"Error in explain_concept: {e}")
        import traceback
        traceback.print_exc()
        
        # Provide a simple fallback response instead of raising an exception
        fallback_response = f"""I can help explain "{concept}" for Grade {grade} students!

**What is {concept}?**
{concept} is an important concept in science education. Let me break it down for you:

**Key Points:**
- This is a fundamental topic that Grade {grade} students should understand
- It connects to other concepts in their curriculum
- Students learn best when they can see real-world examples

**Teaching Tips:**
- Start with simple examples students can relate to
- Use hands-on activities when possible
- Connect to their daily experiences
- Check for understanding with questions

**Next Steps:**
You can find more specific information about {concept} in your Grade {grade} {curriculum_type.upper()} textbooks, or I can help you plan specific activities for teaching this concept.

*Note: This is a general explanation. For curriculum-specific content, please check your textbook or try again.*"""

        return {
            "response": fallback_response,
            "session_id": session_id,
            "concept": concept,
            "grade": grade,
            "language": language,
            "curriculum_type": curriculum_type,
            "source": "fallback",
            "curriculum_found": False,
            "error": str(e)
        }

@app.post("/learning/activities")
async def generate_activities(
    concept: str = Form(...),
    grade: int = Form(...),
    activity_type: str = Form("classroom"),  # classroom, homework, assessment
    count: int = Form(3),
    user_id: str = Form("default_user")
):
    """
    Generate educational activities for a concept
    """
    session_id = f"activities_{concept}_{grade}_{uuid.uuid4()}"
    
    prompt = f"""Generate {count} {activity_type} activities for teaching {concept} to Grade {grade} students.
                Include materials needed, step-by-step instructions, and learning objectives."""
    
    runner = await session_manager.get_or_create_runner(user_id, session_id)
    response_data = await get_agent_response_async(runner, user_id, session_id, prompt)
    
    return {"response": response_data["text"], "session_id": session_id}

@app.post("/lesson/prepare")
async def prepare_lesson(
    topic: str = Form(...),
    grade: int = Form(...),
    subject: str = Form(...),
    duration: int = Form(45),
    lesson_type: str = Form("comprehensive"),  # comprehensive, basic, advanced
    user_id: str = Form("default_user"),
    session_id: Optional[str] = Form(None)
):
    """
    Generate comprehensive lesson plan and study materials
    """
    if session_id is None:
        session_id = f"lesson_{topic}_{grade}_{uuid.uuid4()}"
    
    prompt = f"""Create a comprehensive {duration}-minute lesson plan for teaching {topic} in {subject} for Grade {grade} students.
                Include:
                - Learning objectives
                - Introduction (5-10 min)
                - Main content with activities (20-30 min)
                - Assessment methods
                - Homework suggestions
                - Teaching tips and strategies
                Format for easy implementation in classroom."""
    
    runner = await session_manager.get_or_create_runner(user_id, session_id)
    response_data = await get_agent_response_async(runner, user_id, session_id, prompt)
    
    return {"response": response_data["text"], "session_id": session_id}

@app.post("/lesson/materials")
async def generate_study_materials(
    topic: str = Form(...),
    grade: int = Form(...),
    subject: str = Form(...),
    material_type: str = Form("comprehensive"),  # comprehensive, summary, detailed
    user_id: str = Form("default_user")
):
    """
    Generate study materials for a specific topic
    """
    session_id = f"materials_{topic}_{grade}_{uuid.uuid4()}"
    
    prompt = f"""Generate {material_type} study material for {topic} in {subject} for Grade {grade}.
                Include:
                - Key concepts and definitions
                - Examples and illustrations
                - Important points to remember
                - NCERT textbook references
                - Additional resources"""
    
    runner = await session_manager.get_or_create_runner(user_id, session_id)
    response_data = await get_agent_response_async(runner, user_id, session_id, prompt)
    
    return {"response": response_data["text"], "session_id": session_id}

@app.post("/curriculum/generate")
async def generate_curriculum(
    grade: int = Form(...),
    subjects: str = Form(...),  # JSON string of subjects
    curriculum_type: str = Form("ncert"),  # ncert, custom, hybrid
    academic_year: str = Form("2024-25"),
    user_id: str = Form("default_user"),
    session_id: Optional[str] = Form(None)
):
    """
    Generate comprehensive curriculum based on grade and subjects
    """
    if session_id is None:
        session_id = f"curriculum_{grade}_{uuid.uuid4()}"
    
    try:
        subjects_list = json.loads(subjects)
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="Invalid JSON format for subjects")
    
    prompt = f"""Generate a comprehensive year-long curriculum for Grade {grade} covering {', '.join(subjects_list)} for academic year {academic_year}.
                Based on {curriculum_type.upper()} guidelines.
                Include:
                - Monthly planning for each subject
                - Chapter breakdown with learning objectives
                - Assessment schedule
                - Resource requirements
                - Integration opportunities between subjects
                Format as structured curriculum plan."""
    
    runner = await session_manager.get_or_create_runner(user_id, session_id)
    response_data = await get_agent_response_async(runner, user_id, session_id, prompt)
    
    return {"response": response_data["text"], "session_id": session_id}

@app.post("/curriculum/monthly-plan")
async def generate_monthly_plan(
    grade: int = Form(...),
    subject: str = Form(...),
    month: str = Form(...),
    user_id: str = Form("default_user")
):
    """
    Generate detailed monthly plan for a specific subject
    """
    session_id = f"monthly_{subject}_{grade}_{uuid.uuid4()}"
    
    prompt = f"""Create a detailed monthly plan for {subject} in Grade {grade} for {month}.
                Include weekly breakdown, learning objectives, activities, and assessments."""
    
    runner = await session_manager.get_or_create_runner(user_id, session_id)
    response_data = await get_agent_response_async(runner, user_id, session_id, prompt)
    
    return {"response": response_data["text"], "session_id": session_id}

@app.post("/assessment/generate")
async def generate_assessment(
    topic: str = Form(...),
    grade: int = Form(...),
    question_type: str = Form("mcq"),  # mcq, short_answer, long_answer, true_false
    count: int = Form(5),
    difficulty: str = Form("medium"),  # easy, medium, hard
    user_id: str = Form("default_user")
):
    """
    Generate assessment questions for a topic
    """
    session_id = f"assessment_{topic}_{grade}_{uuid.uuid4()}"
    
    prompt = f"""Generate {count} {question_type.upper()} questions for {topic} suitable for Grade {grade} students.
                Difficulty level: {difficulty}
                Include:
                - Questions with clear instructions
                - Correct answers
                - Explanation for correct answers
                - Learning objectives covered
                Format questions for easy use in classroom."""
    
    runner = await session_manager.get_or_create_runner(user_id, session_id)
    response_data = await get_agent_response_async(runner, user_id, session_id, prompt)
    
    return {"questions": response_data["text"], "topic": topic, "grade": grade}

@app.post("/assessment/quiz")
async def generate_quiz(
    topics: str = Form(...),  # JSON array of topics
    grade: int = Form(...),
    quiz_type: str = Form("mixed"),  # mixed, subject_specific, chapter_wise
    duration: int = Form(30),  # minutes
    user_id: str = Form("default_user")
):
    """
    Generate complete quiz with multiple topics
    """
    session_id = f"quiz_{grade}_{uuid.uuid4()}"
    
    try:
        topics_list = json.loads(topics)
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="Invalid JSON format for topics")
    
    prompt = f"""Create a {duration}-minute quiz for Grade {grade} covering {', '.join(topics_list)}.
                Quiz type: {quiz_type}
                Include:
                - Mix of question types (MCQ, short answer, true/false)
                - Instructions for students
                - Answer key
                - Time allocation per question
                - Difficulty distribution"""
    
    runner = await session_manager.get_or_create_runner(user_id, session_id)
    response_data = await get_agent_response_async(runner, user_id, session_id, prompt)
    
    return {"response": response_data["text"], "session_id": session_id}

@app.post("/image/generate")
async def generate_educational_image(
    prompt: str = Form(...),
    style: str = Form("educational"),  # educational, diagram, illustration, photo
    aspect_ratio: str = Form("9:16"),
    user_id: str = Form("default_user"),
    session_id: Optional[str] = Form(None)
):
    """
    Generate educational images using Imagen
    """
    if session_id is None:
        session_id = f"image_{uuid.uuid4()}"
    
    enhanced_prompt = f"Educational {style}: {prompt}. Style: {style}, suitable for classroom teaching, clear and informative."
    
    runner = await session_manager.get_or_create_runner(user_id, session_id)
    response_data = await get_agent_response_async(runner, user_id, session_id, enhanced_prompt)
    
    if response_data["bytes_base64"]:
        return {
            "response": response_data["text"],
            "image_url": f"data:image/png;base64,{response_data['bytes_base64']}",
            "session_id": session_id
        }
    
    return {"response": response_data["text"], "session_id": session_id}

@app.post("/image/generate-diagram")
async def generate_diagram(
    concept: str = Form(...),
    diagram_type: str = Form("flowchart"),  # flowchart, labeled, process, comparison
    grade: int = Form(...),
    user_id: str = Form("default_user")
):
    """
    Generate specific types of educational diagrams
    """
    session_id = f"diagram_{concept}_{grade}_{uuid.uuid4()}"
    
    prompt = f"""Generate a {diagram_type} diagram to explain {concept} for Grade {grade} students.
                Make it educational, clear, and suitable for classroom use."""
    
    runner = await session_manager.get_or_create_runner(user_id, session_id)
    response_data = await get_agent_response_async(runner, user_id, session_id, prompt)
    
    if response_data["bytes_base64"]:
        return {
            "response": response_data["text"],
            "image_url": f"data:image/png;base64,{response_data['bytes_base64']}",
            "session_id": session_id
        }
    
    return {"response": response_data["text"], "session_id": session_id}

@app.post("/teacher/classroom-tips")
async def get_classroom_tips(
    topic: str = Form(...),
    grade: int = Form(...),
    classroom_size: str = Form("medium"),  # small, medium, large
    user_id: str = Form("default_user")
):
    """
    Get classroom management and teaching tips
    """
    session_id = f"tips_{topic}_{grade}_{uuid.uuid4()}"
    
    prompt = f"""Provide classroom management and teaching tips for teaching {topic} to Grade {grade} students.
                Classroom size: {classroom_size}
                Include:
                - Classroom setup suggestions
                - Student engagement strategies
                - Time management tips
                - Assessment methods
                - Common challenges and solutions"""
    
    runner = await session_manager.get_or_create_runner(user_id, session_id)
    response_data = await get_agent_response_async(runner, user_id, session_id, prompt)
    
    return {"response": response_data["text"], "session_id": session_id}

@app.post("/teacher/multi-grade-strategies")
async def get_multi_grade_strategies(
    grades: str = Form(...),  # JSON array of grades
    subject: str = Form(...),
    user_id: str = Form("default_user")
):
    """
    Get strategies for teaching multiple grades simultaneously
    """
    session_id = f"multigrade_{subject}_{uuid.uuid4()}"
    
    try:
        grades_list = json.loads(grades)
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="Invalid JSON format for grades")
    
    prompt = f"""Provide strategies for teaching {subject} to multiple grades ({', '.join(map(str, grades_list))}) simultaneously.
                Include:
                - Classroom organization
                - Activity planning
                - Assessment strategies
                - Time management
                - Student grouping methods"""
    
    runner = await session_manager.get_or_create_runner(user_id, session_id)
    response_data = await get_agent_response_async(runner, user_id, session_id, prompt)
    
    return {"response": response_data["text"], "session_id": session_id}

@app.get("/ncert/resources")
async def get_ncert_resources(
    grade: int = Query(...),
    subject: Optional[str] = Query(None)
):
    """
    Get available NCERT resources for a grade/subject
    """
    # Return list of available NCERT resources
    resources = [
        {"type": "textbook", "name": f"NCERT {subject or 'General'} Class {grade}", "url": f"/assets/ncert-books/grade-{grade}-{subject or 'general'}-en.pdf"},
        {"type": "supplementary", "name": f"NCERT Supplementary Material Grade {grade}", "url": f"/assets/ncert-books/grade-{grade}-supplementary-en.pdf"},
    ]
    
    return {
        "grade": grade,
        "subject": subject,
        "resources": resources
    }

@app.post("/session/continue")
async def continue_session(
    session_id: str = Form(...),
    user_id: str = Form(...)
):
    """
    Continue an existing session
    """
    # Retrieve session history and continue conversation
    return {"session_id": session_id, "history": "session_history", "status": "active"}

@app.post("/synthesize_speech")
async def synthesize_speech(text: str = Form(...)):
    """
    Synthesizes speech from the given text and returns an audio file.
    """
    audio_file_path = "synthesized_speech.mp3"
    try:
        synthesize_text(text, audio_file_path)
        if os.path.exists(audio_file_path):
            def iterfile():
                with open(audio_file_path, "rb") as f:
                    yield from f
                os.remove(audio_file_path) # Clean up the file after streaming

            return StreamingResponse(iterfile(), media_type="audio/mpeg")
        else:
            raise HTTPException(status_code=500, detail="Failed to synthesize speech.")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Speech synthesis error: {e}")

@app.get("/api/corpus/books/{curriculum}/{grade}")
async def list_corpus_books(curriculum: str, grade: int):
    """
    List available books in RAG corpus for specific curriculum and grade
    Format: <curriculum>_<grade>_<subject>_<part>
    Returns: List of unique subjects
    """
    try:
        from vertexai.preview import rag
        
        # Select corpus based on curriculum
        if curriculum.lower() == "ncert":
            corpus_id = "576460752303423488"
        elif curriculum.lower() == "kts":
            corpus_id = "5764607523034234880"
        else:
            return {"error": "Invalid curriculum type", "books": []}
        
        corpus_name = f"projects/265110558107/locations/us-central1/ragCorpora/{corpus_id}"
        
        # List files in corpus
        files = list(rag.list_files(corpus_name=corpus_name))
        
        # Extract subjects from filenames
        subjects = set()
        for file in files:
            filename = file.display_name.lower()
            print(f"Processing file: {filename}")  # Debug log
            
            # Parse filename pattern: ncert_classX_subject_part.pdf
            if f"class{grade}" in filename or f"grade{grade}" in filename:
                # Remove .pdf extension
                filename_clean = filename.replace('.pdf', '')
                
                # Split by underscores: ['ncert', 'class6', 'english', '1']
                parts = filename_clean.split('_')
                
                if len(parts) >= 3:
                    # Find the class/grade part
                    for i, part in enumerate(parts):
                        if f"class{grade}" in part or f"grade{grade}" in part:
                            # Subject should be the next part
                            if i + 1 < len(parts):
                                subject = parts[i + 1]
                                # Skip numeric parts and common suffixes
                                if not subject.isdigit() and subject not in ['part', 'en', 'hi']:
                                    subjects.add(subject.title())
                            break
            
            # Also handle grade-X-subject format for backward compatibility
            elif f"grade-{grade}" in filename:
                parts = filename.replace('.pdf', '').split('-')
                if len(parts) >= 3:
                    for i, part in enumerate(parts):
                        if str(grade) in part and i + 1 < len(parts):
                            subject = parts[i + 1]
                            if subject not in ['en', 'hi', 'part1', 'part2'] and not subject.isdigit():
                                subjects.add(subject.title())
                            break
        
        return {"books": sorted(list(subjects))}
    except Exception as e:
        print(f"Error listing corpus books: {e}")
        return {"error": str(e), "books": []}

@app.post("/api/schedule/generate")
async def generate_ai_schedule(
    curriculum: str = Form(...),
    grade: int = Form(...), 
    subject: str = Form(...),
    language: str = Form("en"),
    user_id: str = Form("default_user")
):
    """
    Generate 5-day lesson schedule for specific subject based on vector DB analysis
    """
    try:
        from datetime import datetime, timedelta
        
        # Calculate next 5 working days
        def calculate_working_days():
            today = datetime.now()
            working_days = []
            current_date = today
            
            while len(working_days) < 5:
                current_date += timedelta(days=1)
                # Check if it's a weekday (Monday=0, Sunday=6)
                if current_date.weekday() < 5:  # Monday to Friday
                    working_days.append(current_date.strftime("%A, %B %d"))
            
            return working_days
        
        working_days = calculate_working_days()
        
        # Create AI prompt to analyze subject content from vector DB
        prompt = f"""
        You are an expert educational content designer and child psychology specialist. Analyze the {curriculum.upper()} Grade {grade} {subject} textbook content from the vector database to create a FUN, ENGAGING, and DIGESTIBLE 5-day lesson schedule.

        CRITICAL INSTRUCTIONS:
        1. First, search and retrieve ALL content from the {curriculum.upper()} Grade {grade} {subject} textbook in the vector database
        2. Identify TOPICS (not chapters) - focus on learning concepts, skills, and knowledge areas
        3. Analyze topic COMPLEXITY and DIFFICULTY LEVEL for Grade {grade} students
        4. Distribute content based on TOPIC COMPLEXITY, not page counts:
           - Simple/fun topics: Can cover more in one day
           - Complex/abstract topics: Break into smaller, digestible chunks
           - Interactive topics: Prioritize hands-on activities
        5. Make learning ENJOYABLE and INTERESTING for children
        6. Each day should build logical progression while maintaining engagement
        7. Respond in {language} language

        Schedule for these working days: {', '.join(working_days)}

        For EACH DAY, provide this EXACT format:

        **DAY 1 - [Date]:**
        **Topic:** [Specific topic name from textbook]
        **Why this topic today:** [Brief explanation of complexity/reasoning]
        **Learning Goals:** [What students will understand/be able to do]
        **Fun Activities:** [Engaging, age-appropriate activities from textbook]
        **Practice:** [Simple exercises to reinforce learning]
        **Assessment:** [Quick, fun way to check understanding]
        **Pages/References:** [Specific textbook pages or sections]

        **DAY 2 - [Date]:**
        [Same format]

        [Continue for all 5 days]

        IMPORTANT: Base daily content distribution on topic complexity and student engagement, NOT on fixed page counts. Some days might cover 2 pages of complex topics, others might cover 10 pages of simple, fun content.

        Start by analyzing the vector database content for {subject} Grade {grade} now.
        """
        
        # Use RAG agent to generate schedule based on actual curriculum content
        session_id = f"schedule_{curriculum}_{grade}_{subject.replace(' ', '_')}_{uuid.uuid4()}"
        runner = await session_manager.get_or_create_runner(user_id, session_id)
        
        # Get response using curriculum-specific RAG agent
        result = await get_agent_response_async(runner, user_id, session_id, prompt)
        
        return {
            "schedule": result["text"], 
            "working_days": working_days,
            "curriculum": curriculum,
            "grade": grade,
            "subject": subject
        }
    except Exception as e:
        print(f"Error generating AI schedule: {e}")
        return {"error": str(e)}

@app.get("/health")
async def health_check():
    """
    Health check endpoint to ensure the API is running.
    """
    return {"status": "ok"}

if __name__ == "__main__":
    import uvicorn
    # You might want to adjust the host and port for deployment
    # uvicorn.run(app, host="0.0.0.0", port=8000)
    uvicorn.run(app, port=8000)