
from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),

    #API Routes
    path("chatterpost", views.compose, name="compose"),
    path("postsview/<str:view>", views.postsview, name="posts"),
    path("post/<str:sender>", views.follow, name="follow")
]
