import axios from "axios";
import { buyTrade } from "../controllers/buy.js";
import { swapBack, useContract } from "../controllers/contract/swap.js";
import { decrypt, encrypt } from "../controllers/encryption.js";
import {
  buyDB,
  editBuyAmount,
  editSellHiAmount,
  editSellHi_x,
  editSellLoAmount,
  editSellLo_x,
  setMaxBuyTax,
  setMaxLiq,
  setMaxMC,
  setMaxSellTax,
  setMinLiq,
  setMinMC,
  setSlippage
} from "../controllers/settings.js";
import { txError } from "../errors/txError.js";
import {
  bot,
  buySettingsState,
  preSnipe,
  selectPreSnipes,
  selectToken,
  sellSettingsState,
  sellState,
  state,
  usersAwaitingAmount,
  usersAwaitingSell
} from "../index.js";
import { log, err } from "../utils/globals.js";
import { isWalletValid } from "../utils/isWalletValid.js";
import { buyMessage, fastKeyboard } from "../utils/keyboards.js";
import { Markup } from "telegraf";
import { findUser } from "../database/users.js";
import { preSnipeActionDB, removeSnipeFromList } from "../database/preSnipe.js";
import { fetchTokenDetails } from "../controllers/moralis/moralis.js";

// bot.action("editMinMCap", async (ctx) => {
//   log("hit");
//   await ctx.replyWithHTML(
//     `<code>Enter Minimum Market Cap Value: 1000 == $1000 Market cap</code>`
//   );
// });

// bot.on("text", async (cttx) => {
//   log("received");
//   log(cttx.message.text);
//   return;
// });

export const pendingSettings = async () => {
  return bot.on("text", async (ctx) => {
    let username = ctx.from.id.toString();
    let text = ctx.message.text;
    // buySettingsState.hasOwnProperty(username);
    try {
      if (buySettingsState[username] && Number(text)) {
        if (buySettingsState[username].type == "editMinMCap") {
          await setMinMC(username, Number(text));
          await ctx.replyWithHTML(`<i> minimum MarketCap set to $${text}</i>`);
          delete buySettingsState[username];
        } else if (buySettingsState[username].type == "editMaxMCap") {
          await setMaxMC(username, Number(text));
          await ctx.replyWithHTML(`<i> max MarketCap set to $${text}</i>`);
          delete buySettingsState[username];
        } else if (buySettingsState[username].type == "editMinLiquidity") {
          await setMinLiq(username, Number(text));
          await ctx.replyWithHTML(`<i> minimum Liquidity set to $${text}</i>`);
          delete buySettingsState[username];
        } else if (buySettingsState[username].type == "editMaxLiquidity") {
          await setMaxLiq(username, Number(text));
          await ctx.replyWithHTML(`<i> max Liquidity set to $${text}</i>`);
          delete buySettingsState[username];
        } else if (buySettingsState[username].type == "editMaxBuyTax") {
          await setMaxBuyTax(username, Number(text));
          await ctx.replyWithHTML(`<i> max buy Tax set to ${text}%</i>`);
          delete buySettingsState[username];
        } else if (buySettingsState[username].type == "editSlippage") {
          await setSlippage(username, Number(text));
          await ctx.replyWithHTML(
            `<i> Slippage set to ${Math.ceil(Number(text))}%</i>`
          );
          delete buySettingsState[username];
        } else if (buySettingsState[username].type == "editBuyAmount") {
          await editBuyAmount(username, Number(text));
          const user = await findUser(username);
          await ctx.replyWithHTML(
            `<i> buyAmount set to ${text}${
              user.buyType == 0 ? "%" : "BROCK"
            }</i>`
          );
          delete buySettingsState[username];
        }
      } else if (buySettingsState[username] && !Number(text)) {
        log("========== from pendingSettings ==========");
        err("========= is not a number ==========");
        await ctx.replyWithHTML(`<i> enter a valid number </i>`);
      }

      // sell state settings
      if (sellSettingsState[username] && Number(text)) {
        if (sellSettingsState[username].type == "editMaxSellTax") {
          await setMaxSellTax(username, Number(text));
          await ctx.replyWithHTML(`<i> max sell Tax set to ${text}%</i>`);
          delete sellSettingsState[username];
        } else if (sellSettingsState[username].type == "editSellHix") {
          await editSellHi_x(username, Number(text));
          await ctx.replyWithHTML(
            `<i> take profit set to ${text}x above entry</i>`
          );
          delete sellSettingsState[username];
        } else if (sellSettingsState[username].type == "editSellLox") {
          await editSellLo_x(username, Number(text));
          await ctx.replyWithHTML(
            `<i> stop loss set to ${text}x below entry</i>`
          );
          delete sellSettingsState[username];
        } else if (sellSettingsState[username].type == "editSellHiAmount") {
          await editSellHiAmount(username, Number(text));
          await ctx.replyWithHTML(
            `<i> take profit set to ${text}% above entry</i>`
          );
          delete sellSettingsState[username];
        } else if (sellSettingsState[username].type == "editSellLoAmount") {
          await editSellLoAmount(username, Number(text));
          await ctx.replyWithHTML(
            `<i> stop loss set to ${text}% below entry</i>`
          );
          delete sellSettingsState[username];
        }
      } else if (sellSettingsState[username] && !Number(text)) {
        log("========== from pendingSettings ==========");
        err("========= is not a number ==========");
        await ctx.replyWithHTML(`<i> enter a valid number </i>`);
      }

      isWalletValid(text) &&
        !preSnipe.includes(username) &&
        buyTrade(text, ctx, username);

      isWalletValid(text) &&
        preSnipe.includes(username) &&
        (await preSnipeActionDB(text, username, ctx));

      const customValue = ctx.message.text;

      usersAwaitingAmount.includes(username)
        ? await customBuyForSpecificUser(username, customValue, ctx)
        : usersAwaitingSell.includes(username) &&
          (await customSellForSpecificUser(username, customValue, ctx));
    } catch (error) {
      log("========= from general pendingSetting try catch =========");
      err(error);
    }
  });
};

