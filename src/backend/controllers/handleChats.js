import { Chat, User, UserChat, Message } from "../database/models";

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
  Bussines Logic: The user can delete a chat just if the user is logged (use JWY middleware) and just if the user is a memeber of that chat.
  Expected Params: :id is the id from the chat to remove.
  */
  try {
    const { id } = req.params;
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

    await chatToDelete.delete()
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

    const chats = await user.getChat();

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
    const chatId = req.params.id;
    const userId = req.payload.id;
    const user = await User.findByPk(userId);

    if (!user) return res.status(410).json({
      success: false,
      message: `ERROR| This user no longer exist.`
    })

    const chat = await user.getChat({
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
    userId: Instance or id of the member to update.
  }
  Expected Params: :id, is the id of the chat.
  */
  try {
    const chatId = req.params.id;
    const { userId, add } = req.body;
    const type = await Chat.findOne({
      where: { id : chatId }
    })?.type;
    const isAdmin = await UserChat.findOne({
      where: {
        chatFk: chatId,
        userFk: userId,
      }
    })?.isAdmin;

    if (!isAdmin || !type) return res.status(404).json({
      success: false,
      message: `ERROR| Chat not found, it doesn't exist or user is not member.`
    })

    if (type === 'contact') return res.status(422).json({
      success: false,
      meesage: `ERROR| Type of chat is not supported for this request (contact).`
    })

    if (isAdmin !== true && userId !== req.payload.id) return res.status(403).json({
      success: false,
      message: `ERROR| Unauthorized operation.`
    })

    await (add ? Chat.addUser(userId) : Chat.removeUser(userId))

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