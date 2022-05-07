/* eslint-disable node/no-unsupported-features/es-syntax */
import fs from "fs";
import { ethers, network } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();

  let deployed: { [chainId: number]: { [name: string]: string } } = {};

  const Market = await ethers.getContractFactory("Market");
  const market = await Market.deploy(deployer.address);

  const outFile = `deployed.json`;
  const chainId = network.config.chainId || 1337;

  console.log("Chain ID: " + chainId);

  deployed[chainId] = {
    ...deployed[chainId],
    Market: market.address,
  };

  if (process.env.NODE_ENV === "development") {
    const ERC20 = await ethers.getContractFactory("MockERC20");
    const erc20 = await ERC20.deploy();

    deployed[chainId] = {
      ...deployed[chainId],
      ERC20: erc20.address,
    };
  }

  try {
    fs.readFile(outFile, (err, data) => {
      if (!err) {
        deployed = {
          ...JSON.parse(data.toString()),
          ...deployed,
        };
        console.log(deployed);
      }
      fs.writeFileSync(outFile, JSON.stringify(deployed, null, 2), "utf-8");
    });
  } catch (err) {
    console.log(err);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
