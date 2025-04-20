import { Actor, HttpAgent } from '@dfinity/agent';
import { Principal } from '@dfinity/principal';
import { idlFactory } from '../../../declarations/icp_crowdfunding_backend/icp_crowdfunding_backend.did.js';

// Global variables
let agent;
let backendActor;

/**
 * Initializes the API with the provided identity (or anonymous)
 * @param {Identity} identity - The user's identity (optional)
 */
export const initializeApi = async (identity = null) => {
  const isLocalNetwork = process.env.DFX_NETWORK !== 'ic';
  
  // Create an agent (anonymous or with identity)
  agent = new HttpAgent({
    host: isLocalNetwork ? 'http://localhost:4943' : 'https://ic0.app',
    identity,
  });

  // Only fetch the root key when in local development
  if (isLocalNetwork) {
    await agent.fetchRootKey();
  }

  // Create the actor using the agent
  const canisterId = process.env.CANISTER_ID_ICP_CROWDFUNDING_BACKEND || process.env.ICP_CROWDFUNDING_BACKEND_CANISTER_ID;
  
  backendActor = Actor.createActor(idlFactory, {
    agent,
    canisterId,
  });
};

/**
 * Creates a new campaign
 * @param {string} name - Campaign name
 * @param {string} description - Campaign description
 * @param {number} goalAmount - Goal amount in tokens
 * @param {number} deadline - Deadline in nanoseconds since epoch
 * @returns {Promise<number>} - Campaign ID
 */
export const createCampaign = async (name, description, goalAmount, deadline) => {
  if (!backendActor) throw new Error('API not initialized');
  
  try {
    // Convert JavaScript number to BigInt for the Candid interface
    const bigintGoalAmount = BigInt(goalAmount);
    const bigintDeadline = BigInt(deadline);
    
    const campaignId = await backendActor.create_campaign(
      name,
      description,
      bigintGoalAmount,
      bigintDeadline
    );
    
    return Number(campaignId);
  } catch (error) {
    console.error('Failed to create campaign:', error);
    throw error;
  }
};

/**
 * Fetches all campaigns
 * @returns {Promise<Array>} - Array of campaigns
 */
export const getAllCampaigns = async () => {
  if (!backendActor) throw new Error('API not initialized');
  
  try {
    const campaigns = await backendActor.get_all_campaigns();
    
    // Convert BigInt values to numbers for easier handling in React
    return campaigns.map(formatCampaign);
  } catch (error) {
    console.error('Failed to fetch campaigns:', error);
    throw error;
  }
};

/**
 * Fetches a specific campaign
 * @param {number} campaignId - Campaign ID
 * @returns {Promise<Object>} - Campaign details
 */
export const getCampaign = async (campaignId) => {
  if (!backendActor) throw new Error('API not initialized');
  
  try {
    const result = await backendActor.get_campaign(BigInt(campaignId));
    
    if ('Err' in result) {
      throw new Error(result.Err);
    }
    
    return formatCampaign(result.Ok);
  } catch (error) {
    console.error(`Failed to fetch campaign ${campaignId}:`, error);
    throw error;
  }
};

/**
 * Contributes to a campaign
 * @param {number} campaignId - Campaign ID
 * @param {number} amount - Contribution amount in tokens
 * @returns {Promise<void>}
 */
export const contributeToCampaign = async (campaignId, amount) => {
  if (!backendActor) throw new Error('API not initialized');
  
  try {
    const result = await backendActor.contribute_to_campaign(
      BigInt(campaignId),
      BigInt(amount)
    );
    
    if ('Err' in result) {
      throw new Error(result.Err);
    }
    
    return result.Ok;
  } catch (error) {
    console.error(`Failed to contribute to campaign ${campaignId}:`, error);
    throw error;
  }
};

/**
 * Gets user contributions for a campaign
 * @param {number} campaignId - Campaign ID
 * @returns {Promise<number>} - User's contribution amount
 */
export const getUserContributions = async (campaignId) => {
  if (!backendActor) throw new Error('API not initialized');
  
  try {
    const result = await backendActor.get_user_contributions(BigInt(campaignId));
    
    if ('Err' in result) {
      throw new Error(result.Err);
    }
    
    return Number(result.Ok);
  } catch (error) {
    console.error(`Failed to get user contributions for campaign ${campaignId}:`, error);
    throw error;
  }
};

/**
 * Checks if a campaign has reached its goal
 * @param {number} campaignId - Campaign ID
 * @returns {Promise<boolean>} - Success status
 */
export const isCampaignSuccessful = async (campaignId) => {
  if (!backendActor) throw new Error('API not initialized');
  
  try {
    const result = await backendActor.is_campaign_successful(BigInt(campaignId));
    
    if ('Err' in result) {
      throw new Error(result.Err);
    }
    
    return result.Ok;
  } catch (error) {
    console.error(`Failed to check success for campaign ${campaignId}:`, error);
    throw error;
  }
};

/**
 * Helper function to format campaign data from canister
 * @param {Object} campaign - Raw campaign data from canister
 * @returns {Object} - Formatted campaign data
 */
const formatCampaign = (campaign) => {
  // Convert contributors array to a more usable format
  const contributorsMap = {};
  campaign.contributors.forEach(([principalId, amount]) => {
    contributorsMap[principalId.toString()] = Number(amount);
  });
  
  return {
    id: Number(campaign.id),
    name: campaign.name,
    description: campaign.description,
    creator: campaign.creator.toString(),
    goalAmount: Number(campaign.goal_amount),
    currentAmount: Number(campaign.current_amount),
    deadline: Number(campaign.deadline),
    isActive: campaign.is_active,
    contributors: contributorsMap,
    progress: Number(campaign.current_amount) / Number(campaign.goal_amount) * 100,
  };
};

/**
 * Updates the API with a new identity
 * @param {Identity} identity - The user's identity
 */
export const updateApiIdentity = (identity) =>

