import { fetchETH } from "../controllers/fetchBalance.js";
import { fetchUser } from "../controllers/fetchWallets.js";
import { findUser } from "../database/users.js";
import { log } from "../utils/globals.js";
import {
  fastKeyboard,
  inlineKeyboard,
  selectWallet
} from "../utils/keyboards.js";
import { EthPrice } from "../utils/prices.js";

export const startHandler = async (ctx) => {
  let username = ctx.from.id.toString();

  try {
    console.log("========== start =============");

    const response = await fetchUser(username);
    const user = await findUser(username);
    const walletAddresses = user.wallets.map((wallet) => wallet.address);

    const balances = await Promise.all(walletAddresses.map(fetchETH));
    const prices = await Promise.all(balances.map(EthPrice));

    // log(balances);
    // log(user.wallets);

    const welcome =
      `<b> 🚀 Elite Sniper Bot - Official Sniper Bot on the Bitrock Blockchain 🎯</b>\n\n` +
      `⚙️ Team Elite\n\n` +
      `Trade any tokens on the Bitrock blockchain, easy fast and effortlessly.\n\n` +
      `📚 Elite Sniper Academy\n\n` +
      `💬 <a href="http://t.me/ApeOnBitrock">Official $APE TG</a>\n\n` +
      `📢 <a href="http://t.me/SniperDaoCalls"> Sniper Dao Calls </a>\n\n` +
      `🌐 <a href="https://apetoken.net">Website</a>\n\n` +
      `🍌 Enjoy your Benefits as a $APE Holder and Sniper DAO Member!\n\n` +
      `If you need any help, just type /help.\n\n` +
      `Here are your $BROCK Trading wallets. Select your default wallet and dive into trading🎯\n\n` +
      `<code>═══ Your Wallets ═══</code>\n` +
      user.wallets
        .map((e, i) => {
          return `<b>▰ Address ${i + 1}: ▰</b>\nBal: ${balances[i]} BROCK $${
            prices[i]
          }\n<code>${e.address}</code>\n\n`;
        })
        .join("");

    await ctx.replyWithPhoto("https://ibb.co/Qdy7Q49", {
      caption: welcome,
      parse_mode: "HTML",
      ...(await inlineKeyboard(username))
    });
  } catch (error) {
    console.log(error);
    const ErrorMessage = `Something went wrong,

${
  error.toString().includes("timed out")
    ? "Your request timed out 😵‍💫, please try again in a minute."
    : "That's strange 🤔, please give us a minute."
}`;

    await ctx.reply(ErrorMessage, fastKeyboard);
  }
};

// fix just to trigger another build

//  ▰ Eth
//     Balance: ${response.balance}🔺⬩$${await AvaxPrice(response.balance)}

// `Introducing a cutting-edge bot crafted exclusively for Eth Traders. Trade any token instantly right after launch.\n` +
