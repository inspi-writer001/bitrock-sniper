import { decrypt, encrypt } from "../controllers/encryption.js";
import { findUser } from "../database/users.js";
import { buyAddress, state, usersAwaitingAmount } from "../index.js";
import { err, log } from "../utils/globals.js";
import { txError } from "../errors/txError.js";
import { useContract } from "../controllers/contract/swap.js";

export const buy = async (ctx) => {
  try {
    log(ctx.match[0]);
    log("nigga pressed it");
    // const amountToBuy = "5";
    const amountToBuy = ctx.match[0].toString();
    let user = ctx.from.id.toString();

    let response = buyAddress[user];
    log("response ===");
    log(response);

    const currentUser = await findUser(user);
    const userAddress = currentUser.walletAddress;
    // const userAvaxBalance = currentUser.balance;
    const userEncryptedMnemonics = currentUser.encrypted_mnemonnics;

    const mnemonics = decrypt(userEncryptedMnemonics);

    if (amountToBuy === "buy_custom") {
      log("aaaaaaahahhhhh");
      state[user] = {
        state: "awaiting_custom_amount",
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
      log("User wants a custom value for buy");
      // awaitingCustomValue = true;
      await ctx.reply("Enter the custom value for buy: 👀 example 0.23 👇");
      // const customValue = await getUserInput(ctx);

      usersAwaitingAmount.push(user);
      log(usersAwaitingAmount[user]);

      return;
    }

    // testnet MYCOIN = 0xcd520AFabcfdA94f2fe3321ed0570CBFE2eD8A24
    // testnet USD =  0x7f11f79DEA8CE904ed0249a23930f2e59b43a385
    try {
      // TODO remove test contract address

      await ctx.reply("processing tx ⚡️ ==========");
      await ctx.reply("processing gas ⛽️ ==========");
      const result = await useContract(
        userAddress,
        response.attributes.address,
        mnemonics,
        response.attributes.decimals,
        response.attributes.symbol,
        response.attributes.name,
        amountToBuy
      );
      await ctx.replyWithHTML(
        `<b>cheers 🪄🎉 here's your transaction hash:</b>\n<a href="https://etherscan.io/tx/${result.hash}"> view on explorer  ${result.hash} </a>`
      );
      // await ctx.replyWithHTML(
      //   `<b> fetching your portfolio details ♻️ ===== </b>`
      // );

      //   await portfolioBuyDialog(ctx, user, response.attributes.address);
      return;
    } catch (error) {
      await txError(error, ctx);
    }
  } catch (error) {
    log("error occured in buy ============");
    err(error);
  }
};
