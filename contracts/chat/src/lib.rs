#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, Address, Env, String, Symbol, Vec};

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
        // First retrieve the conversation between from and to
        // let conversation = env.storage().instance().get::<_,
    }
}

mod test;
