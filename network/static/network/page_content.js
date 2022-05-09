// =============== Brings back to top page and reload when click on Chatter logo
function topPage() {
  window.location.reload();
};

// ============================= Resize small textareas depending on text length
function textareaResize(element) {
  element.style.paddingBottom = "13px";
  element.style.height = "5px";
  element.style.height = (element.scrollHeight)+"px";
}

// ===================================================== Document event listener
document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#all_posts').addEventListener('click', () => loadPosts('All_posts'));
  document.querySelector('#following').addEventListener('click', () => loadPosts('Following'));

  var username = document.querySelector('#username').textContent;
  document.querySelector('#username').addEventListener('click', () => loadPosts(username));

  // By default, load all posts
  loadPosts('All_posts');

});

// ================================================================ CHATTERPOSTS
// ============================================================ Send chatterpost
function sendChatterpost() {

  fetch('/chatterpost', {
    method: 'POST',
    headers: {'X-CSRFToken': csrftoken},
    mode: 'same-origin',
    body: JSON.stringify({
      chatterpost: document.getElementById('compose-message').value
    })
  })
  .then(response => response.json())
  .then(result => {
    var text = Object.values(result);
    var message = document.getElementById("message");
    message.innerHTML = text;
    message.style.display = "block";

    // If message successfully sent, reset message + empty the box
    if (Object.keys(result) == 'message') {
      setTimeout(() => {
        document.getElementById('compose-message').value ='';
      }, 1000);
      message.classList.add('smooth-reset');
      message.style.animationPlayState='running';
      message.onanimationend = () => {
        message.innerHTML = '';
        message.classList.remove('smooth-reset');
        message.style.animationPlayState='initial';
        message.style.display = "none";

        // Check what is the current view
        let viewName = (document.getElementById('view-name').textContent).replace(' ', '_');

        displayChatterposts(viewName, true);
      }
    };
  });
};

// ================================================================== Load posts
function loadPosts(view) {

  viewName = view;

  // Show the view name
  document.querySelector('#posts-view').innerHTML =
    `<div id="user-title"><h2 id="view-name">${viewName.replaceAll('_', ' ')}</h2></div>`;

  // Get back to page 1 everytime the view is changed
  page = 1;
  document.getElementById('btn-up').style.color ="#9900cc";

  displayChatterposts(view, false);
};

// ======================================================== Display chatterposts
function displayChatterposts(view, insert) {

  fetch(`postsview/${view}?page=${page}`)
  .then(response => response.json())
  .then(posts => {

    if (insert) { // Insert new post
      var username = document.getElementById("username").textContent;

      for (let i = 1; i < 3; i++) { // 3 is a "security" value for top checks
        var postId = document.getElementById("id_" + posts[i].id);

        if (username == posts[i].sender && postId == null) {
          // Add new post as the latest on the list
          const postView = document.getElementById('posts-view');
          var newPostDiv = new DOMParser().parseFromString(postDiv(posts[i]), "text/html");
          postView.insertBefore(newPostDiv.body.firstChild, postView.children[1]);
          postView.children[1].classList.add('new-message');
        }
      }
    }
    else { // Construct user infos view
      const followers = posts[0]["followers"];
      const following = posts[0]["following"];
      const chatterposts = posts[0]["postsCount"];

      // Don't display anything if not userview
      if (view != "All_posts" && view != "Following") {

        // Display words in singular or plural depending of numbers
        followerWord = (followers == 1) ? "follower" : "followers";
        chatterpostWord = (chatterposts == 1) ? "chatterpost" : "chatterposts";

        // Display datas in userview
        document.querySelector('#user-title').innerHTML +=
          `<p id="user-info">` +
            `&#9672; &nbsp; <span id="folnumb">${followers} ${followerWord}</span> &nbsp;` +
            `&#9672; &nbsp; ${following} following &nbsp;` +
            `&#9672; &nbsp; ${chatterposts} ${chatterpostWord} &nbsp; &#9672;` +
          `</p>`;
      }

      // Display each post
      for (let i = 1; i < posts.length - 1; i++) { // -1 because of "has next"
        document.querySelector('#posts-view').innerHTML += postDiv(posts[i]);
      }

      // Display page number
      document.getElementById('page-number').innerHTML = `Page ${page}`;

      // Enable or disable the button if next page or not + message
      if (posts[posts.length - 1].has_next == true) {
        document.getElementById('btn-down').style.color ="#df3390";
        document.getElementById('btn-down').disabled = false;
        document.getElementById('end-page').innerHTML = "";
      }
      else {
        document.getElementById('btn-down').style.color ="#9900cc";
        document.getElementById('btn-down').disabled = true;
        document.getElementById('end-page').innerHTML = "Last page";
        document.getElementById("scroll").value = "false";
      }
    };

  });
};

