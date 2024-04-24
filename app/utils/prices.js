import axios from "axios";
import dotenv from "dotenv";
dotenv.config();
const env = process.env;

export const tokenPrice = async (contractAddress) => {
  const response = await axios.get(
    `https://pro-api.coingecko.com/api/v3/onchain/networks/bitrock/tokens/${contractAddress}`,
    {
      headers: {
        "x-cg-pro-api-key": env.COINGECKO_API_KEY
      }
    }
  );

  const usdPrice = response.data.data.attributes.price_usd;

  return Number(usdPrice);
};

export const tokenInfo = async (contractAddress) => {
  const response = await axios.get(
    `https://pro-api.coingecko.com/api/v3/onchain/networks/bitrock/tokens/${contractAddress}`,
    {
      headers: {
        "x-cg-pro-api-key": env.COINGECKO_API_KEY
      }
    }
  );

  return response.data.data;
};

export const EthPrice = async (balance) => {
  if (Number(balance) <= 0) return 0;
  let contractAddress = "0x413f0E3A440abA7A15137F4278121450416882d5";
  const response = await axios.get(
    `https://pro-api.coingecko.com/api/v3/onchain/networks/bitrock/tokens/${contractAddress}`,
    {
      headers: {
        "x-cg-pro-api-key": env.COINGECKO_API_KEY
      }
    }
  );

  const userBalance = (
    Number(response.data.data.attributes.price_usd) * Number(balance)
  ).toFixed(3);
  return userBalance;
};

export const EthPriceRaw = async (balance) => {
  if (Number(balance) <= 0) return 0;
  const response = await axios.get(
    `https://pro-api.coinmarketcap.com/v2/tools/price-conversion?symbol=ETH&amount=${balance}`,
    {
      headers: {
        "X-CMC_PRO_API_KEY": process.env.COINMARKET_API_KEY
      }
    }
  );

  const userBalance = response.data.data[0].quote.USD.price.toFixed(7);
  return userBalance;
};

export const poolInfo = async (poolAddress, bot) => {
  try {
    const response = await axios.get(
      `https://pro-api.coingecko.com/api/v3/onchain/networks/bitrock/pools/${poolAddress}?include=base_token%2Cquote_token`,
      {
        headers: {
          "x-cg-pro-api-key": env.COINGECKO_API_KEY
        }
      }
    );
    const formattedResponse = response.data.data;
    return formattedResponse;
  } catch (error) {
    return new Error("not found");
  }
};
