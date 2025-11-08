import { io } from "../../app.js";
import { Chat, Message } from "../../database/models.js";

export const validAccess = async (data, socket) => {
  try {
    const { chatId } = data;
    
    if (!chatId) {
      socket.emit('error', {
        success: false,
        message: 'ERROR| chatId is required.'
      });
      return false;
    }
    
    const userId = socket.payload.id;
    const chat = await Chat.findByPk(chatId);
    
    if (!chat) {
      socket.emit('error', {
        success: false,
        message: 'ERROR| Chat not found.'
      });
      return false;
    }

    const isMember = await chat.hasUser(userId);
    
    if (!isMember) {
      socket.emit('error', {
        success: false,
        message: 'ERROR| You are not a member of this chat.'
      });
      return false;
    }

    return true;
    
  } catch (err) {
    console.error('Error en validAccess:', err);
    socket.emit('error', {
      success: false,
      message: 'ERROR| Access validation failed.'
    });
    return false;
  }
}

export const joinChat = (data, socket) => {
  /*
  Expected Data:
  {
    chatId: INTEGER -> Id of the chat to join.
  }
  */
  try {
    const { chatId } = data;
    socket.join(`chat:${chatId}`)

  } catch (err) {
    socket.emit('error', {
      success: false,
      message: `ERROR| Can't join the chat room.`
    })
  }
}

export const leaveChat = (data, socket) => {
  /*
  Expected Data:
  {
    chatId: INTEGER -> Id of the chat to leave.
  }
  */
  try {
    const { chatId } = data;
    socket.leave(`chat:${chatId}`)

  } catch (err) {
    socket.emit('error', {
      success: false,
      message: `ERROR| Can't leave the chat room.`
    })
  }
}

export const sendMessage = async (data, socket) => {
  /*
  Expected Data:
  {
    content: STRING -> Message content.
    chatId: INTEGER -> The id of the chat of the new message.
  }
  */
  try {
    const { content, chatId } = data;
    const userId = socket.payload.id;

    const newMessage = await Message.create({
      content,
      sendedBy : userId,
      chat : chatId,
    })

    io.to(`chat:${chatId}`).emit('new-message', {
      message: {
        id: newMessage.id,
        content,
        seen: newMessage.seen,
        sendedBy: {
          id: userId,
          roll: socket.payload.roll,
          name: socket.payload.name
        }
      }
    })

    /*
    Mandar notificación a quienes no están en el chat.
    En el frontend se debe hacer una consulta a express para obtener quienes vieron
    el mensage y verificar si el usuario lo vio o no para saber si mostrar o no la notificación.
    */
    const chat = await Chat.findByPk(chatId)

    if (!chat) socket.emit('error', {
      success:false,
      message:`ERROR| Couldn't found the chat.`
    })

    const outUsers = await chat.getUser()
    outUsers.forEach(user => {
      socket.to(`user:${user.id}`).emit('message-notification', {
        content,
        name: socket.payload.name
      })
    })

  } catch (err) {
    socket.emit('error', {
      success: false,
      message: `ERROR| Can't send the message.`
    })
  }
}

export const seenMessage = async (data, socket) => {
  /*
  Expected Data:
  {
    msgId: INTEGER -> Id of the message to update.
    chatId: INTEGER -> Id of the chat.
  }
  */
  try {
    const { msgId } = data;
    const userId = socket.payload.id;
    const msgToUpdate = await Message.findOne({
      where : { id : msgId }
    })
    
    if (!msgToUpdate) return socket.emit('error', {
      success:false,
      message:`ERROR| Message not found.`
    })

    const updatedSeenBy = [...msgToUpdate.seenBy, userId];
    const newMessage = await msgToUpdate.update({ seenBy: updatedSeenBy });

    io.to(`user:${msgToUpdate.sendedBy}`).emit('seen-message', { seenBy : newMessage.seenBy }) //Here the front of the sender of the message must verify if all the members of the chat have seen that.

  } catch (err) {
    socket.emit('error', {
      success: false,
      message: `ERROR| Can't send the message.`
    })
  }
}

export const editMessage = async (data, socket) => {
  /*
  Expected Data:
  {
    content: STRING -> Message content.
    chatId: INTEGER -> The id of the chat of the new message.
  }
  */
  try {
    const { content, msgId, chatId } = data;
    const userId = socket.payload.id;

    const msgToEdit = await Message.findByPk(msgId)

    if (!msgToEdit) return socket.emit('error', {
      success:false,
      message:`ERROR| Message not found.`
    })
    if (userId !== msgToEdit.sendedBy) return socket.emit('error', {
      success:false,
      message:`ERROR| Usuario no autorizado para esta opración.`
    });

    const editedMsg = await msgToEdit.update({ content })

    io.to(`chat:${chatId}`).emit('edited-message', {
      id: editedMsg.id,
      content,
      seen: editedMsg.seen,
      sendedBy: {
        id: userId,
        name: socket.payload.name,
        roll: socket.payload.roll
      }
    }) // Here, the frontend users have to show the new message.

    /*
    Send notification.
    */
    const chat = await Chat.findByPk(chatId)

    if (!chat) return socket.emit('error', {
      success:false,
      message:`ERROR| Couldn't found the chat.`
    })

    const outUsers = await chat.getUser()
    outUsers.forEach(user => {
      socket.to(`user:${user.id}`).emit('message-notification', {
        content,
        name: socket.payload.name
      })
    })

  } catch (err) {
    socket.emit('error', {
      success: false,
      message: `ERROR| Can't send the message.`
    })
  }
}

export const deleteMessage = async (data, socket) => {
  /*
  Expected Data:
  {
    msgId : INTEGER -> Id of the mesage.
    chatId : INTEGER -> Id of the chat.
  }
  */
  try {
    const { msgId, chatId } = data;
    const userId = socket.payload.id;

    const msgToDelete = await Message.findByPk(msgId);

    if (!msgToDelete) return socket.emit('error', {
      success:false,
      message:`ERROR| Couldn't found the chat.`
    })
    if (userId !== msgToDelete.sendedBy) return socket.emit('error', {
      success:false,
      message:`ERROR| Usuario no autorizado para esta opración.`
    });

    await msgToDelete.destroy()

    io.to(`chat:${chatId}`).emit('deleted-message', { msgId })
  } catch (err) {
    socket.emit('error', {
      success: false,
      message: `ERROR| Can't send the message.`
    })
  }
}

export const typeMessage = async (data, socket) => {
  const { chatId } = data;
  const userId = socket.payload.id;
  const userName = socket.payload.name;
  
  socket.to(`chat:${chatId}`).emit('type-message', {
    userId,
    userName,
    chatId
  });
}

export const noTypeMessage = (data, socket) => {
  const { chatId } = data;
  const userId = socket.payload.id;
  
  socket.to(`chat:${chatId}`).emit('no-type-message', {
    userId,
    chatId
  });
}