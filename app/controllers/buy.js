import axios from "axios";
import dotenv from "dotenv";
import { err, log } from "../utils/globals.js";
import {
  buyMessage,
  buyOptions,
  sellOptions,
  snipeOptions
} from "../utils/keyboards.js";
import { buyAddress, pnlState, preSniper, sellAddress } from "../index.js";
import { findUser } from "../database/users.js";
import { dextoolsAudit, fetchSpecificTokenBalance } from "./moralis/moralis.js";
import { fromCustomLamport } from "../utils/converters.js";
import { getAverageGasLimit } from "./ethers/blockDetails.js";
import { fetchETH } from "./fetchBalance.js";
import { EthPrice } from "../utils/prices.js";
import { fetchHoneypot } from "./fetchHoneypot.js";

dotenv.config();
const env = process.env;

export const buyTrade = async (contractAddress, ctx, sell = false) => {
  try {
    let username = ctx.from.id.toString();

    log(contractAddress);

    const asynchronous = await Promise.all([
      findUser(username)
      // getAverageGasLimit()
    ]);
    const user = asynchronous[0];
    // const gasLimit = asynchronous[1];
    const userAddress = user.walletAddress;

    const tokenBalance = await fetchSpecificTokenBalance(
      userAddress,
      contractAddress
    );

    let formattedBalance = fromCustomLamport(
      tokenBalance[0]?.balance || 0,
      tokenBalance[0]?.decimals || 0
    );

    const userBalance = await fetchETH(userAddress);
    const balanceWorth = await EthPrice(userBalance);

    log(formattedBalance);
    await axios
      .get(
        `https://pro-api.coingecko.com/api/v3/onchain/networks/bitrock/tokens/${contractAddress}`,
        {
          headers: {
            "x-cg-pro-api-key": env.COINGECKO_API_KEY
          }
        }
      )
      .then(async (response) => {
        log("===== response from geckoterminal ====");
        let poolData = "";
        if (response.data.data.relationships.top_pools.data.length > 0) {
          const pool = await axios.get(
            `https://pro-api.coingecko.com/api/v3/onchain/networks/bitrock/pools/${
              response.data.data.relationships.top_pools.data[0].id.split(
                "bitrock_"
              )[1]
            }`,
            {
              headers: {
                "x-cg-pro-api-key": env.COINGECKO_API_KEY
              }
            }
          );
          poolData = pool.data.data;
        }

        const dextools = await dextoolsAudit(contractAddress);

        //   log(response);
        const body = {
          balance: Number(formattedBalance).toFixed(3) || 0,
          buyTax: dextools.buyTax,
          sellTax: dextools.sellTax
        };

        const message = buyMessage(response, body, poolData);
        const option = buyOptions(
          contractAddress,
          user.defaultAddress,
          user.walletAddress,
          userBalance,
          balanceWorth,
          user.slippage ? user.slippage : "default"
        );
        const sellOption = sellOptions(
          contractAddress,
          user.defaultAddress,
          user.walletAddress,
          userBalance,
          balanceWorth
        );

        // keyboard

        typeof sell == "string" && sell === "snipe"
          ? (async () => {
              await ctx.replyWithHTML(
                message,
                snipeOptions(
                  contractAddress,
                  user.defaultAddress,
                  user.walletAddress,
                  userBalance,
                  balanceWorth
                )
              );
              preSniper[username] = {
                state: "awaiting_snipe",
                trade: {
                  userAddress: user.walletAddress,
                  contractAddress: contractAddress,
                  encrypted_mnemonics: user.encrypted_mnemonnics
                }
              };
            })()
          : typeof sell == "boolean" && sell == true
          ? (async () => {
              await ctx.replyWithHTML(message, sellOption);
              pnlState[username] = {
                state: "pnl",
                trade: {
                  userAddress: userAddress,
                  contractAddress: response.data.data.attributes.address,
                  decimals: response.data.data.attributes.decimals,
                  ticker: response.data.data.attributes.symbol,
                  tokenName: response.data.data.attributes.name
                }
              };
            })()
          : await ctx.replyWithHTML(message, option);
        typeof sell == "boolean" && sell == true
          ? (sellAddress[username] = response.data.data)
          : (buyAddress[username] = response.data.data);
      });
  } catch (error) {
    err(error);
    err("couldn't fetch tokens");
    log(error);
    if (error.toString().toLowerCase().includes("moralis")) {
      await ctx.reply(
        " something went wrong 😵‍💫 \nplease reselect default address"
      );
    } else {
      await ctx.reply(" couldn't find any tokens there 😵‍💫");
    }
  }
};

// 0x9c0241e7538b35454735ae453423daf470a25b3a
