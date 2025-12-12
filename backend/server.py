from flask import Flask, request, jsonify, Response
from flask_cors import CORS
import ollama
import json
from datetime import datetime
from rag_manager import RAGManager
import os
from werkzeug.utils import secure_filename

app = Flask(__name__)
# CORS 설정 강화 (수정)
CORS(app, resources={
    r"/*": {
        "origins": ["http://localhost:3000", "http://127.0.0.1:3000"],
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"],
        "expose_headers": ["Content-Type"],
        "supports_credentials": True,
        "max_age": 3600
    }
})

# RAG 매니저 초기화
rag_manager = RAGManager()

# 파일 업로드 설정
UPLOAD_FOLDER = './uploads'
ALLOWED_EXTENSIONS = {'pdf', 'docx', 'txt'}
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# 초등학생용 시스템 프롬프트
SYSTEM_PROMPT = """너는 초등학생들을 위한 친절한 한국어 선생님 AI야.

역할:
1. 초등학생 수준에 맞게 쉽고 재미있게 설명해줘
2. 항상 긍정적이고 격려하는 말투를 사용해
3. 어려운 단어는 쉬운 말로 풀어서 설명해줘
4. 친구처럼 친근하게, 하지만 존중하는 태도로 대화해
5. 이전 대화 내용을 기억하고 자연스럽게 이어서 대화해

지원 영역:
- 학습: 수학, 국어, 과학, 영어 등
- 인성: 친구 관계, 감정 표현, 예절, 자신감
- 고민 상담: 학교생활, 가족 관계

규칙:
- 항상 한국어로 자연스럽게 답변하며, 한국어 맞춤법과 문법을 정확하게 사용해야되.
- 전문적인 내용이라도 한국인이 이해하기 쉽게 설명해줘.
- 영어 단어는 필요한 경우에만 사용하고, 가능한 한국어로 설명해줘.
- 폭력적, 부적절한 내용은 다루지 않아
- 숙제 답을 직접 주지 않고, 힌트와 방법을 알려줘
- 항상 긍정적인 방향으로 유도해
- 참고자료가 제공되면, 그 내용을 기반으로 정확하게 설명해"""

# OPTIONS 요청 처리 추가 (중요!)
@app.before_request
def handle_preflight():
    if request.method == "OPTIONS":
        response = app.make_default_options_response()
        response.headers['Access-Control-Allow-Origin'] = 'http://localhost:3000'
        response.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS'
        response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization'
        return response

def allowed_file(filename):
    """허용된 파일 확장자 체크"""
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/health', methods=['GET'])
def health_check():
    """서버 상태 확인"""
    stats = rag_manager.get_stats()
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat(),
        'rag_stats': stats
    })

