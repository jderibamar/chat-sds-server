// Setup basic express server
const express = require('express')
const app = express()
const path = require('path')
const server = require('http').createServer(app)
const io = require('socket.io')(server)
const cors = require('cors')
const port = process.env.PORT || 3000

server.listen(port, () => { console.log('Server listening at port %d', port) })

// Routing
app.use(express.static(path.join(__dirname, 'public')) )
app.use(cors())

// Chatroom

var numUsers = 0
let totalU = []
let msgRec = [] //array de mensagens recebidas
let listaU = []

io.on('connection', (socket) => 
{
    totalU.push(socket)
    console.log('Nova conexão de ID: ', socket.id)
    console.log(`Total de usuários conectados: ${ totalU.length }`)    
    var addedUser = false

  // when the client emits 'new message', this listens and executes
  socket.on('new message', (data) => 
  {
    // we tell the client to execute 'new message'
     msgRec.push(data) 
     console.log('Mensagens no servidor de exemplo: ', msgRec)
     socket.broadcast.emit('new message', { username: socket.username, message: data })
  })

  socket.on('disconnect', data => 
  {
      totalU.splice(totalU.indexOf(socket), 1)
      console.log(`Socket de ID: ${ socket.id } desconectou `)
      console.log(`Total de usuários conectados: ${ totalU.length }`)
  })

  // when the client emits 'add user', this listens and executes
  socket.on('add user', (user) => 
  {     
     listaU.push(user)
     console.log(`Usuário conectou: ${ user.user }` )
    // if (addedUser) return (comentei)
 
    // we store the username in the socket session for this client
   
    //linhas que comentei
    // socket.username = user
    // ++numUsers
    // addedUser = true
    // socket.emit('login', { numUsers: numUsers })
    // echo globally (all clients) that a person has connected
    // socket.broadcast.emit('user joined', { user: socket.username, numUsers: numUsers }) código original do exemplo      
      socket.broadcast.emit('user joined', { user: user.user, message: 'Usuário conectou' })      
  })

   // when the user disconnects.. perform this
   socket.on('disconnect', () => 
   {
     if (addedUser) 
     {
       --numUsers;
 
       // echo globally that this client has left
       socket.broadcast.emit('user left', {
         username: socket.username,
         numUsers: numUsers
       })
     }
   })

  // when the client emits 'typing', we broadcast it to others
  socket.on('typing', () => { socket.broadcast.emit('typing', { username: socket.username }) })

  // when the client emits 'stop typing', we broadcast it to others
  socket.on('stop typing', () => 
  {
    socket.broadcast.emit('stop typing', { username: socket.username }) })
 
})