// ============================================== Create div of each Chatterpost
function postDiv(post) {

  var postId = "id_" + post.id;
  var heartId = "heart_" + post.id;
  var sender = post.sender;
  var timestamp = post.timestamp;
  var chatterpost = post.chatterpost;
  var edited = post.edited;
  var deleted = post.deleted;
  var follow = post.follow;
  var likedby = post.likedby;
  var commentsCount = post.comments;

  // Right icons: edit, follow or unfollow
  var username = document.querySelector('#username').textContent;

  if (sender === username) {
    icon = `<i class="fas fa-pen edit mytooltip"
              onclick="editView(${post.id})">
              <span id='text' class="tooltiptext box">Edit this message</span>
            </i>`
  }
  else if (follow == true) {
    icon = `<i class="fa fa-user-check usercheck mytooltip ${sender}"
              onclick="followSender('${sender}', ${follow})">
              <span id='text' class="tooltiptext box">Unfollow this fellow</span>
            </i>`;
  }
  else {
    icon = `<i class="fa fa-user-plus userplus mytooltip ${sender}"
              onclick="followSender('${sender}', ${follow})">
              <span id='text' class="tooltiptext box">Follow this fellow</span>
            </i>`;
  }

  // Solid or regular heart if liked or not by the current user
  heart = (likedby.includes(username)) ? `fas` : `far`;
  // Add "modified" mention if the post has been edited
  edit_mention = (edited) ? `(modified)` : "";
  // Style default text if got deleted
  deleted_txt = (deleted) ? `deleted_txt` : "";

  // Design each post view
  return `<div class="compose-box" id="${postId}">
    <div>
      <p class="intro-sentence">
        <a onclick="loadPosts('${sender}')">
          <strong style="color:#dba6ed">${sender}</strong>
        </a>
        chatted on ${timestamp}:
        <span style="color:#676767">${edit_mention}</span>
      </p>

      ${icon}
    </div>

    <div class="message-box ${deleted_txt}" id="txt${post.id}">${chatterpost}</div>

    <p class="likes-comments">
      <span id="like_${post.id}" style="letter-spacing: 0.5px">${likedby.length}</span>
      <i style="color:#dba6ed" class="${heart} fa-heart" id="${heartId}"
      onclick="like('${post.id}', ${likedby.includes(username)})"></i> &nbsp;

      <span id="comCount_${post.id}" style="letter-spacing: 0.5px">${commentsCount}</span>
      <i style="color:#dba6ed" class="far fa-comment" onclick="showComments(${post.id}, false)"></i>
    </p>

    <div id="comments${post.id}" class="comment-section" style="display:none;">
      <p class="intro-sentence" style="color: #dba6ed; display:none; margin-left: 0;" id="error_msg"></p>
      <textarea rows="1" class="glow" id="compose-comment${post.id}" oninput="textareaResize(this)"
        placeholder="Wanna comment something smart about it?"></textarea>
      <button type="button" name="button" onclick="sendComment(${post.id})"><b>Comment</b></button>
      <div id="displayComments_${post.id}"></div>
    </div>

  </div>`
};

// ================================================================== PAGINATION
// ================================================================= Scroll mode
function scrollMode() {
  // Enable the scrolling option
  document.getElementById("scroll").value = "true";

  //change the color of the icons
  document.getElementById('scroll').style.color ="#df3390";
  document.getElementById('page').style.color ="#9900cc";

  // Make up and down buttons invisible
  document.getElementById('btn-up').style.display = "none";
  document.getElementById('btn-down').style.display = "none";
};

window.onscroll = function () {

  if (document.getElementById("scroll").value == "true") {
    if (window.innerHeight + window.pageYOffset >= document.body.offsetHeight) {
      page += 1;
      view = document.querySelector('#view-name').innerHTML.replaceAll(' ', '_');

      displayChatterposts(view, false);
    };
  };
};

// =================================================================== Page mode
function pageMode() {
  // Disable the scrolling option
  document.getElementById("scroll").value = "false";

  //change the color of the icons
  document.getElementById('scroll').style.color ="#9900cc";
  document.getElementById('page').style.color ="#df3390";

  // Make up and down buttons invisible
  document.getElementById('btn-up').style.display = "block";
  document.getElementById('btn-down').style.display = "block";
};