const customBuyForSpecificUser = async (username, customValue, ctx) => {
  log("heyy I got a custom value ", customValue);
  log("from ", username);
  const index = usersAwaitingAmount.indexOf(username);
  state[username].trade.amount = customValue;

  usersAwaitingAmount.splice(index, 1);
  log(usersAwaitingAmount);
  log(state[username]);

  log("running custom buy ============");

  // await ctx.reply("processing tx ⚡️ ==========");
  // await ctx.reply("processing gas ⛽️ ==========");

  const currentUser = await findUser(username);
  const message = await ctx.replyWithHTML(
    `🔘 Submitting Transaction || Wallet ${
      currentUser.defaultAddress + 1
    } <a href="https://explorer.bit-rock.io/address/${
      currentUser.walletAddress
    }">${currentUser.walletAddress}</a>`,
    {
      link_preview_options: {
        is_disabled: true
      }
    }
  );

  // TODO remove test contract address

  try {
    const result = await useContract(
      state[username].trade.userAddress,
      state[username].trade.contractAddress,
      decrypt(state[username].trade.encrypted_mnemonics),
      state[username].trade.decimals,
      state[username].trade.ticker,
      state[username].trade.coinName,
      state[username].trade.amount,
      state[username].trade.slippage
    );

    await buyDB(
      username,
      state[username].trade.contractAddress,
      state[username].trade.amount,
      state[username].trade.entryPrice,
      state[username].trade.entryMCAP,
      state[username].trade.coinName
    );

    await ctx.deleteMessage(message.message_id);

    await ctx.replyWithHTML(
      `<b>📝 Transaction Approved || You bought approx. </b> <a href="https://explorer.bit-rock.io/tx/${
        result.hash
      }">${Number(result.amountOut).toFixed(2)} $${
        state[username].trade.coinName
      } for ${state[username].trade.amount} $BROCK</a> || 💳 Wallet ${
        currentUser.defaultAddress + 1
      } <a href="https://explorer.bit-rock.io/address/${
        currentUser.walletAddress
      }">${currentUser.walletAddress}</a>`,
      {
        link_preview_options: {
          is_disabled: true
        }
      }
    );

    // await ctx.replyWithHTML(
    //   `<b>cheers 🪄🎉 here's your transaction hash:</b>\n<a href="https://explorer.bit-rock.io/tx/${result.hash}"> view on explorer ${result.hash}  </a>`
    // );
    // await ctx.replyWithHTML(
    //   `<b> fetching your portfolio details ♻️ ===== </b>`
    // );

    return;
  } catch (error) {
    await txError(error, ctx);
  }

  state.hasOwnProperty(username) && delete state[username];
  log(state);
};

