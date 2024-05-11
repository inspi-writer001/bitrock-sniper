import { decrypt, encrypt } from "../controllers/encryption.js";
import { findUser } from "../database/users.js";
import {
  buyAddress,
  sellAddress,
  sellState,
  state,
  usersAwaitingAmount,
  usersAwaitingSell
} from "../index.js";
import { err, log } from "../utils/globals.js";
import { txError } from "../errors/txError.js";
import { swapBack, useContract } from "../controllers/contract/swap.js";
import { fastKeyboard } from "../utils/keyboards.js";
import { customSellForSpecificUser } from "./editSettings.js";
import { generateImage } from "../utils/generateImage.js";
import { tokenInfo } from "../utils/prices.js";

export const sell = async (ctx) => {
  try {
    let username = ctx.from.id.toString();

    log(ctx.match[0]);
    // ctx.answerCbQuery("hello");
    log("nigga pressed it for sell");
    // const amountToBuy = "5";
    const amountToBuy = ctx.match[0].toString();

    let user = username;

    const currentUser = await findUser(user);
    const userAddress = currentUser.walletAddress;
    //   const userAvaxBalance = currentUser.balance;
    const userEncryptedMnemonics = currentUser.encrypted_mnemonnics;

    const mnemonics = decrypt(userEncryptedMnemonics);
    let response = sellAddress[user];

    // TODO remove test contract address

    if (amountToBuy === "sell_custom") {
      sellState[username] = {
        state: "awaiting_custom_sell",
        trade: {
          userAddress: userAddress,
          contractAddress: response.attributes.address,
          encrypted_mnemonics: userEncryptedMnemonics,
          decimals: response.attributes.decimals,
          ticker: response.attributes.symbol,
          coinName: response.attributes.name
        }
      };
      log("user value is different");
      log("User wants a custom value for sell");
      //   awaitingCustomValue = true;
      await ctx.reply("Enter the custom value to sell: 👀 example 0.3 👇");
      // const customValue = await getUserInput(ctx);

      usersAwaitingSell.push(username);
      log(usersAwaitingSell[username]);

      return;
    }

    let validAmount = amountToBuy.replace("p", "");
    validAmount == "100" ? (validAmount = "99") : (validAmount = validAmount);
    log("valid amount ", validAmount);

    // TODO remove test contract address
    log("===response ==");
    log(response);

    try {
      await ctx.reply("processing tx ⚡️ ==========");
      await ctx.reply("processing gas ⛽️ ==========");
      const result = await swapBack(
        userAddress,
        response.attributes.address,
        mnemonics,
        response.attributes.decimals,
        response.attributes.symbol,
        response.attributes.name,
        validAmount,
        "",
        true,
        ctx
      );

      // TODO change snowtrace
      await ctx.replyWithHTML(
        `<b>cheers 🪄🎉 here's your transaction hash:</b>\n<a href="https://explorer.bit-rock.io/tx/${result.hash}"> view on explorer ${result.hash}  </a>`,
        fastKeyboard
      );

      return;
    } catch (error) {
      await txError(error, ctx);
    }

    const customValue = ctx?.message?.text;
    usersAwaitingSell.includes(currentUser) &&
      (await customSellForSpecificUser(currentUser, customValue, ctx));
  } catch (error) {
    log(" error from custom sell ============");
    err(error);
  }
};

export const sendPnl = async (ctx) => {
  try {
    let username = ctx.from.id.toString();

    const userStateTrade = sellState[username].trade.contractAddress;

    const currentUser = await findUser(username);
    const userTrade = currentUser.trades[userStateTrade.toLowerCase()];

    const tokenI = await tokenInfo(userStateTrade);
    const imageUrl = await generateImage(
      userTrade.coinName,
      "| SELL",
      userTrade.entryPrice,
      tokenI.attributes.price_usd
    );

    await ctx.replyWithPhoto(imageUrl.data.download_url_png);
  } catch (error) {
    log(" error from sendPnl ============");
    err(error);
  }
};
