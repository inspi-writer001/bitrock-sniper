import { Markup } from "telegraf";

import { findUser, isAutoBuy } from "../database/users.js";
import { fetchDefaultWallet } from "../robot/settings.js";
import numeral from "numeral";
import { getAllActiveSnipesForUser } from "../database/preSnipe.js";
import { err, log } from "./globals.js";
import { selectPreSnipes, selectToken } from "../index.js";
import {
  fetchTokenBalances,
  fetchTokenDetails
} from "../controllers/moralis/moralis.js";

export const inlineKeyboard = async (telegramId) => {
  const userDefaultWallet = await fetchDefaultWallet(telegramId);
  return Markup.inlineKeyboard([
    [Markup.button.callback(" SELECT DEFAULT WALLET ", "selectWallet")],
    [
      Markup.button.callback(
        `${userDefaultWallet == 0 ? "✅" : ""} w1 `,
        "selectWallet:w1"
      ),
      Markup.button.callback(
        `${userDefaultWallet == 1 ? "✅" : ""} w2 `,
        "selectWallet:w2"
      )
      // Markup.button.callback(
      //   `${userDefaultWallet == 2 ? "✅" : ""} w3 `,
      //   "selectWallet:w3"
      // )
    ],
    [
      Markup.button.callback("🟢 Buy ", "buy"),
      Markup.button.callback("🎯 Pre Snipe ", "presnipe"),
      Markup.button.callback("🔴 Sell ", "sell")
    ],
    [
      // Markup.button.callback(" New Pairs ", "newPairs"),
      Markup.button.callback("Sniped Positions ", "openPositions"),
      Markup.button.callback("⚙️ Settings ", "settings")
    ],
    // [Markup.button.callback(" 🔑 Mnemonics ", "button8")],

    [
      Markup.button.webApp(" Help ", "https://google.com"),
      Markup.button.callback("💰 View Settings ", "button7")
      // Markup.button.callback("🔁 Refresh ", "restart")
    ]
  ]);
};
export const settingsInlineKeyboard = async (telegramId) => {
  const autoBuy = await isAutoBuy(telegramId);
  return Markup.inlineKeyboard([
    [
      Markup.button.callback(" ⚙️ Pre Snipe ", "buySettings"),
      Markup.button.callback(" Export Wallet ", "exportW")
    ],
    // [
    //   Markup.button.callback(" Fast 🦄 ", "button8"),
    //   Markup.button.callback(" Booster 🚀 ", "button7"),
    //   Markup.button.callback(" Custom fee ", "customFee")
    // ],
    // [
    //   Markup.button.callback(
    //     ` ${autoBuy == 0 ? "🔴" : "✅"} Auto Buy `,
    //     "autoBuy"
    //   )
    // ],
    [
      Markup.button.callback("🏠 Main Menu ", "mainMenu"),
      Markup.button.callback("💰 View Settings ", "button7")
      // Markup.button.callback("🔁 Refresh ", "restart")
    ]
  ]);
};
// now tio try
// to trigger push now we gotta force push

export const fastFastClose = Markup.inlineKeyboard([
  Markup.button.callback("❌ Close ", "vanish")
]);

export const removeFromPreSnipeList = Markup.inlineKeyboard([
  Markup.button.callback("❌ Close ", "removeFromPreSnipeList")
]);

export const fastKeyboard = Markup.inlineKeyboard([
  [
    Markup.button.callback("⚙️ Pre Snipe ", "buySettings"),
    Markup.button.callback("🔁 Refresh ", "mainMenu")
    // Markup.button.callback("⚙️ Sell Settings", "sellSettings")
  ]
]);

export const selectWallet = Markup.inlineKeyboard([
  [Markup.button.callback(" SELECT WALLET TO USE ", "selectWallet")],
  [
    Markup.button.callback(" w1 ", "selectWallet1"),
    Markup.button.callback(" w2 ", "selectWallet2")
    // Markup.button.callback(" w3 ", "selectWallet3")
  ]
]);

export const buySettings = (user) =>
  Markup.inlineKeyboard([
    [
      Markup.button.callback(" ⬅️ Back ", "backToSettings"),
      Markup.button.callback(" 🏠 Home ", "mainMenu")
    ],
    [Markup.button.callback("== Buy Type ==", "buytype")],
    [
      Markup.button.callback(
        `${user.buyType == 0 ? "✅" : ""} % percentage `,
        "buyPercentage"
      ),
      Markup.button.callback(
        `${user.buyType == 1 ? "✅" : ""} x amount `,
        "buyXAmount"
      )
    ],
    // [
    //   Markup.button.callback(" == EDIT == ", "edit..."),
    //   Markup.button.callback(" == RESET == ", "reset...")
    // ],
    [
      Markup.button.callback(" ✏️ Buy amount ", "editBuyAmount"),
      Markup.button.callback(" Clear  ", "resetBuyAmount")
    ]
    // [
    //   Markup.button.callback(" ✏️ Min MarketCap ", "editMinMCap"),
    //   Markup.button.callback(" Clear MarketCap ", "resetMinMCap")
    // ],
    // [
    //   Markup.button.callback(" ✏️ Max MarketCap ", "editMaxMCap"),
    //   Markup.button.callback(" Clear MarketCap ", "resetMaxMCap")
    // ],
    // [
    //   Markup.button.callback(" ✏️ Min Liquidity ", "editMinLiquidity"),
    //   Markup.button.callback(" Clear Min ", "resetMinLiquidity")
    // ],
    // [
    //   Markup.button.callback(" ✏️ Max Liquidity ", "editMaxLiquidity"),
    //   Markup.button.callback(" Clear Max ", "resetMaxLiquidity")
    // ]
  ]);

