// =============== Brings back to top page and reload when click on Chatter logo
function topPage() {
  window.location.reload();
};

// ===================================================== Document event listener
document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#all_posts').addEventListener('click', () => loadPosts('all_posts'));
  document.querySelector('#following').addEventListener('click', () => loadPosts('following'));

  var username = document.querySelector('#username').textContent;
  document.querySelector('#username').addEventListener('click', () => loadPosts(username));

  // By default, load all posts
  loadPosts('all_posts');

  // Auto-resize textareas as the text gets longer.
  // https://stackoverflow.com/questions/454202/creating-a-textarea-with-auto-resize
  const text = document.getElementsByTagName("textarea");
  for (let i = 0; i < text.length; i++) {
    text[i].setAttribute("style", "height:" + (text[i].scrollHeight) + "px; overflow-y:hidden;");
    text[i].addEventListener("input", OnInput, false);
  };

  function OnInput() {
    this.style.height = "auto";
    this.style.height = (this.scrollHeight) + "px";
  };

});

// ============================================================ Send chatterpost
function sendChatterpost() {

  fetch('/chatterpost', {
    method: 'POST',
    body: JSON.stringify({
      chatterpost: document.getElementById('compose-message').value
    })
  })
  .then(response => response.json())
  .then(result => {
    var text = Object.values(result);
    var message = document.getElementById("message");
    message.innerHTML = text;

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

        // Check what is the current view
        let viewName = (document.getElementById('view-name').textContent).replace(' ', '_');

        displayChatterposts(viewName, true);
      }
    };
  });
};

// ================================================================== Load posts
function loadPosts(view) {

  viewName = `${view.charAt(0).toUpperCase() + view.slice(1)}`;

  // Show the view name
  document.querySelector('#posts-view').innerHTML =
    `<div id="user-title"><h2 id="view-name">${viewName.replaceAll('_', ' ')}</h2></div>`;

  displayChatterposts(view, false);
};

// ======================================================== Display chatterposts
function displayChatterposts(view, insert) {
// True for insertion/ False for just load

  fetch(`postsview/${view}`)
  .then(response => response.json())
  .then(posts => {

    if (insert) {
      // Insert new post
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
    else {
      // Construct user infos view
      const followers = posts[0]["followers"];
      const following = posts[0]["following"];
      const chatterposts = posts[0]["postsCount"];

      // Don't display anything if not userview
      if (view != "all_posts" && view != "following") {

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

      // Load posts. Starts at 1 because 0 contains the box with user's data.
      for (let i = 1; i < posts.length; i++) {
        document.querySelector('#posts-view').innerHTML += postDiv(posts[i]);
      }
    }
  });
};

// ============================================== Create div of each Chatterpost
function postDiv(post) {

  var postId = "id_" + post.id;
  var heartId = "heart_" + post.id;
  var sender = post.sender;
  var timestamp = post.timestamp;
  var chatterpost = post.chatterpost;
  var follow = post.follow;
  var likedby = post.likedby;

  // Right icons: edit, follow or unfollow
  var username = document.querySelector('#username').textContent;

  if (sender === username) {
    icon = `<i class="fas fa-pen edit mytooltip"
              onclick="editView(${post.id})">
              <span id='text' class="tooltiptext">Edit this message</span>
            </i>`
  }
  else if (follow == true) {
    icon = `<i class="fa fa-user-check usercheck mytooltip ${sender}"
              onclick="followSender('${sender}', ${follow})">
              <span id='text' class="tooltiptext">Unfollow this fellow</span>
            </i>`;
  }
  else {
    icon = `<i class="fa fa-user-plus userplus mytooltip ${sender}"
              onclick="followSender('${sender}', ${follow})">
              <span id='text' class="tooltiptext">Follow this fellow</span>
            </i>`;
  }

  // Solid or regular heart if liked or not by the current user
  heart = (likedby.includes(username)) ? `fas` : `far`;

  // Design each post view
  return `<div class="purple-box" id="${postId}">
    <div>
      <p class="intro-sentence">
        <a onclick="loadPosts('${sender}')">
          <strong style="color:#dba6ed">${sender}</strong>
        </a>
        chatted on ${timestamp}:
      </p>
      ${icon}
    </div>
    <div class="message-box">${chatterpost}</div>
    <p class="likes-comments">
      <span id="like_${post.id}">${likedby.length}</span>
      <i style="color:#dba6ed" class="${heart} fa-heart" id="${heartId}"
      onclick="like('${post.id}', ${likedby.includes(username)})"></i> &nbsp;

      0 <i style="color:#dba6ed" class="far fa-comment"></i>
    </p>
  </div>`
};

// =================================================================== Edit view
function editView(id) {

  thisDiv = document.getElementById(`id_${id}`);

  // Hide 3 first divs for the edit view
  for (i = 0; i < 3; i++) {
    thisDiv.children[i].style.display = "none";
  }

  text = thisDiv.children[1].textContent;

  // Edit view
  thisDiv.innerHTML +=
    `<div>
      <p class="intro-sentence">You are currently editing...</p>
      <i class="fas fa-pen edit cancel-edit mytooltip"
        onclick="cancelEdit()">
        <span id='text' class="tooltiptext">Cancel Edit</span>
      </i>
      <textarea>${text}</textarea>
      <button type="button" name="button" onclick="sendChatterpost()"><b>Edit</b></button>
    </div>`;
};

// ================================================================= Cancel edit
function cancelEdit() {
  // Show again the parts of the div from this post
  for (i = 0; i < 3; i++) {
    thisDiv.children[i].style.display = "block";
  }

  // Remove the edit field
  thisDiv.children[3].remove();
};

// =================================================================== Edit Post
function editPost() {

}

// ============================================================= Follow/Unfollow
function followSender(sender, follow) {

  fetch(`post/${sender}`, {
    method: 'PUT',
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

// ======================================================================== Like
function like(post_id, likedby) {

  fetch(`postid/${post_id}`, {
    method: 'PUT',
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

//pagination and comments
