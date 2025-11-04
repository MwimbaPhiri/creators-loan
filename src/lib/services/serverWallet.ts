import { CdpClient } from "@coinbase/cdp-sdk";

let cdpClient: CdpClient | null = null;

/**
 * Initialize CDP Client for server-side wallet operations
 */
export function initializeCDPClient() {
  if (!cdpClient) {
    // The CDP client automatically loads credentials from environment variables:
    // CDP_API_KEY_ID, CDP_API_KEY_SECRET, CDP_WALLET_SECRET
    cdpClient = new CdpClient();
  }
  return cdpClient;
}

/**
 * Get or create an escrow account for the platform
 * This account will hold creator coins as collateral
 */
export async function getOrCreateEscrowAccount() {
  const cdp = initializeCDPClient();
  
  try {
    // Try to get existing escrow account by name
    const account = await cdp.evm.getOrCreateAccount({
      name: "platform-escrow-main",
    });
    
    console.log(`Escrow account address: ${account.address}`);
    return account;
  } catch (error) {
    console.error("Error getting/creating escrow account:", error);
    throw error;
  }
}

/**
 * Create a unique escrow account for a specific loan application
 * @param loanId - The unique identifier for the loan
 */
export async function createLoanEscrowAccount(loanId: string) {
  const cdp = initializeCDPClient();
  
  try {
    const account = await cdp.evm.getOrCreateAccount({
      name: `loan-escrow-${loanId}`,
    });
    
    console.log(`Loan escrow account created: ${account.address} for loan ${loanId}`);
    return account;
  } catch (error) {
    console.error(`Error creating loan escrow account for ${loanId}:`, error);
    throw error;
  }
}

/**
 * Get account balance for an escrow account
 * @param accountAddress - The escrow account address
 * @param network - The network to check (e.g., "base-mainnet", "base-sepolia")
 */
export async function getEscrowBalance(
  accountAddress: string,
  network: string = "base-mainnet"
) {
  const cdp = initializeCDPClient();
  
  try {
    // Get ETH balance
    const balance = await cdp.evm.getBalance({
      address: accountAddress,
      network,
    });
    
    return balance;
  } catch (error) {
    console.error(`Error getting balance for ${accountAddress}:`, error);
    throw error;
  }
}

/**
 * Send a transaction from an escrow account
 * Used for releasing collateral or returning funds
 */
export async function sendFromEscrow(params: {
  fromAddress: string;
  toAddress: string;
  amount: bigint;
  network: string;
  data?: string;
}) {
  const cdp = initializeCDPClient();
  
  try {
    const result = await cdp.evm.sendTransaction({
      address: params.fromAddress,
      transaction: {
        to: params.toAddress,
        value: params.amount,
        data: params.data,
        type: "eip1559",
      },
      network: params.network,
    });
    
    console.log(`Transaction sent from escrow: ${result.transactionHash}`);
    return result;
  } catch (error) {
    console.error("Error sending from escrow:", error);
    throw error;
  }
}

/**
 * Request testnet funds for an escrow account (for testing only)
 */
export async function fundEscrowTestnet(accountAddress: string) {
  const cdp = initializeCDPClient();
  
  try {
    const faucetResponse = await cdp.evm.requestFaucet({
      address: accountAddress,
      network: "base-sepolia",
      token: "eth",
    });
    
    console.log(`Testnet funds requested: ${faucetResponse.transactionHash}`);
    return faucetResponse;
  } catch (error) {
    console.error("Error requesting testnet funds:", error);
    throw error;
  }
}

/**
 * Close the CDP client connection
 */
export async function closeCDPClient() {
  if (cdpClient) {
    await cdpClient.close();
    cdpClient = null;
  }
}
