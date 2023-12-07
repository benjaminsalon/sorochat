#![cfg(test)]

use crate::{ChatContract, ChatContractClient};
use soroban_sdk::{testutils::Address as _, Address, Env, String};

#[test]
fn test() {
    let env = Env::default();

    let from = Address::random(&env);
    let to = Address::random(&env);

    let contract_id = env.register_contract(None, ChatContract);
    let client = ChatContractClient::new(&env, &contract_id);

    client.write_message(&from, &to, &String::from_slice(&env, "Bonjour l'ami!"));
    // let client_default_title = client.read_title();
    // assert_eq!(client_default_title, String::from_slice(&env, "Default Title"));

    // client.set_title(&String::from_slice(&env, "My New Title"));
    // let client_new_title = client.read_title();

    // assert_eq!(client_new_title, String::from_slice(&env, "My New Title"));
}
