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
  const _Voter3 = accounts[4];
  const _MsgNotOwner = "Ownable: caller is not the owner";
  const _MsgRegisteringCanStarted = "Registering proposals cant be started now";
  const _MsgRegisteringNotStarted = "Registering proposals havent started yet";
  const _MsgRegisteringNotFinished = "Registering proposals phase is not finished";
  const _MsgVotingNotStarted = "Voting session havent started yet";
  const _MsgVotingNotEnded = "Current status is not voting session ended";
  const _MsgAlreadyRegistered = "Already registered";
  const _MsgNotAVoter = "You're not a voter";
  const _MsgProposalNotAllowed ="Proposals are not allowed yet"
  const _MsgRienProposer = "Vous ne pouvez pas ne rien proposer"
  const _MsgVotersRegistrationNotOpen = "Voters registration is not open yet"
  const _MsgAlreadyVoted = "You have already voted"
  const _MsgProposalNotFound = "Proposal not found"


  let VotingInstance;

  beforeEach(async function(){
    VotingInstance= await Voting.new({from: _owner});
  });

    //Global Testing
    it("Owner of contract", async () => {
      expect(await VotingInstance.owner()).to.equal(_owner);
    });

    it("onlyVoters", async () => {
      await expectRevert(VotingInstance.getVoter(_Voter1), "You're not a voter");
      await expectRevert(VotingInstance.getOneProposal(1), "You're not a voter");
    });

    //State Testing OnlyOwner
    it("Status OnlyOwner", async () => {
      await expectRevert(VotingInstance.startProposalsRegistering({from: _Voter1}), _MsgNotOwner);
      await expectRevert(VotingInstance.endProposalsRegistering({ from: _Voter1}), _MsgNotOwner);
      await expectRevert(VotingInstance.startVotingSession({ from: _Voter1}), _MsgNotOwner);
      await expectRevert(VotingInstance.endVotingSession({ from: _Voter1}), _MsgNotOwner);
      await expectRevert(VotingInstance.tallyVotes({ from: _Voter1}), _MsgNotOwner);
    });

    //State Testing Status
    it("Status Change", async () => {
      //State RegisteringVoters. Impossible to endProposalsRegistering,startVotingSession,endVotingSession,tallyVotes. Just ProposalsRegistrationStarted
      await expectRevert(VotingInstance.endProposalsRegistering({from: _owner}), _MsgRegisteringNotStarted);
      await expectRevert(VotingInstance.startVotingSession({from: _owner}), _MsgRegisteringNotFinished);
      await expectRevert(VotingInstance.endVotingSession({from: _owner}), _MsgVotingNotStarted);
      await expectRevert(VotingInstance.tallyVotes({from: _owner}), _MsgVotingNotEnded);

      //Change to ProposalsRegistrationStarted
      const resultstartProposalsRegistering = await VotingInstance.startProposalsRegistering({from: _owner});
      expectEvent(resultstartProposalsRegistering, 'WorkflowStatusChange', {
        previousStatus: new BN(0),
        newStatus: new BN(1)
      });

      //State ProposalsRegistrationStarted. Impossible to RegisteringVoters,startVotingSession,endVotingSession,tallyVotes. Just endProposalsRegistering
      await expectRevert(VotingInstance.startProposalsRegistering({from: _owner}), _MsgRegisteringCanStarted);
      await expectRevert(VotingInstance.startVotingSession({from: _owner}), _MsgRegisteringNotFinished);
      await expectRevert(VotingInstance.endVotingSession({from: _owner}), _MsgVotingNotStarted);
      await expectRevert(VotingInstance.tallyVotes({from: _owner}), _MsgVotingNotEnded);

      //Change to endProposalsRegistering
      const resultendProposalsRegistering = await VotingInstance.endProposalsRegistering({from: _owner});
      expectEvent(resultendProposalsRegistering, 'WorkflowStatusChange', {
        previousStatus: new BN(1),
        newStatus: new BN(2)
      });

      //State endProposalsRegistering. Impossible to RegisteringVoters,ProposalsRegistrationStarted,endVotingSession,tallyVotes. Just startVotingSession
      await expectRevert(VotingInstance.startProposalsRegistering({from: _owner}), _MsgRegisteringCanStarted);     
      await expectRevert(VotingInstance.endProposalsRegistering({from: _owner}), _MsgRegisteringNotStarted);
      await expectRevert(VotingInstance.endVotingSession({from: _owner}), _MsgVotingNotStarted);
      await expectRevert(VotingInstance.tallyVotes({from: _owner}), _MsgVotingNotEnded);

      //Change to startVotingSession
      const resultstartVotingSession = await VotingInstance.startVotingSession({from: _owner});
      expectEvent(resultstartVotingSession, 'WorkflowStatusChange', {
        previousStatus: new BN(2),
        newStatus: new BN(3)
      });

      //State startVotingSession. Impossible to RegisteringVoters,ProposalsRegistrationStarted,endProposalsRegistering,tallyVotes. Just endVotingSession
      await expectRevert(VotingInstance.startProposalsRegistering({from: _owner}), _MsgRegisteringCanStarted);     
      await expectRevert(VotingInstance.endProposalsRegistering({from: _owner}), _MsgRegisteringNotStarted);
      await expectRevert(VotingInstance.startVotingSession({from: _owner}), _MsgRegisteringNotFinished);
      await expectRevert(VotingInstance.tallyVotes({from: _owner}), _MsgVotingNotEnded);

      //Change to endVotingSession
      const resultendVotingSession = await VotingInstance.endVotingSession({from: _owner});
      expectEvent(resultendVotingSession, 'WorkflowStatusChange', {
        previousStatus: new BN(3),
        newStatus: new BN(4)
      });

      //State endVotingSession. Impossible to startVotingSession, RegisteringVoters,ProposalsRegistrationStarted,endProposalsRegistering,. Just tallyVotes
      await expectRevert(VotingInstance.startProposalsRegistering({from: _owner}), _MsgRegisteringCanStarted);     
      await expectRevert(VotingInstance.endProposalsRegistering({from: _owner}), _MsgRegisteringNotStarted);
      await expectRevert(VotingInstance.startVotingSession({from: _owner}), _MsgRegisteringNotFinished);
      await expectRevert(VotingInstance.endVotingSession({from: _owner}), _MsgVotingNotStarted);

      //Change to VotesTallied
      const resulttallyVotes = await VotingInstance.tallyVotes({from: _owner});
      expectEvent(resulttallyVotes, 'WorkflowStatusChange', {
        previousStatus: new BN(4),
        newStatus: new BN(5)
      });

      //End of status. Impossible to change
      await expectRevert(VotingInstance.startProposalsRegistering({from: _owner}), _MsgRegisteringCanStarted);     
      await expectRevert(VotingInstance.endProposalsRegistering({from: _owner}), _MsgRegisteringNotStarted);
      await expectRevert(VotingInstance.startVotingSession({from: _owner}), _MsgRegisteringNotFinished);
      await expectRevert(VotingInstance.endVotingSession({from: _owner}), _MsgVotingNotStarted);
      await expectRevert(VotingInstance.tallyVotes({from: _owner}), _MsgVotingNotEnded);
    });

    //Add voter. Check the require WorkflowStatus
    it("Add voter WorkflowStatus", async () => {

      // 0 We need to be a voter
      await VotingInstance.addVoter(_Voter1);

      //RegisteringVoters = Add Voter Allowed = No Test

      //ProposalsRegistrationStarted = Add Voter Not Allowed
      await VotingInstance.startProposalsRegistering({from: _owner});
      await expectRevert(VotingInstance.addVoter(_Voter1,{from: _owner}), _MsgVotersRegistrationNotOpen);
      
      //ProposalsRegistrationEnded = Add Voter Not Allowed
      await VotingInstance.endProposalsRegistering({from: _owner});
      await expectRevert(VotingInstance.addVoter(_Voter1,{from: _owner}), _MsgVotersRegistrationNotOpen);
       
      //VotingSessionStarted = Add Voter Not Allowed
      await VotingInstance.startVotingSession({from: _owner});
      await expectRevert(VotingInstance.addVoter(_Voter1,{from: _owner}), _MsgVotersRegistrationNotOpen);
       
      //VotingSessionEnded = Add Voter Not Allowed
      await VotingInstance.endVotingSession({from: _owner});
      await expectRevert(VotingInstance.addVoter(_Voter1,{from: _owner}), _MsgVotersRegistrationNotOpen);

      //VotesTallied = Add Voter Not Allowed
      await VotingInstance.tallyVotes({from: _owner});  
      await expectRevert(VotingInstance.addVoter(_Voter1,{from: _owner}), _MsgVotersRegistrationNotOpen);  
    })

    //Add voter. if we added the voter, if we added twice and event
    it("Add voter", async () => {

      //0 - We add voter and test emit
      const result = await VotingInstance.addVoter(_Voter1);
      expectEvent(result, 'VoterRegistered', {
        voterAddress: _Voter1
      });

      //2 - Double addvoter
      await expectRevert(VotingInstance.addVoter(_Voter1), _MsgAlreadyRegistered);

      //2 - If the addVoter working
      let Voter_1 = await VotingInstance.getVoter(_Voter1,{from: _Voter1});
      expect(Voter_1.isRegistered).to.equal(true);
    })

    //Add Proposal. Check the require WorkflowStatus
    it("Add proposal WorkflowStatus", async () => {

      // 0 We need to be a voter
      await VotingInstance.addVoter(_Voter1);

      //RegisteringVoters = proposal not allowed
      await expectRevert(VotingInstance.addProposal("Proposal",{from: _Voter1}), _MsgProposalNotAllowed);

      //ProposalsRegistrationStarted = proposal allowed = no Test
      await VotingInstance.startProposalsRegistering({from: _owner});

      //endProposalsRegistering = proposal not allowed
      await VotingInstance.endProposalsRegistering({from: _owner});
      await expectRevert(VotingInstance.addProposal("Proposal",{from: _Voter1}), _MsgProposalNotAllowed);
       
      //startVotingSession = proposal not allowed
      await VotingInstance.startVotingSession({from: _owner});
      await expectRevert(VotingInstance.addProposal("Proposal",{from: _Voter1}), _MsgProposalNotAllowed);
       
      //endVotingSession = proposal not allowed
      await VotingInstance.endVotingSession({from: _owner});
      await expectRevert(VotingInstance.addProposal("Proposal",{from: _Voter1}), _MsgProposalNotAllowed);

      //VotesTallied = proposal not allowed
      await VotingInstance.tallyVotes({from: _owner});  
      await expectRevert(VotingInstance.addProposal("Proposal",{from: _Voter1}), _MsgProposalNotAllowed);      
    })

    //Add proposal. if we added the proposal, if the proposal is empty and event
    it("Add proposal", async () => {
      
      // 0 We need to be a voter and good status
      await VotingInstance.addVoter(_Voter1,{from: _owner});
      await VotingInstance.startProposalsRegistering({from: _owner});

      // 1 - Proposal empty
      await expectRevert(VotingInstance.addProposal("",{from: _Voter1}), _MsgRienProposer);

      // 2 - Event
      const result = await VotingInstance.addProposal("Proposal 1",{from: _Voter1});
      expectEvent(result, 'ProposalRegistered', {
        proposalId: new BN(1)
      });
    })    

  
    //Vote. Check the require WorkflowStatus
    it("Vote WorkflowStatus", async () => {

      // 0 We need to be a voter, 
      await VotingInstance.addVoter(_Voter1,{from: _owner});

      //RegisteringVoters = vote not allowed
      await expectRevert(VotingInstance.setVote(0,{from: _Voter1}), _MsgVotingNotStarted);

      //ProposalsRegistrationStarted = vote not allowed
      await VotingInstance.startProposalsRegistering({from: _owner});
      await expectRevert(VotingInstance.setVote(0,{from: _Voter1}), _MsgVotingNotStarted);

      //endProposalsRegistering = vote not allowed
      await VotingInstance.endProposalsRegistering({from: _owner});
      await expectRevert(VotingInstance.setVote(0,{from: _Voter1}), _MsgVotingNotStarted);
       
      //startVotingSession = vote allowed = no test
      await VotingInstance.startVotingSession({from: _owner});
       
      //endVotingSession = vote not allowed
      await VotingInstance.endVotingSession({from: _owner});
      await expectRevert(VotingInstance.setVote(0,{from: _Voter1}), _MsgVotingNotStarted);

      //VotesTallied = vote not allowed
      await VotingInstance.tallyVotes({from: _owner});  
      await expectRevert(VotingInstance.setVote(0,{from: _Voter1}), _MsgVotingNotStarted);    
    })

    //Vote. if we vote, already vote, id exist and event
    it("Vote", async () => {
      
      // 0 We need setup
      await VotingInstance.addVoter(_Voter1);
      await VotingInstance.addVoter(_Voter2);
      await VotingInstance.addVoter(_Voter3);
      await VotingInstance.startProposalsRegistering({from: _owner});
      await VotingInstance.addProposal("Proposal 1",{from: _Voter1});
      await VotingInstance.addProposal("Proposal 2",{from: _Voter2});
      await VotingInstance.endProposalsRegistering({from: _owner});
      await VotingInstance.startVotingSession({from: _owner});

      await VotingInstance.setVote(0,{from: _Voter1});

      //1 - Already vote
      await expectRevert(VotingInstance.setVote(0,{from: _Voter1}), _MsgAlreadyVoted);

      //2 - Vote for not existing id
      await expectRevert(VotingInstance.setVote(10,{from: _Voter2}), _MsgProposalNotFound);

      //3 - Event
      const result = await VotingInstance.setVote(1,{from: _Voter3});
      expectEvent(result, 'Voted', {
        voter:_Voter3,
        proposalId: new BN(1)
      });
    })  

    //tallyVotes. Check the require WorkflowStatus
    it("tallyVotes WorkflowStatus", async () => {

      //RegisteringVoters = tallyVotes not allowed
      await expectRevert(VotingInstance.tallyVotes({from: _owner}), _MsgVotingNotEnded);

      //ProposalsRegistrationStarted = tallyVotes not allowed
      await VotingInstance.startProposalsRegistering({from: _owner});
      await expectRevert(VotingInstance.tallyVotes({from: _owner}), _MsgVotingNotEnded);

      //endProposalsRegistering = tallyVotes not allowed
      await VotingInstance.endProposalsRegistering({from: _owner});
      await expectRevert(VotingInstance.tallyVotes({from: _owner}), _MsgVotingNotEnded);
       
      //startVotingSession = tallyVotes not allowed
      await VotingInstance.startVotingSession({from: _owner});
      await expectRevert(VotingInstance.tallyVotes({from: _owner}), _MsgVotingNotEnded);
       
      //endVotingSession = tallyVotes allowed = no test
      await VotingInstance.endVotingSession({from: _owner});

      //VotesTallied = tallyVotes not allowed
      await VotingInstance.tallyVotes({from: _owner});  
      await expectRevert(VotingInstance.tallyVotes({from: _owner}), _MsgVotingNotEnded); 
      
    })  

    //tallyVotes. Check the id and event
    it("tallyVotes", async () => {
      
      // 0 We need setup
      await VotingInstance.addVoter(_Voter1);
      await VotingInstance.addVoter(_Voter2);
      await VotingInstance.addVoter(_Voter3);
      await VotingInstance.startProposalsRegistering({from: _owner});
      await VotingInstance.addProposal("Proposal 1",{from: _Voter1});
      await VotingInstance.addProposal("Proposal 2",{from: _Voter2});
      await VotingInstance.endProposalsRegistering({from: _owner});
      await VotingInstance.startVotingSession({from: _owner});
      await VotingInstance.setVote(1,{from: _Voter1});
      await VotingInstance.setVote(1,{from: _Voter2});
      await VotingInstance.setVote(2,{from: _Voter3});
      await VotingInstance.endVotingSession({from: _owner});

      //1 - Event
      await VotingInstance.tallyVotes.call();
      console.log(VotingInstance.winningProposalID);
      
    }) 
});
