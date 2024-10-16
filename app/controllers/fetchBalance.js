import { ethers } from "ethers";
import { globals, log } from "../utils/globals.js";
//  "https://rpc.mevblocker.io/"
export const fetchETH = async (walletAddress) => {
  const provider = new ethers.JsonRpcProvider(globals.infuraSepolia);
  const balance = await provider.getBalance(walletAddress);
  const etherBalance = ethers.formatEther(balance);
  return Number(etherBalance).toFixed(3);
};

// log("========= wallet balance =======");
// log(await fetchETH("0xe011EC515c0E70094c8b4D5c9d36d3b499D9532d"));
