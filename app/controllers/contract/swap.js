import { ethers } from "ethers";
import { smartContractTestnetAddress } from "./contractAddress.js";
import axios from "axios";
import { err, globals, log } from "../../utils/globals.js";
import { fromCustomLamport, toCustomLamport } from "../../utils/converters.js";
import { BN } from "bn.js";
import { fetchSpecificTokenBalance } from "../moralis/moralis.js";
import { EthPrice } from "../../utils/prices.js";

// TODO change sepolia WETH to mainnet WETH
const WETH = "0x413f0E3A440abA7A15137F4278121450416882d5";
const ROCKROUTER = "0xeeabd314e2eE640B1aca3B27808972B05c7f6A3b";
//  "0x7b79995e5f793A07Bc00c21412e50Ecae098E7f9"; // sepolia

const tokenABI = [
  // Standard ERC-20 functions
  "function balanceOf(address account) view returns (uint256)",
  "function transfer(address recipient, uint256 amount) returns (bool)",
  "function decimals() view returns (uint8)",
  "function _decimals() view returns (uint8)",
  "function symbol() view returns (string)",
  "function _symbol() view returns (string)",
  "function approve(address spender, uint256 amount) returns (bool)"
];

export const useContract = async (
  userAddress,
  contractAddress,
  privateKey,
  decimal,
  ticker,
  coinName,
  amount,
  slippage,
  extraGas
) => {
  const provider = new ethers.JsonRpcProvider(globals.infuraSepolia);
  const walletInstance = new ethers.Wallet(privateKey, provider);
  const routerContract = new ethers.Contract(
    smartContractTestnetAddress,
    [
      "function swapExactETHForTokensSupportingFeeOnTransferTokens(address _tokenOut, uint256 amountOutMin, uint256 deadline)",
      "function swapExactTokensForETHSupportingFeeOnTransferTokens(address _tokenIn, uint256 amountOutMin, uint256 amountInMax, uint256 deadline)"
    ],
    walletInstance
  );

  const rockRouterContract = new ethers.Contract(
    ROCKROUTER,
    [
      "function getAmountsOut(uint amountIn, address[] calldata path) external view returns (uint[] memory amounts)"
    ],
    provider
  );

  const structuredAmount = ethers
    .parseEther(((95 / 100) * Number(amount)).toFixed(2).toString())
    .toString();

  log("==== amounts out =====");
  const exactAmountsOut = await rockRouterContract.getAmountsOut(
    structuredAmount,
    [WETH, contractAddress]
  );
  log(exactAmountsOut);

  let slippageAmount;
  if (slippage) {
    slippageAmount =
      BigInt(exactAmountsOut[1]) -
      (BigInt(exactAmountsOut[1]) * BigInt(slippage)) / BigInt(100);
  }
  // const routerContract = new ethers.Contract(
  //   smartContractTestnetAddress,
  //   [
  //     "function getAmountsOut(uint amountIn, address[] path) view returns (uint[] amounts)",
  //     "function swapExactETHForTokensSupportingFeeOnTransferTokens(uint amountOutMin, address[] path, address to, uint deadline) external payable"
  //   ],
  //   walletInstance
  // );
  // "0xcd520AFabcfdA94f2fe3321ed0570CBFE2eD8A24" ||
  const deadline = Math.floor(Date.now() / 1000) + 60 * 10; // Set a deadline (10 minutes from now)
  // const taxes = await contract.getTaxes();
  // const ttx = await routerContract.getAmountsOut(
  //   Number(ethers.parseEther(amount)).toString(),
  //   [WETH, contractAddress]
  // );

  const functionName = "swapExactETHForTokensSupportingFeeOnTransferTokens";
  let weiGasAmount, ethAmount;
  if (extraGas) {
    const currentEthPrice = await EthPrice(1);
    ethAmount = Number(extraGas) / Number(currentEthPrice);
    const userAmount = ethers.parseUnits(
      ethAmount.toFixed(3).toString(),
      "ether"
    );
    const newAmount = ethers.formatUnits(userAmount.toString(), "gwei");
    weiGasAmount = newAmount;
  }

  // const contractParams = ["0", [WETH, contractAddress], userAddress, deadline];
  const contractParams = [
    contractAddress,
    slippageAmount ? slippageAmount.toString() : "0",
    deadline
  ];

  const transaction = {
    to: smartContractTestnetAddress,
    value: ethers.parseEther(amount),
    data: routerContract.interface.encodeFunctionData(
      functionName,
      contractParams
    ),
    ...(extraGas ? { gasLimit: weiGasAmount } : {})
  };
  const sentTransaction = await walletInstance.sendTransaction(transaction);

  // await sentTransaction.wait();

  log("========== logging ========");
  // log(ttx[1]);
  log(sentTransaction);
  return {
    hash: sentTransaction.hash,
    amountOut: fromCustomLamport(
      slippageAmount
        ? slippageAmount.toString()
        : exactAmountsOut[1].toString(),
      decimal
    )
  };
};

