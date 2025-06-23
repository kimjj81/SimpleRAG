import os
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.document_loaders import (
    PyPDFLoader,
    TextLoader,
    Docx2txtLoader,
    UnstructuredExcelLoader,
)
from langchain_community.vectorstores import OpenSearchVectorSearch
from langchain_openai import OpenAIEmbeddings

def get_document_loader(file_path):
    print(f"File path: {file_path}")
    file_extension = os.path.splitext(file_path)[1].lower()
    print(f"File extension: {file_extension}")

    if file_extension == ".pdf":
        return PyPDFLoader(file_path)
    elif file_extension == ".txt" or file_extension == ".md":
        return TextLoader(file_path)
    elif file_extension == ".docx":
        return Docx2txtLoader(file_path)
    elif file_extension in [".xlsx", ".xls"]:
        return UnstructuredExcelLoader(file_path)
    else:
        raise ValueError(f"Unsupported file type: {file_extension}")

def chunk_document(document):
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=1000,
        chunk_overlap=200,
        length_function=len,
        is_separator_regex=False,
    )
    return text_splitter.split_documents(document)

def get_opensearch_vector_store():
    opensearch_url = "https://admin:{}@opensearch:9200".format(os.environ.get("OPENSEARCH_INITIAL_ADMIN_PASSWORD"))
    embeddings = OpenAIEmbeddings()
    return OpenSearchVectorSearch(
        opensearch_url=opensearch_url,
        index_name="rag-index",
        embedding_function=embeddings,
        engine="lucene",  # Changed from deprecated nmslib to lucene
        http_auth=("admin", os.environ.get("OPENSEARCH_INITIAL_ADMIN_PASSWORD")),
        use_ssl=True,
        verify_certs=False,
        ssl_assert_hostname=False,
        ssl_show_warn=False,
    )

def embed_and_store(chunks):
    vector_store = get_opensearch_vector_store()
    vector_store.add_documents(chunks)

def process_file(file_path):
    loader = get_document_loader(file_path)
    document = loader.load()
    chunks = chunk_document(document)
    embed_and_store(chunks)
