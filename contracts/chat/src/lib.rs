#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, vec, Address, Env, String, Symbol, Vec};

#[derive(Clone)]
#[contracttype]
pub struct ConversationsKey(pub Address, pub Address);

#[contracttype]
pub struct Message {
    msg: String,
}

type Conversation = Vec<Message>;

#[derive(Clone)]
#[contracttype]
pub enum DataKey {
    Conversations(ConversationsKey),
    ConversationInitiated(Address),
}

#[contract]
pub struct ChatContract;

#[contractimpl]
impl ChatContract {
    pub fn write_message(env: Env, from: Address, to: Address, msg: String) {
        // First we need to retrieve the possibly already existing conversation between from and to
        let conversation = env
            .storage()
            .instance()
            .get::<_, Conversation>(&DataKey::Conversations(ConversationsKey(from, to)))
            .unwrap_or(vec![&env]);
    }
}

mod test;