export const useSniper = async (
  userAddress,
  contractAddress,
  privateKey,
  decimal,
  ticker,
  coinName,
  amount,
  slippage,
  extraGas
) => {
  const provider = new ethers.JsonRpcProvider(globals.infuraSepolia);
  const walletInstance = new ethers.Wallet(privateKey, provider);
  const routerContract = new ethers.Contract(
    smartContractTestnetAddress,
    [
      "function swapExactETHForTokensSupportingFeeOnTransferTokens(address _tokenOut, uint256 amountOutMin, uint256 deadline)",
      "function swapExactTokensForETHSupportingFeeOnTransferTokens(address _tokenIn, uint256 amountOutMin, uint256 amountInMax, uint256 deadline)"
    ],
    walletInstance
  );

  const rockRouterContract = new ethers.Contract(
    ROCKROUTER,
    [
      "function getAmountsOut(uint amountIn, address[] calldata path) external view returns (uint[] memory amounts)"
    ],
    provider
  );

  const structuredAmount = ethers
    .parseEther(((95 / 100) * Number(amount)).toFixed(2).toString())
    .toString();

  log("==== amounts out =====");
  const exactAmountsOut = await rockRouterContract.getAmountsOut(
    structuredAmount,
    [WETH, contractAddress]
  );
  log(exactAmountsOut);

  let slippageAmount;
  if (slippage) {
    slippageAmount =
      BigInt(exactAmountsOut[1]) -
      (BigInt(exactAmountsOut[1]) * BigInt(slippage)) / BigInt(100);
  }
  // const routerContract = new ethers.Contract(
  //   smartContractTestnetAddress,
  //   [
  //     "function getAmountsOut(uint amountIn, address[] path) view returns (uint[] amounts)",
  //     "function swapExactETHForTokensSupportingFeeOnTransferTokens(uint amountOutMin, address[] path, address to, uint deadline) external payable"
  //   ],
  //   walletInstance
  // );
  // "0xcd520AFabcfdA94f2fe3321ed0570CBFE2eD8A24" ||
  const deadline = Math.floor(Date.now() / 1000) + 60 * 10; // Set a deadline (10 minutes from now)
  // const taxes = await contract.getTaxes();
  // const ttx = await routerContract.getAmountsOut(
  //   Number(ethers.parseEther(amount)).toString(),
  //   [WETH, contractAddress]
  // );

  const functionName = "swapExactETHForTokensSupportingFeeOnTransferTokens";
  let weiGasAmount, ethAmount;
  if (extraGas) {
    const currentEthPrice = await EthPrice(1);
    ethAmount = Number(extraGas) / Number(currentEthPrice);
    const userAmount = ethers.parseUnits(
      ethAmount.toFixed(3).toString(),
      "ether"
    );
    const newAmount = ethers.formatUnits(userAmount.toString(), "gwei");
    weiGasAmount = newAmount.split(".")[0];
  }

  // const contractParams = ["0", [WETH, contractAddress], userAddress, deadline];
  const contractParams = [
    contractAddress,
    slippageAmount ? slippageAmount.toString() : "0",
    deadline
  ];

  const transaction = {
    to: smartContractTestnetAddress,
    value: ethers.parseEther(amount),
    data: routerContract.interface.encodeFunctionData(
      functionName,
      contractParams
    ),
    ...(extraGas ? { gasLimit: weiGasAmount } : {})
  };
  const sentTransaction = await walletInstance.sendTransaction(transaction);

  // await sentTransaction.wait();

  log("========== logging ========");
  // log(ttx[1]);
  log(sentTransaction);
  return {
    hash: sentTransaction.hash,
    amountOut: fromCustomLamport(
      slippageAmount
        ? slippageAmount.toString()
        : exactAmountsOut[1].toString(),
      decimal
    )
  };
};

