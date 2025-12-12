# 초등학생 학습 챗봇 - RAG 시스템

## 📚 RAG란?

**Retrieval-Augmented Generation (검색 증강 생성)**

-   외부 지식(문서, 교과서 등)을 검색하여 AI 답변에 활용
-   AI가 학습하지 않은 최신 정보나 특정 문서 내용 참조 가능

## 🏗 시스템 구조

```
사용자 질문
    ↓
질문 임베딩 (벡터 변환)
    ↓
벡터 DB에서 관련 문서 검색
    ↓
검색된 문서 + 질문 → LLM
    ↓
컨텍스트 기반 답변 생성
```

## 🛠 구현 방법 (2가지)

### 방법 1: 간단한 방식 (추천) ⭐

-   **ChromaDB** (로컬 벡터 DB)
-   **Sentence Transformers** (임베딩)
-   **장점**: 설치 간단, 무료, 로컬 실행

### 방법 2: 고급 방식

-   **Pinecone/Weaviate** (클라우드 벡터 DB)
-   **OpenAI Embeddings** (API 필요)
-   **장점**: 확장성 좋음, 관리 쉬움

## 📦 필요한 패키지

```bash
pip install chromadb
pip install sentence-transformers
pip install pypdf  # PDF 문서용
pip install python-docx  # Word 문서용
```

## 🎓 활용 예시

**교과서 기반 학습**

-   수학 교과서 업로드 → 개념 설명 시 교과서 내용 참조
-   과학 실험 자료 → 실험 방법 정확히 안내

**맞춤 학습 자료**

-   선생님이 제공한 프린트, PPT
-   학교 공지사항, 가정통신문

**안전한 답변**

-   학습된 문서 내에서만 답변 (hallucination 방지)
