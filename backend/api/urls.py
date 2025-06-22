from django.urls import path
from . import views

urlpatterns = [
    path('upload/', views.FileUploadView.as_view(), name='file-upload'),
    path('sessions/', views.ChatSessionListCreateView.as_view(), name='chat-session-list-create'),
    path('sessions/<int:pk>/', views.ChatSessionDetailView.as_view(), name='chat-session-detail'),
    path('messages/', views.ChatMessageListCreateView.as_view(), name='chat-message-list-create'),
    path('users/', views.UserListView.as_view(), name='user-list'),
    path('files/', views.FileListView.as_view(), name='file-list'),
]
