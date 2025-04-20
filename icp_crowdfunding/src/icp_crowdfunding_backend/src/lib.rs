use candid::{CandidType, Deserialize, Principal};
use ic_cdk::api::time;
use ic_cdk_macros::*;
use std::cell::RefCell;
use std::collections::BTreeMap;

// Define the Campaign structure
#[derive(CandidType, Deserialize, Clone)]
struct Campaign {
    id: u64,
    name: String,
    description: String,
    creator: Principal,
    goal_amount: u64,
    current_amount: u64,
    deadline: u64, // timestamp in nanoseconds
    is_active: bool,
    contributors: BTreeMap<Principal, u64>,
}

// Define the global state
thread_local! {
    static CAMPAIGNS: RefCell<BTreeMap<u64, Campaign>> = RefCell::new(BTreeMap::new());
    static NEXT_CAMPAIGN_ID: RefCell<u64> = RefCell::new(1);
}

// Function to create a new campaign
#[update]
fn create_campaign(name: String, description: String, goal_amount: u64, deadline: u64) -> u64 {
    let caller = ic_cdk::caller();
    let campaign_id = NEXT_CAMPAIGN_ID.with(|id| {
        let current_id = *id.borrow();
        *id.borrow_mut() = current_id + 1;
        current_id
    });

    let campaign = Campaign {
        id: campaign_id,
        name,
        description,
        creator: caller,
        goal_amount,
        current_amount: 0,
        deadline,
        is_active: true,
        contributors: BTreeMap::new(),
    };

    CAMPAIGNS.with(|campaigns| {
        campaigns.borrow_mut().insert(campaign_id, campaign);
    });

    campaign_id
}

// Function to contribute to a campaign
#[update]
fn contribute_to_campaign(campaign_id: u64, amount: u64) -> Result<(), String> {
    let caller = ic_cdk::caller();
    let current_time = time();

    CAMPAIGNS.with(|campaigns| {
        let mut campaigns_map = campaigns.borrow_mut();
        
        if let Some(campaign) = campaigns_map.get_mut(&campaign_id) {
            if !campaign.is_active {
                return Err("Campaign is not active".to_string());
            }
            
            if current_time > campaign.deadline {
                campaign.is_active = false;
                return Err("Campaign has ended".to_string());
            }
            
            // In a real implementation, you would handle the actual token transfer here
            // For this example, we're just updating the contribution amount
            campaign.current_amount += amount;
            
            // Update contributor's record
            let current_contribution = campaign.contributors.get(&caller).unwrap_or(&0);
            campaign.contributors.insert(caller, current_contribution + amount);
            
            Ok(())
        } else {
            Err("Campaign not found".to_string())
        }
    })
}

// Function to get a campaign details
#[query]
fn get_campaign(campaign_id: u64) -> Result<Campaign, String> {
    CAMPAIGNS.with(|campaigns| {
        match campaigns.borrow().get(&campaign_id) {
            Some(campaign) => Ok(campaign.clone()),
            None => Err("Campaign not found".to_string()),
        }
    })
}

// Function to get all campaigns
#[query]
fn get_all_campaigns() -> Vec<Campaign> {
    CAMPAIGNS.with(|campaigns| {
        campaigns.borrow().values().cloned().collect()
    })
}

// Function to check if a campaign has reached its goal
#[query]
fn is_campaign_successful(campaign_id: u64) -> Result<bool, String> {
    CAMPAIGNS.with(|campaigns| {
        match campaigns.borrow().get(&campaign_id) {
            Some(campaign) => {
                if time() < campaign.deadline {
                    Err("Campaign is still active".to_string())
                } else {
                    Ok(campaign.current_amount >= campaign.goal_amount)
                }
            },
            None => Err("Campaign not found".to_string()),
        }
    })
}

// Function to get user contributions
#[query]
fn get_user_contributions(campaign_id: u64) -> Result<u64, String> {
    let caller = ic_cdk::caller();
    
    CAMPAIGNS.with(|campaigns| {
        match campaigns.borrow().get(&campaign_id) {
            Some(campaign) => {
                Ok(*campaign.contributors.get(&caller).unwrap_or(&0))
            },
            None => Err("Campaign not found".to_string()),
        }
    })
}

candid::export_service!();

#[cfg(test)]
mod tests {

    #[test]
    fn save_candid() {
        use std::env;
        use std::fs::write;
        use std::path::PathBuf;

        let dir = PathBuf::from(env::var("CARGO_MANIFEST_DIR").unwrap());
        let did_path = dir.join("icp_crowdfunding_backend.did");

        let service = format!("type Campaign = record {{
            id: nat64;
            name: text;
            description: text;
            creator: principal;
            goal_amount: nat64;
            current_amount: nat64;
            deadline: nat64;
            is_active: bool;
            contributors: vec record {{ principal; nat64 }};
        }};
        
        service : {{
            create_campaign: (text, text, nat64, nat64) -> (nat64);
            contribute_to_campaign: (nat64, nat64) -> (variant {{ Ok; Err: text }});
            get_campaign: (nat64) -> (variant {{ Ok: Campaign; Err: text }}) query;
            get_all_campaigns: () -> (vec Campaign) query;
            is_campaign_successful: (nat64) -> (variant {{ Ok: bool; Err: text }}) query;
            get_user_contributions: (nat64) -> (variant {{ Ok: nat64; Err: text }}) query;
        }}");

        write(did_path, service).expect("Write failed.");
    }
}