export const customSellForSpecificUser = async (username, customValue, ctx) => {
  log("heyy I got a custom value ", customValue);
  log("from ", username);
  const index = usersAwaitingSell.indexOf(username);
  sellState[username].trade.amount = customValue;

  usersAwaitingSell.splice(index, 1);
  log(usersAwaitingSell);
  log(sellState[username]);

  log("running custom sell ==========");
  const currentUser = await findUser(username);
  const message = await ctx.replyWithHTML(
    `🔘 Submitting Transaction || Wallet ${
      currentUser.defaultAddress + 1
    } <a href="https://explorer.bit-rock.io/address/${
      currentUser.walletAddress
    }">${currentUser.walletAddress}</a>`,
    {
      link_preview_options: {
        is_disabled: true
      }
    }
  );

  // await ctx.reply("========== processing tx ⚡️");
  // await ctx.reply("========== processing gas ⛽️");

  // TODO remove test contractAddress

  try {
    const result = await swapBack(
      sellState[username].trade.userAddress,
      sellState[username].trade.contractAddress,
      decrypt(sellState[username].trade.encrypted_mnemonics),
      sellState[username].trade.decimals,
      sellState[username].trade.ticker,
      sellState[username].trade.coinName,
      sellState[username].trade.amount,
      sellState[username].trade.slippage,
      false,
      ctx
    );

    await ctx.deleteMessage(message.message_id);

    await ctx.replyWithHTML(
      `<b>📝 Transaction Approved || You sold </b> <a href="https://explorer.bit-rock.io/tx/${
        result.hash
      }">${result.amount} $${
        sellState[username].trade.coinName
      } for approx. ${Number(result.amountOut).toFixed(
        2
      )} $BROCK</a> || 💳 Wallet ${
        currentUser.defaultAddress + 1
      } <a href="https://explorer.bit-rock.io/address/${result.hash}">${
        currentUser.walletAddress
      }</a>`,
      {
        link_preview_options: {
          is_disabled: true
        }
      }
    );

    // await ctx.replyWithHTML(
    //   `<b>cheers 🪄🎉 here's your transaction hash:</b>\n<a href="https://explorer.bit-rock.io/tx/${result.hash}"> view on explorer ${result.hash}  </a>`,
    //   {
    //     link_preview_options: {
    //       is_disabled: true
    //     }
    //   }
    // );
    return;
  } catch (error) {
    await txError(error, ctx);
  }

  sellState.hasOwnProperty(username) && delete sellState[username];
  log(sellState);
};

