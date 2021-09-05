/* eslint-disable no-alert */
/* eslint-disable no-inner-declarations */
/* eslint-disable no-use-before-define */
/* eslint-disable no-undef */
const messageContainer = document.getElementById('message-container');
const messageForm = document.getElementById('send-container');
const messageInput = document.getElementById('message-input');
const goBackContainer = document.getElementById('go-back-container');

const messagesArray = [];

if (messageContainer && messageForm && messageContainer.getAttribute('type') === 'group-chat') {
  const socket = io();
  const user = messageContainer.getAttribute('user');
  const parsedUser = JSON.parse(user);
  let messages = JSON.parse(messageContainer.getAttribute('previousMessages'));
  if (messages) {
    messages.forEach((elem) => {
      appendMessage(elem.userName, elem.userId, elem.content, new Date(elem.date));
    });
    messages = {};
  }

  socket.emit('new-connection', user);
  socket.on('chat-message', (data) => {
    appendMessage(data.name, data.userId, data.message, new Date());
  });
  socket.on('user-is-typing', (name) => appendTyper(name));
  socket.on('user-stopped-typing', (name) => removeTyper(name));

  setTimeout(() => {
    messageContainer.scrollTop = messageContainer.scrollHeight;
    alert('Tip: \nIn order to leave and save any new chat history, you have to press the button below.');
  }, 500);

  $('#message-input').focus(() => {
    socket.emit('started-typing', user);
  });

  $('#message-input').focusout(() => {
    socket.emit('finished-typing', user);
  });

  messageForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const message = messageInput.value;
    removeTyper(parsedUser.name);
    appendMessage(parsedUser.name, parsedUser.id, message, new Date());
    socket.emit('send-group-chat-message', { message, user });
    messagesArray.push({
      content: messageForm.elements.namedItem('content').value,
      userName: messageForm.elements.namedItem('userName').value,
      userId: messageForm.elements.namedItem('userId').value,
      groupId: messageForm.elements.namedItem('groupId').value,
      date: new Date(),
    });
    messageInput.value = '';
  });

  goBackContainer.addEventListener('click', () => {
    if (messagesArray) {
      const saveMessagesForm = document.createElement('FORM');
      saveMessagesForm.action = messageContainer.getAttribute('submitPath');
      saveMessagesForm.method = 'post';
      const msg = document.createElement('input');
      msg.type = 'text';
      msg.name = 'messages';
      msg.value = JSON.stringify(messagesArray);
      const gId = document.createElement('input');
      gId.type = 'number';
      gId.name = 'groupId';
      gId.value = parsedUser.groupId;
      saveMessagesForm.appendChild(msg);
      saveMessagesForm.appendChild(gId);
      document.body.appendChild(saveMessagesForm);
      saveMessagesForm.submit();
    }
  });

  function appendMessage(senderName, senderId, message, date) {
    let formattedDate = `${date.toLocaleDateString(undefined, { month: 'long', day: 'numeric' })} ${date.toLocaleTimeString('it-IT')}`.split(':');
    formattedDate.pop();
    formattedDate = formattedDate.join(':');
    const messageElement = document.createElement('div');
    messageElement.setAttribute('class', 'message');
    const name = document.createElement('p');
    name.setAttribute('class', 'name');
    const content = document.createElement('p');
    content.setAttribute('class', 'content');
    const datetime = document.createElement('p');
    datetime.setAttribute('class', 'datetime');
    if (senderId === parsedUser.id) {
      messageElement.style.marginLeft = 'auto';
      messageElement.style.marginRight = '0';
      messageElement.style.backgroundColor = 'lightgreen';
    } else {
      name.innerText = senderName;
      messageElement.style.marginLeft = '0';
      messageElement.style.marginRight = 'auto';
      messageElement.style.backgroundColor = 'lightblue';
    }
    content.innerText = message;
    datetime.innerText = formattedDate;
    messageElement.appendChild(name);
    messageElement.appendChild(content);
    messageElement.appendChild(datetime);
    messageContainer.append(messageElement);
    messageContainer.scrollTop = messageContainer.scrollHeight;
  }

  function appendTyper(name) {
    const typer = document.createElement('div');
    typer.setAttribute('class', 'typer');
    typer.innerText = `${name} is typing...`;
    typer.id = name;
    messageContainer.append(typer);
    messageContainer.scrollTop = messageContainer.scrollHeight;
    setTimeout(() => {
      removeTyper(name);
    }, 10000);
  }

  function removeTyper(name) {
    const typer = document.getElementById(name);
    if (typer) {
      typer.remove();
    }
  }
}