// =================================================================  buttonDown
function buttonDown() {

  // Increment page
  page += 1;
  document.getElementById('btn-up').style.color ="#df3390";

  showPosts();
};

// ==================================================================== buttonUp
function buttonUp() {

  if (page > 1) {
    page -= 1;

    showPosts();
  }

  if (page < 2)
    document.getElementById('btn-up').style.color ="#9900cc";
};

// =================================================== Show 10 posts at the time
function showPosts() {
  view = document.querySelector('#view-name').innerHTML.replaceAll(' ', '_');

  deletePosts = document.querySelector('#posts-view').childNodes.length - 1;

  for (let i = 1; i <= deletePosts; i++)
    document.querySelector('#posts-view').childNodes[1].remove();

  displayChatterposts(view, false);
}

// ======================================================================== EDIT
// =================================================================== Edit view
function editView(id) {

  thisDiv = document.getElementById(`id_${id}`);

  var taHeight = document.getElementById(`txt${id}`).offsetHeight + "px";

  // Hide 3 first divs for the edit view
  for (i = 0; i < 4; i++) {
    thisDiv.children[i].style.display = "none";
  }

  text = thisDiv.children[1].textContent;

  // Edit view
  thisDiv.innerHTML +=
    `<div>
      <p class="intro-sentence">You are currently editing...</p>
      <i class="fas fa-pen edit cancel-edit mytooltip"
        onclick="stopEdit()">
        <span id='text' class="tooltiptext">Cancel Edit</span>
      </i>
      <textarea style="height:${taHeight}" class="glow" oninput="textareaResize(this)"
        id="edit-message">${text}</textarea>
      <button type="button" name="button" onclick="editPost(${id})"><b>Edit</b></button>
    </div>`;
};

// ================================================================= Cancel edit
function stopEdit() {
  // Show again the parts of the div from this post
  for (i = 0; i < 3; i++) {
    thisDiv.children[i].style.display = "block";
  }

  // Remove the edit field
  thisDiv.children[4].remove();
};

// =================================================================== Edit Post
function editPost(id) {

  fetch(`/editpost/${id}`, {
    headers: {'X-CSRFToken': csrftoken},
    mode: 'same-origin',
    method: 'POST',
    body: JSON.stringify({
    editpost: document.getElementById('edit-message').value
    })
  })
  .then(response => response.json())
  .then(result => {

    // Determine the class of the displayed text
    if (Object.keys(result) == "error") { // error message = red
      newMessage = result.error;
      document.getElementById(`txt${id}`).style.color="red";
    }

    else {
      newMessage = result.message;

      if (result.deleted) // deleted message = grey + italic
        document.getElementById(`txt${id}`).classList.add('deleted_txt');
      else // normal message = white
        document.getElementById(`txt${id}`).classList.remove('deleted_txt');

    }

    // Replace the text in the inbox
    document.getElementById(`txt${id}`).textContent = newMessage;

    // Remove the edit field
    stopEdit();

    // Add animation effect
    document.getElementById(`id_${id}`).classList.add('new-message');
  });
};

// ====================================================================== FOLLOW
// ===================================================== Follow a writer(sender)
function followSender(sender, follow) {

  fetch(`post/${sender}`, {
    method: 'PUT',
    headers: {'X-CSRFToken': csrftoken},
    mode: 'same-origin',
    body: JSON.stringify({
      follow: !follow
    })
  })
  .then(response => {
    // Check status from the backend
    if (response.status == 204) {

      if (follow) {
        // Call function to change icon
        document.querySelectorAll('.' + String(sender)).forEach(changeClassUnfollow);
        // Update amount of followers
        updateFol = -1;
      }
      else {
        // Call function to change icon
        document.querySelectorAll('.' + String(sender)).forEach(changeClassFollow);
        // Update amount of followers
        updateFol = 1;
      }

      // If user view, update amount of followers
      if (document.getElementById("user-info") != null) {

        const numb = parseInt(document.getElementById("folnumb").textContent.split(/[\s]+/)[0]) + updateFol;
        // If there is only one follower, make it singular
        fol = (numb == 1) ? "follower" : "followers";

        document.getElementById("folnumb").innerHTML = numb + " " + fol;
      }
    }
  });
};

