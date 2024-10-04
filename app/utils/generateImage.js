import axios from "axios";
import { log } from "../utils/globals.js";

function calculatePercentageChange(initialPrice, finalPrice) {
  let priceDifference = Number(finalPrice) - Number(initialPrice);

  let percentageChange = (priceDifference / initialPrice) * 100;

  return percentageChange;
}

function isNegative(number) {
  return Number(number) < 0;
}

export const generateImage = async (
  pair,
  tradeAction,
  initialPrice,
  currentPrice
) => {
  log(pair, tradeAction, initialPrice, currentPrice);
  const percentage = calculatePercentageChange(initialPrice, currentPrice);
  const response = await axios.post(
    "https://api.canvas.switchboard.ai/",
    {
      template: "elitesniper",
      sizes: [
        {
          width: 1920,
          height: 1080
        }
      ],
      elements: {
        image1: {
          url: "https://via.placeholder.com/500/500"
        },
        PNL: {
          text: "PNL"
        },
        pair_name: {
          text: pair,
          color: "#FFED15"
        },
        percentage: {
          text: `${percentage.toFixed(2)}%`,
          textBackgroundColor: "rgba(0, 0, 0, 0)",
          color: isNegative(percentage) ? "#FF4D4D" : "#56E92D"
        },
        invested: {
          text: "Invested"
        },
        text5: {
          text: "Current Worth"
        },
        brock_icon: {
          url: "https://via.placeholder.com/500/500"
        },
        brock_icon2: {
          url: "https://via.placeholder.com/500/500"
        },
        entry_brock_amount: {
          text: `$${initialPrice} BROCK`,
          textBackgroundColor: "rgba(0, 0, 0, 0)",
          color: "#9A9A9A"
        },
        current_brock_amount: {
          text: `$${currentPrice} BROCK`,
          textBackgroundColor: "rgba(0, 0, 0, 0)",
          color: "#9A9A9A"
        },
        invested_in_usd: {
          text: "$50.60"
        },
        current_price_in_usd: {
          text: "$60.60"
        },
        image4: {
          url: "https://via.placeholder.com/500/500"
        }
      }
    },
    {
      headers: {
        "Content-Type": "application/json",
        "X-API-KEY": "e605fe2b-0c7c-4c69-8ca7-fe003b210263"
      }
    }
  );

  if (response.data.status && response.data.status != "success") {
    throw new Error({
      message: "something went wrong fetching pnl"
    });
  }
  return response;
};

// export const generateImage = async (
//   pair,
//   tradeAction,
//   initialPrice,
//   currentPrice
// ) => {
//   log(pair, tradeAction, initialPrice, currentPrice);
//   const percentage = calculatePercentageChange(initialPrice, currentPrice);
//   const response = await axios.post(
//     "https://rest.apitemplate.io/v2/create-image?template_id=1c577b2346dec858",
//     {
//       overrides: [
//         {
//           name: "rect_1",
//           stroke: "#000000",
//           backgroundColor: "#000000"
//         },
//         {
//           name: "background-image",
//           stroke: "grey",
//           src: "https://apitemplateio-user.s3-ap-southeast-1.amazonaws.com/19195/26795/405bb312-7ab8-431f-b69a-c2257bbcabd0.jpg"
//         },
//         {
//           name: "qr_1",
//           backgroundColor: "white",
//           content: "https://apitemplate.io",
//           color: "#000000"
//         },
//         {
//           name: "pair",
//           text: pair,
//           textBackgroundColor: "rgba(0, 0, 0, 0)",
//           color: "#FFED15"
//         },
//         {
//           name: "text_1",
//           text: `${percentage.toFixed(2)}%`,
//           textBackgroundColor: "rgba(0, 0, 0, 0)",
//           color: isNegative(percentage) ? "#FF4D4D" : "#56E92D"
//         },
//         {
//           name: "trade_action",
//           text: tradeAction,
//           textBackgroundColor: "rgba(0, 0, 0, 0)",
//           color: "#FFFFFF"
//         },
//         {
//           name: "text_3",
//           text: "Initial",
//           textBackgroundColor: "",
//           color: "#B3B3B3"
//         },
//         {
//           name: "text_3_1",
//           text: "Current",
//           textBackgroundColor: "",
//           color: "#B3B3B3"
//         },
//         {
//           name: "text_4",
//           text: `$${initialPrice} BROCK`,
//           textBackgroundColor: "rgba(0, 0, 0, 0)",
//           color: "#9A9A9A"
//         },
//         {
//           name: "current_price",
//           text: `$${currentPrice} BROCK`,
//           textBackgroundColor: "rgba(0, 0, 0, 0)",
//           color: "#9A9A9A"
//         }
//       ]
//     },
//     {
//       headers: {
//         "X-API-KEY": "6160MTkxOTU6MTYyOTc6d1NjM0tiQzFZbkZKcklJcg="
//       }
//     }
//   );

//   if (response.data.status && response.data.status != "success") {
//     throw new Error({
//       message: "something went wrong fetching pnl"
//     });
//   }
//   return response;
// };

// log(await generateImage("Inspi/BROCK", "Buy", 1.2, 1.0));
