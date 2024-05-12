#![no_std]
use soroban_sdk::{contract, contractimpl, Env, String, Address, Vec, contracttype, vec};

#[contracttype]
#[derive(Clone, Debug)]
pub struct Message {
    msg: String,
    from: Address,
}

type Conversation = Vec<Message>;

type ConversationsInitiated = Vec<Address>;

#[derive(Clone)]
#[contracttype]
pub struct ConversationsKey(pub Address, pub Address);

#[derive(Clone)]
#[contracttype]
pub enum DataKey {
    Conversations(ConversationsKey),
    ConversationsInitiated(Address),
}

pub fn update_conversations_initiated(env: &Env, from: Address, to: Address) {
    // Update the conversation initiated of FROM
    let mut conversation_initiated_from = env.storage().persistent().get::<_, ConversationsInitiated>(&DataKey::ConversationsInitiated(from.clone())).unwrap_or(vec![&env]);
    conversation_initiated_from.push_back(to.clone());
    env.storage().persistent().set(
        &DataKey::ConversationsInitiated(from.clone()),
        &conversation_initiated_from
    );


    // Update the conversation initiated of TO
    if from != to {
        let mut conversation_initiated_to = env.storage().persistent().get::<_, ConversationsInitiated>(&DataKey::ConversationsInitiated(to.clone())).unwrap_or(vec![&env]);
        conversation_initiated_to.push_back(from.clone());
        env.storage().persistent().set(
            &DataKey::ConversationsInitiated(to.clone()),
            &conversation_initiated_to
        );
    }
}

#[contract]
pub struct ChatContract;

#[contractimpl]
impl ChatContract {

    pub fn read_title(env: Env) -> String {
        String::from_str(&env, "This is a success")
    }

    pub fn read_conversation(env: &Env, from: Address, to:Address) -> Conversation {
        let key = DataKey::Conversations(ConversationsKey(from.clone(),to.clone()));
        let conversation = env.storage().persistent().get::<_,Conversation>(&key).unwrap_or(vec![&env]);
        conversation
    }

    pub fn read_conversations_initiated(env: &Env, from: Address) -> ConversationsInitiated{
        let key = DataKey::ConversationsInitiated(from);
        let conversations_initiated = env.storage().persistent().get::<_,ConversationsInitiated>(&key).unwrap_or(vec![&env]);
        conversations_initiated
    }

    pub fn write_message(env: Env, from: Address, to: Address, msg_str: String) {
        // Check that from is authorized
        from.require_auth();

        // Retrieve the conversation key
        let key = DataKey::Conversations(ConversationsKey(from.clone(), to.clone()));

        // Check if conversation exists
        let conversation_exists = env.storage().persistent().has(&key);

        // If it does not exists, then we add the addresses of from and to to respectively to and from initiated conversations
        if !conversation_exists {
            update_conversations_initiated(&env, from.clone(), to.clone());
        }

        // We retrieve the conversation, if conversation does not exist -> empty vec
        let mut conversation = env.storage().persistent().get::<_,Conversation>(&key).unwrap_or(vec![&env]);

        // Add the new message to the conversation
        let new_message = Message {
            msg: msg_str,
            from: from.clone()
        };
        conversation.push_back(new_message);

        // Push the updated conversation back into the storage
        env.storage().persistent().set(&key, &conversation);
        if from != to {
            let key_other_side = DataKey::Conversations(ConversationsKey(to.clone(), from.clone()));
            env.storage().persistent().set(&key_other_side, &conversation);
        }
    }


}

mod test;
