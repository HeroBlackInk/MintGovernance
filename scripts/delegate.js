const { ethers } = require("hardhat");
require("dotenv").config();



async function main() {
  const [owner] = await ethers.getSigners();
  const tokenAddress = process.env.TOKEN_ADDRESS;
  const governorAddress = process.env.GOVERNOR_ADDRESS; 


  const governor = await ethers.getContractAt("Governor",governorAddress)

  const token = await ethers.getContractAt("MyToken",tokenAddress);

  const tx = await token.delegate(owner.address);
  await tx.wait();
  console.log(
    `Delegate tx: ${tx}`
  );

}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
