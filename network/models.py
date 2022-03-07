from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    pass

class Message(models.Model):
    user = models.ForeignKey("User", on_delete=models.CASCADE, related_name="messages")
    sender = models.ForeignKey("User", on_delete=models.PROTECT, related_name="messages_sent")
    body = models.TextField(blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)
