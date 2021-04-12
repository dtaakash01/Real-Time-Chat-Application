const express = require('express');
const http = require('http');
const { format } = require('path');
const path = require('path');
const socketio = require('socket.io');
const formatMessage = require('./utils/messages');
const { userJoin, 
        getCurrentUser,
        userLeave,
        getRoomUsers
     } = require('./utils/users');

const app = express();
const server = http.createServer(app);
const  io = socketio(server);

const botName = 'ChatCord Bot'

io.on('connection', socket => {
    console.log("New WS connection...");

    

    socket.on('joinChatRoom', ({ username, room }) => {

    const user = userJoin(socket.id, username, room);

    socket.join(user.room);
        
    //Welcome Current User
    socket.emit('message', formatMessage(botName, 'Welcome to ChatCord'));

    // Broadcast when a user connect
    socket.broadcast.to(user.room).emit('message', formatMessage(botName, `${user.username} has joined the chat`));  //emits to everybody except the user that is connecting

    //Send Users and room info
    io.to(user.room).emit('roomUsers', {
        room: user.room,
        users: getRoomUsers(user.room)
    });
    })


    //Listen for chatMessage
    socket.on('chatMessage', (msg) => {
        const user = getCurrentUser(socket.id)

        io.to(user.room).emit('message',formatMessage(`${user.username}`, msg));
    })
    
        //Runs when client disconnect
    socket.on('disconnect', () => {

        const user = userLeave(socket.id);

        if(user){
            io.to(user.room).emit('message', formatMessage(botName, 
                `${user.username} has left the chat`));

        //Send Users and room info
        io.to(user.room).emit('roomUsers', {
            room: user.room,
            users: getRoomUsers(user.room)
        });
        }



     
    })
    
    /* //Broadcast to everybody
    io.emit() */
})


PORT = 3000 || process.env.PORT;

app.use(express.static(path.join(__dirname, 'public')))

server.listen(PORT, () => {
    console.log(`Server running on ${PORT}`);
})