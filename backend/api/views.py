from rest_framework import generics
from .models import ChatSession, ChatMessage, File
from .serializers import ChatSessionSerializer, ChatMessageSerializer, FileSerializer, UserSerializer
from django.contrib.auth.models import User
from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response
from rest_framework import status
from .rag import process_file, get_opensearch_vector_store
import os
from django.core.files.storage import default_storage
from django.conf import settings
from langchain_openai import ChatOpenAI
from langchain.chains import ConversationalRetrievalChain
from langchain_community.callbacks.manager import get_openai_callback

class FileUploadView(APIView):
    parser_classes = (MultiPartParser, FormParser)

    def post(self, request, *args, **kwargs):
        file_obj = request.data['file']
        file_name = file_obj.name
        
        # Ensure the uploads directory exists
        upload_dir = os.path.join(settings.MEDIA_ROOT, 'uploads')
        os.makedirs(upload_dir, exist_ok=True)
        
        file_path = os.path.join(upload_dir, file_name)
        
        with default_storage.open(file_path, 'wb+') as destination:
            for chunk in file_obj.chunks():
                destination.write(chunk)
        
        # Create a File object and save it to the database
        file_instance = File.objects.create(name=file_name, file=file_path)
        
        process_file(file_path)
        
        return Response({"status": "success"}, status=status.HTTP_201_CREATED)

class ChatSessionListCreateView(generics.ListCreateAPIView):
    queryset = ChatSession.objects.all()
    serializer_class = ChatSessionSerializer

class ChatSessionDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = ChatSession.objects.all()
    serializer_class = ChatSessionSerializer

class ChatMessageListCreateView(generics.ListCreateAPIView):
    queryset = ChatMessage.objects.all()
    serializer_class = ChatMessageSerializer

    def perform_create(self, serializer):
        session = serializer.validated_data['session']
        user_message = serializer.save()

        # RAG logic
        vector_store = get_opensearch_vector_store()
        llm = ChatOpenAI(model_name="gpt-3.5-turbo", temperature=0)
        retriever = vector_store.as_retriever()
        qa = ConversationalRetrievalChain.from_llm(llm, retriever=retriever)
        
        chat_history = []
        for message in session.messages.all():
            if message.role == 'user':
                chat_history.append((message.content, ''))
            else:
                chat_history[-1] = (chat_history[-1][0], message.content)

        with get_openai_callback() as cb:
            result = qa({"question": user_message.content, "chat_history": chat_history})
        
        assistant_message = ChatMessage.objects.create(
            session=session,
            role='assistant',
            content=result['answer'],
            input_tokens=cb.prompt_tokens,
            output_tokens=cb.completion_tokens
        )

class UserListView(generics.ListAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer

class FileListView(generics.ListAPIView):
    queryset = File.objects.all()
    serializer_class = FileSerializer
