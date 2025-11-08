import { Chat, User, UserChat, Message } from "../database/models.js";

export const createChat = async (req, res) => {
  /*
  Bussines Logic: A new chat will be created when some one create a group or want to write someone for first time (user has to be logged, use JWT middleware).
  Expected body:
  {
    type -> STING, ENUM('group', 'contact')
    members -> ARRAY, Items => [member instance or id, { isAdmin : BOOL }]
    name -> STRING
  }
  */
  try {
    const { type, members, name } = req.body;
    const newChat = await Chat.create({ type, name })
    if (type === 'contact' && members.length !== 2) {
      return res.status(400).json({
        success:false,
        message: `ERROR| The members amount aren't two, can't create a contact.`
      })
    }

    for (let member of members) {
      await newChat.addUser( member[0] , { through : member[1] } )
    }
    
    res.status(201).json({
      success:true,
      message: 'ACK| Chat created successfully.'
    })
  } catch (err) {
     res.status(500).json({
      success:false,
      message: `ERROR| Couldn't create the chat, internal server error.`
     })
  }
}

export const deleteChat = async (req, res) => {
  /*
  Bussines Logic: The user can delete a chat just if the user is logged (use JWY middleware) and just if the user is a memeber of that chat (if is a gruop, the idea is do that if is the last member in the chat).
  Expected Params: :id is the id from the chat to remove.
  */

  try {
    const id = parseInt(req.params.id);
    const userId = req.payload.id;

    const chatToDelete = await Chat.findOne({
      where : { id }
    })
    if (!chatToDelete) return res.status(404).json({
      success:false,
      message:`ERROR| Chat not found.`
    })

    if (!(await chatToDelete.hasUser(userId))) return res.status(403).json({
      success: false,
      message: `ERROR| This user isn't a memeber of this chat, can't delete the chat.`
    })
    
    await chatToDelete.destroy()

    res.status(200).json({
      success:true,
      message:`ACK| Chat deleted successfully.`
    })
  } catch (err) {
    res.status(500).json({
      success:false,
      message: `ERROR| Internal server error.`
    })
  }
}

export const getChats = async (req, res) => {
  /*
  Bussines Logic: The user can get just his chats, needs to be logged (use JWT middleware).
  */
  try {
    const userId = req.payload.id;
    const user = await User.findByPk(userId);

    if (!user) return res.status(410).json({
      success: false,
      message: `ERROR| This user no longer exist.`
    })

    const chats = await user.getChats();

    if (!chats) return res.status(404).json({
      success:false,
      messsage: `ERROR| This user doesn't have chats.`
    })

    res.status(200).json({
      success:true,
      message: `ACK| Chats found successfully.`,
      chats
    })
  } catch (err) {
    res.status(500).json({
      success:false,
      message: `ERROR| Internal server error.`
    })
  }
}

export const getChatById = async (req, res) => {
  /*
  Bussines Logic: Obtener chat y todos sus mensajes.
  Expected Params: :id -> Id of the chat.
  */
  try {
    const chatId = parseInt(req.params.id);
    const userId = req.payload.id;
    const user = await User.findByPk(userId);

    if (!user) return res.status(410).json({
      success: false,
      message: `ERROR| This user no longer exist.`
    })

    const chat = await user.getChats({
      where : { id : chatId },
      include:[
        {
          model: User,
          attributes: ['id', 'name', 'roll', 'email'],
          through: {
            attributes: ['isAdmin']
          }
        },
        {
          model: Message,
        }
      ]
    });
    
    res.status(200).json({
      success:true,
      message: `ACK| Chat got successfully.`,
      chat
    })

  } catch (err) {
    res.status(500).json({
      success:false,
      message: `ERROR| Internal server error.`
    })
  }
}

export const updateChatMembers = async (req, res) => {
  /*
  Bussines Logic: Just a logged user (use JWT middleware) can remove him self. If he is admin, can remove or add users to the group.
  Expected Body:
  {
    add : BOOL,
    userId: Id of the member to update.
    willBeAdmin: BOOL
  }
  Expected Params: :id, is the id of the chat.
  */
  try {
    const chatId = parseInt(req.params.id);
    const { userId, add, willBeAdmin } = req.body;

    const chat = await Chat.findOne({
      where: { id : chatId }
    });

    const type = chat?.type;

    const relation = await UserChat.findOne({
      where: {
        chatFk: chatId,
        userFk: req.payload.id,
      }
    });
    console.log("BEFORE")
    const isAdmin = relation?.isAdmin;
    console.log("AFTER")
    if (!type) return res.status(404).json({
      success: false,
      message: `ERROR| Chat not found.`
    })

    if (type === 'contact') return res.status(422).json({
      success: false,
      mesage: `ERROR| Type of chat is not supported for this request (contact).`
    })

    if (!isAdmin && userId !== req.payload.id) return res.status(403).json({
      success: false,
      message: `ERROR| Unauthorized operation.`
    })
    console.log("Hola")
    await (add ? chat.addUser(userId, { through : { isAdmin : willBeAdmin }}) : chat.removeUser(userId))
    console.log("Chau")
    res.status(200).json({
      success:true,
      message: `ACK| Operation done correctly.`
    })

  } catch (err) {
    res.status(500).json({
      success:false,
      message: `ERROR| Internal server error.`
    })
  }
}

export const verifyOwnSeen = async (req, res) => {
  try {
    /*
      Expected Params: :id, Id of the message.
    */

    const msgId = req.params.id;
    const userId = req.payload.id;

    const message = (await Message.findByPk(msgId))
    if (!message) return res.status(404).json({
      success: false,
      message: `ERROR| Message data not fuound.`
    })
    const seen = message.seenBy.includes(userId);
    if (!seen) { return res.status(200).send(false) } else { return res.status(200).send(true) }
  } catch (err) {
    res.status(500).json({
      success:false,
      message: `ERROR| Internal server error.`
    })
  }
}