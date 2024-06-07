import { Markup } from "telegraf";
import { changeDefaultWallet } from "../database/users.js";
import { fetchUser } from "../controllers/fetchWallets.js";
import { encrypt } from "../controllers/encryption.js";

// user personal inline keyboard
const inlineKeyboard = Markup.inlineKeyboard([
  [Markup.button.callback(" SELECT DEFAULT WALLET ", "selectWallet")],
  [
    Markup.button.callback(" w1 ", "selectWallet:w1"),
    Markup.button.callback(" w2 ", "selectWallet:w2")
    // Markup.button.callback(" w3 ", "selectWallet:w3")
  ],
  [
    Markup.button.callback("🟢 Buy ", "buy"),
    Markup.button.callback("🎯 Pre Snipe ", "presnipe"),
    Markup.button.callback("🔴 Sell ", "sell")
  ],
  [
    // Markup.button.callback(" New Pairs ", "newPairs"),
    Markup.button.callback("Active Snipes ", "openPositions"),
    Markup.button.callback("⚙️ Settings ", "settings")
  ],
  // [Markup.button.callback(" 🔑 Mnemonics ", "button8")],

  [
    Markup.button.webApp(" Help ", "https://apetoken.net")
    // Markup.button.callback("💰 View Settings ", "button7")
  ]
]);

const updateWalletButtons = (selectedWallet) => {
  inlineKeyboard.reply_markup.inline_keyboard.forEach((row) => {
    row.forEach((button) => {
      if (
        button.callback_data &&
        button.callback_data.startsWith("selectWallet:")
      ) {
        const walletNumber = button.callback_data.split(":")[1];

        if (walletNumber === selectedWallet) {
          !button.text.includes("✅") && (button.text = "✅ " + button.text);
        } else {
          button.text = button.text.replace("✅ ", "");
        }
      }
    });
  });
};

export const selectWallet1 = async (ctx) => {
  try {
    let username = ctx.from.id.toString();
    updateWalletButtons("w1");
    const userUnityWallet = (await fetchUser(username)).wallets;
    await changeDefaultWallet(
      username,
      0,
      encrypt(userUnityWallet[0].privateKey),
      userUnityWallet[0].address
    );
    await ctx.editMessageReplyMarkup(inlineKeyboard.reply_markup);
  } catch (error) {
    console.log("--- trying to update current wallet ----");
  }
};

export const selectWallet2 = async (ctx) => {
  try {
    let username = ctx.from.id.toString();
    updateWalletButtons("w2");
    const userUnityWallet = (await fetchUser(username)).wallets;
    await changeDefaultWallet(
      username,
      1,
      encrypt(userUnityWallet[1].privateKey),
      userUnityWallet[1].address
    );
    await ctx.editMessageReplyMarkup(inlineKeyboard.reply_markup);
  } catch (error) {
    console.log("--- trying to update current wallet ----");
  }
};

export const selectWallet3 = async (ctx) => {
  try {
    let username = ctx.from.id.toString();
    updateWalletButtons("w3");
    const userUnityWallet = (await fetchUser(username)).wallets;
    await changeDefaultWallet(
      username,
      2,
      encrypt(userUnityWallet[2].privateKey),
      userUnityWallet[2].address
    );
    await ctx.editMessageReplyMarkup(inlineKeyboard.reply_markup);
  } catch (error) {
    console.log("--- trying to update current wallet ----");
  }
};
