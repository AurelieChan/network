const username ="Aurélie"

function MessageForm() {

  const placeholder ="What's up today, " + username + "?"

  return (
    <form className="purple-box">
      <textarea rows="3" cols="50"placeholder={placeholder}></textarea>
      <button type="button">Send</button>
    </form>
  )
}

ReactDOM.render(<MessageForm />, document.getElementById('page_content'));

function ReadMessages() {

  return (
    <div className="purple-box">
      <p className="intro-sentence">(Name) chatted on (date, time): (+ Follow)</p>
      <div className="message-box">(Message) bla bla bla... </div>
      <p className="intro-sentence">(Likes), maybe (comments)</p>
    </div>
  )
}

ReactDOM.render(<ReadMessages />, document.getElementById('test'));
