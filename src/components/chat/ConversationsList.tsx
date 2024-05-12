import { Card } from "@chakra-ui/react"

interface ConversationListProps {
    conversationsList: Array<string>,
    setConversationDisplayedAddress: (newDisplayedAddress: string) => void
}

export default function ConversationList({conversationsList, setConversationDisplayedAddress}:ConversationListProps) {


    return (
        <>
        {conversationsList.map((address: string, index:number) => (
            <Card variant="outline" key={index} p={2} bgColor="whiteAlpha.0"
                onClick={() => setConversationDisplayedAddress(address)}
                cursor="pointer"
                _hover={{
                    background: "whiteAlpha.100",
                }}
            >
                {address}
            </Card>
        ))}

        </>
    )
}