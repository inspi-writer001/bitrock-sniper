import { fetchTokenBalances } from "../controllers/moralis/moralis.js";
import { Markup } from "telegraf";

import {
  clearMaxLiq,
  clearMaxSellTax,
  clearMinLiq,
  clearMinMC,
  clearSellHi_x,
  clearMaxBuyTax,
  defaullWallet,
  triggerSnipe,
  clearSellLoAmount,
  clearSellHiAmount,
  clearMaxMC,
  clearSellLo_x,
  triggerBuyType,
  triggerSellType
} from "../controllers/settings.js";
import { findUser } from "../database/users.js";
import { fromCustomLamport } from "../utils/converters.js";
import { err, log } from "../utils/globals.js";
import {
  buySettings,
  fastFastClose,
  removeFromPreSnipeList,
  sellSettings,
  settingsInlineKeyboard
} from "../utils/keyboards.js";
import { preSnipe, selectToken } from "../index.js";

export const settingsHandler = async (ctx) => {
  let username = ctx.from.id.toString();
  if (!username && ctx.from && ctx.from.id) {
    username = ctx.from.id.toString();
  }
  try {
    const keyBoardState = await settingsInlineKeyboard(username);
    await ctx.reply(" ⚙️ Settings ", keyBoardState);
  } catch (error) {
    log("==== error from settingsHandler ====");
    err(error);
  }
};

export const vanish = async (ctx) => {
  try {
    const chatId = ctx.chat.id;
    const messageId = ctx.callbackQuery.message.message_id; // Adjust the message ID as needed

    if (messageId > 0) {
      await ctx.telegram.deleteMessage(chatId, messageId);
    } else {
      await ctx.reply("No previous message to delete.");
    }
  } catch (error) {
    console.error("Error deleting message:", error);
  }
};

export const buyPrompt = async (ctx) => {
  await ctx.reply(" 📑 paste token contract address here. 👇");
};

export const triggerAutoBuy = async (ctx) => {
  let username = ctx.from.id.toString();

  try {
    await triggerSnipe(username);
    const keyBoardState = await settingsInlineKeyboard(username);
    await ctx.editMessageReplyMarkup(keyBoardState.reply_markup);
  } catch (error) {
    log("==== error from triggerAutoBuy ====");
    err(error);
  }
};

export const fetchDefaultWallet = async (telegramId) => {
  const userDefaultAddress = await defaullWallet(telegramId);
  return userDefaultAddress;
};

export const pullUpBuySettings = async (ctx) => {
  let username = ctx.from.id.toString();
  let user = await findUser(username);

  try {
    await ctx.editMessageReplyMarkup(buySettings(user).reply_markup);
  } catch (error) {
    log("==== error from pullUpBuySettings ====");
    err(error);
  }
};

export const preSnipeMenu = async (ctx) => {
  let username = ctx.from.id.toString();
  if (!preSnipe.includes(username)) {
    preSnipe.push(username);
  }
  await ctx.reply(
    "paste CA to snipe here 👇\n⚠️ Make sure it's correct.\n❌ Close this menu before initiating manual 🟢 Buy",
    removeFromPreSnipeList
  );
};

export const closePreSnipe = async (ctx) => {
  let username = ctx.from.id.toString();
  if (preSnipe.includes(username)) {
    // preSnipe = preSnipe.filter((item) => item !== username);
    const index = preSnipe.indexOf(username);
    preSnipe.splice(index, 1);
  }
  await vanish(ctx);
};

export const closePreSnipeWithUsername = async (username) => {
  if (preSnipe.includes(username)) {
    const index = preSnipe.indexOf(username);
    preSnipe.splice(index, 1);
  }
};

export const pullUpSellSettings = async (ctx) => {
  let username = ctx.from.id.toString();
  try {
    await ctx.editMessageReplyMarkup(sellSettings.reply_markup);
  } catch (error) {
    log("==== error from pullUpSellSettings ====");
    err(error);
  }
};

