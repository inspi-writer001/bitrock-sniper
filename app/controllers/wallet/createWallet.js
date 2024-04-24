import { ethers } from "ethers";
import User from "../../Schema/User.js";
import { decrypt, encrypt } from "../encryption.js";
import { fetchUser } from "../fetchWallets.js";
import { err, log } from "../../utils/globals.js";
import { fastFastClose, fastKeyboard } from "../../utils/keyboards.js";

export const createWallet12 = async (telegramId) => {
  const existingUser = await User.findOne({
    username: telegramId
  });
  // log("=== existing user ====", existingUser);

  const wallets = [
    {
      address: existingUser.wallets[0].address,
      privateKey: decrypt(existingUser.wallets[0].privateKey)
    },
    {
      address: existingUser.wallets[1].address,
      privateKey: decrypt(existingUser.wallets[1].privateKey)
    }
  ];
  return wallets;
};

export const firstTimeCreate12 = async () => {
  const wallet1 = ethers.Wallet.createRandom();
  //   const seedPhrase = wallet1.mnemonic.phrase;
  const privateKey1 = wallet1.privateKey;
  const wallet2 = ethers.Wallet.createRandom();
  //   const seedPhrase = wallet1.mnemonic.phrase;
  const privateKey2 = wallet2.privateKey;
  // const wallet3 = ethers.Wallet.createRandom();
  // //   const seedPhrase = wallet1.mnemonic.phrase;
  // const privateKey3 = wallet3.privateKey;

  const address1 = wallet1.address;
  const address2 = wallet2.address;
  // const address3 = wallet3.address;

  const wallets = [
    {
      address: address1,
      privateKey: encrypt(privateKey1)
    },
    {
      address: address2,
      privateKey: encrypt(privateKey2)
    }
    // { address: address3, privateKey: encrypt(privateKey3) }
  ];
  return wallets;
};

export const exportWallet = async (ctx) => {
  try {
    let username = ctx.from.id.toString();
    const user = await fetchUser(username);
    const userWallets = user.wallets;
    // log(" userrrr", user.wallets[0]);
    const key =
      `<pre><b>═══ 🔑 Your Mnemonics ═══</b></pre>\n` +
      ` 🔒 Make sure to keep it safe\n\n` +
      `${userWallets
        .map((e, i) => {
          // log(" -- this is e --");
          // log(e);
          return (
            "wallet" +
            (i + 1) +
            " " +
            `<span class="tg-spoiler">${e.privateKey}</span>\n\n`
          );
        })
        .toString()
        .replaceAll(",", "")}`;
    await ctx.replyWithHTML(key, fastFastClose);
  } catch (error) {
    log(" ===  error from export wallet ===");
    err(error);
  }
};
