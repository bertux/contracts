"user strict";

/**
 * @author Cyril Lapinte - <cyril@openfiz.com>
 */

const assertRevert = require("../helpers/assertRevert");
const KYCTokensale = artifacts.require("tokensale/KYCTokensale.sol");
const Token = artifacts.require("util/token/TokenERC20.sol");
const UserRegistry = artifacts.require("UserRegistry.sol");
const BN = require("bn.js");

contract("KYCTokensale", function (accounts) {
  let sale, token, userRegistry;
 
  const KYC_LEVEL_KEY = 1;

  const vaultERC20 = accounts[1];
  const vaultETH = accounts[2];
  const tokenPrice = 500;
  const supply = "1000000";
  const dayPlusOneTime = Math.floor((new Date()).getTime() / 1000) + 3600 * 24;

  before(async function () {
    userRegistry = await UserRegistry.new(
      "Dummy",
      [ accounts[1], accounts[2], accounts[3], accounts[4], accounts[5], accounts[6] ], dayPlusOneTime);
    await userRegistry.updateUserExtended(1, KYC_LEVEL_KEY, 0);
    await userRegistry.updateUserExtended(2, KYC_LEVEL_KEY, 1);
    await userRegistry.updateUserExtended(3, KYC_LEVEL_KEY, 2);
    await userRegistry.updateUserExtended(4, KYC_LEVEL_KEY, 3);
    await userRegistry.updateUserExtended(5, KYC_LEVEL_KEY, 4);
    await userRegistry.updateUserExtended(6, KYC_LEVEL_KEY, 5);
  });

  beforeEach(async function () {
    token = await Token.new("Name", "Symbol", 0, accounts[1], 1000000);
    sale = await KYCTokensale.new(
      token.address,
      vaultERC20,
      vaultETH,
      tokenPrice,
      userRegistry.address,
    );
    await token.approve(sale.address, supply, { from: accounts[1] });
  });

  it("should have a token", async function () {
    const tokenAddress = await sale.token();
    assert.equal(tokenAddress, token.address, "token");
  });

  it("should have a vault ERC20", async function () {
    const saleVaultERC20 = await sale.vaultERC20();
    assert.equal(saleVaultERC20, vaultERC20, "vaultERC20");
  });

  it("should have a vault ETH", async function () {
    const saleVaultETH = await sale.vaultETH();
    assert.equal(saleVaultETH, vaultETH, "vaultETH");
  });

  it("should have a token price", async function () {
    const saleTokenPrice = await sale.tokenPrice();
    assert.equal(saleTokenPrice, tokenPrice, "tokenPrice");
  });

  it("should have a user registry", async function () {
    const saleUserRegistry = await sale.userRegistry();
    assert.equal(saleUserRegistry, userRegistry.address, "userRegistry");
  });
});