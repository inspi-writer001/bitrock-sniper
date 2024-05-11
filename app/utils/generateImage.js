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
    "https://rest.apitemplate.io/v2/create-image?template_id=1c577b2346dec858",
    {
      overrides: [
        {
          name: "rect_1",
          stroke: "#000000",
          backgroundColor: "#000000"
        },
        {
          name: "background-image",
          stroke: "grey",
          src: "https://apitemplateio-user.s3-ap-southeast-1.amazonaws.com/19195/26795/405bb312-7ab8-431f-b69a-c2257bbcabd0.jpg"
        },
        {
          name: "qr_1",
          backgroundColor: "white",
          content: "https://apitemplate.io",
          color: "#000000"
        },
        {
          name: "pair",
          text: pair,
          textBackgroundColor: "rgba(0, 0, 0, 0)",
          color: "#FFED15"
        },
        {
          name: "text_1",
          text: `${percentage.toFixed(2)}%`,
          textBackgroundColor: "rgba(0, 0, 0, 0)",
          color: isNegative(percentage) ? "#FF4D4D" : "#56E92D"
        },
        {
          name: "trade_action",
          text: tradeAction,
          textBackgroundColor: "rgba(0, 0, 0, 0)",
          color: "#FFFFFF"
        },
        {
          name: "text_3",
          text: "Initial",
          textBackgroundColor: "",
          color: "#B3B3B3"
        },
        {
          name: "text_3_1",
          text: "Current",
          textBackgroundColor: "",
          color: "#B3B3B3"
        },
        {
          name: "text_4",
          text: `$${initialPrice} BROCK`,
          textBackgroundColor: "rgba(0, 0, 0, 0)",
          color: "#9A9A9A"
        },
        {
          name: "current_price",
          text: `$${currentPrice} BROCK`,
          textBackgroundColor: "rgba(0, 0, 0, 0)",
          color: "#9A9A9A"
        }
      ]
    },
    {
      headers: {
        "X-API-KEY": "6160MTkxOTU6MTYyOTc6d1NjM0tiQzFZbkZKcklJcg="
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

// log(await generateImage("Inspi/BROCK", "Buy", 1.2, 1.0));
