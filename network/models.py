from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils import timezone
from django.utils.timezone import now

class User(AbstractUser):
    following = models.ManyToManyField('self', symmetrical=False, blank=True, related_name="followers")

class Post(models.Model):
    sender = models.ForeignKey("User", on_delete=models.CASCADE, related_name="sent_post")
    chatterpost = models.TextField(max_length = 500)
    timestamp = models.DateTimeField(auto_now_add=True)
    edited = models.BooleanField(default=False)
    deleted = models.BooleanField(default=False)
    likedby = models.ManyToManyField(User, blank=True, related_name="like")

    def serialize(self):
        return {
            "id": self.id,
            "sender": self.sender.username,
            "chatterpost": self.chatterpost,
            "timestamp": self.timestamp.strftime("%b %d %Y, %I:%M %p"),
            "edited": self.edited,
            "deleted": self.deleted,
            # For loop to get a list of usernames that liked one post
            "likedby": [like.username for like in self.likedby.all()]
        }

class Comment(models.Model):
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name="comments")
    comment = models.CharField(max_length = 500)
    commentor = models.ForeignKey(User, on_delete=models.CASCADE, related_name="commentedby")
    timestamp = models.DateTimeField(default=timezone.now)

    def serialize(self):
        return {
            "post_id": self.post.id,
            "comment": self.comment,
            "commentor": self.commentor.username,
            "timestamp": self.timestamp.strftime("%b %d %Y, %I:%M %p")
        }
