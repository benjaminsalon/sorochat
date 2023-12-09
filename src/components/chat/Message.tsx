import { Box, Card, Text } from "@chakra-ui/react";

export type MessageType = {
    msg: string,
    from: string
}

interface MessageProps {
    message: MessageType,
    userConnected: string
}

export function Message({message,userConnected}:MessageProps) {
    let position = userConnected == message.from ? "right" : "left";
    return (
        <>
            <Box ml='3' bg="whiteAlpha.100" borderRadius="12" padding="4" margin="4" position="relative" >
                <Text fontWeight='bold'>
                {message.from}
                </Text>
                <Text fontSize='sm'>{message.msg}</Text>
            </Box>
        <p></p>
        </>
    );
}
  