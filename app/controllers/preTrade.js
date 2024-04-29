import { ethers } from "ethers";
import {
  factoeryMainnet,
  factoryTestnet,
  smartContractMainnetAddress,
  smartContractTestnetAddress
} from "./contract/contractAddress.js";
import { err, globals, log } from "../utils/globals.js";
import User from "../Schema/User.js";
import { decrypt } from "./encryption.js";
import { fetchETH } from "./fetchBalance.js";
import { BN } from "bn.js";
import { EthPrice, poolInfo, tokenInfo, tokenPrice } from "../utils/prices.js";
import mongoose from "mongoose";
import { pusher } from "./mongo.js";
import { fromCustomLamport } from "../utils/converters.js";
import { addSnipe } from "../database/snipe.js";
import PreSnipes from "../Schema/PreSnipes.js";
import { changePreSnipeState } from "../database/preSnipe.js";
import { useContract } from "./contract/swap.js";

const db = mongoose.connection;

const routerAbi = [
  "function getAmountsOut(uint amountIn, address[] memory path) public view returns (uint[] memory amounts)",
  "function swapExactTokensForTokens(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) external returns (uint[] memory amounts)"
];

const factoryAbi = [
  "event PairCreated(address indexed token0, address indexed token1, address pair, uint)"
];

const pairAbi = [
  "function getReserves() external view returns (uint112 reserve0, uint112 reserve1, uint32 blockTimestampLast)",
  "function token0() external view returns (address)",
  "function token1() external view returns (address)"
];

// TODO change WETH address from sepolia to mainnet
const WETH = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";
// const WETH = "0x7b79995e5f793A07Bc00c21412e50Ecae098E7f9"; // testnet
// const uniswapV2FactorySepoliaIsh = "0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f";
const factoryContract = factoeryMainnet;

// testnet factory "0x7E0987E5b3a30e3f2828572Bb659A548460a3003" ||
// const factoryContract =  factoryTestnet;
const routerContract = smartContractTestnetAddress; // mainnet router
// const routerContract = smartContractMainnetAddress;

export const preSnipeAction = async (bot) => {
  try {
    // const provider = new ethers.WebSocketProvider(globals.infuraSepoliaWss);
    const provider = new ethers.WebSocketProvider(globals.infuraMainnetWss); // testnet

    const factory = new ethers.Contract(factoryContract, factoryAbi, provider);

    factory.on("PairCreated", async (token0, token1, pairAddress) => {
      log(
        `New pair detected\n=================\ntoken0: ${token0}\ntoken1: ${token1}\npairAddress: ${pairAddress}`
      );
      const waitingUsers = await PreSnipes.find({
        "snipes.isActive": 0
      }).lean();

      waitingUsers.map(async (currentTrade) => {
        const currentUser = await User.findOne({
          username: currentTrade.username
        });
        if (currentUser) {
          log(" === found user %s awaiting trade ===", currentUser.username);
          let tokenIn, tokenOut, reserveEth, contractIndex;
          if (token0 === WETH) {
            // reserveEth = reserves[0];
            tokenIn = token0;
            tokenOut = token1;
          } else if (token1 == WETH) {
            // reserveEth = reserves[1];
            tokenIn = token1;
            tokenOut = token0;
          } else {
            log(" ==== undefined tokenIn ====");
            return;
          }
          contractIndex = currentTrade.snipes.findIndex(
            (snipeContractAddress) =>
              snipeContractAddress.tokenContractAddress == tokenOut
          );
          log("===== contract index =====", contractIndex);

          if (contractIndex !== -1) {
            const userBalance = await fetchETH(currentUser.walletAddress);
            let buyAmount;
            if (currentUser.buyType == 0) {
              buyAmount = (userBalance * (currentUser.buyAmount / 100)).toFixed(
                3
              );
            } else {
              buyAmount = currentUser.buyAmount;
            }
            if (buyAmount > 0 && Number(userBalance) > 0.0005) {
              log(
                "=== taking trade on behalf of user %s and amount %d ===",
                currentUser.username,
                buyAmount
              );
              try {
                const tookTrade = await useContract(
                  currentUser.walletAddress,
                  currentTrade.snipes[contractIndex].tokenContractAddress,
                  decrypt(currentUser.encrypted_mnemonnics),
                  "",
                  "",
                  "",
                  buyAmount.toString(),
                  ""
                );
                await changePreSnipeState(currentTrade.username, tokenOut, 1);
                await bot.sendMessage(
                  currentUser.username,
                  `<b>cheers 🪄🎉, you sniped a pool. Here's your transaction hash:</b>\n<a href="https://explorer.bit-rock.io/search-results?q=${tookTrade.hash}"> view on explorer  ${tookTrade.hash} </a>`,
                  { parse_mode: "HTML" }
                );
              } catch (errr) {
                log(" ==== error from making transaction ====", errr);
              }
            } else {
              log(
                "user %s doesnt have enough balance or buy amount",
                currentUser.username
              );
            }
          } else {
            log("=== user isn't watching this token ===");
          }
        }
      });
    });
  } catch (error) {
    log(" ======= error from snipe ======");
    err(error);
  }
};
