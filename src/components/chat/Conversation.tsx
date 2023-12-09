export type Message = {
    msg: string
}
interface ConversationProps {
    conversation: Array<Message>,
    destinationAddress: string
  }
  
  export default function Conversation({conversation, destinationAddress}:ConversationProps) {
  
    return (
      <>{destinationAddress}
      {conversation.map((message: Message) => (
        <p>{message.msg}</p>
      ))}
      </>
    );
  }
  