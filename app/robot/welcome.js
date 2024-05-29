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
      `<b> 🚀 Elite Sniper Bot - Official Sniper Bot on the Bitrock Blockchain 🎯</b>\n\n` +
      `⚙️ Team Elite\n\n` +
      `Trade any tokens on the Bitrock blockchain, easy fast and effortlessly.\n\n` +
      `📚 Elite Sniper Academy\n\n` +
      `💬 Official Chain\n\n` +
      `📢 Degen Calls\n\n` +
      `🌐 Website\n\n` +
      `🍌 Enjoy your Benefits as a $APE Holder and Sniper DAO Member!\n\n` +
      `If you need any help, just type /help.\n\n` +
      `Here are your $BROCK Trading wallets. Select your default wallet and dive into trading🎯\n\n` +
      `<code>═══ Your Wallets ═══</code>\n` +
      response.wallets
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