export const backToSettings = async (ctx) => {
  let username = ctx.from.id.toString();

  try {
    const keyBoardState = await settingsInlineKeyboard(username);
    await ctx.editMessageReplyMarkup(keyBoardState.reply_markup);
  } catch (error) {
    log("==== error from backToSettings ====");
    err(error);
  }
};

export const doClearMinMcap = async (ctx) => {
  let username = ctx.from.id.toString();
  try {
    await clearMinMC(username);
  } catch (error) {
    log("==== error from clearMcap ====");
    err(error);
  }
};

export const doClearMaxMcap = async (ctx) => {
  let username = ctx.from.id.toString();
  try {
    await clearMaxMC(username);
  } catch (error) {
    log("==== error from clearMcap ====");
    err(error);
  }
};

export const doClearMinLiq = async (ctx) => {
  let username = ctx.from.id.toString();
  try {
    await clearMinLiq(username);
  } catch (error) {
    log("==== error from clearMinLiq ====");
    err(error);
  }
};
export const doClearMaxLiq = async (ctx) => {
  let username = ctx.from.id.toString();
  try {
    await clearMaxLiq(username);
  } catch (error) {
    log("==== error from clearMaxLiq ====");
    err(error);
  }
};

export const doClearMaxBuyTax = async (ctx) => {
  let username = ctx.from.id.toString();
  try {
    await clearMaxBuyTax(username);
  } catch (error) {
    log("==== error from clearMinBuyTax ====");
    err(error);
  }
};

export const doClearMaxSellTax = async (ctx) => {
  let username = ctx.from.id.toString();
  try {
    await clearMaxSellTax(username);
  } catch (error) {
    log("==== error from clearMinBuyTax ====");
    err(error);
  }
};

export const doClearSellHi_x = async (ctx) => {
  let username = ctx.from.id.toString();
  try {
    await clearSellHi_x(username);
  } catch (error) {
    log("==== error from clearSellHix ====");
    err(error);
  }
};

export const doClearSellLo_x = async (ctx) => {
  let username = ctx.from.id.toString();
  try {
    await clearSellLo_x(username);
  } catch (error) {
    log("==== error from clearSellLox ====");
    err(error);
  }
};

export const doClearSellHiAmount = async (ctx) => {
  let username = ctx.from.id.toString();
  try {
    await clearSellHiAmount(username);
  } catch (error) {
    log("==== error from clearSellHiAmount ====");
    err(error);
  }
};

export const doClearSellLoAmount = async (ctx) => {
  let username = ctx.from.id.toString();
  try {
    await clearSellLoAmount(username);
  } catch (error) {
    log("==== error from clearSellLoAmount ====");
    err(error);
  }
};

export const doSwitchBuyType = async (ctx) => {
  let username = ctx.from.id.toString();
  try {
    const user = await triggerBuyType(username);

    await ctx.editMessageReplyMarkup(buySettings(user).reply_markup);
  } catch (error) {
    log("==== error from doSwitchBuyType ====");
    err(error);
  }
};

export const doSwitchSellType = async (ctx) => {
  let username = ctx.from.id.toString();
  try {
    const user = await triggerSellType(username);

    await ctx.editMessageReplyMarkup(buySettings(user).reply_markup);
  } catch (error) {
    log("==== error from doSwitchSellType ====");
    err(error);
  }
};

export const pullUpViewSettings = async (ctx) => {
  let username = ctx.from.id.toString();
  try {
    let user = await findUser(username);

    await ctx.replyWithHTML(
      `Here are your configured settings ⛽️\n==========================\n<code>Buy Type                   ${
        user.buyType == 0 ? "percentage" : "x units"
      }\nSell Type                  ${
        user.sellType == 0 ? "percentage" : "x units"
      }\nBuy Amount                 ${user.buyAmount || 0}</code>`,
      fastFastClose
    );
  } catch (error) {
    log("==== error from pullUpViewSettings ====");
    err(error);
  }
};
// export const pullUpViewSettings = async (ctx) => {
//   let username = ctx.from.id.toString();
//   try {
//     let user = await findUser(username);