export const sellCallBackQuery = async (ctx) => {
  try {
    let username = ctx.from.id.toString();
    let userInput = ctx.callbackQuery.data;
    log(" ============= userInput ============== ");
    log(userInput);
    const increaseDefaultNumber = () => {
      if (selectToken[username].tokenIndex < selectToken[username].max)
        selectToken[username].tokenIndex = selectToken[username].tokenIndex + 1;
    };
    const decreaseDefaultNumber = () => {
      if (selectToken[username].tokenIndex > 0)
        selectToken[username].tokenIndex = selectToken[username].tokenIndex - 1;
    };
    const increaseDefaultNumberB = () => {
      if (selectPreSnipes[username].tokenIndex < selectPreSnipes[username].max)
        selectPreSnipes[username].tokenIndex =
          selectPreSnipes[username].tokenIndex + 1;
    };
    const decreaseDefaultNumberB = () => {
      if (selectPreSnipes[username].tokenIndex > 0)
        selectPreSnipes[username].tokenIndex =
          selectPreSnipes[username].tokenIndex - 1;
    };

    const switchingKeyboard = Markup.inlineKeyboard([
      Markup.button.callback(`⏪ Prev`, `prev`),
      Markup.button.callback(
        `${
          selectToken[username].tokens[selectToken[username].tokenIndex].name
        }`,
        `${selectToken[username].tokens[
          selectToken[username].tokenIndex
        ].token_address.toString()}`
      ),
      Markup.button.callback(`⏩ Next`, `next`)
    ]);

    if (userInput == "prev") {
      log("goto previous token");
      decreaseDefaultNumber();
      log(selectToken[username].tokenIndex);
      await ctx.editMessageReplyMarkup(switchingKeyboard.reply_markup);
    } else if (userInput == "next") {
      log("goto next token");
      increaseDefaultNumber();
      log(selectToken[username].tokenIndex);
      await ctx.editMessageReplyMarkup(switchingKeyboard.reply_markup);
    } else if (userInput == "prevB") {
      log("goto previous token");

      decreaseDefaultNumberB();
      log(selectPreSnipes[username].tokenIndex);
      const token = await fetchTokenDetails(
        selectPreSnipes[username].tokens[selectPreSnipes[username].tokenIndex]
          .tokenContractAddress
      );

      await ctx.telegram.editMessageText(
        ctx.chat.id,
        selectPreSnipes[username].messageId,
        null,
        `<b>🌕️${token[0].name || ""} ($${
          token[0].symbol || ""
        })</b>\n🪅<b>CA</b>: <code>${
          token[0].address || ""
        }</code>\n💧<b>Status</b>: Pending \n\n Total Pending: ${
          selectPreSnipes[username].max + 1
        }`,
        {
          parse_mode: "HTML",
          reply_markup: {
            inline_keyboard: [
              [
                { text: `⏪ Prev`, callback_data: `prevB` },
                { text: `⏩ Next`, callback_data: `nextB` }
              ],
              [{ text: `🛑 Cancel Position`, callback_data: `closeSnipe` }]
            ]
          }
        }
      );
      // await ctx.editMessageReplyMarkup(switchingKeyboardB.reply_markup);
    } else if (userInput == "nextB") {
      log("goto next token");
      increaseDefaultNumberB();
      log(selectPreSnipes[username].tokenIndex);
      log(
        selectPreSnipes[username].tokens[selectPreSnipes[username].tokenIndex]
      );
      const token = await fetchTokenDetails(
        selectPreSnipes[username].tokens[selectPreSnipes[username].tokenIndex]
          .tokenContractAddress
      );

      await ctx.telegram.editMessageText(
        ctx.chat.id,
        selectPreSnipes[username].messageId,
        null,
        `<b>🌕️${token[0].name || ""} ($${
          token[0].symbol || ""
        })</b>\n🪅<b>CA</b>: <code>${
          token[0].address || ""
        }</code>\n💧<b>Status</b>: Pending \n\n Total Pending: ${
          selectPreSnipes[username].max + 1
        }`,
        {
          parse_mode: "HTML",
          reply_markup: {
            inline_keyboard: [
              [
                { text: `⏪ Prev`, callback_data: `prevB` },
                { text: `⏩ Next`, callback_data: `nextB` }
              ],
              [{ text: `🛑 Cancel Position`, callback_data: `closeSnipe` }]
            ]
          }
        }
      );
      // await ctx.editMessageReplyMarkup(switchingKeyboardB.reply_markup);
    } else if (userInput == "closeSnipe") {
      await removeSnipeFromList(
        username,
        selectPreSnipes[username].tokens[selectPreSnipes[username].tokenIndex]
          .tokenContractAddress
      );
      await ctx.reply(
        `🔥 Snipe Position for ${
          selectPreSnipes[username].tokens[selectPreSnipes[username].tokenIndex]
            .tokenContractAddress
        } closed ✔️`
      );
    }
    // preSnipeCallBack(ctx, userInput);

    // TODO  remove test UnityBot wallet address
    isWalletValid(userInput) && (await buyTrade(userInput, ctx, true));
  } catch (error) {}
};

// / to trigger build

const truncateText = (text, length) => {
  const maxLength = length || 6;
  if (text.length > maxLength) {
    return text.substring(0, maxLength) + "...";
  } else {
    return text;
  }
};
