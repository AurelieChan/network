// =============== Brings back to top page and reload when click on Chatter logo
function topPage() {
  window.location.reload();
}

// ===================================================== Document event listener
document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#all_posts').addEventListener('click', () => load_posts('all_posts'));
  document.querySelector('#following').addEventListener('click', () => load_posts('following'));

  // var username = document.getElementById('username').textContent; // can be better
  // document.querySelector('#username').addEventListener('click', () => load_posts(username));

  // By default, load all posts
  load_posts('all_posts');

  // Auto-resize textareas as the text gets longer.
  // https://stackoverflow.com/questions/454202/creating-a-textarea-with-auto-resize
  const text = document.getElementsByTagName("textarea");
  for (let i = 0; i < text.length; i++) {
    text[i].setAttribute("style", "height:" + (text[i].scrollHeight) + "px; overflow-y:hidden;");
    text[i].addEventListener("input", OnInput, false);
  }

  function OnInput() {
    this.style.height = "auto";
    this.style.height = (this.scrollHeight) + "px";
  }

})

// ============================================================ Send chatterpost
function send_chatterpost() {

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
        let viewName = (document.getElementById('view-name').textContent).replace(' ', '_').toLowerCase();

        display_chatterposts(viewName, true);

      }
    }
  });
};

// ================================================================== Load posts
function load_posts(view) {

  viewName = `${view.charAt(0).toUpperCase() + view.slice(1)}`;

  // Show the view name
  document.querySelector('#posts-view').innerHTML =
    `<h2 id="view-name">${viewName.replaceAll('_', ' ')}</h2>`;

  display_chatterposts(view, false);
};

// ======================================================== Display chatterposts
function display_chatterposts(view, insert) {
// True for insertion/ False for just load

  fetch(`postsview/${view}`)
  .then(response => response.json())
  .then(posts => {

    if (insert) {
      // Insert new post
      var username = document.getElementById('username').textContent;

      for (let i = 0; i < 3; i++) { // 3 is a "security" value for top checks
        var postId = document.getElementById("id_" + posts[i].id);

        if (username == posts[i].sender && postId == null) {
          // Add new post as the latest on the list
          const postView = document.getElementById('posts-view');
          // document.getElementById('posts-view').insertAdjacentHTML("afterbegin", postDiv(posts[i]));
          // var postDivString = postDiv(posts[i]);
          var newPostDiv = new DOMParser().parseFromString(postDiv(posts[i]), "text/html");
          postView.insertBefore(newPostDiv.body.firstChild, postView.children[1]);
        }
      }

    }
    else {
      // Load posts
      for (let i = 0; i < posts.length; i++) {
        document.querySelector('#posts-view').innerHTML += postDiv(posts[i]);
      }
    }
  });
};

// ============================================== Create div of each Chatterpost
function postDiv(post) {

  var postId = "id_" + post.id;
  var sender = post.sender;
  var timestamp = post.timestamp;
  var chatterpost = post.chatterpost;

  // var following = follow.following;
  // If following other icon
  // Else

  // Design each post view
  return `<div class="purple-box" id="${postId}">
    <div>
      <p class="intro-sentence">
        <strong style="color:#dba6ed">${sender}</strong> chatted on ${timestamp}:
      </p>
      <i class="fa fa-user-plus userplus mytooltip">
        <span id='text' class="tooltiptext">Follow this fellow</span>
      </i>
      <i class="fas fa-pen edit mytooltip">
        <span id='text' class="tooltiptext">Edit this message</span>
      </i>
    </div>
    <div class="message-box">${chatterpost}</div>
    <p class="likes-comments">
      0 <i style="color:#dba6ed" class="far fa-heart"></i> &nbsp;
      0 <i style="color:#dba6ed" class="far fa-comment"></i>
    </p>
  </div>`
}