// [
//   Markup.button.callback(" ✏️ Max Buy Tax ", "editMaxBuyTax"),
//   Markup.button.callback(" ⌫ Clear Max ", "resetMaxBuyTax")
// ];

// [
//   Markup.button.callback(" ✏️ Max Sell Tax  ", "editMaxSellTax"),
//   Markup.button.callback(" ⌫ Clear Max ", "resetMaxSellTax")
// ],

export const sellSettings = Markup.inlineKeyboard([
  [
    Markup.button.callback(" ⬅️ Back ", "backToSettings"),
    Markup.button.callback(" 🏠 Home ", "mainMenu")
  ],
  [
    Markup.button.callback(" == EDIT == ", "edit..."),
    Markup.button.callback(" == RESET == ", "reset...")
  ],
  [
    Markup.button.callback(" ✏️ Sell-Hi-x ", "editSellHix"),
    Markup.button.callback(" Clear Hi-x ", "resetSellHix")
  ],
  [
    Markup.button.callback(" ✏️ Sell-Lo-x ", "editSellLox"),
    Markup.button.callback(" Clear Lo-x ", "resetSellLox")
  ],
  [
    Markup.button.callback(" ✏️ Sell-Hi Percent ", "editSellHiAmount"),
    Markup.button.callback(" Clear Amount ", "resetSellHiAmount")
  ],
  [
    Markup.button.callback(" ✏️ Sell-Lo Percent ", "editSellLoAmount"),
    Markup.button.callback(" Clear Amount ", "resetSellLoAmount")
  ]
]);

// [
//     Markup.button.callback(" 0.5 ETH ✏️ ", "avax"),
//     Markup.button.callback(" 1 ETH ✏️ ", "avax"),
//     Markup.button.callback(" 3 ETH ✏️ ", "avax")
//   ],
//   [
//     Markup.button.callback(" 5 ETH ✏️ ", "avax"),
//     Markup.button.callback(" 10 ETH ✏️ ", "avax")
//   ],
//   [Markup.button.callback(" Buy Slippage: 15% ✏️ ", "setslippage")],
//   [Markup.button.callback(" 🔴 MEV Protect (Buys) ", "autoBuy")],
//   [
//     Markup.button.callback(" 50% ✏️ ", "avax"),
//     Markup.button.callback(" 100% ✏️ ", "avax"),
//     Markup.button.callback(" 3 ETH ✏️ ", "avax")
//   ],
//   [Markup.button.callback(" Sell Slippage: 15% ✏️ ", "setslippage")],
//   [Markup.button.callback(" 🔴 MEV Protect (Sells) ", "autoBuy")],
//   [Markup.button.callback(" Advanced Mode ➡ ", "autoBuy")],
// ]

export const buyOptions = (contractAddress) =>
  Markup.inlineKeyboard([
    [
      Markup.button.callback("⚡️ Buy 0.05 ", "0.05"),
      Markup.button.callback("⚡️ Buy 0.1 ", "0.1"),
      Markup.button.callback("⚡️ Buy X", "buy_custom")
    ],
    [
      Markup.button.callback("🟢 Buy Menu ", "buy"),

      Markup.button.callback("🏠 Main Menu ", "mainMenu")
    ],
    [
      Markup.button.url(
        "📊 Chart ",
        `https://www.geckoterminal.com/bitrock/pools/${contractAddress}`
      ),
      Markup.button.callback("❌ Close ", "vanish")
    ]
  ]);

export const sellOptions = (contractAddress) =>
  Markup.inlineKeyboard([
    [
      Markup.button.callback("⚡️ Sell 10% ", "10p"),
      Markup.button.callback("⚡️ Sell 20% ", "20p"),
      Markup.button.callback("⚡️ Sell 30%", "30p")
    ],
    [
      Markup.button.callback("⚡️ Sell 50% ", "50p"),
      Markup.button.callback("⚡️ Sell 70% ", "70p"),
      Markup.button.callback("⚡️ Sell 90%", "90p")
    ],
    [
      Markup.button.callback("⚡️ Sell X", "sell_custom"),
      Markup.button.callback("⚡️ Sell 100% ", "100p")
    ],
    [
      Markup.button.callback("⏪ Open Trades ", "sell"),
      Markup.button.callback("🏠 Main Menu ", "mainMenu")
    ],
    [
      Markup.button.url(
        "📊 Chart ",
        `https://www.geckoterminal.com/bitrock/pools/${contractAddress}`
      ),
      Markup.button.callback("❌ Close ", "vanish")
    ]
  ]);

