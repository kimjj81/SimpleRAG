from rest_framework import serializers
from .models import File, ChatSession, ChatMessage
from django.contrib.auth.models import User

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'is_active', 'is_staff', 'is_superuser', 'date_joined', 'last_login']

class FileSerializer(serializers.ModelSerializer):
    class Meta:
        model = File
        fields = "__all__"

class ChatSessionSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    message_count = serializers.IntegerField(read_only=True)
    
    class Meta:
        model = ChatSession
        fields = ['id', 'user', 'created_at', 'message_count']

class ChatMessageSerializer(serializers.ModelSerializer):
    session = ChatSessionSerializer(read_only=True)
    
    class Meta:
        model = ChatMessage
        fields = ['id', 'session', 'role', 'content', 'created_at', 'input_tokens', 'output_tokens']