// =========================================================== Not followed icon
function changeClassUnfollow(unfollow) {
  // Change class
  unfollow.classList.remove('fa-user-check', 'usercheck');
  unfollow.classList.add('fa-user-plus', 'userplus');

  // Change tooltip text
  unfollow.firstElementChild.textContent = 'Follow this fellow';

  // Reset the onclick function value
  unfollow.setAttribute("onClick", `followSender("${unfollow.classList[2]}", false);`);
};

// =============================================================== Followed icon
function changeClassFollow(follow) {
  // Change class
  follow.classList.remove('fa-user-plus', 'userplus');
  follow.classList.add('fa-user-check', 'usercheck');

  // Change tooltip text
  follow.firstElementChild.textContent = 'Unfollow this fellow';

  // Reset the onclick function value
  follow.setAttribute("onClick", `followSender("${follow.classList[2]}", true);`);
};

// ======================================================================== LIKE
// ================================================================= Like/Unlike
function like(post_id, likedby) {

  fetch(`postid/${post_id}`, {
    method: 'PUT',
    headers: {'X-CSRFToken': csrftoken},
    mode: 'same-origin',
    body: JSON.stringify({
      liked: !likedby
    })
  })
  .then(response => {
    // Check status from the backend
    if (response.status == 204) {

      likeId = document.getElementById(`like_${post_id}`);
      heartId = document.getElementById(`heart_${post_id}`);

      if (likedby) {
        // Change amount of likes
        likeId.innerHTML = parseInt(likeId.textContent) - 1;

        // Change heart style
        heartId.classList.remove('fas');
        heartId.classList.add('far');

        // Reset onlick btn
        heartId.setAttribute("onClick", `like('${post_id}', ${!likedby});`);
      }
      else {
        // Change amount of likes
        likeId.innerHTML = parseInt(likeId.textContent) + 1;

        // Change heart style
        heartId.classList.remove('far');
        heartId.classList.add('animheart');
        heartId.classList.add('fas');

        // Reset onlick btn
        heartId.setAttribute("onClick", `like('${post_id}', ${!likedby});`);
      }

    }
  });

};

// ==================================================================== COMMENTS
// =============================================================== Show comments
function showComments(post_id) {

  var comments = document.getElementById(`comments${post_id}`);

  if (comments.style.display === "none") {
    comments.style.display = "block";
    displayAllComments(post_id, false);
  }
  else {
    comments.style.display = "none";
    // Clear comments
    document.getElementById(`displayComments_${post_id}`).innerHTML='';
  }
};

// ======================================================== Display all comments
function displayAllComments(post_id, insert) {

  fetch(`commentsview/${post_id}`)
  .then(response => response.json())
  .then(comments => {

    commentsCount = Object.keys(comments).length;
    var commentsDiv = document.getElementById(`displayComments_${post_id}`);

    cLast = (insert) ? 0 : commentsCount - 1;

    // Make a for loop throught each comments to display them
    for (let c = cLast; c >= 0 ; c--) {

      commentsDiv.innerHTML =
      `<div>
        <p class="comment-sentence">
          <a onclick="loadPosts('${comments[c].commentor}')">
            <strong style="color:#dba6ed">${comments[c].commentor}</strong>
          </a>
          commented on ${comments[c].timestamp}:
        </p>

        <div class="comment-box">${comments[c].comment}</div>
      </div>` + commentsDiv.innerHTML;

    };

    // Add animation effect
    if (insert) {
      commentsDiv.children[0].children[1].classList.add('new-message');
    }

  });
};

// ================================================================ Send comment
function sendComment(post_id) {
  fetch(`/comment/${post_id}`, {
    method: 'POST',
    headers: {'X-CSRFToken': csrftoken},
    mode: 'same-origin',
    body: JSON.stringify({
      comment: document.getElementById(`compose-comment${post_id}`).value,
    })
  })
  .then(response => response.json())
  .then(result => {

    var message = document.getElementById("error_msg");

    if (Object.keys(result) == 'message') { // Successfully sent
      // Update amount of comments
      var commentsCount = Object.values(result);
      // Display it near the comments icon
      document.getElementById(`comCount_${post_id}`).innerHTML = commentsCount;

      // Empty comment text field
      document.getElementById(`compose-comment${post_id}`).value ="";
      // Hide error message field
      message.style.display = "none";

      // Call the display function to insert the new comment
      displayAllComments(post_id, true);
    }
    else { // Show error message
      var text = Object.values(result);
      message.innerHTML = text;
      message.style.display = "block";
    }

  });
};