@app.route('/chat', methods=['POST'])
def chat():
    """
    통합 채팅 API (대화 이력 + RAG)
    
    Request Body:
    {
        "message": "사용자 메시지",
        "history": [{"role": "user", "content": "..."}, ...],  // 선택사항
        "use_rag": true  // 선택사항, 기본값 true
    }
    """
    try:
        data = request.json
        user_message = data.get('message', '')
        conversation_history = data.get('history', [])
        use_rag = data.get('use_rag', True)
        
        if not user_message:
            return jsonify({'error': '메시지를 입력해주세요'}), 400
        
        # 1. 시스템 프롬프트로 시작
        messages = [{'role': 'system', 'content': SYSTEM_PROMPT}]
        
        # 2. RAG 검색 및 컨텍스트 추가
        rag_context = ""
        used_sources = []
        
        if use_rag:
            rag_context = rag_manager.get_context_for_query(user_message, n_results=3)
            
            if rag_context:
                # 참고자료를 시스템 메시지에 추가
                rag_instruction = f"""

                [📚 참고 자료]
                다음은 업로드된 학습 자료에서 찾은 관련 내용이야:

                {rag_context}

                위 참고 자료의 내용을 활용해서 정확하게 설명해주되, 
                초등학생이 이해하기 쉽게 풀어서 말해줘."""
                
                messages[0]['content'] += rag_instruction
                
                # 사용된 출처 정보 수집
                results = rag_manager.search(user_message, n_results=3)
                for result in results:
                    if result['metadata']:
                        used_sources.append(result['metadata'])
                
                print(f"📚 RAG 활성화: {len(used_sources)}개 문서 참조")
        
        # 3. 이전 대화 이력 추가 (최근 10개만)
        if conversation_history:
            recent_history = conversation_history[-10:] if len(conversation_history) > 10 else conversation_history
            messages.extend(recent_history)
            print(f"💬 대화 이력: {len(recent_history)}개 메시지 포함")
        
        # 4. 현재 사용자 메시지 추가
        messages.append({'role': 'user', 'content': user_message})
        
        # 5. LLM 호출
        print(f"🤖 LLM 호출 - 총 {len(messages)}개 메시지 전달")
        response = ollama.chat(
            model='llama3.2:3b',
            messages=messages
        )
        print(f"🤖 LLM 호출결과 - {response}")
        bot_response = response['message']['content']
        
        # 6. 응답 반환
        return jsonify({
            'response': bot_response,
            'timestamp': datetime.now().isoformat(),
            'rag_used': bool(rag_context),
            'sources': used_sources,
            'context_size': len(messages)
        })
        
    except Exception as e:
        print(f"❌ Error in chat endpoint: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/chat/stream', methods=['POST'])
def chat_stream():
    """
    스트리밍 채팅 API (대화 이력 + RAG 통합)
    
    Server-Sent Events 형식으로 실시간 응답 스트리밍
    """
    try:
        data = request.json
        user_message = data.get('message', '')
        conversation_history = data.get('history', [])
        use_rag = data.get('use_rag', True)
        
        if not user_message:
            return jsonify({'error': '메시지를 입력해주세요'}), 400
        
        def generate():
            try:
                # 1. 시스템 프롬프트
                messages = [{'role': 'system', 'content': SYSTEM_PROMPT}]
                
                # 2. RAG 컨텍스트 추가
                if use_rag:
                    rag_context = rag_manager.get_context_for_query(user_message, n_results=3)
                    if rag_context:
                        rag_instruction = f"""

[📚 참고 자료]
{rag_context}

위 참고 자료를 활용해서 정확하게 설명해줘."""
                        messages[0]['content'] += rag_instruction
                
                # 3. 대화 이력 추가
                if conversation_history:
                    recent_history = conversation_history[-10:]
                    messages.extend(recent_history)
                
                # 4. 현재 메시지 추가
                messages.append({'role': 'user', 'content': user_message})
                
                # 5. 스트리밍 응답
                stream = ollama.chat(
                    model='llama3.2:3b',
                    messages=messages,
                    stream=True
                )
                
                for chunk in stream:
                    if 'message' in chunk and 'content' in chunk['message']:
                        content = chunk['message']['content']
                        yield f"data: {json.dumps({'content': content})}\n\n"
                
                yield f"data: {json.dumps({'done': True})}\n\n"
                
            except Exception as e:
                print(f"❌ Stream error: {str(e)}")
                yield f"data: {json.dumps({'error': str(e)})}\n\n"
        
        return Response(generate(), mimetype='text/event-stream')
        
    except Exception as e:
        print(f"❌ Error in stream endpoint: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/upload', methods=['POST'])
def upload_file():
    """
    학습 자료 업로드
    
    Form Data:
    - file: 업로드할 파일 (PDF, DOCX, TXT)
    - subject: 과목 (선택사항)
    - grade: 학년 (선택사항)
    - topic: 주제 (선택사항)
    """
    try:
        if 'file' not in request.files:
            return jsonify({'error': '파일이 없습니다'}), 400
        
        file = request.files['file']
        
        if file.filename == '':
            return jsonify({'error': '파일이 선택되지 않았습니다'}), 400
        
        if not allowed_file(file.filename):
            return jsonify({'error': '지원하지 않는 파일 형식입니다 (PDF, DOCX, TXT만 가능)'}), 400
        
        # 파일 저장
        filename = secure_filename(file.filename)
        filepath = os.path.join(UPLOAD_FOLDER, filename)
        file.save(filepath)
        
        # 메타데이터 구성
        metadata = {
            'filename': filename,
            'upload_date': datetime.now().isoformat()
        }
        
        if 'subject' in request.form:
            metadata['subject'] = request.form['subject']
        if 'grade' in request.form:
            metadata['grade'] = request.form['grade']
        if 'topic' in request.form:
            metadata['topic'] = request.form['topic']
        
        # RAG 시스템에 추가
        doc_ids = []
        if filename.endswith('.pdf'):
            doc_ids = rag_manager.add_pdf(filepath, metadata)
        elif filename.endswith('.docx'):
            doc_id = rag_manager.add_docx(filepath, metadata)
            doc_ids = [doc_id]
        elif filename.endswith('.txt'):
            with open(filepath, 'r', encoding='utf-8') as f:
                text = f.read()
            doc_id = rag_manager.add_text(text, metadata)
            doc_ids = [doc_id]
        
        print(f"✅ 파일 업로드 성공: {filename} ({len(doc_ids)}개 문서)")
        
        return jsonify({
            'message': '파일이 성공적으로 업로드되었습니다',
            'filename': filename,
            'documents_added': len(doc_ids),
            'metadata': metadata
        })
        
    except Exception as e:
        print(f"❌ Upload error: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/documents', methods=['GET'])
def list_documents():
    """업로드된 문서 통계"""
    try:
        stats = rag_manager.get_stats()
        return jsonify(stats)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/documents/search', methods=['POST'])
def search_documents():
    """
    문서 검색 (테스트/디버깅용)
    
    Request Body:
    {
        "query": "검색어",
        "n_results": 3  // 선택사항
    }
    """
    try:
        data = request.json
        query = data.get('query', '')
        n_results = data.get('n_results', 3)
        
        if not query:
            return jsonify({'error': '검색어를 입력해주세요'}), 400
        
        results = rag_manager.search(query, n_results)
        
        return jsonify({
            'query': query,
            'results': results
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/documents/clear', methods=['POST'])
def clear_documents():
    """모든 문서 삭제 (주의!)"""
    try:
        rag_manager.clear_collection()
        print("⚠️  모든 문서 삭제됨")
        return jsonify({'message': '모든 문서가 삭제되었습니다'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/models', methods=['GET'])
def list_models():
    """사용 가능한 Ollama 모델 목록"""
    try:
        models = ollama.list()
        return jsonify({
            'models': [model['name'] for model in models['models']]
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    print("=" * 60)
    print("🤖 초등학생 학습 챗봇 서버 시작")
    print("=" * 60)
    print("📍 서버 주소: http://localhost:5000")
    print("💡 사용 전 'ollama serve' 실행 필요")
    print("=" * 60)
    print("✨ 기능:")
    print("  - 대화 이력 유지 (최근 10개)")
    print("  - RAG 기능 (문서 기반 답변)")
    print("  - 파일 업로드 (PDF, DOCX, TXT)")
    print("  - 스트리밍 응답 지원")
    print("=" * 60)
    
    # 초기 학습 자료 로딩 (선택사항)
    print("\n📖 기본 학습 자료 로딩 중...")
    
    # 예시: 기본 수학 개념
    rag_manager.add_text(
        """분수는 전체를 똑같이 나눈 것 중 일부를 나타내는 수예요.
        분자는 위에 있는 숫자로, 선택한 부분의 개수를 말해요.
        분모는 아래에 있는 숫자로, 전체를 나눈 개수를 말해요.
        예를 들어, 피자 한 판을 4등분했을 때 그중 1조각은 1/4(4분의 1)이 돼요.
        분수를 더할 때는 분모가 같으면 분자끼리만 더하면 돼요.""",
        metadata={"subject": "수학", "grade": "3학년", "topic": "분수"}
    )
    
    rag_manager.add_text(
        """곱셈은 같은 수를 여러 번 더하는 것을 간단하게 나타낸 거예요.
        예를 들어, 3 × 4는 3을 4번 더한다는 뜻이에요. 즉, 3 + 3 + 3 + 3 = 12죠.
        곱셈구구는 1부터 9까지의 곱셈을 외우는 거예요.
        2단은 2, 4, 6, 8... 이렇게 2씩 커지는 규칙이 있어요.""",
        metadata={"subject": "수학", "grade": "2학년", "topic": "곱셈"}
    )
    
    rag_manager.add_text(
        """광합성은 식물이 햇빛을 이용해서 양분을 만드는 과정이에요.
        식물의 잎에 있는 엽록체라는 곳에서 일어나요.
        햇빛과 물과 이산화탄소를 이용해서 포도당(양분)과 산소를 만들어요.
        우리가 숨쉬는 산소도 식물이 광합성을 해서 만들어진 거예요.""",
        metadata={"subject": "과학", "grade": "4학년", "topic": "광합성"}
    )
    
    stats = rag_manager.get_stats()
    print(f"✅ 총 {stats['total_documents']}개 문서 로드 완료")
    print(f"📊 과목별: {stats['subjects']}")
    print("=" * 60)
    print("\n🚀 서버 시작 완료! 사용 준비됨\n")
    
    app.run(debug=True, host='0.0.0.0', port=5000)