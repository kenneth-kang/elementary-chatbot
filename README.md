# 🎓 초등학생 학습 챗봇

초등학생을 위한 AI 기반 학습 지원 챗봇입니다. 로컬 LLM(Ollama)과 RAG 시스템을 활용하여 교과서 내용을 기반으로 정확한 답변을 제공합니다.

## ✨ 주요 기능

-   🤖 **로컬 AI 챗봇** - Ollama를 활용한 프라이버시 보호
-   📚 **RAG 시스템** - 교과서/학습 자료 기반 답변
-   💬 **대화 이력 유지** - 맥락을 이해하는 연속 대화
-   📤 **파일 업로드** - PDF, DOCX, TXT 지원
-   🎨 **친근한 UI** - 초등학생에게 최적화된 디자인
-   📱 **반응형 디자인** - 모바일/태블릿/데스크톱 지원
-   ⚡ **RxJS 통합** - 반응형 프로그래밍으로 안정적인 통신

## 🛠 기술 스택

### 백엔드

-   **Python** 3.10+
-   **Flask** 3.0.0 - 웹 프레임워크
-   **Ollama** - 로컬 LLM 실행
-   **ChromaDB** - 벡터 데이터베이스
-   **Sentence Transformers** - 한국어 임베딩
-   **LangChain** - RAG 파이프라인

### 프론트엔드

-   **Next.js** 15.5.7 (최신 보안 패치)
-   **React** 19.0.0
-   **TypeScript** 5.6.3
-   **Jotai** 2.10.3 - 상태 관리
-   **RxJS** 7.8.1 - 반응형 프로그래밍
-   **Framer Motion** 11.11.17 - 애니메이션
-   **Tailwind CSS** 3.4.15 - 스타일링

## 📋 시스템 요구사항

-   **macOS** (M1/M2/M3 권장)
-   **RAM**: 최소 8GB (16GB 권장)
-   **저장공간**: 10GB 이상
-   **Node.js**: 18.0.0 이상
-   **Python**: 3.10 이상

## 🚀 빠른 시작

### 1. Ollama 설치

```bash
# macOS
brew install ollama

# 모델 다운로드
ollama pull llama3.1:8b
```

### 2. 자동 설치 (권장)

```bash
# 설치 스크립트 실행
chmod +x setup.sh
./setup.sh
```

### 3. 수동 설치

#### 백엔드

```bash
# 프로젝트 생성
mkdir elementary-chatbot
cd elementary-chatbot

# 백엔드 설정
mkdir backend
cd backend

# 가상환경 생성 및 활성화
python3 -m venv venv
source venv/bin/activate

# 패키지 설치
pip install -r requirements.txt
```

#### 프론트엔드

```bash
cd ..

# Next.js 프로젝트 생성
npx create-next-app@15.5.7 frontend --typescript --tailwind --app

cd frontend

# 패키지 설치
npm install jotai@2.10.3 rxjs@7.8.1 framer-motion@11.11.17 \
    lucide-react@0.460.0 react-textarea-autosize@8.5.4

# 환경 변수 설정
echo "NEXT_PUBLIC_API_URL=http://localhost:5000" > .env.local
```

### 4. 파일 구성

제공된 Artifacts의 코드를 각 파일에 복사합니다:

**백엔드:**

-   `backend/server.py`
-   `backend/rag_manager.py`
-   `backend/requirements.txt`

**프론트엔드:**

-   `src/services/api.service.ts`
-   `src/store/chatStore.ts`
-   `src/hooks/useChatController.ts`
-   `src/types/chat.ts`
-   `src/components/*.tsx` (각 컴포넌트)
-   `src/app/page.tsx`
-   `src/app/layout.tsx`
-   `src/app/globals.css`

## 🎮 실행

3개의 터미널이 필요합니다:

### 터미널 1: Ollama 서버

```bash
ollama serve
```

### 터미널 2: 백엔드 서버

```bash
cd backend
source venv/bin/activate
python server.py
```

### 터미널 3: 프론트엔드 서버

```bash
cd frontend
npm run dev
```

### 접속

브라우저에서 http://localhost:3000 으로 접속합니다.

## 📖 사용 방법

### 1. 기본 대화

-   채팅창에 질문을 입력하면 AI가 답변합니다
-   이전 대화 내용을 기억하여 자연스러운 대화가 가능합니다

### 2. 빠른 질문

-   상단의 버튼을 클릭하면 미리 설정된 질문을 빠르게 전송할 수 있습니다
-   수학 도움, 고민 상담, 이야기, 과학 등

### 3. 학습 자료 업로드

-   헤더의 "학습자료 추가" 버튼 클릭
-   PDF, DOCX, TXT 파일 선택
-   과목, 학년, 주제 입력 (선택사항)
-   업로드 완료 후 AI가 해당 자료를 참조하여 답변

### 4. 문서 통계

-   "자료 N개" 버튼을 클릭하면 업로드된 자료 현황 확인 가능

## 🏗 프로젝트 구조