export const swapBack = async (
  userAddress,
  contractAddress,
  privateKey,
  decimal,
  ticker,
  coinName,
  amount,
  slippage,
  percent,
  ctx,
  all
) => {
  const provider = new ethers.JsonRpcProvider(globals.infuraSepolia);
  const responseBalance = await fetchSpecificTokenBalance(
    userAddress,
    contractAddress.toString()
  );
  log(contractAddress);

  log("responseBalance =================");
  log(responseBalance);

  const userBalance = fromCustomLamport(
    responseBalance[0].balance,
    responseBalance[0].decimals
  ).toFixed(3);

  const amountToSell = toCustomLamport(amount, responseBalance[0].decimals);
  log(" ======= amount to sell in its decimals ========= ");

  log(amountToSell);
  log(userBalance);

  const settledBalance =
    percent === true
      ? toCustomLamport(
          (amount / 100) * Number(userBalance).toFixed(3),
          responseBalance[0].decimals
        )
      : amountToSell;

  log(settledBalance);
  const settledBalanceForApprove =
    percent === true ? (amount / 100) * Number(userBalance).toFixed(3) : amount;

  const walletInstance = new ethers.Wallet(privateKey, provider);
  const routerContract = new ethers.Contract(
    smartContractTestnetAddress,
    [
      "function swapExactETHForTokensSupportingFeeOnTransferTokens(address _tokenOut, uint256 amountOutMin, uint256 deadline)",
      "function swapExactTokensForETHSupportingFeeOnTransferTokens(address _tokenIn, uint256 amountOutMin, uint256 amountInMax, uint256 deadline)"
    ],
    walletInstance
  );

  const rockRouterContract = new ethers.Contract(
    ROCKROUTER,
    [
      "function getAmountsOut(uint amountIn, address[] calldata path) external view returns (uint[] memory amounts)"
    ],
    provider
  );

  // const structuredAmount = ethers.parseUnits(settledBalance, ).toString();

  log("==== amounts out =====");
  const exactAmountsOut = await rockRouterContract.getAmountsOut(
    settledBalance.toString(),
    [contractAddress, WETH]
  );
  log(exactAmountsOut);

  // const routerContract = new ethers.Contract(
  //   smartContractTestnetAddress,
  //   [
  //     "function getAmountsOut(uint amountIn, address[] path) view returns (uint[] amounts)",
  //     "function swapExactETHForTokensSupportingFeeOnTransferTokens(uint amountOutMin, address[] path, address to, uint deadline) external payable",
  //     "function swapExactTokensForETHSupportingFeeOnTransferTokens(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) external"
  //   ],
  //   walletInstance
  // );

  try {
    // log(" =========== trying approve ===========");
    // await ctx.reply(" === approving swap 💌 === ");
    await approve(
      privateKey,
      contractAddress,
      smartContractTestnetAddress,
      settledBalanceForApprove,
      decimal,
      globals.infuraSepolia
    ).then((e) => {
      log(e);
    });
    log(" ======== approval successful ======");
  } catch (error) {
    log("approval error =====");
    err(error);
    // throw new Error({ message: "approval failed", error: error.toString() });
  }
  const deadline = Math.floor(Date.now() / 1000) + 60 * 10; // Set a deadline (10 minutes from now)

  // await ctx.reply(" === we're still on it 💌 === ");

  // log("------ table -----");
  // log(
  //   settledBalance.toString(),
  //   "0",
  //   ["0xcd520AFabcfdA94f2fe3321ed0570CBFE2eD8A24" || contractAddress, WETH],
  //   userAddress,
  //   deadline
  // );

  const swapBacks =
    await routerContract.swapExactTokensForETHSupportingFeeOnTransferTokens(
      contractAddress,
      "0",
      all ? responseBalance[0].balance : settledBalance.toString(),
      deadline
    );
  // const swapBacks =
  //   await routerContract.swapExactTokensForETHSupportingFeeOnTransferTokens(
  //     settledBalance.toString(),
  //     "0",
  //     ["0xcd520AFabcfdA94f2fe3321ed0570CBFE2eD8A24" || contractAddress, WETH],
  //     userAddress,
  //     deadline
  //   );
  log("===== swapBack =====");
  log(swapBacks);

  return {
    hash: swapBacks.hash,
    amountOut: fromCustomLamport(
      ((exactAmountsOut[1] * BigInt(94)) / BigInt(100)).toString(),
      "18"
    ).toFixed(2),
    amount: Number(
      fromCustomLamport(settledBalance.toString(), decimal.toString())
    ).toFixed(2)
  };
};

