
const Voting = artifacts.require("Voting");
module.exports = async function (deployer, network, accounts) {
    await deployer.deploy(Voting,{from:accounts[0]});
    let instance = await Voting.deployed();
    console.log(instance.address);
};