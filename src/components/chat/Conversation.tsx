import { Card } from "@chakra-ui/react";
import { Message, type MessageType } from "./Message";

interface ConversationProps {
    conversation: Array<MessageType>
    destinationAddress: string,
    userConnected: string
}


export default function Conversation({conversation, destinationAddress,userConnected}: ConversationProps) {
    return (
        <Card variant="outline" p={4} bgColor="whiteAlpha.100">
        { destinationAddress ? 
        <div>Conversation with {destinationAddress}
        {conversation.map((message: MessageType, index: number) => (
            <Message key={index} message={message} userConnected={userConnected}></Message>
        ))}
        </div>
        :
      <div>Choose a conversation or send a message to new destination</div>}
        </Card>
    
    )
}