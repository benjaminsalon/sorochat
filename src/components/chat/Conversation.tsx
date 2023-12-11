import {type MessageType as ContractMessageType, Message} from './Message'

interface ConversationProps {
    conversation: Array<ContractMessageType>,
    destinationAddress: string,
    userConnected: string
  }
  
  export default function Conversation({conversation, destinationAddress,userConnected}:ConversationProps) {
    return (
        destinationAddress ? 
      <div>Conversation with {destinationAddress}
      {conversation.map((message: ContractMessageType, index: number) => (
        <Message key={index} message={message} userConnected={userConnected}/>
      ))}
      </div>
      :
      <div>Choose a conversation or send a message to new destination</div>
    );
  }
  