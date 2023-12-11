import { Button, Card, FormControl, FormLabel, Input, Stack } from '@chakra-ui/react'
import { type FC, useState, useEffect, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import 'twin.macro'

import { useSorobanReact } from "@soroban-react/core"
import * as SorobanClient from 'soroban-client';
import { contractInvoke } from '@soroban-react/contracts'

import contracts_ids from 'contracts/contracts_ids.json'
import React from 'react'
import Link from 'next/link'

import ConversationsList from '../chat/ConversationsList'
import Conversation from '../chat/Conversation'
import {type MessageType} from '../chat/Message'
type NewMessageData = { newMessage: string, destinationAddress: string }

function stringToScVal(title: string) {
  return SorobanClient.xdr.ScVal.scvString(title)
}

export const GreeterContractInteractions: FC = () => {
  const sorobanContext = useSorobanReact()

  const [updateIsLoading, setUpdateIsLoading] = useState<boolean>(false)
  const { register, handleSubmit } = useForm<NewMessageData>()
  
  const [fetchedConversationsInitiatedList, setConversationsInitiatedList] = useState<Array<string>>([])
  const [updateFrontend, toggleUpdate] = useState<boolean>(true)
  const [contractAddressStored, setContractAddressStored] = useState<string>()
  const [conversationDisplayedAddress, setConversationDisplayedAddress] = useState<string>("")
  const [conversationDisplayed, setConversationDisplayed] = useState<Array<Message>>([])
  const [conversationIsLoading, setConversationIsLoading] = useState<boolean>(false)
  // Fetch the addresses of every initiated conversation
  const fetchConversationsInitiated = useCallback(async () => {
    if (!sorobanContext.server) return

    const currentChain = sorobanContext.activeChain?.name?.toLocaleLowerCase()
    if (!address) {
      return
    }
    else if (!currentChain) {
      console.log("No active chain")
      toast.error('Wallet not connected. Try again…')
      return
    }
    else {
      const contractAddress = (contracts_ids as Record<string,Record<string,string>>)[currentChain]?.chat;
      setContractAddressStored(contractAddress)
      
      try {
        const result = await contractInvoke({
          contractAddress,
          method: 'read_conversations_initiated',
          args: [new SorobanClient.Address(address).toScVal()],
          sorobanContext
        })
        if (!result) throw new Error("Error while fetching. Try Again")

        // Value needs to be cast into a string as we fetch a ScVal which is not readable as is.
        let conversationsInitiated = SorobanClient.scValToNative(result as SorobanClient.xdr.ScVal)
        setConversationsInitiatedList(conversationsInitiated)
      } catch (e) {
        console.error(e)
        toast.error('Error while fetching list of conversations. Try again…')
        setConversationsInitiatedList([])
      } finally {
        
      }
    }
  },[sorobanContext])

  useEffect(() => {void fetchConversationsInitiated()}, [updateFrontend,fetchConversationsInitiated])


  const { activeChain, server, address } = sorobanContext

  const sendMessage = async ({ newMessage, destinationAddress }: NewMessageData ) => {
    if (!address) {
      console.log("Address is not defined")
      toast.error('Wallet is not connected. Try again...')
      return
    }
    else if (!server) {
      console.log("Server is not setup")
      toast.error('Server is not defined. Unabled to connect to the blockchain')
      return
    }
    else {
      const currentChain = activeChain?.name?.toLocaleLowerCase()
      if (!currentChain) {
        console.log("No active chain")
        toast.error('Wallet not connected. Try again…')
        return
      }
      else {
        const contractAddress = (contracts_ids as Record<string,Record<string,string>>)[currentChain]?.chat;

        setUpdateIsLoading(true)

        try {
          const result = await contractInvoke({
            contractAddress,
            method: 'write_message',
            args: [new SorobanClient.Address(address).toScVal(),destinationAddress ? new SorobanClient.Address(destinationAddress).toScVal() : new SorobanClient.Address(conversationDisplayedAddress).toScVal(), stringToScVal(newMessage)],
            sorobanContext,
            signAndSend: true
          })
          
          if (result) {
            toast.success("New chat successfully published!")
            setConversationDisplayedAddress(destinationAddress ?? conversationDisplayedAddress)
          }
          else {
            toast.error("Chat publishing unsuccessful...")
            
          }
        } catch (e) {
          console.error(e)
          toast.error('Error while sending tx. Try again…')
        } finally {
          setUpdateIsLoading(false)
          toggleUpdate(!updateFrontend)
        } 

        await sorobanContext.connect();
      }
    }
  }

  const fetchConversation = useCallback(async () => {
    if (!sorobanContext.server) return
    if (!address) {
      console.log("Address is not defined")
      toast.error('Wallet is not connected. Try again...')
      return
    }
    else if (!server) {
      console.log("Server is not setup")
      toast.error('Server is not defined. Unabled to connect to the blockchain')
      return
    }
    else {
      const currentChain = activeChain?.name?.toLocaleLowerCase()
      if (!currentChain) {
        console.log("No active chain")
        toast.error('Wallet not connected. Try again…')
        return
      }
      else if (conversationDisplayedAddress) {
        const contractAddress = (contracts_ids as Record<string,Record<string,string>>)[currentChain]?.chat;
        setConversationIsLoading(true)
        try {
          const result = await contractInvoke({
            contractAddress,
            method: 'read_conversation',
            args: [new SorobanClient.Address(address).toScVal(),new SorobanClient.Address(conversationDisplayedAddress).toScVal()],
            sorobanContext
          })
          if (!result) throw new Error("Error while fetching. Try Again")

          // Value needs to be cast into a string as we fetch a ScVal which is not readable as is.
          // You can check out the scValConversion.tsx file to see how it's done
          console.log("CONVERSATION FETCHED =",SorobanClient.scValToNative(result as SorobanClient.xdr.ScVal))
          let conversation = SorobanClient.scValToNative(result as SorobanClient.xdr.ScVal)
          // const result_string = scvalToString(result as SorobanClient.xdr.ScVal)
          setConversationDisplayed(conversation)
        } catch (e) {
          console.error(e)
          toast.error('Error while fetching conversation. Try again…')
          setConversationDisplayed([])
        } finally {
          setConversationIsLoading(false)
        } 
      }
    }
  }, [conversationDisplayedAddress])

  useEffect(() => {void fetchConversation()}, [conversationDisplayedAddress,updateFrontend,fetchConversation,sorobanContext])

  useEffect(() => {
    setConversationDisplayedAddress("")
  }, [address])

  return (
    <>{address ?
      <div tw="mt-10 flex w-full flex-wrap items-start justify-center gap-4">
      <div tw="flex grow flex-col space-y-4 max-w-[20rem]">

        {/* Fetched Conversation List */}
        <Card variant="outline" p={4} bgColor="whiteAlpha.100">
          <FormControl>
            <FormLabel>Your Chats</FormLabel>
            <ConversationsList conversationsList={fetchedConversationsInitiatedList} setDisplayedConversationAddress={setConversationDisplayedAddress}></ConversationsList>
          </FormControl>
        </Card>

        {/* Send Message */}
        <Card variant="outline" p={4} bgColor="whiteAlpha.100">
          <form onSubmit={handleSubmit(sendMessage)}>
            <Stack direction="row" spacing={2} align="end">
              <FormControl>
                <FormLabel>Send new Message</FormLabel>
                <Input disabled={updateIsLoading} placeholder={conversationDisplayedAddress} {...register('destinationAddress')} />
                <Input disabled={updateIsLoading} placeholder='Message' {...register('newMessage')} />
              </FormControl>
              <Stack direction='column'>
              <Button
                mt={4}
                colorScheme="purple"
                onClick={() => toggleUpdate((toggle) => !toggle)}
              >
                Refresh
            </Button>
              <Button
                type="submit"
                mt={4}
                colorScheme="purple"
                isDisabled={updateIsLoading}
                isLoading={updateIsLoading}
              >
                Submit
              </Button>
              </Stack>
            </Stack>
          </form>
        </Card>

        {/* Contract Address */}
        <p tw="text-center font-mono text-xs text-gray-600">
          
          {contractAddressStored ? <Link href={"https://stellar.expert/explorer/testnet/contract/" + contractAddressStored} target="_blank">{contractAddressStored}</Link> : "Loading address.."}
        </p>
        </div>
        <Card variant="outline" p={4} bgColor="whiteAlpha.100">
            
            {!conversationIsLoading ?
            <Conversation userConnected={address} destinationAddress={conversationDisplayedAddress} conversation={conversationDisplayed}></Conversation>
            :
            "Loading ..."
            }
        </Card>
      
      </div>
      :
      <div></div>
    }
    </>
  )
}