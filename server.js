// const vCap = new cv.VideoCapture(0)
// Setup basic express server
const express = require('express')
const app = express()
const path = require('path')
const server = require('http').createServer(app)
const io = require('socket.io')(server)
const cors = require('cors')
const port = process.env.PORT || 3000

server.listen(port, () => { console.log('Servidor de testes ativo na porta %d', port) })

// Routing
app.use(express.static(path.join(__dirname, 'public')) )
app.use(cors())

// Chatroom

var numUsers = 0
let totalU = []
let msgRec = [] //array de mensagens recebidas

io.on('connection', (socket) => 
{
    totalU.push(socket)
    console.log('Nova conexão de ID: ', socket.id)
    console.log(`Total de usuários conectados: ${ totalU.length }`)    
    socket.broadcast.emit('join')

    var addedUser = false

    socket.on('stream', imagem =>
    {        
        socket.broadcast.emit('stream', { img: imagem, userid: socket.id })
        // console.log('Usuário compartilhou o vídeo')
        // console.log(`Cam número ${ listaCams.length } do ID: ${ socket.id }`)
        
    })

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
        if(totalU.length % 2 == 0)
        {
            let qtdU = totalU.length / 2 //por causa da dupla conexão que realizo com o socket
            socket.broadcast.emit('user-left', { numU: qtdU, idSoc: socket.id })
            console.log('Número de usuários conectados: ', qtdU )
        }
        
        console.log(`Total de usuários conectados: ${ totalU.length }`)        
    })

    socket.on('join-room', (roomId) => 
    {
        socket.join(roomId)

        const roomClients = io.sockets.adapter.rooms[roomId] || { length: 0 }
        numUsers = roomClients.length

        console.log('Sala criada, ID: ', roomId)
        console.log(`Usuário ${ numUsers } entrou na sala: ${ roomId } e emissão do evento de socket: room_joined`)
        // socket.broadcast.emit('room_joined', { sala_id: roomId, utotal: numUsers })

        
        socket.emit('room_created', {idR: roomId, utotal: numUsers })
        
        
      // These events are emitted only to the sender socket.
      if (numUsers == 0) 
      {          
          console.log(`Creating room ${roomId} and emitting room_created socket event`)          
      } 
      else
      {
          // console.log(`Usuário ${ numUsers } entrou na sala: ${ roomId } e emissão do evento de socket: room_joined`)
          // socket.join(roomId)
          // socket.emit('room_joined', { sala_id: roomId, utotal: numUsers })
      }       
    })
 
  // These events are emitted to all the sockets connected to the same room except the sender.
    socket.on('start_call', (data) => 
    {       
       console.log('Número de vídeos ativos: ')
       console.log(`Evento start_call recebido to peers in room ${ data.roomId }`)
       socket.broadcast.to(data.roomId).emit('start_call')
    })

  socket.on('webrtc_offer', (event) => 
  {
    console.log(`Broadcasting webrtc_offer event to peers in room ${ event.roomId }`)
    socket.broadcast.to(event.roomId).emit('webrtc_offer', event.sdp)
  })

  socket.on('webrtc_answer', (event) =>
  {
      console.log(`Broadcasting webrtc_answer event to peers in room ${event.roomId}`)
      socket.broadcast.to(event.roomId).emit('webrtc_answer', event.sdp)
  })

  socket.on('webrtc_ice_candidate', (event) => {
    console.log(`Broadcasting webrtc_ice_candidate event to peers in room ${event.roomId}`)
    socket.broadcast.to(event.roomId).emit('webrtc_ice_candidate', event)
  })

  // socket.on('call-user', data =>
  // {
  //     socket.broadcast.emit('call-made', { offer: data.offer })
  // })

  

  // when the client emits 'add user', this listens and executes
  // socket.on('add user', (user) => 
  // {     
  //    listaU.push(user)
  //    console.log(`Usuário conectou: ${ user.user }` )
    // if (addedUser) return (comentei)
 
    // we store the username in the socket session for this client
   
    //linhas que comentei
    // socket.username = user
    // ++numUsers
    // addedUser = true
    // socket.emit('login', { numUsers: numUsers })
    // echo globally (all clients) that a person has connected
    // socket.broadcast.emit('user joined', { user: socket.username, numUsers: numUsers }) código original do exemplo      
      // socket.broadcast.emit('user joined', { user: user.user, message: 'Usuário conectou' })      
  // })

   // when the user disconnects.. perform this
  //  socket.on('disconnect', () => 
  //  {
  //    if (addedUser) 
  //    {
  //      --numUsers;
 
  //      // echo globally that this client has left
  //      socket.broadcast.emit('user-left', {
  //        username: socket.username,
  //        numUsers: numUsers
  //      })
  //    }
  //  })

  // when the client emits 'typing', we broadcast it to others
  socket.on('typing', () => { socket.broadcast.emit('typing', { username: socket.username }) })

  // when the client emits 'stop typing', we broadcast it to others
  socket.on('stop typing', () => 
  {
    socket.broadcast.emit('stop typing', { username: socket.username }) })
 
})