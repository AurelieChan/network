import json
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.db import IntegrityError
from django.http import HttpResponse, HttpResponseRedirect
from django.http import JsonResponse
from django.shortcuts import render
from django.urls import reverse
# from django.views.decorators.csrf import csrf_exempt

from .models import User, Post, Comment

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
@login_required
def compose(request):

    # Composing a new post must be via POST
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
def postsview(request, view):

    # Filter posts according requested view
    if view.casefold() == "all_posts":
        posts = Post.objects.all()
        box = {}

    elif view.casefold() == "following":
        followedUsers = request.user.following.all()
        posts = Post.objects.filter(sender__in=followedUsers)
        box = {}

    else:
        try:
            # Posts from that specific user
            posts = User.objects.get(username=view).sent_post.all()

            # Store basic infos of the specific user in a box
            box =   {   "followers": User.objects.get(username=view).followers.count(),
                        "following": User.objects.get(username=view).following.count(),
                        "postsCount": User.objects.get(username=view).sent_post.count()
                    }

        except:
            return JsonResponse({"error": "Invalid posts view."}, status=400)

    # Empty list of posts
    listOfPosts = []

    # Add the "box" as the first item to the dictionary
    listOfPosts.append(box)

    posts = posts.order_by("-timestamp").all()

    # Check if the sender of each post is followed
    for post in posts:

        individualPost = post.serialize()
        sender = individualPost["sender"]

        if request.user.following.filter(username=sender):
            follow = True
        else:
            follow = False

        # Add the data to the dictionary
        individualPost["follow"] = follow

        # Add amount of comments for each post
        individualPost["comments"] = Comment.objects.filter(post_id=post.id).count()

        # Then append all the appropriate posts
        listOfPosts.append(individualPost)

    return JsonResponse(listOfPosts, safe=False)

# ========================================================================= Edit
@login_required
def edit(request, post_id):

    # Editing a post must be via POST
    if request.method != "POST":
        return JsonResponse({"error": "POST request required."}, status=400)

    # Get contents of the edited message
    data = json.loads(request.body)
    editpost = data.get("editpost")

    # Get name of the sender according to the id in the db
    sender = Post.objects.get(id=post_id).sender.username

    # if sender = the current user, then proceed to the next steps
    if sender == str(request.user):

        post = Post.objects.get(id=post_id)

        if editpost == "":
            post.chatterpost = "This message has been deleted by the user."
            post.edited = True
            post.deleted = True

        else:
            post.chatterpost = editpost
            post.edited = True
            post.deleted = False

        post.save()
        return JsonResponse({
            "message": post.chatterpost,
            "deleted": post.deleted
        })

    else:
        return JsonResponse({"error": "This message cannot be updated."}, status=400)

# ======================================================================= Follow
def follow(request, sender):

    # Query for requested sender
    try:
        senderObj = User.objects.get(username=sender)
    except Post.DoesNotExist:
        return JsonResponse({"error": "Sender not found."}, status=404)

    if request.method == "PUT":
        # Get if follow is true or false:
        data = json.loads(request.body)
        follow = data["follow"]

        # Update the DB:
        if follow:
            User.objects.get(username=request.user).following.add(senderObj)
        else:
            User.objects.get(username=request.user).following.remove(senderObj)
        return HttpResponse(status=204)

    else:
        return JsonResponse({
            "error": "GET or PUT request required."
        }, status=400)

# ======================================================================== Likes
def like(request, post_id):

    if request.method == "PUT":
        # Get if likedby is true or false:
        data = json.loads(request.body)
        liked = data["liked"]

        # Update the DB:
        if liked:
            # Add current user to the likedby list of current post
            Post.objects.get(id=post_id).likedby.add(User.objects.get(username=request.user))
        else:
            # Remove current user from the likedby list of current post
            Post.objects.get(id=post_id).likedby.remove(User.objects.get(username=request.user))

        return HttpResponse(status=204)

    else:
        return JsonResponse({
            "error": "GET or PUT request required."
        }, status=400)

# ====================================================================== Comment
@login_required
def comment(request, post_id):
        # Composing a new post must be via POST
        if request.method != "POST":
            return JsonResponse({"error": "POST request required."}, status=400)

        # Get contents of the message
        data = json.loads(request.body)
        comment = data.get("comment")
        if comment == "":
            return JsonResponse({"error": "Are you sure you don't have anything to say?"})

        else:
            comment = Comment(
                commentor=request.user,
                comment=comment,
                post=Post.objects.get(id=post_id)
            )
            comment.save()

            # If comment sent successufully, send new count of comments to the FE
            countComments = Comment.objects.filter(post_id=post_id).count()
            return JsonResponse({"message": countComments}, status=201)

# ================================================================ Comments view
def commentsview(request, post_id):

    comments = Comment.objects.order_by("-timestamp").filter(post_id=post_id)
    listOfComments = []

    for comment in comments:
        individualComment = comment.serialize()
        listOfComments.append(individualComment)

    return JsonResponse(listOfComments, safe=False)
