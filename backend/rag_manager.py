import chromadb
from chromadb.config import Settings
from sentence_transformers import SentenceTransformer
from typing import List, Dict
import os
import pypdf
from docx import Document

class RAGManager:
    """초등학생 학습 자료용 RAG 매니저"""
    
    def __init__(self, persist_directory: str = "./chroma_db"):
        """
        Args:
            persist_directory: ChromaDB 저장 경로
        """
        # ChromaDB 초기화
        self.client = chromadb.Client(Settings(
            persist_directory=persist_directory,
            anonymized_telemetry=False
        ))
        
        # 임베딩 모델 (한국어 지원)
        self.embedding_model = SentenceTransformer('jhgan/ko-sroberta-multitask')
        
        # 컬렉션 생성/로드
        try:
            self.collection = self.client.get_collection(name="elementary_materials")
        except:
            self.collection = self.client.create_collection(
                name="elementary_materials",
                metadata={"description": "초등학생 학습 자료"}
            )
    
    def add_text(self, text: str, metadata: Dict = None) -> str:
        """
        텍스트를 벡터 DB에 추가
        
        Args:
            text: 추가할 텍스트
            metadata: 메타데이터 (제목, 출처, 학년, 과목 등)
        
        Returns:
            문서 ID
        """
        if metadata is None:
            metadata = {}
        
        # 문서 ID 생성
        doc_id = f"doc_{len(self.collection.get()['ids'])}"
        
        # 임베딩 생성
        embedding = self.embedding_model.encode(text).tolist()
        
        # ChromaDB에 추가
        self.collection.add(
            ids=[doc_id],
            embeddings=[embedding],
            documents=[text],
            metadatas=[metadata]
        )
        
        return doc_id
    
    def add_pdf(self, pdf_path: str, metadata: Dict = None) -> List[str]:
        """
        PDF 파일을 처리하여 벡터 DB에 추가
        
        Args:
            pdf_path: PDF 파일 경로
            metadata: 메타데이터
        
        Returns:
            추가된 문서 ID 리스트
        """
        if metadata is None:
            metadata = {"source": pdf_path}
        
        doc_ids = []
        
        # PDF 읽기
        with open(pdf_path, 'rb') as file:
            pdf_reader = pypdf.PdfReader(file)
            
            for page_num, page in enumerate(pdf_reader.pages):
                text = page.extract_text()
                
                if text.strip():  # 텍스트가 있는 경우만
                    page_metadata = {
                        **metadata,
                        "page": page_num + 1,
                        "total_pages": len(pdf_reader.pages)
                    }
                    
                    doc_id = self.add_text(text, page_metadata)
                    doc_ids.append(doc_id)
        
        return doc_ids
    
    def add_docx(self, docx_path: str, metadata: Dict = None) -> str:
        """
        Word 문서를 처리하여 벡터 DB에 추가
        
        Args:
            docx_path: Word 파일 경로
            metadata: 메타데이터
        
        Returns:
            문서 ID
        """
        if metadata is None:
            metadata = {"source": docx_path}
        
        # Word 문서 읽기
        doc = Document(docx_path)
        
        # 전체 텍스트 추출
        full_text = "\n".join([paragraph.text for paragraph in doc.paragraphs])
        
        return self.add_text(full_text, metadata)
    
    def search(self, query: str, n_results: int = 3) -> List[Dict]:
        """
        질문과 관련된 문서 검색
        
        Args:
            query: 검색 질문
            n_results: 반환할 문서 개수
        
        Returns:
            검색 결과 리스트
        """
        # 질문 임베딩
        query_embedding = self.embedding_model.encode(query).tolist()
        
        # 유사도 검색
        results = self.collection.query(
            query_embeddings=[query_embedding],
            n_results=n_results
        )
        
        # 결과 포맷팅
        formatted_results = []
        for i in range(len(results['ids'][0])):
            formatted_results.append({
                'id': results['ids'][0][i],
                'text': results['documents'][0][i],
                'metadata': results['metadatas'][0][i],
                'distance': results['distances'][0][i] if 'distances' in results else None
            })
        
        return formatted_results
    
    def get_context_for_query(self, query: str, n_results: int = 3) -> str:
        """
        질문에 대한 컨텍스트 생성 (LLM에 전달할 용도)
        
        Args:
            query: 사용자 질문
            n_results: 검색할 문서 개수
        
        Returns:
            컨텍스트 텍스트
        """
        results = self.search(query, n_results)
        
        if not results:
            return ""
        
        context_parts = []
        for i, result in enumerate(results, 1):
            metadata = result['metadata']
            source_info = metadata.get('source', '학습자료')
            
            if 'page' in metadata:
                source_info += f" (페이지 {metadata['page']})"
            
            context_parts.append(f"[참고자료 {i} - {source_info}]\n{result['text']}\n")
        
        return "\n".join(context_parts)
    
    def clear_collection(self):
        """모든 문서 삭제"""
        self.client.delete_collection(name="elementary_materials")
        self.collection = self.client.create_collection(
            name="elementary_materials",
            metadata={"description": "초등학생 학습 자료"}
        )
    
    def get_stats(self) -> Dict:
        """저장된 문서 통계"""
        data = self.collection.get()
        
        subjects = {}
        for metadata in data['metadatas']:
            subject = metadata.get('subject', '미분류')
            subjects[subject] = subjects.get(subject, 0) + 1
        
        return {
            'total_documents': len(data['ids']),
            'subjects': subjects
        }


# 사용 예시
if __name__ == "__main__":
    # RAG 매니저 초기화
    rag = RAGManager()
    
    # 예시: 수학 개념 추가
    rag.add_text(
        "분수는 전체를 똑같이 나눈 것 중 일부를 나타내는 수예요. "
        "예를 들어, 피자 한 판을 4등분했을 때 그중 1조각은 1/4이 돼요.",
        metadata={
            "subject": "수학",
            "grade": "3학년",
            "topic": "분수"
        }
    )
    
    # 검색 테스트
    results = rag.search("분수가 뭐야?")
    print("검색 결과:", results[0]['text'][:50])