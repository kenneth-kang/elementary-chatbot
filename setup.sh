#!/bin/bash

echo "======================================================"
echo "🎓 초등학생 학습 챗봇 자동 설치 스크립트"
echo "======================================================"
echo ""

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 프로젝트 루트 디렉토리 생성
PROJECT_NAME="elementary-chatbot"
echo -e "${GREEN}📁 프로젝트 디렉토리 생성: $PROJECT_NAME${NC}"
mkdir -p $PROJECT_NAME
cd $PROJECT_NAME

# ========================================
# 백엔드 설정
# ========================================
echo ""
echo -e "${YELLOW}🔧 백엔드 설정 시작...${NC}"

mkdir -p backend
cd backend

# Python 가상환경 생성
echo "Python 가상환경 생성 중..."
python3 -m venv venv
source venv/bin/activate

# requirements.txt 생성
cat > requirements.txt << 'EOF'
flask==3.0.0
flask-cors==4.0.0
ollama==0.1.6
python-dotenv==1.0.0
chromadb==0.4.22
sentence-transformers==2.3.1
langchain==0.1.4
langchain-community==0.0.16
pypdf==4.0.1
python-docx==1.1.0
openpyxl==3.1.2
EOF

# Python 패키지 설치
echo "Python 패키지 설치 중..."
pip install --upgrade pip
pip install -r requirements.txt

# server.py 파일 생성 안내
echo ""
echo -e "${YELLOW}⚠️  다음 파일들을 수동으로 생성해주세요:${NC}"
echo "  - backend/server.py"
echo "  - backend/rag_manager.py"
echo ""

cd ..

# ========================================
# 프론트엔드 설정
# ========================================
echo ""
echo -e "${YELLOW}🎨 프론트엔드 설정 시작...${NC}"

# Next.js 프로젝트 생성 (자동 yes)
echo "Next.js 프로젝트 생성 중..."
npx create-next-app@15.5.7 frontend --typescript --tailwind --app --yes

cd frontend

# 추가 패키지 설치
echo "추가 패키지 설치 중..."
npm install jotai@2.10.3 rxjs@7.8.1 framer-motion@11.11.17 lucide-react@0.460.0 react-textarea-autosize@8.5.4

# 디렉토리 구조 생성
echo "디렉토리 구조 생성 중..."
mkdir -p src/components
mkdir -p src/services
mkdir -p src/store
mkdir -p src/hooks
mkdir -p src/types

# .env.local 생성
echo "환경 변수 파일 생성 중..."
cat > .env.local << 'EOF'
NEXT_PUBLIC_API_URL=http://localhost:5000
EOF

cd ..

# ========================================
# 완료 메시지
# ========================================
echo ""
echo -e "${GREEN}======================================================"
echo "✅ 기본 설치 완료!"
echo "======================================================${NC}"
echo ""
echo -e "${YELLOW}📝 다음 단계:${NC}"
echo ""
echo "1️⃣  백엔드 파일 생성"
echo "   - backend/server.py (제공된 코드 참조)"
echo "   - backend/rag_manager.py (제공된 코드 참조)"
echo ""
echo "2️⃣  프론트엔드 파일 생성"
echo "   - frontend/src/services/api.service.ts"
echo "   - frontend/src/store/chatStore.ts"
echo "   - frontend/src/hooks/useChatController.ts"
echo "   - frontend/src/types/chat.ts"
echo "   - frontend/src/components/*.tsx (각 컴포넌트)"
echo "   - frontend/src/app/page.tsx"
echo "   - frontend/src/app/layout.tsx"
echo "   - frontend/src/app/globals.css"
echo ""
echo "3️⃣  Ollama 설정"
echo "   brew install ollama"
echo "   ollama pull llama3.2:3b"
echo ""
echo "4️⃣  실행 (3개 터미널 필요)"
echo ""
echo "   [터미널 1] Ollama 서버:"
echo "   ollama serve"
echo ""
echo "   [터미널 2] 백엔드 서버:"
echo "   cd backend"
echo "   source venv/bin/activate"
echo "   python server.py"
echo ""
echo "   [터미널 3] 프론트엔드 서버:"
echo "   cd frontend"
echo "   npm run dev"
echo ""
echo "5️⃣  접속"
echo "   http://localhost:3000"
echo ""
echo -e "${GREEN}======================================================"
echo "🚀 즐거운 개발 되세요!"
echo "======================================================${NC}"