const approve = async (
  privateKey,
  tokenAddress,
  routerAddress,
  amountToApprove,
  decimals,
  rpc
) => {
  const provider = new ethers.JsonRpcProvider(rpc);
  const walletInstance = new ethers.Wallet(privateKey, provider);
  // const amountToApproveInCustomLamport = toCustomLamport(
  //   amountToApprove,
  //   decimals
  // );
  // const max = amountToApproveInCustomLamport.toString();
  // const amountAllowingTwentyPercentExtra = new BN(max).muln(1.5).toString();
  // log("amountAllowingTwentyPercentExtra");
  // log(amountAllowingTwentyPercentExtra);
  const max = ethers.MaxUint256;
  log(max);
  const contract = new ethers.Contract(tokenAddress, tokenABI, walletInstance);
  const request = await contract.approve(routerAddress, max.toString());
  await request.wait();
  return request.hash;
};

// await useContract(
//   "0xe011EC515c0E70094c8b4D5c9d36d3b499D9532d",
//   "0x7f11f79DEA8CE904ed0249a23930f2e59b43a385",
//   "0x69b4e6e10724619e35d3b949eb30b4f7af88a5e20749f0d18cc11778f68d011d",
//   "18",
//   "",
//   "",
//   "0.04"
// );

// setTimeout(async () => {
//   await swapBack(
//     "0xe011EC515c0E70094c8b4D5c9d36d3b499D9532d",
//     "0x7f11f79DEA8CE904ed0249a23930f2e59b43a385",
//     "0x69b4e6e10724619e35d3b949eb30b4f7af88a5e20749f0d18cc11778f68d011d",
//     18,
//     "",
//     "",
//     "270",
//     ""
//   );
// }, 10000);

// 17536000000000000000 0 [
//   '0x9c0241e7538b35454735ae453423daf470a25b3a',
//   '0x7b79995e5f793A07Bc00c21412e50Ecae098E7f9'
// ] 0xe011EC515c0E70094c8b4D5c9d36d3b499D9532d 1709625452

// 272000000000000000000000 0 [
//   '0x7f11f79DEA8CE904ed0249a23930f2e59b43a385',
//   '0x7b79995e5f793A07Bc00c21412e50Ecae098E7f9'
// ] 0xe011EC515c0E70094c8b4D5c9d36d3b499D9532d 1709625310