export const formatNumber = (number) => {
  return numeral(+number).format("00.00a");
};

export const buyMessage = (response, body, poolData) => `
<b>🌕 ${response.data.data.attributes.name} ($${
  response.data.data.attributes.symbol
}) 🔗 BITROCK Token</b>\n<b>LP: <code>${
  response.data.data.relationships.top_pools.data[0].id.split("bitrock_")[1]
}</code>\nCA: <code>${
  response.data.data.attributes.address
}</code>\nV2</b> Pool\n\n
<b>🔺 Price</b>                | $${response.data.data.attributes.price_usd}
<b>🗄 Total Supply</b>  | ${formatNumber(
  response.data.data.attributes.total_supply
)} ${response.data.data.attributes.symbol}
<b>💰 Balance</b>           | ${body.balance}
<b>💧 Liquidity</b>         | $${poolData.attributes["reserve_in_usd"]}
<b>💪 MC/Liq</b>            | ${(
  Number(
    +response.data.data.attributes.market_cap_usd ||
      +response.data.data.attributes.price_usd *
        +response.data.data.attributes.total_supply
  ) / Number(poolData.attributes["reserve_in_usd"])
).toFixed(2)}
<b>🧢 Market Cap</b>    | $${formatNumber(
  response.data.data.attributes.market_cap_usd ||
    +response.data.data.attributes.price_usd *
      +response.data.data.attributes.total_supply
)}`;

{
  /* <a href='https://app.uniswap.org/tokens/ethereum/${
  response.data.data.attributes.address
}'>Uniswap</a> | <a href="https://etherscan.io/address/${
  response.data.data.attributes.address
}">Etherscan</a>\n */
}
// Liquidity: 11.1 WETH
// Max Buy: 100% ≣ 1.0e+6
// Max Sell: 100% ≣ 1.0e+6
// Max Wallet: 100% ≣ 1.0e+6
// ⚖️ Taxes         | Ⓑ 3.0% ⓢ 3.0%
{
  /* <b>🔥 Burnt</b>               | 0% */
}
{
  /* <b>📉 CA Balance</b>    | 0.17% */
}

export const openSnipes = async (ctx) => {
  let username = ctx.from.id.toString();
  try {
    // const userAddress = await findUser(username);
    const userSnipes = await getAllActiveSnipesForUser(username);
    log(" ==== user snipes ===");
    log(userSnipes);
    const firstToken = await fetchTokenDetails(
      userSnipes[0].tokenContractAddress
    );
    // const walletBalances = await fetchTokenBalances();

    selectPreSnipes[username] = { tokenIndex: 0 };
    selectPreSnipes[username].max = userSnipes.length - 1;
    selectPreSnipes[username].tokens = userSnipes;

    selectToken[username] = { tokenIndex: 0 };
    selectToken[username].max = 4;
    selectToken[username].tokens = [
      {
        token_address: "test",
        symbol: "MC",
        name: "Yest",
        logo: null,
        thumbnail: null,
        decimals: 18,
        balance: "564277822148025607328794",
        possible_spam: false,
        verified_contract: false
      },
      {
        token_address: "test",
        symbol: "FROGS",
        name: "Test",
        logo: null,
        thumbnail: null,
        decimals: 9,
        balance: "499248873309964947",
        possible_spam: false,
        verified_contract: false
      },
      {
        token_address: "test",
        symbol: "USD",
        name: "test",
        logo: null,
        thumbnail: null,
        decimals: 18,
        balance: "35072234456773777776",
        possible_spam: false,
        verified_contract: false
      }
    ];
    // selectToken[username] = { tokenIndex: 0 };
    // selectToken[username].max = walletBalances.length - 1;
    // selectToken[username].tokens = walletBalances;

    userSnipes.length > 0
      ? await ctx
          .replyWithHTML(
            `<b>🌕️${firstToken[0].name || ""} ($${
              firstToken[0].symbol || ""
            })</b>\n🪅<b>CA</b>: <code>${
              firstToken[0].address || ""
            }</code>\n💧<b>Status</b>: Pending \n\n Total Pending: ${
              selectPreSnipes[username].max + 1
            }`,
            Markup.inlineKeyboard([
              [
                Markup.button.callback(`⏪ Prev`, `prevB`),
                Markup.button.callback(`⏩ Next`, `nextB`)
              ],
              [Markup.button.callback(`🛑 Cancel Position`, `closeSnipe`)]
            ])
          )
          .then((sentMessage) => {
            // log(sentMessage);
            selectPreSnipes[username].messageId = sentMessage.message_id;
          })
      : await ctx.reply(
          "No open Snipes",
          Markup.inlineKeyboard([
            [Markup.button.callback("❌ Close ", "vanish")]
          ])
        );
  } catch (error) {
    err("===== error from fetcing openSnipes ====");
    err(error);
  }
};
