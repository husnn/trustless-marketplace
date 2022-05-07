import { expect } from "chai";
import { ethers } from "hardhat";
import { ERC20, Market } from "../../typechain";

describe("Market", async function () {
  const signers = await ethers.getSigners();
  const tests: Array<{
    name: string;
    sender: string;
    id: number;
    error?: string | null;
  }> = [
    {
      name: "Cancel trade - Success",
      sender: signers[0].address,
      id: 1,
      error: null,
    },
    {
      name: "Trade does not exist",
      sender: signers[0].address,
      id: 2,
      error: "Unauthorized",
    },
  ];
  let erc20: ERC20, market: Market;
  let tx;
  before(async () => {
    const ERC20 = await ethers.getContractFactory("MockERC20");
    erc20 = await ERC20.deploy();

    const Market = await ethers.getContractFactory("Market");
    market = await Market.deploy(signers[0].address);

    await erc20.deployed();
    await market.deployed();

    tx = await erc20.approve(market.address, 1000);
    await tx.wait();
  });
  tests.forEach((tt) => {
    it(tt.name, async function () {
      const expiry = new Date();
      expiry.setTime(expiry.getTime() + 1 * 60 * 60 * 1000);

      tx = await market.wrap(
        erc20.address,
        1000,
        Math.floor(expiry.getTime() / 1000)
      );

      await tx.wait();

      const trade = await market.get(1);

      expect(trade.amount).to.equal(1000);

      if (tt.error)
        await expect(market.cancel(tt.id)).to.be.revertedWith(tt.error);
      else await expect(market.cancel(tt.id)).to.emit(market, "Cancel");
    });
  });
});
