import dotenv from "dotenv";
import { fromCustomLamport } from "../../utils/converters.js";
import { err, log } from "../../utils/globals.js";
dotenv.config();
import axios from "axios";

const env = process.env;
const baseUrl = "https://explorer.bit-rock.io/api/v2";

// {
//     "token_address": "0xefd6c64533602ac55ab64442307f6fe2c9307305",
//     "name": "APE",
//     "symbol": "APE",
//     "logo": null,
//     "thumbnail": null,
//     "decimals": 18,
//     "balance": "101715701444169451516503179"
//   }

export const fetchTokenBalances = async (address) => {
  const preResponse = await axios.get(
    `${baseUrl}/addresses/${address}/token-balances`
  );
  const response = preResponse.data.map((e, i) => ({
    token_address: e.token.address,
    name: e.token.name,
    symbol: e.token.symbol,
    decimals: e.token.decimals,
    logo: e.token.icon_url,
    thumbnail: e.token.icon_url,
    balance: e.value
  }));

  let promises = [];

  const balances = response;

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

// log(fetchTokenBalances("0xb3049c4C314FA534E691369f0c4E7BA79bb2BD58"));

// [
//   {
//     token_address: "0xefd6c64533602ac55ab64442307f6fe2c9307305",
//     name: "APE",
//     symbol: "APE",
//     logo: null,
//     thumbnail: null,
//     decimals: 18,
//     balance: "101715701444169451516503179"
//   }
// ];

export const fetchSpecificTokenBalance = async (address, contractAddress) => {
  try {
    const preResponse = await axios.get(
      `${baseUrl}/addresses/${address}/token-balances`
    );
    const response = preResponse.data.map((e, i) => {
      log(e.token);
      log(contractAddress);
      if (e.token.address == contractAddress) {
        log(" ================ yes ================");
        log(preResponse.data[i]);
        return preResponse.data[i];
      } else {
        log("==== noooo ===");
        return [];
      }
    });

    if (response.length === 0) {
      throw new Error("Token not found");
    }

    const singleToken = {
      token_address: response[0].token.address,
      name: response[0].token.name,
      symbol: response[0].token.symbol,
      decimals: response[0].token.decimals,
      logo: response[0].token.icon_url,
      thumbnail: response[0].token.icon_url,
      balance: response[0].value
    };

    return [singleToken];
  } catch (error) {
    log("=============== error fetching balance ==");
    log(error);
    const singleToken = {
      token_address: contractAddress,
      name: "",
      symbol: "",
      decimals: 0,
      logo: "",
      thumbnail: "",
      balance: 0
    };
    return [singleToken];
  }
};

export const fetchTokenPrice = async (contractAddress) => {
  const response = await axios.get(
    `https://pro-api.coingecko.com/api/v3/onchain/networks/bitrock/tokens/${contractAddress}`,
    {
      headers: {
        "x-cg-pro-api-key": env.COINGECKO_API_KEY
      }
    }
  );
  const usdPrice = response.data.data.attributes.price_usd;
  return usdPrice;
};

// {
//     "address": "0x1f9840a85d5af5bf1d1762f925bdaddc4201f984",
//     "name": "Uniswap",
//     "symbol": "UNI",
//     "decimals": "18",
//     "logo": "https://cdn.moralis.io/eth/0x1f9840a85d5af5bf1d1762f925bdaddc4201f984.webp",
//     "logo_hash": "064ee9557deba73c1a31014a60f4c081284636b785373d4ccdd1b3440df11f43",
//     "thumbnail": "https://cdn.moralis.io/eth/0x1f9840a85d5af5bf1d1762f925bdaddc4201f984_thumb.webp",
//     "block_number": null,
//     "validated": null,
//     "created_at": "2022-01-20T10:39:55.818Z"
//   }

export const fetchTokenDetails = async (contractAddress) => {
  const preResponse = await axios.get(`${baseUrl}/tokens/${contractAddress}`);
  const dataResponse = preResponse.data;
  const response = [dataResponse];

  return response;
};