//     await ctx.replyWithHTML(
//       `Here are your configured settings ⛽️\n==========================\n<code>Auto Snipe                 ${
//         user.snipe == 0 ? "false" : "true"
//       }\nBuy Type                   ${
//         user.buyType == 0 ? "percentage" : "x units"
//       }\nSell Type                  ${
//         user.sellType == 0 ? "percentage" : "x units"
//       }\nBuy Amount                 ${
//         user.buyAmount || 0
//       }\nSell Amount                ${
//         user.sellAmount || 0
//       }\nSnipe Minimum Market Cap   $${
//         user.minmiumMC
//       }\nSnipe Maximum Market Cap   $${
//         user.maxMC
//       }\nSnipe Minimum Liquidity    $${
//         user.minmiumLiq
//       }\nSnipe Max Liquidity        $${
//         user.maxLiq
//       }\nSnipe Max Sell Tax         ${
//         user.maxSellTax
//       }%\nTrade Sell Hi Percent      ${
//         user.sellHiAmount
//       }%\nTrade Sell Hi x            ${
//         user.sellHix
//       }\nTrade Sell Lo x            ${
//         user.sellLox
//       }\nTrade Sell Lo Percent      ${user.sellLoAmount}\n</code>`,
//       fastFastClose
//     );
//   } catch (error) {
//     log("==== error from pullUpViewSettings ====");
//     err(error);
//   }
// };

// \nSnipe Max Buy Tax          ${
//         user.maxBuyTax
//       }%

// export const sellMenu = async (ctx) => {
//   let username = ctx.from.id.toString();
//   try {
//     const userAddress = await findUser(username);
//     const walletBalances = await fetchTokenBalances(userAddress.walletAddress);

//     walletBalances.length > 0
//       ? await ctx.reply(
//           `here are your open orders,
// we only show token balances above 0.005 units`,
//           Markup.inlineKeyboard(
//             walletBalances.map((e) => {
//               log(fromCustomLamport(e.balance, e.decimals));
//               // if (!e.possible_spam) {
//               return Markup.button.callback(
//                 `${fromCustomLamport(e.balance, e.decimals).toFixed(3)} ${
//                   e.symbol
//                 }`.toString(),
//                 `${e.token_address.toString()}`
//               );
//               // }
//             }),
//             { columns: 2 }
//           )
//         )
//       : await ctx.reply(
//           "No open Positions",
//           Markup.inlineKeyboard([
//             [Markup.button.callback("❌ Close ", "vanish")]
//           ])
//         );
//   } catch (error) {
//     log(" ======== error from sellMenu =========");
//     err(error);
//   }
// };
export const sellMenu = async (ctx) => {
  let username = ctx.from.id.toString();
  try {
    const userAddress = await findUser(username);
    const walletBalances = await fetchTokenBalances(userAddress.walletAddress);

    selectToken[username] = { tokenIndex: 0 };
    selectToken[username].max = walletBalances.length - 1;
    selectToken[username].tokens = walletBalances;

    let e = walletBalances[selectToken[username].tokenIndex];
    if (walletBalances.length > 0) {
      const switchingKeyboard = Markup.inlineKeyboard([
        Markup.button.callback(`⏪ Prev`, `prev`),
        Markup.button.callback(`${e.name}`, `${e.token_address.toString()}`),
        Markup.button.callback(`⏩ Next`, `next`)
      ]);
      await ctx.reply(
        "here are your open orders, we only show token balances above 0.005 units",
        switchingKeyboard
      );
    } else {
      await ctx.reply(
        "No open Positions",
        Markup.inlineKeyboard([[Markup.button.callback("❌ Close ", "vanish")]])
      );
    }
  } catch (error) {
    log(" ======== error from sellMenu =========");
    err(error);
  }
};
