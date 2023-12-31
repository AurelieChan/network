
from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),

    #API Routes
    path("chatterpost", views.compose, name="compose"),
    path("editpost/<str:post_id>", views.edit, name="edit"),
    path("postsview/<str:view>", views.postsview, name="posts"),
    path("post/<str:sender>", views.follow, name="follow"),
    path("postid/<str:post_id>", views.like, name="like"),
    path("comment/<str:post_id>", views.comment, name="comment"),
    path("commentsview/<str:post_id>", views.commentsview, name="commentsview")
]
