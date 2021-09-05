/* eslint-disable import/order */
/* eslint no-console: "off" */
require('dotenv').config();

const app = require('./src/app');
const db = require('./src/models');

const PORT = process.env.PORT || 3000;

const server = require('http').createServer(app.callback());

const io = require('socket.io')(server);

db.sequelize
  .authenticate()
  .then(() => {
    console.log('Connection to the database has been established successfully.');
    io.on('connection', (socket) => {
      socket.on('new-connection', (strUser) => {
        const user = JSON.parse(strUser);
        const { groupId, chatId } = user;
        if (groupId) {
          socket.join(user.groupId);
        }
        if (chatId) {
          socket.join(user.chatId);
        }
      });
      socket.on('send-group-chat-message', (data) => {
        const user = JSON.parse(data.user);
        socket.to(user.groupId).emit('chat-message', { message: data.message, name: user.name, userId: user.id });
      });
      socket.on('send-user-chat-message', (data) => {
        const user = JSON.parse(data.user);
        socket.to(user.chatId).emit('chat-message', { message: data.message, userId: user.id });
      });
      socket.on('started-typing', (strUser) => {
        const user = JSON.parse(strUser);
        const { groupId, chatId } = user;
        if (groupId) {
          socket.to(user.groupId).emit('user-is-typing', user.name);
        }
        if (chatId) {
          socket.to(user.chatId).emit('user-is-typing', user.name);
        }
      });
      socket.on('finished-typing', (strUser) => {
        const user = JSON.parse(strUser);
        const { groupId, chatId } = user;
        if (groupId) {
          socket.to(user.groupId).emit('user-stopped-typing', user.name);
        }
        if (chatId) {
          socket.to(user.chatId).emit('user-stopped-typing', user.name);
        }
      });
    });
    server.listen(PORT, (err) => {
      if (err) {
        return console.error('Failed', err);
      }
      console.log(`Listening on port ${PORT}`);
      return app;
    });
  })
  .catch((err) => console.error('Unable to connect to the database:', err));
