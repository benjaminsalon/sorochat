#![cfg(test)]

use crate::{ChatContract, ChatContractClient, Message};
use soroban_sdk::{testutils::Address as _, vec, Address, Env, String};

#[test]
fn test() {
    let env = Env::default();
    env.mock_all_auths();

    let from = Address::generate(&env);
    let to = Address::generate(&env);
    let to_2 = Address::generate(&env);

    let contract_id = env.register_contract(None, ChatContract);
    let client = ChatContractClient::new(&env, &contract_id);
    let conversation_before = client.read_conversation(&from, &to);
    assert_eq!(conversation_before.len(), 0);

    let conversations_initiated = client.read_conversations_initiated(&from);
    assert_eq!(conversations_initiated, vec![&env]);

    client.write_message(&from, &to, &String::from_str(&env, "Bonjour l'ami!"));
    let conversation_after = client.read_conversation(&from, &to);
    // log!(&env, "{:?}", conversation_after);
    assert_eq!(conversation_after.len(), 1);
    assert_eq!(
        conversation_after,
        vec![
            &env,
            Message {
                msg: String::from_str(&env, "Bonjour l'ami!"),
                from: from.clone()
            }
        ]
    );

    let conversations_initiated = client.read_conversations_initiated(&from);
    assert_eq!(conversations_initiated, vec![&env, to.clone()]);
    let conversations_initiated = client.read_conversations_initiated(&to);
    assert_eq!(conversations_initiated, vec![&env, from.clone()]);

    client.write_message(&from, &to_2, &String::from_str(&env, "Bonjour l'ami!"));
    let conversation_after = client.read_conversation(&from, &to_2);
    assert_eq!(conversation_after.len(), 1);
    assert_eq!(
        conversation_after,
        vec![
            &env,
            Message {
                msg: String::from_str(&env, "Bonjour l'ami!"),
                from: from.clone()
            }
        ]
    );

    let conversations_initiated = client.read_conversations_initiated(&from);
    assert_eq!(
        conversations_initiated,
        vec![&env, to.clone(), to_2.clone()]
    );
    let conversations_initiated = client.read_conversations_initiated(&to_2);
    assert_eq!(conversations_initiated, vec![&env, from]);
}
