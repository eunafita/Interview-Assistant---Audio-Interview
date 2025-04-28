# 🎤 AI Interview Simulator — GPT-4 + Whisper + TTS
Practice your English job interviews by simulating realistic interviews, using your own resume and a job description!
Powered by GPT-4, Whisper, and TTS APIs from OpenAI.



## 🚀 Features
- 🧠 GPT-4 generates realistic, personalized interview questions
- 🗣️ Whisper transcribes your audio responses
- 🔊 TTS (Text-to-Speech) reads the questions aloud with natural voices
- 📝 Full interview transcript export (Markdown .md file)
- 🎙️ Interactive microphone recording (Start/Stop/End)
- ⚡ Available via Google Colab or full local installation with Docker



# 🧪 Technologies Used

- GPT-4 (OpenAI Chat API)
- Whisper (OpenAI Speech-to-Text API)
- TTS (tts-1 model from OpenAI)
- NestJS (Backend API)
- Angular (Frontend Web App)
- Docker + Docker Compose
- Google Colab (Jupyter Notebook)



# 📚 Options to Use

### 1. 🧪 Try the Colab Notebook (No install needed)
Click below to practice directly inside Google Colab:

[![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/eunafita/Interview-Assistant---Audio-Interview/blob/main/interview_assistant_audio.ipynb)



### 2. 🐳 Run the Full Web App Locally (Docker)
Clone the project:

```bash
git clone https://github.com/eunafita/Interview-Assistant---Audio-Interview.git
cd Interview-Assistant---Audio-Interview
```

Build and run with Docker Compose:

```bash
docker-compose up --build
```
- 🌐 Frontend: http://localhost:4200
- 🧠 Backend API: http://localhost:3000



### Note:
### Before running, make sure you have a valid .env file inside /backend/ with your OpenAI API key:

```bash
OPENAI_API_KEY=your-openai-api-key-here
```

### ⚙️ Project Structure
```code
/frontend          --> Angular application (user interface)
/backend           --> NestJS application (API & OpenAI integration)
/docker-compose.yml --> Multi-container configuration
/interview_assistant_audio.ipynb --> Google Colab notebook version
```

### 📦 Requirements
- Docker Engine installed (Linux, Windows, or Mac)
- OpenAI account with access to GPT-4, Whisper, and TTS APIs

Optional (for local development):
- Node.js 18+
- Angular CLI
- NestJS CLI
#

### 📝 Roadmap
- ☑️ Initial prototype via Google Colab
- ☑️ Full-stack version (NestJS + Angular)
- ☑️ Dockerized setup for easy installation
- ⬜ Add login and session management (optional future feature)
- ⬜ Support for multiple languages (future feature)
- ⬜ Add support for more AI models as Claude(anthropic), DeepSeek, Grok and others
- ⬜ Add question categories like: Background, tricky questions, skills questions, job specific questions.


#
### 🙌 Acknowledgments
- OpenAI for providing the APIs
- Google Colab for quick prototyping
- Docker Community for making local deployments simple


#
### 📄 License
This project is licensed under the [MIT License](https://opensource.org/licenses/MIT).


#
# 🎯 Final Result
- ✅ Practice your English speaking
- ✅ Get realistic feedback
- ✅ Export your entire interview transcript
- ✅ Ready for real interviews!


#
# 🚀 Ready to simulate your first interview?
- Start now on Google Colab [![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/eunafita/Interview-Assistant---Audio-Interview/blob/main/interview_assistant_audio.ipynb)
  
or
- Run locally with Docker in minutes! 🐳
