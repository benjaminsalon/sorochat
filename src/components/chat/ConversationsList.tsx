import { Card } from "@chakra-ui/react";

interface ConversationsListProps {
  conversationsList: Array<string>,
  setDisplayedConversationAddress: (newDestinationAddress: string) => void
}

export default function ConversationsList({conversationsList, setDisplayedConversationAddress}:ConversationsListProps) {

  return (
    <>
    {conversationsList.map((address: string, index: number) => (
      <>
      <Card variant="outline" key={index} p={2} bgColor="whiteAlpha.0" 
          onClick={() => setDisplayedConversationAddress(address)} 
          cursor="pointer"
          _hover={{
            background: "whiteAlpha.100",
          }}
      >
        {address}
      </Card>
      </>
    ))}
    </>
  );
}
