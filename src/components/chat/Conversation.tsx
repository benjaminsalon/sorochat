import {type MessageType as ContractMessageType, Message} from './Message'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { Chat, MessageType } from '@flyerhq/react-native-chat-ui'

interface ConversationProps {
    conversation: Array<ContractMessageType>,
    destinationAddress: string,
    userConnected: string
  }
  
  export default function Conversation({conversation, destinationAddress,userConnected}:ConversationProps) {
    // let conversation_type_adapted: Array<MessageType.Any> = conversation.map(({msg,from}: ContractMessageType) => {
    //     return {
    //         author: {id:from},
    //         id: "id",
    //         type: "text",
    //         text: msg
    //     };
    // })
    return (
      <div>{destinationAddress}
      {conversation.map((message: ContractMessageType) => (
        <Message message={message} userConnected={userConnected}/>
      ))}
      </div>
    );

    // return (
    //     <Chat user={{id:conversation[0].from}} onSendPress={() => {}} messages={conversation_type_adapted}></Chat>
    // )
  }
  