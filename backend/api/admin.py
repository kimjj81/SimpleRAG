from django.contrib import admin
from .models import File, ChatSession, ChatMessage

admin.site.register(File)
admin.site.register(ChatSession)
admin.site.register(ChatMessage)
