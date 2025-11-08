import { joinChat, sendMessage, seenMessage, editMessage, deleteMessage, typeMessage, noTypeMessage, leaveChat, validAccess } from "../events/messages.js";

const messagesConnection = (socket) => {
  //This room is a generic room for all users for recibe notifications of all chats instead of join each user to all their chats.
  socket.join(`user:${socket.payload.id}`)

  socket.on('joinChat', async (data) => {
    const access = await validAccess(data, socket); 
    if (access) joinChat(data, socket)
  })
  socket.on('leaveChat', async (data) => {
    const access = await validAccess(data, socket); 
    if (access) leaveChat(data, socket)
  })
  socket.on('sendMessage', async (data) => {
    const access = await validAccess(data, socket); 
    if (access) sendMessage(data, socket)
  })
  socket.on('seenMessage', async (data) => {
    const access = await validAccess(data, socket); 
    if (access) seenMessage(data, socket)
  })
  socket.on('editMessage', async (data) => {
    const access = await validAccess(data, socket); 
    if (access) editMessage(data, socket)
  })
  socket.on('deleteMessage', async (data) => {
    const access = await validAccess(data, socket); 
    if (access) deleteMessage(data, socket)
  })
  socket.on('typeMessage', async (data) => {
    const access = await validAccess(data, socket); 
    if (access) typeMessage(data, socket)
  })
  socket.on('noTypeMessage', async (data) => {
    const access = await validAccess(data, socket); 
    if (access) noTypeMessage(data, socket)
  })

  socket.on('disconnect', ()=>{})
}

export default messagesConnection