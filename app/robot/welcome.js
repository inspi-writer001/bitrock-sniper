import { fetchETH } from "../controllers/fetchBalance.js";
import { fetchUser } from "../controllers/fetchWallets.js";
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
    const balances = await Promise.all([
      fetchETH(response.wallets[0].address),
      fetchETH(response.wallets[1].address)
    ]);

    const prices = await Promise.all([
      EthPrice(balances[0]),
      EthPrice(balances[1])
    ]);

    const welcome =
      `
    <b> 🚀 Elite Sniper Bot - Official Sniper Bot on the Bitrock Blockchain 🎯</b>\n\n` +
      `⚙️ Team Elite

Trade any tokens on the Bitrock blockchain, easy fast and effortlessly.

📚 Elite Sniper Academy

💬 Official Chain

📢 Degen Calls

🌐 Website

🍌 Enjoy your Benefits as a $APE Holder and Sniper DAO Member!

If you need any help, just type /help.\n` +
      `Here are your ETH Trading wallets. Simply fund your wallet, select a default wallet and dive into trading 🚀\n\n` +
      `<code>═══ Your Wallets ═══</code>\n` +
      response.wallets
        .map((e, i) => {
          return `\b▰ Address ${i + 1}: ▰\n Bal: ${balances[i]} BROCK $${
            prices[i]
          } \n<code>${e.address}</code>\n\n`;
        })
        .toString()
        .replaceAll(",", "");

    await ctx.replyWithHTML(
      welcome,
      await inlineKeyboard(username),
      selectWallet
    );
  } catch (error) {
    console.log(error);
    const ErrorMessage = `Something went wrong,

${
  error.toString().includes("timed out")
    ? "Your request Timed out 😵‍💫, please try again in a min"
    : "That's strange 🤔, please give us a minute"
}`;

    await ctx.reply(ErrorMessage, fastKeyboard);
  }
};

// fix just to trigger another build

//  ▰ Eth
//     Balance: ${response.balance}🔺⬩$${await AvaxPrice(response.balance)}

// `Introducing a cutting-edge bot crafted exclusively for Eth Traders. Trade any token instantly right after launch.\n` +
