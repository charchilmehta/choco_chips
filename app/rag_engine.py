import os
import json
from typing import List, Dict, Any, Tuple
import openai
from langchain.embeddings import OpenAIEmbeddings
from langchain.vectorstores import Chroma
from langchain.text_splitter import CharacterTextSplitter
from langchain.chat_models import ChatOpenAI
from langchain.prompts import ChatPromptTemplate
from langchain.chains import RetrievalQA
from app.config import Config

class RAGEngine:
    """RAG-powered copilot for industrial knowledge"""
    
    def __init__(self, collection_name: str = "industrial_docs"):
        self.collection_name = collection_name
        self.embeddings = None
        self.vector_store = None
        self.llm = None
        self.qa_chain = None
        self._initialize()
    
    def _initialize(self):
        """Initialize RAG components"""
        try:
            api_key = Config.OPENAI_API_KEY
            if not api_key:
                raise ValueError("OPENAI_API_KEY not set")
            
            # Initialize embeddings
            self.embeddings = OpenAIEmbeddings(openai_api_key=api_key)
            
            # Initialize vector store
            persist_dir = Config.EMBEDDINGS_DIR
            os.makedirs(persist_dir, exist_ok=True)
            
            self.vector_store = Chroma(
                collection_name=self.collection_name,
                embedding_function=self.embeddings,
                persist_directory=persist_dir
            )
            
            # Initialize LLM
            self.llm = ChatOpenAI(
                model_name="gpt-3.5-turbo",
                temperature=0.7,
                openai_api_key=api_key
            )
            
            # Create QA chain
            self.qa_chain = RetrievalQA.from_chain_type(
                llm=self.llm,
                chain_type="stuff",
                retriever=self.vector_store.as_retriever(search_kwargs={"k": 3}),
                return_source_documents=True
            )
        except Exception as e:
            print(f"RAG initialization error: {e}")
    
    def add_documents(self, documents: List[Dict[str, str]]):
        """Add documents to vector store"""
        try:
            texts = []
            metadatas = []
            
            for doc in documents:
                # Split long documents
                splitter = CharacterTextSplitter(
                    chunk_size=500,
                    chunk_overlap=50
                )
                chunks = splitter.split_text(doc.get('content', ''))
                
                for chunk in chunks:
                    texts.append(chunk)
                    metadatas.append({
                        'source': doc.get('filename', 'unknown'),
                        'doc_type': doc.get('type', 'unknown')
                    })
            
            # Add to vector store
            if texts and self.vector_store:
                self.vector_store.add_texts(texts, metadatas=metadatas)
                self.vector_store.persist()
        except Exception as e:
            print(f"Error adding documents: {e}")
    
    def query(self, question: str) -> Dict[str, Any]:
        """Query the knowledge base using RAG"""
        try:
            if not self.qa_chain:
                return {
                    'answer': 'RAG engine not initialized',
                    'sources': [],
                    'confidence': 0.0
                }
            
            result = self.qa_chain(question)
            
            sources = []
            if 'source_documents' in result:
                for doc in result['source_documents']:
                    sources.append({
                        'document': doc.metadata.get('source', 'unknown'),
                        'doc_type': doc.metadata.get('doc_type', 'unknown'),
                        'snippet': doc.page_content[:200]
                    })
            
            return {
                'answer': result.get('result', 'No answer found'),
                'sources': sources,
                'confidence': 0.8  # Placeholder confidence score
            }
        except Exception as e:
            return {
                'answer': f'Error querying: {str(e)}',
                'sources': [],
                'confidence': 0.0
            }
    
    def get_similar_documents(self, query: str, k: int = 5) -> List[Dict[str, Any]]:
        """Find similar documents to a query"""
        try:
            if not self.vector_store:
                return []
            
            results = self.vector_store.similarity_search(query, k=k)
            
            similar_docs = []
            for doc in results:
                similar_docs.append({
                    'source': doc.metadata.get('source', 'unknown'),
                    'type': doc.metadata.get('doc_type', 'unknown'),
                    'content': doc.page_content,
                    'relevance_score': 0.8
                })
            
            return similar_docs
        except Exception as e:
            print(f"Error finding similar documents: {e}")
            return []
