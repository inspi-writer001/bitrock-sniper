import Moralis from "moralis";
import { EvmChain } from "@moralisweb3/common-evm-utils";
import dotenv from "dotenv";
import { fromCustomLamport } from "../../utils/converters.js";
import { err, log } from "../../utils/globals.js";
dotenv.config();

const chain = EvmChain.ETHEREUM;

// console.log(chain.toJSON());

// const chain = {
//   _value: "0x1c03",
//   _chainlistData: {
//     name: "Bitrock Mainnet",
//     chain: "BITROCK",
//     icon: "bitrock",
//     rpc: ["https://brockrpc.io", "https://connect.bit-rock.io"],
//     features: [{ name: "EIP155" }, { name: "EIP1559" }],
//     faucets: [],
//     nativeCurrency: { name: "Bitrock", symbol: "BROCK", decimals: 18 },
//     infoURL: "https://www.bit-rock.io",
//     shortName: "bitrock",
//     chainId: 7171,
//     networkId: 7171,
//     slip44: 60,
//     ens: { registry: "0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e" },
//     explorers: [
//       {
//         name: "blockscout",
//         url: "https://explorer.bit-rock.io",
//         icon: "blockscout",
//         standard: "EIP3091"
//       }
//     ]
//   }
// };

export const connectToMoralis = async () => {
  try {
    await Moralis.start({
      apiKey: process.env.MORALIS_API
      // ...and any other configuration
    });
    log("=====================================");
    log("=====================================");
    log("connected to moralis successfully");
  } catch (error) {
    err("======= error connectng to moralis ====");
    err(error);
  }
};

export const fetchTokenBalances = async (address) => {
  log(chain);
  log(chain._chainlistData);
  const response = await Moralis.EvmApi.token.getWalletTokenBalances({
    address: address,
    chain: chain
  });

  let promises = [];

  const balances = response.toJSON();

  let sortedAmount = [];

  for (let i = 0; i < balances.length; i++) {
    let promise = new Promise((resolve, reject) => {
      if (
        fromCustomLamport(balances[i].balance, balances[i].decimals) > 0.005
      ) {
        sortedAmount.push(balances[i]);
        resolve();
      } else {
        resolve();
      }
    });

    promises.push(promise);
  }

  await Promise.all(promises);

  log(" ======= sortedAmount =======");
  log(sortedAmount);

  return sortedAmount;
};

export const fetchSpecificTokenBalance = async (address, contractAddress) => {
  // TODO remove test token contract address
  const response = await Moralis.EvmApi.token.getWalletTokenBalances({
    address: address,
    tokenAddresses: [contractAddress],
    chain: chain
  });

  // log(response.toJSON());
  return response.toJSON();
};

export const fetchTokenPrice = async (contractAddress) => {
  const response = await Moralis.EvmApi.token.getTokenPrice({
    address: contractAddress,
    chain
  });

  return response.toJSON().usdPrice;
};

export const fetchTokenDetails = async (contractAddress) => {
  // log("fetching specific token details");
  const response = await Moralis.EvmApi.token.getTokenMetadata({
    chain,
    addresses: [contractAddress]
  });

  log(response.toJSON());
  return response.toJSON();
};
