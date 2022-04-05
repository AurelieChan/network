from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    following = models.ManyToManyField('self', symmetrical=False, blank=True, related_name="followers")

class Post(models.Model):
    sender = models.ForeignKey("User", on_delete=models.CASCADE, related_name="sent_post")
    chatterpost = models.TextField(max_length = 800)
    timestamp = models.DateTimeField(auto_now_add=True)
    likedby = models.ManyToManyField(User, blank=True, related_name="like")

    def serialize(self):
        return {
            "id": self.id,
            "sender": self.sender.username,
            "chatterpost": self.chatterpost,
            "timestamp": self.timestamp.strftime("%b %d %Y, %I:%M %p"),
            # For loop to get a list of usernames that liked one post
            "likedby": [like.username for like in self.likedby.all()]
        }
