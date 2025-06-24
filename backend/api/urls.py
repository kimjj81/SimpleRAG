from django.urls import path
from . import views

urlpatterns = [
    # File endpoints
    path('files/', views.FileListView.as_view(), name='file-list'),
    path('files/<int:pk>/', views.FileDetailView.as_view(), name='file-detail'),
    path('files/upload/', views.FileUploadView.as_view(), name='file-upload'),
    
    # Chat session endpoints
    path('chat-sessions/', views.ChatSessionListCreateView.as_view(), name='chat-session-list-create'),
    path('chat-sessions/<int:pk>/', views.ChatSessionDetailView.as_view(), name='chat-session-detail'),
    
    # Chat message endpoints
    path('chat-messages/', views.ChatMessageListCreateView.as_view(), name='chat-message-list-create'),
    path('chat-messages/<int:pk>/', views.ChatMessageDetailView.as_view(), name='chat-message-detail'),
    
    # User endpoints
    path('users/', views.UserListView.as_view(), name='user-list'),
    
    # Legacy endpoints for backward compatibility
    path('upload/', views.FileUploadView.as_view(), name='file-upload-legacy'),
    path('sessions/', views.ChatSessionListCreateView.as_view(), name='chat-session-list-create-legacy'),
    path('sessions/<int:pk>/', views.ChatSessionDetailView.as_view(), name='chat-session-detail-legacy'),
    path('messages/', views.ChatMessageListCreateView.as_view(), name='chat-message-list-create-legacy'),
]