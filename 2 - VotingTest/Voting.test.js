const Voting = artifacts.require("./contracts/Voting.sol");
const { BN , expectRevert, expectEvent } = require('@openzeppelin/test-helpers');
const { expect } = require('chai');


contract("Voting", accounts => {
  // const _name = "Alyra"
  // const _symbol = "ALY" 
  // const _initialSupply = new BN(10000);
  // const _owner = accounts[0];
  // const _recipient = accounts[1];
  // const _decimal = new BN(18);

  const _owner = accounts[0];
  const _Voter1 = accounts[1];
  const _Voter2 = accounts[3];
  const _Voter3 = accounts[3];
  const _MsgNotOwner = "Ownable: caller is not the owner";
  const _MsgRegisteringCanStarted = "Registering proposals cant be started now";
  const _MsgRegisteringNotStarted = "Registering proposals havent started yet";
  const _MsgRegisteringNotFinished = "Registering proposals phase is not finished";
  const _MsgVotingNotStarted = "Voting session havent started yet";
  const _MsgVotingNotEnded = "Current status is not voting session ended";

  let VotingInstance;

  beforeEach(async function(){
    VotingInstance= await Voting.new({from: _owner});
  });

    //Global Testing
    it("Owner of contract", async () => {
      expect(await VotingInstance.owner()).to.equal(_owner);
    });
   
    //State Testing OnlyOwner
    it("Check Status OnlyOwner", async () => {
      await expectRevert(VotingInstance.startProposalsRegistering({from: _Voter1}), _MsgNotOwner);
      await expectRevert(VotingInstance.endProposalsRegistering({ from: _Voter1}), _MsgNotOwner);
      await expectRevert(VotingInstance.startVotingSession({ from: _Voter1}), _MsgNotOwner);
      await expectRevert(VotingInstance.endVotingSession({ from: _Voter1}), _MsgNotOwner);
      await expectRevert(VotingInstance.tallyVotes({ from: _Voter1}), _MsgNotOwner);
    });

    //State Testing Status
    it("Check Status Change", async () => {
      //State RegisteringVoters. Impossible to endProposalsRegistering,startVotingSession,endVotingSession,tallyVotes. Just ProposalsRegistrationStarted
      await expectRevert(VotingInstance.endProposalsRegistering({from: _owner}), _MsgRegisteringNotStarted);
      await expectRevert(VotingInstance.startVotingSession({from: _owner}), _MsgRegisteringNotFinished);
      await expectRevert(VotingInstance.endVotingSession({from: _owner}), _MsgVotingNotStarted);
      await expectRevert(VotingInstance.tallyVotes({from: _owner}), _MsgVotingNotEnded);

      //Change to ProposalsRegistrationStarted
      await VotingInstance.startProposalsRegistering({from: _owner});

      //State ProposalsRegistrationStarted. Impossible to RegisteringVoters,startVotingSession,endVotingSession,tallyVotes. Just endProposalsRegistering
      await expectRevert(VotingInstance.startProposalsRegistering({from: _owner}), _MsgRegisteringCanStarted);
      await expectRevert(VotingInstance.startVotingSession({from: _owner}), _MsgRegisteringNotFinished);
      await expectRevert(VotingInstance.endVotingSession({from: _owner}), _MsgVotingNotStarted);
      await expectRevert(VotingInstance.tallyVotes({from: _owner}), _MsgVotingNotEnded);

      //Change to endProposalsRegistering
      await VotingInstance.endProposalsRegistering({from: _owner});

      //State endProposalsRegistering. Impossible to RegisteringVoters,ProposalsRegistrationStarted,endVotingSession,tallyVotes. Just startVotingSession
      await expectRevert(VotingInstance.startProposalsRegistering({from: _owner}), _MsgRegisteringCanStarted);     
      await expectRevert(VotingInstance.endProposalsRegistering({from: _owner}), _MsgRegisteringNotStarted);
      await expectRevert(VotingInstance.endVotingSession({from: _owner}), _MsgVotingNotStarted);
      await expectRevert(VotingInstance.tallyVotes({from: _owner}), _MsgVotingNotEnded);

      //Change to startVotingSession
      await VotingInstance.startVotingSession({from: _owner});

      //State startVotingSession. Impossible to RegisteringVoters,ProposalsRegistrationStarted,endProposalsRegistering,tallyVotes. Just endVotingSession
      await expectRevert(VotingInstance.startProposalsRegistering({from: _owner}), _MsgRegisteringCanStarted);     
      await expectRevert(VotingInstance.endProposalsRegistering({from: _owner}), _MsgRegisteringNotStarted);
      await expectRevert(VotingInstance.startVotingSession({from: _owner}), _MsgRegisteringNotFinished);
      await expectRevert(VotingInstance.tallyVotes({from: _owner}), _MsgVotingNotEnded);

      //Change to endVotingSession
      await VotingInstance.endVotingSession({from: _owner});

      //State endVotingSession. Impossible to startVotingSession, RegisteringVoters,ProposalsRegistrationStarted,endProposalsRegistering,. Just tallyVotes
      await expectRevert(VotingInstance.startProposalsRegistering({from: _owner}), _MsgRegisteringCanStarted);     
      await expectRevert(VotingInstance.endProposalsRegistering({from: _owner}), _MsgRegisteringNotStarted);
      await expectRevert(VotingInstance.startVotingSession({from: _owner}), _MsgRegisteringNotFinished);
      await expectRevert(VotingInstance.endVotingSession({from: _owner}), _MsgVotingNotStarted);

      //Change to tallyVotes
      await VotingInstance.tallyVotes({from: _owner});

      //End of status. Impossible to change
      await expectRevert(VotingInstance.startProposalsRegistering({from: _owner}), _MsgRegisteringCanStarted);     
      await expectRevert(VotingInstance.endProposalsRegistering({from: _owner}), _MsgRegisteringNotStarted);
      await expectRevert(VotingInstance.startVotingSession({from: _owner}), _MsgRegisteringNotFinished);
      await expectRevert(VotingInstance.endVotingSession({from: _owner}), _MsgVotingNotStarted);
      await expectRevert(VotingInstance.tallyVotes({from: _owner}), _MsgVotingNotEnded);
    });


  // it("has a name", async () => {
  //   expect(await MyTokenInstance.name()).to.equal(_name);
  // });

  // it("has a symbol", async () => {
  //   expect(await MyTokenInstance.symbol()).to.equal(_symbol);
  // });

  // it("has a decimal", async () => {
  //   expect(await MyTokenInstance.decimals()).to.be.bignumber.equal(_decimal);
  // });

  // it("check first balance", async () => {
  //   expect(await MyTokenInstance.balanceOf(_owner)).to.be.bignumber.equal(_initialSupply);
  // });

  // it("check balance after transfer", async () => {
  //   let amount = new BN(100);
  //   let balanceOwnerBeforeTransfer = await MyTokenInstance.balanceOf(_owner);
  //   let balanceRecipientBeforeTransfer = await MyTokenInstance.balanceOf(_recipient)

  //   expect(balanceRecipientBeforeTransfer).to.be.bignumber.equal(new BN(0));
    
  //   await MyTokenInstance.transfer(_recipient, new BN(100), {from: _owner});

  //   let balanceOwnerAfterTransfer = await MyTokenInstance.balanceOf(_owner);
  //   let balanceRecipientAfterTransfer = await MyTokenInstance.balanceOf(_recipient)

  //   expect(balanceOwnerAfterTransfer).to.be.bignumber.equal(balanceOwnerBeforeTransfer.sub(amount));
  //   expect(balanceRecipientAfterTransfer).to.be.bignumber.equal(balanceRecipientBeforeTransfer.add(amount));
  // });

  // it("check if transferFrom done", async () => {
  //   let amount = new BN(100);
    
  //   await MyTokenInstance.approve(_recipient, amount);
 
  //   let balanceOwnerBeforeTransfer = await MyTokenInstance.balanceOf(_owner);
  //   let balanceRecipientBeforeTransfer = await MyTokenInstance.balanceOf(_recipient)
  //   expect(balanceOwnerBeforeTransfer).to.be.bignumber.equal(_initialSupply);
  //   expect(balanceRecipientBeforeTransfer).to.be.bignumber.equal(new BN(0));
 
  //   await MyTokenInstance.transferFrom(_owner, _recipient, amount, { from: _recipient})
 
  //   let balanceOwnerAfterTransfer = await MyTokenInstance.balanceOf(_owner);
  //   let balanceRecipientAfterTransfer = await MyTokenInstance.balanceOf(_recipient)
 
  //   expect(balanceOwnerAfterTransfer).to.be.bignumber.equal(balanceOwnerBeforeTransfer.sub(amount));
  //   expect(balanceRecipientAfterTransfer).to.be.bignumber.equal(balanceRecipientBeforeTransfer.add(amount));
  // });

  // it("check if approval done", async () => {
  //   let amount = new BN(100);
  //   let AllowanceBeforeApproval = await MyTokenInstance.allowance(_owner, _recipient);
  //   expect(AllowanceBeforeApproval).to.be.bignumber.equal(new BN(0));
 
  //   await MyTokenInstance.approve(_recipient, amount);
    
  //   let AllowanceAfterApproval = await MyTokenInstance.allowance(_owner, _recipient);
  //   expect(AllowanceAfterApproval).to.be.bignumber.equal(amount);
  // });


});
