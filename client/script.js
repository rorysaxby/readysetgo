(() => {
  const socket = io();
  const chatForm = {};

  const emitMessage = (message) => {
    socket.emit("chat message", message);
  };

  const submitChatMessage = (e) => {
    console.log(e);
    console.log(chatForm.messageInput);
  };

  const setupChatForm = () => {
    chatForm.form = document.getElementById(`ChatForm`);
    chatForm.messageInput = document.getElementById(`MessageInput`);
    chatForm.form.addEventListener("submit", submitChatMessage);
  };

  const init = () => {
    setupChatForm();
  };
  init();
})();
