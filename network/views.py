import json
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.db import IntegrityError
from django.http import HttpResponse, HttpResponseRedirect
from django.http import JsonResponse
from django.shortcuts import render
from django.urls import reverse
from django.views.decorators.csrf import csrf_exempt

from .models import User, Post

# ======================================================================== Index
def index(request):
    # Authenticated users view their inbox
    if request.user.is_authenticated:
        return render(request, "network/index.html")

    # Everyone else is prompted to sign in
    else:
        return HttpResponseRedirect(reverse("login"))

# =================================================================== Login View
def login_view(request):
    if request.method == "POST":

        # Attempt to sign user in
        username = request.POST["username"]
        password = request.POST["password"]
        user = authenticate(request, username=username, password=password)

        # Check if authentication successful
        if user is not None:
            login(request, user)
            return HttpResponseRedirect(reverse("index"))
        else:
            return render(request, "network/login.html", {
                "message": "Invalid username and/or password."
            })
    else:
        return render(request, "network/login.html")

# ================================================================== Logout View
def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse("index"))

# ===================================================================== Register
def register(request):
    if request.method == "POST":
        username = request.POST["username"]
        email = request.POST["email"]

        # Ensure password matches confirmation
        password = request.POST["password"]
        confirmation = request.POST["confirmation"]
        if password != confirmation:
            return render(request, "network/register.html", {
                "message": "Passwords must match."
            })

        # Attempt to create new user
        try:
            user = User.objects.create_user(username, email, password)
            user.save()
        except IntegrityError:
            return render(request, "network/register.html", {
                "message": "Username already taken."
            })
        login(request, user)
        return HttpResponseRedirect(reverse("index"))
    else:
        return render(request, "network/register.html")

# ====================================================================== Compose
@csrf_exempt
@login_required
def compose(request):

    # Composing a new email must be via POST
    if request.method != "POST":
        return JsonResponse({"error": "POST request required."}, status=400)

    # Get contents of the message
    data = json.loads(request.body)
    chatterpost = data.get("chatterpost")
    if chatterpost == "":
        return JsonResponse({"error": "Are you sure you don't have anything to say?"})

    else:
        chatterpost = Post(
            sender=request.user,
            chatterpost=chatterpost
        )
        chatterpost.save()

        return JsonResponse({"message": "Message sent successfully."}, status=201)

# ==================================================================== Post View
@login_required
def postsview(request, view):

    # Filter posts according requested view
    if view == "all_posts":
        posts = Post.objects.all()

    elif view == "following":
        followedUsers = request.user.following.all()
        posts = Post.objects.filter(sender__in=followedUsers)

    # elif view == request.user.username:
    #     posts = Post.objects.filter(sender__in=request.user.id)

    else:
        return JsonResponse({"error": "Invalid posts view."}, status=400)

    # # Check if the sender of each post is followed
    # for post in posts:
    #     if sender.id in following.id:
    #         follow == True
    #     else:
    #         follow == False
    #
    #     # add the data to the dictionary
    #     posts = post.serialize()
    #     posts["follow"] = follow

    # Return posts in reverse chronologial order
    posts = posts.order_by("-timestamp").all()
    # return JsonResponse([post.serialize() for post in posts], safe=False)
    return JsonResponse([post.serialize() for post in posts], safe=False)

# ======================================================================== Likes
# def like(request):
#
#     if request.method == "POST":
#         current_username = request.user.username
#         current_user = User.objects.get(username=current_username)
#         post_id = Post.objects.get(id__exact= id).id
#         like = listing.watchedby.filter(username=current_username)
#         is_watching = watching.exists()
#
#         if is_watching:
#             listing.watchedby.remove(current_user)
#
#         else:
#             listing.watchedby.add(current_user)
#
#     return JsonResponse({})
