import { Button, Card, FormControl, FormLabel, Input, Stack } from '@chakra-ui/react'
import { type FC, useState, useEffect, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import 'twin.macro'

import { useSorobanReact } from "@soroban-react/core"
// import * as SorobanClient from 'soroban-client';
import * as StellarSdk from 'stellar-sdk';
import { contractInvoke } from '@soroban-react/contracts'

import contracts_ids from 'contracts/contracts_ids.json'
import React from 'react'
import Link from 'next/link'

import ConversationsList from '../chat/ConversationsList'
import Conversation from '../chat/Conversation'
import {type MessageType} from '../chat/Message'
type NewMessageData = { newMessage: string, destinationAddress: string }

function stringToScVal(title: string) {
  return StellarSdk.xdr.ScVal.scvString(title)
}

export const GreeterContractInteractions: FC = () => {
  const sorobanContext = useSorobanReact()
  const { activeChain, server, address } = sorobanContext
  
  const [updateIsLoading, setUpdateIsLoading] = useState<boolean>(false)
  const { register, handleSubmit } = useForm<NewMessageData>()
  
  const [fetchedConversationsInitiatedList, setConversationsInitiatedList] = useState<Array<string>>([])
  const [updateFrontend, toggleUpdate] = useState<boolean>(true)
  const [contractAddressStored, setContractAddressStored] = useState<string>()
  const [conversationDisplayedAddress, setConversationDisplayedAddress] = useState<string>("")
  const [conversationDisplayed, setConversationDisplayed] = useState<Array<MessageType>>([])
  const [conversationIsLoading, setConversationIsLoading] = useState<boolean>(false)


  // Fetch the addresses of every initiated conversations
  // All functions are using the useCallback hook for only updating the function if one parameter changes.
  const fetchConversationsInitiated = useCallback(async () => {
    // We need the context to be set up correctly, we need a server to talk to
    if (!sorobanContext.server) return

    const currentChain = sorobanContext.activeChain?.name?.toLocaleLowerCase()

    // We need an address set for the user
    if (!address) {
      return
    } // and a chain chosen
    else if (!currentChain) {
      console.log("No active chain")
      toast.error('Wallet not connected. Try again…')
      return
    }
    else {
      // Retrieve the contract address of the chat in the json
      const contractAddress = (contracts_ids as Record<string,Record<string,string>>)[currentChain]?.chat;
      // We store it in the state to display it
      setContractAddressStored(contractAddress)
      
      try {
        // We call the getter method on the contract to retrieve the list of addresses the user has talked to
        const address_to_fetch : StellarSdk.xdr.ScVal = new StellarSdk.Address(address).toScVal();
        const result = await contractInvoke({
          contractAddress,
          method: 'read_conversations_initiated',
          args: [ address_to_fetch],
          sorobanContext
        })
        // if (!result) throw new Error("Error while fetching. Try Again")

        // // Value needs to be cast into a string as we fetch a ScVal which is not readable as is.
        const conversationsInitiated: Array<string> = StellarSdk.scValToNative(result as StellarSdk.xdr.ScVal) as Array<string>
        setConversationsInitiatedList(conversationsInitiated)
      } catch (e) {
        console.error(e)
        toast.error('Error while fetching list of conversations. Try again…')
        setConversationsInitiatedList([])
      } finally {
        
      }
    }
  },[sorobanContext, address])

  // And we want the latter function to be called each time we have a frontend update, or when the user changes the connected address.
  useEffect(() => {void fetchConversationsInitiated()}, [updateFrontend,fetchConversationsInitiated])

    

  // This function will be called each time the user click the send message button
  const sendMessage = async ({ newMessage, destinationAddress }: NewMessageData ) => {
    // Same as earlier, we check that the context is well setup
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
        // We retrieve the contract address
        const contractAddress = (contracts_ids as Record<string,Record<string,string>>)[currentChain]?.chat;

        // This state is used for displaying loading messages and disabling button while loading
        setUpdateIsLoading(true)

        try {
          // Here we call the setter method to write a new message in the chat
          const result = await contractInvoke({
            contractAddress,
            method: 'write_message',
            // In the next line, we are testing if a specific destination address was given, otherwise we use the address of which the chat is currently displayed
            args: [new StellarSdk.Address(address).toScVal(),destinationAddress ? new StellarSdk.Address(destinationAddress).toScVal() : new StellarSdk.Address(conversationDisplayedAddress).toScVal(), stringToScVal(newMessage)],
            sorobanContext,
            signAndSend: true
          })
          
          if (result) {
            toast.success("New chat successfully published!")
            if (destinationAddress && destinationAddress != conversationDisplayedAddress) {
              // If there was a destination address given then we want to display the chat corresponding to the address we just sent a chat to
              setConversationDisplayedAddress(destinationAddress)
            }
          }
          else {
            toast.error("Chat publishing unsuccessful...")
            
          }
        } catch (e) {
          console.error(e)
          toast.error('Error while sending tx. Try again…')
        } finally {
          // We stop the loading display
          setUpdateIsLoading(false)
          toggleUpdate(!updateFrontend)
        } 

        await sorobanContext.connect();
      }
    }
  }

  // This method will be used to fetch the entire conversation of the address we want to display the chat
  const fetchConversation = useCallback(async () => {
    // Same checks on context
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
        // We retrieve contract address
        const contractAddress = (contracts_ids as Record<string,Record<string,string>>)[currentChain]?.chat;
        // Set the loading
        setConversationIsLoading(true)
        try {
          // Call the getter method
          const result = await contractInvoke({
            contractAddress,
            method: 'read_conversation',
            args: [new StellarSdk.Address(address).toScVal(),new StellarSdk.Address(conversationDisplayedAddress).toScVal()],
            sorobanContext
          })
          if (!result) throw new Error("Error while fetching. Try Again")

          // Value needs to be cast into a string as we fetch a ScVal which is not readable as is.
          console.log("CONVERSATION FETCHED =",StellarSdk.scValToNative(result as StellarSdk.xdr.ScVal))
          const conversation = StellarSdk.scValToNative(result as StellarSdk.xdr.ScVal) as Array<MessageType>
          // We then change the state. This state value will be used by the conversation component to diplay chats
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

  // We want to update this when the conversationDisplayedAddress changes, or when something in the context changes, or when we decide to toggle a frontend update.
  useEffect(() => {void fetchConversation()}, [conversationDisplayedAddress,updateFrontend,fetchConversation,sorobanContext])

  // This is used to clear the conversation displayed when the user changes the connected address.
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
        {/* Displayed conversation */}
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