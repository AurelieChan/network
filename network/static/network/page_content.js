var username = "Aurélie";

function MessageForm() {

  var placeholder = "What's up today, " + username + "?";

  return React.createElement(
    "form",
    { className: "purple-box" },
    React.createElement("textarea", { rows: "3", cols: "50", placeholder: placeholder }),
    React.createElement(
      "button",
      { type: "button" },
      "Send"
    )
  );
}

ReactDOM.render(React.createElement(MessageForm, null), document.getElementById('page_content'));



function ReadMessages() {

  return React.createElement(
    "div",
    { className: "purple-box" },
    React.createElement(
      "p",
      { className: "intro-sentence" },
      "(Name) chatted on (date, time): (+ Follow)"
    ),
    React.createElement(
      "div",
      { className: "message-box" },
      "(Message) bla bla bla... "
    ),
    React.createElement(
      "p",
      { className: "intro-sentence" },
      "(Likes), maybe (comments)"
    )
  );
}

ReactDOM.render(React.createElement(ReadMessages, null), document.getElementById('test'));
