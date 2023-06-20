const { ethers } = require("hardhat");
require("dotenv").config();
const hre = require("hardhat");


const { toHex, utf8ToBytes } = require("ethereum-cryptography/utils")
const { keccak256 } = require("ethereum-cryptography/keccak");

async function main() {
  const [owner] = await ethers.getSigners();
  const tokenAddress = process.env.TOKEN_ADDRESS;
  const governorAddress = process.env.GOVERNOR_ADDRESS; 


  const governor = await ethers.getContractAt("Governor",governorAddress)

  const token = await ethers.getContractAt("MyToken",tokenAddress);

  const tx = await governor.propose(
    [token.address],
    [0],
    [token.interface.encodeFunctionData("mint", [owner.address, ethers.utils.parseEther("13")])],
    "Give the owner more tokens!"
  );
  const receipt = await tx.wait();
  const event = receipt.events.find(x => x.event === 'ProposalCreated');
  const { proposalId } = event.args;
  console.log(
    `Proposal ID is ${proposalId}`
  );


  // wait for the 1 block voting delay
  //await hre.network.provider.send("evm_mine");

  const currentBlockNumber = await ethers.provider.getBlockNumber();
  console.log(`Current block is ${currentBlockNumber}`)

  let newBlockNumber = currentBlockNumber;

  // 循环直到新的区块出现
  while (newBlockNumber <= currentBlockNumber) {
      await new Promise(resolve => setTimeout(resolve, 5000)); // 等待5秒
      newBlockNumber = await ethers.provider.getBlockNumber();
  }

  console.log('New block number:', newBlockNumber);


  const tx2 = await governor.castVote(proposalId, 1);  
  await tx2.wait();

  await governor.execute(
    [token.address],
    [0],
    [token.interface.encodeFunctionData("mint", [owner.address, ethers.utils.parseEther("13")])],
    keccak256(utf8ToBytes("Give the owner more tokens!"))
  );


}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