```
elementary-chatbot/
├── backend/
│   ├── server.py              # Flask 서버
│   ├── rag_manager.py         # RAG 시스템
│   ├── requirements.txt       # Python 패키지
│   ├── uploads/               # 업로드 파일
│   └── chroma_db/             # 벡터 DB
│
└── frontend/
    ├── src/
    │   ├── app/               # Next.js 앱
    │   ├── components/        # React 컴포넌트
    │   ├── services/          # API 서비스
    │   ├── store/             # 상태 관리
    │   ├── hooks/             # 커스텀 Hook
    │   └── types/             # TypeScript 타입
    ├── public/
    └── package.json
```

## 🔄 데이터 흐름

```
사용자 입력
    ↓
RxJS Subject (이벤트 발행)
    ↓
useChatController (스트림 구독)
    ↓
ApiService (Observable 기반 통신)
    ↓
Flask API
    ↓
RAG Manager (문서 검색)
    ↓
Ollama LLM (답변 생성)
    ↓
Observable 처리
    ↓
Jotai Atom 업데이트
    ↓
React 리렌더링
```

## 🎨 UI 스크린샷

### 메인 화면

-   밝고 친근한 그라디언트 디자인
-   귀여운 이모지 아바타
-   부드러운 애니메이션 효과

### 파일 업로드

-   직관적인 드래그 앤 드롭
-   메타데이터 입력 폼
-   업로드 진행 상태 표시

## 🔧 설정 옵션

### 백엔드 설정

**server.py에서 수정 가능:**

```python
# 포트 변경
app.run(debug=True, host='0.0.0.0', port=5000)

# 대화 이력 개수 조정
recent_history = conversation_history[-10:]  # 10 → 원하는 숫자
```

**rag_manager.py에서 수정 가능:**

```python
# 검색 결과 개수
def search(self, query: str, n_results: int = 3):  # 3 → 원하는 숫자

# 임베딩 모델 변경
self.embedding_model = SentenceTransformer('jhgan/ko-sroberta-multitask')
```

### 프론트엔드 설정

**.env.local:**

```bash
NEXT_PUBLIC_API_URL=http://localhost:5000  # API URL 변경
```

## 🐛 문제 해결

### 서버 연결 실패

```bash
# 백엔드 상태 확인
curl http://localhost:5000/health

# Ollama 상태 확인
ollama list
```

### 포트 충돌

```bash
# 백엔드 포트 변경: server.py에서 수정
# 프론트엔드 포트 변경
npm run dev -- -p 3001
```

### 모델 로딩 실패

```bash
# 모델 재다운로드
ollama pull llama3.1:8b

# 다른 모델 시도
ollama pull gemma:2b
```

### 패키지 설치 오류

```bash
# Node.js
rm -rf node_modules package-lock.json
npm install

# Python
pip install --upgrade pip
pip install -r requirements.txt
```

## 📊 성능 최적화

-   ✅ **RxJS shareReplay** - API 응답 캐싱
-   ✅ **switchMap** - 중복 요청 자동 취소
-   ✅ **대화 이력 제한** - 최근 10개만 전송
-   ✅ **코드 스플리팅** - Next.js 자동 최적화
-   ✅ **이미지 최적화** - Next.js Image 컴포넌트

## 🔒 보안

-   ✅ **Next.js 15.5.7** - CVE-2025-66478 보안 패치 적용
-   ✅ **CORS 설정** - 허용된 도메인만 접근
-   ✅ **파일 검증** - 허용된 확장자만 업로드
-   ✅ **환경 변수** - 민감 정보 분리
-   ✅ **입력 검증** - XSS 방지

## 🧪 테스트

### API 테스트

```bash
# 헬스 체크
curl http://localhost:5000/health

# 채팅 테스트
curl -X POST http://localhost:5000/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "안녕!"}'

# 파일 업로드 테스트
curl -X POST http://localhost:5000/upload \
  -F "file=@test.pdf" \
  -F "subject=수학"
```

## 📈 향후 계획

### 단기 (1-2개월)

-   [ ] 음성 입력/출력 기능
-   [ ] 이미지 OCR (필기 인식)
-   [ ] 퀴즈 자동 생성
-   [ ] 대화 저장/불러오기

### 중기 (3-6개월)

-   [ ] 사용자 인증 시스템
-   [ ] 학습 진도 추적
-   [ ] 부모님 대시보드
-   [ ] 다중 모델 지원

### 장기 (6-12개월)

-   [ ] 모바일 앱 (React Native)
-   [ ] 오프라인 모드
-   [ ] 실시간 협업 기능
-   [ ] 학습 분석 리포트

## 🤝 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 라이선스

이 프로젝트는 교육 목적으로 자유롭게 사용 가능합니다.

## 👥 제작자

-   **프로젝트 설계**: Claude (Anthropic)
-   **기술 지원**: Ollama, ChromaDB, Next.js

## 📚 참고 자료

-   [Next.js 문서](https://nextjs.org/docs)
-   [RxJS 문서](https://rxjs.dev)
-   [Ollama 문서](https://ollama.ai)
-   [ChromaDB 문서](https://docs.trychroma.com)
-   [Jotai 문서](https://jotai.org)

## 💬 문의

프로젝트에 대한 질문이나 제안이 있으시면 Issue를 열어주세요!

---

**Made with ❤️ for Elementary Students**
