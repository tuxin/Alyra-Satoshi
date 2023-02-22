const Voting = artifacts.require("./contracts/Voting.sol");
const { BN , expectRevert, expectEvent } = require('@openzeppelin/test-helpers');
const { expect } = require('chai');


contract("Voting", accounts => {
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

    describe("Global Testing, owner and modifier",() =>{
      beforeEach(async function(){
        VotingInstance= await Voting.new({from: _owner});
      });

        //Owner testing
        it("Owner of contract", async () => {
          // 1 - We test the contract owner
          expect(await VotingInstance.owner()).to.equal(_owner);
        });

        //Voters testing
        it("onlyVoters", async () => {
          // 1 - We test the two function, we need to be a voter
          await expectRevert(VotingInstance.getVoter.call(_Voter1), "You're not a voter");
          await expectRevert(VotingInstance.getOneProposal.call(1), "You're not a voter");
        });

        //Onlyowner testing
        it("Status OnlyOwner", async () => {
          // 1 - We test the changing status only for owner
          await expectRevert(VotingInstance.startProposalsRegistering({from: _Voter1}), _MsgNotOwner);
          await expectRevert(VotingInstance.endProposalsRegistering({ from: _Voter1}), _MsgNotOwner);
          await expectRevert(VotingInstance.startVotingSession({ from: _Voter1}), _MsgNotOwner);
          await expectRevert(VotingInstance.endVotingSession({ from: _Voter1}), _MsgNotOwner);
          await expectRevert(VotingInstance.tallyVotes({ from: _Voter1}), _MsgNotOwner);
        });
    });

    describe("Status Workflow, require and event",() =>{ 
      beforeEach(async function(){
        VotingInstance= await Voting.new({from: _owner});
      });
      
        //State Testing Status change flow
        it("Status Change flow", async () => {
          // 1 - State RegisteringVoters. Impossible to endProposalsRegistering,startVotingSession,endVotingSession,tallyVotes. Just ProposalsRegistrationStarted
          await expectRevert(VotingInstance.endProposalsRegistering({from: _owner}), _MsgRegisteringNotStarted);
          await expectRevert(VotingInstance.startVotingSession({from: _owner}), _MsgRegisteringNotFinished);
          await expectRevert(VotingInstance.endVotingSession({from: _owner}), _MsgVotingNotStarted);
          await expectRevert(VotingInstance.tallyVotes({from: _owner}), _MsgVotingNotEnded);

          //Change to ProposalsRegistrationStarted
          await VotingInstance.startProposalsRegistering({from: _owner});

          // 2 - State ProposalsRegistrationStarted. Impossible to RegisteringVoters,startVotingSession,endVotingSession,tallyVotes. Just endProposalsRegistering
          await expectRevert(VotingInstance.startProposalsRegistering({from: _owner}), _MsgRegisteringCanStarted);
          await expectRevert(VotingInstance.startVotingSession({from: _owner}), _MsgRegisteringNotFinished);
          await expectRevert(VotingInstance.endVotingSession({from: _owner}), _MsgVotingNotStarted);
          await expectRevert(VotingInstance.tallyVotes({from: _owner}), _MsgVotingNotEnded);

          //Change to endProposalsRegistering
          await VotingInstance.endProposalsRegistering({from: _owner});

          // 3 - State endProposalsRegistering. Impossible to RegisteringVoters,ProposalsRegistrationStarted,endVotingSession,tallyVotes. Just startVotingSession
          await expectRevert(VotingInstance.startProposalsRegistering({from: _owner}), _MsgRegisteringCanStarted);     
          await expectRevert(VotingInstance.endProposalsRegistering({from: _owner}), _MsgRegisteringNotStarted);
          await expectRevert(VotingInstance.endVotingSession({from: _owner}), _MsgVotingNotStarted);
          await expectRevert(VotingInstance.tallyVotes({from: _owner}), _MsgVotingNotEnded);

          //Change to startVotingSession
          await VotingInstance.startVotingSession({from: _owner});

          // 4 - State startVotingSession. Impossible to RegisteringVoters,ProposalsRegistrationStarted,endProposalsRegistering,tallyVotes. Just endVotingSession
          await expectRevert(VotingInstance.startProposalsRegistering({from: _owner}), _MsgRegisteringCanStarted);     
          await expectRevert(VotingInstance.endProposalsRegistering({from: _owner}), _MsgRegisteringNotStarted);
          await expectRevert(VotingInstance.startVotingSession({from: _owner}), _MsgRegisteringNotFinished);
          await expectRevert(VotingInstance.tallyVotes({from: _owner}), _MsgVotingNotEnded);

          //Change to endVotingSession
          await VotingInstance.endVotingSession({from: _owner});

          // 5 - State endVotingSession. Impossible to startVotingSession, RegisteringVoters,ProposalsRegistrationStarted,endProposalsRegistering,. Just tallyVotes
          await expectRevert(VotingInstance.startProposalsRegistering({from: _owner}), _MsgRegisteringCanStarted);     
          await expectRevert(VotingInstance.endProposalsRegistering({from: _owner}), _MsgRegisteringNotStarted);
          await expectRevert(VotingInstance.startVotingSession({from: _owner}), _MsgRegisteringNotFinished);
          await expectRevert(VotingInstance.endVotingSession({from: _owner}), _MsgVotingNotStarted);

          //Change to VotesTallied
          await VotingInstance.tallyVotes({from: _owner});

          // 6 - End of status. Impossible to change
          await expectRevert(VotingInstance.startProposalsRegistering({from: _owner}), _MsgRegisteringCanStarted);     
          await expectRevert(VotingInstance.endProposalsRegistering({from: _owner}), _MsgRegisteringNotStarted);
          await expectRevert(VotingInstance.startVotingSession({from: _owner}), _MsgRegisteringNotFinished);
          await expectRevert(VotingInstance.endVotingSession({from: _owner}), _MsgVotingNotStarted);
          await expectRevert(VotingInstance.tallyVotes({from: _owner}), _MsgVotingNotEnded);
        });

        //State Testing Status event flow
        it("Status Change events", async () => {
          // 1 - Change to ProposalsRegistrationStarted
          const resultstartProposalsRegistering = await VotingInstance.startProposalsRegistering({from: _owner});
          expectEvent(resultstartProposalsRegistering, 'WorkflowStatusChange', {
            previousStatus: new BN(0),
            newStatus: new BN(1)
          });

          // 2 - Change to endProposalsRegistering
          const resultendProposalsRegistering = await VotingInstance.endProposalsRegistering({from: _owner});
          expectEvent(resultendProposalsRegistering, 'WorkflowStatusChange', {
            previousStatus: new BN(1),
            newStatus: new BN(2)
          });

          // 3 - Change to startVotingSession
          const resultstartVotingSession = await VotingInstance.startVotingSession({from: _owner});
          expectEvent(resultstartVotingSession, 'WorkflowStatusChange', {
            previousStatus: new BN(2),
            newStatus: new BN(3)
          });

          // 4 - Change to endVotingSession
          const resultendVotingSession = await VotingInstance.endVotingSession({from: _owner});
          expectEvent(resultendVotingSession, 'WorkflowStatusChange', {
            previousStatus: new BN(3),
            newStatus: new BN(4)
          });

          // 5 - Change to VotesTallied
          const resulttallyVotes = await VotingInstance.tallyVotes({from: _owner});
          expectEvent(resulttallyVotes, 'WorkflowStatusChange', {
            previousStatus: new BN(4),
            newStatus: new BN(5)
          });
        });

        //State Testing Status value flow
        it("Status Change Value", async () => {
          // 1 - Change to ProposalsRegistrationStarted
          await VotingInstance.startProposalsRegistering({from: _owner});
          expect(await VotingInstance.workflowStatus.call()).to.be.bignumber.equal(new BN(1));

          // 2 - Change to endProposalsRegistering
          await VotingInstance.endProposalsRegistering({from: _owner});
          expect(await VotingInstance.workflowStatus.call()).to.be.bignumber.equal(new BN(2));

          // 3 - Change to startVotingSession
          await VotingInstance.startVotingSession({from: _owner});
          expect(await VotingInstance.workflowStatus.call()).to.be.bignumber.equal(new BN(3));

          // 4 - Change to endVotingSession
          await VotingInstance.endVotingSession({from: _owner});
          expect(await VotingInstance.workflowStatus.call()).to.be.bignumber.equal(new BN(4));

          // 5 - Change to VotesTallied
          await VotingInstance.tallyVotes({from: _owner});
          expect(await VotingInstance.workflowStatus.call()).to.be.bignumber.equal(new BN(5));
        });
    })

    describe("WorkflowStatus with functions",() =>{
      beforeEach(async function(){
        VotingInstance= await Voting.new({from: _owner});

        // 1 - We need setup
        await VotingInstance.addVoter(_Voter1,{from: _owner});
      });

        //Add voter. Check the require WorkflowStatus
        it("Add voter WorkflowStatus", async () => {

          //RegisteringVoters = Add Voter Allowed = No Test

          // 1 - ProposalsRegistrationStarted = Add Voter Not Allowed
          await VotingInstance.startProposalsRegistering({from: _owner});
          await expectRevert(VotingInstance.addVoter(_Voter1,{from: _owner}), _MsgVotersRegistrationNotOpen);
          
          // 2 - ProposalsRegistrationEnded = Add Voter Not Allowed
          await VotingInstance.endProposalsRegistering({from: _owner});
          await expectRevert(VotingInstance.addVoter(_Voter1,{from: _owner}), _MsgVotersRegistrationNotOpen);
          
          // 3 - VotingSessionStarted = Add Voter Not Allowed
          await VotingInstance.startVotingSession({from: _owner});
          await expectRevert(VotingInstance.addVoter(_Voter1,{from: _owner}), _MsgVotersRegistrationNotOpen);
          
          // 4 - VotingSessionEnded = Add Voter Not Allowed
          await VotingInstance.endVotingSession({from: _owner});
          await expectRevert(VotingInstance.addVoter(_Voter1,{from: _owner}), _MsgVotersRegistrationNotOpen);

          // 5 - VotesTallied = Add Voter Not Allowed
          await VotingInstance.tallyVotes({from: _owner});  
          await expectRevert(VotingInstance.addVoter(_Voter1,{from: _owner}), _MsgVotersRegistrationNotOpen);  
        })

        //Add Proposal. Check the require WorkflowStatus
        it("Add proposal WorkflowStatus", async () => {

          // 1 - RegisteringVoters = proposal not allowed
          await expectRevert(VotingInstance.addProposal("Proposal",{from: _Voter1}), _MsgProposalNotAllowed);

          // 2 - ProposalsRegistrationStarted = proposal allowed = no Test
          await VotingInstance.startProposalsRegistering({from: _owner});

          // 3 - endProposalsRegistering = proposal not allowed
          await VotingInstance.endProposalsRegistering({from: _owner});
          await expectRevert(VotingInstance.addProposal("Proposal",{from: _Voter1}), _MsgProposalNotAllowed);
          
          // 4 - startVotingSession = proposal not allowed
          await VotingInstance.startVotingSession({from: _owner});
          await expectRevert(VotingInstance.addProposal("Proposal",{from: _Voter1}), _MsgProposalNotAllowed);
          
          // 5 - endVotingSession = proposal not allowed
          await VotingInstance.endVotingSession({from: _owner});
          await expectRevert(VotingInstance.addProposal("Proposal",{from: _Voter1}), _MsgProposalNotAllowed);

          // 6 - VotesTallied = proposal not allowed
          await VotingInstance.tallyVotes({from: _owner});  
          await expectRevert(VotingInstance.addProposal("Proposal",{from: _Voter1}), _MsgProposalNotAllowed);      
        })

        //Vote. Check the require WorkflowStatus
        it("Vote WorkflowStatus", async () => {

          // 1 - RegisteringVoters = vote not allowed
          await expectRevert(VotingInstance.setVote(0,{from: _Voter1}), _MsgVotingNotStarted);

          // 2 - ProposalsRegistrationStarted = vote not allowed
          await VotingInstance.startProposalsRegistering({from: _owner});
          await expectRevert(VotingInstance.setVote(0,{from: _Voter1}), _MsgVotingNotStarted);

          // 3 - endProposalsRegistering = vote not allowed
          await VotingInstance.endProposalsRegistering({from: _owner});
          await expectRevert(VotingInstance.setVote(0,{from: _Voter1}), _MsgVotingNotStarted);
          
          // 4 - startVotingSession = vote allowed = no test
          await VotingInstance.startVotingSession({from: _owner});
          
          // 5 - endVotingSession = vote not allowed
          await VotingInstance.endVotingSession({from: _owner});
          await expectRevert(VotingInstance.setVote(0,{from: _Voter1}), _MsgVotingNotStarted);

          // 6 - VotesTallied = vote not allowed
          await VotingInstance.tallyVotes({from: _owner});  
          await expectRevert(VotingInstance.setVote(0,{from: _Voter1}), _MsgVotingNotStarted);    
        })

        //tallyVotes. Check the require WorkflowStatus
        it("tallyVotes WorkflowStatus", async () => {

          // 1 - RegisteringVoters = tallyVotes not allowed
          await expectRevert(VotingInstance.tallyVotes({from: _owner}), _MsgVotingNotEnded);

          // 2 - ProposalsRegistrationStarted = tallyVotes not allowed
          await VotingInstance.startProposalsRegistering({from: _owner});
          await expectRevert(VotingInstance.tallyVotes({from: _owner}), _MsgVotingNotEnded);

          // 3 - endProposalsRegistering = tallyVotes not allowed
          await VotingInstance.endProposalsRegistering({from: _owner});
          await expectRevert(VotingInstance.tallyVotes({from: _owner}), _MsgVotingNotEnded);
          
          // 4 - startVotingSession = tallyVotes not allowed
          await VotingInstance.startVotingSession({from: _owner});
          await expectRevert(VotingInstance.tallyVotes({from: _owner}), _MsgVotingNotEnded);
          
          // 5 - endVotingSession = tallyVotes allowed = no test
          await VotingInstance.endVotingSession({from: _owner});

          // 6 - VotesTallied = tallyVotes not allowed
          await VotingInstance.tallyVotes({from: _owner});  
          await expectRevert(VotingInstance.tallyVotes({from: _owner}), _MsgVotingNotEnded); 
        }) 
    });

    
    describe("Function addVoter",() =>{
      beforeEach(async function(){
        VotingInstance= await Voting.new({from: _owner});
        // 1 - We need setup
        await VotingInstance.addVoter(_Voter1);
      });

        //Add voter event
        it("Add voter event", async () => {
          // 1 - We add voter and test emit
          const result = await VotingInstance.addVoter(_Voter2);
          expectEvent(result, 'VoterRegistered', {
            voterAddress: _Voter2
          });
        })

        //Add voter twice
        it("Add double voter", async () => {
          //1 - Double addvoter
          await expectRevert(VotingInstance.addVoter(_Voter1), _MsgAlreadyRegistered);
        })

        //Add voter. if we added the voter
        it("Add voter verification", async () => {
          //1 - If the addVoter working
          let Voter_1 = await VotingInstance.getVoter(_Voter1,{from: _Voter1});
          expect(Voter_1.isRegistered).to.equal(true);
        })

      });    

      describe("Function addProposal",() =>{
        beforeEach(async function(){
          VotingInstance= await Voting.new({from: _owner});
          // 1 - We need setup
          await VotingInstance.addVoter(_Voter1,{from: _owner});
          await VotingInstance.startProposalsRegistering({from: _owner});
          await VotingInstance.addProposal("Proposal Test",{from: _Voter1});
        });

        //Add proposal. if we added the proposal, if the proposal is empty
        it("Proposal empty", async () => {
          // 1 - Proposal empty
          await expectRevert(VotingInstance.addProposal("",{from: _Voter1}), _MsgRienProposer);
        })   
        
        //Add proposal event
        it("Proposal event", async () => {
          // 1 - Event
          const result = await VotingInstance.addProposal("Proposal 1",{from: _Voter1});
          expectEvent(result, 'ProposalRegistered', {
            proposalId: new BN(2)
          });
        }) 
        
        //Add proposal if we added the proposal
        it("Proposal verification", async () => {
          // 1 - Proposal in blockchain = "Proposal 1"
          let Propos = await VotingInstance.getOneProposal(1,{from: _Voter1});
          expect(Propos.description).to.equal("Proposal Test");
        })        

      }); 

      describe("Function Vote",() =>{
        beforeEach(async function(){
          VotingInstance= await Voting.new({from: _owner});
          // 1 - We need setup
          await VotingInstance.addVoter(_Voter1);
          await VotingInstance.addVoter(_Voter2);
          await VotingInstance.addVoter(_Voter3);
          await VotingInstance.startProposalsRegistering({from: _owner});
          await VotingInstance.addProposal("Proposal 1",{from: _Voter1});
          await VotingInstance.addProposal("Proposal 2",{from: _Voter2});
          await VotingInstance.endProposalsRegistering({from: _owner});
          await VotingInstance.startVotingSession({from: _owner});
          await VotingInstance.setVote(0,{from: _Voter1});
        });

        //Vote. if we vote, already vote
        it("Already Vote", async () => {
          // 1 - Already vote
          await expectRevert(VotingInstance.setVote(0,{from: _Voter1}), _MsgAlreadyVoted);
        })  

        //Vote id exist
        it("Vote for non existing id", async () => {
          // 1 - Vote for not existing id
          await expectRevert(VotingInstance.setVote(10,{from: _Voter2}), _MsgProposalNotFound);
        })
        
        //Vote event
        it("Vote event", async () => {
          // 1 - Event
          const result = await VotingInstance.setVote(1,{from: _Voter3});
          expectEvent(result, 'Voted', {
            voter:_Voter3,
            proposalId: new BN(1)
          });
        })          
      }); 

      describe("Function tallyVotes",() =>{
        beforeEach(async function(){
          VotingInstance= await Voting.new({from: _owner});
          // 1 - We need setup
          await VotingInstance.addVoter(_Voter1);
          await VotingInstance.addVoter(_Voter2);
          await VotingInstance.addVoter(_Voter3);
          await VotingInstance.startProposalsRegistering({from: _owner});
          await VotingInstance.addProposal("Proposal 1",{from: _Voter1});
          await VotingInstance.addProposal("Proposal 2",{from: _Voter2});
          await VotingInstance.endProposalsRegistering({from: _owner});
          await VotingInstance.startVotingSession({from: _owner});
          await VotingInstance.setVote(2,{from: _Voter1});
          await VotingInstance.setVote(1,{from: _Voter2});
          await VotingInstance.setVote(2,{from: _Voter3});
          await VotingInstance.endVotingSession({from: _owner});
        });

        //tallyVotes event
        it("tallyVotes event", async () => {
          // 1 - Event
          const resulttallyVotes = await VotingInstance.tallyVotes({from: _owner});
          expectEvent(resulttallyVotes, 'WorkflowStatusChange', {
            previousStatus: new BN(4),
            newStatus: new BN(5)
          });
        }) 

         //tallyVotes. Check the id 
         it("tallyVotes result", async () => {
          // 1 - Vote result
          await VotingInstance.tallyVotes({from: _owner})
          expect(await VotingInstance.winningProposalID.call()).to.be.bignumber.not.equal(new BN(0));
        })   

      });
    
    describe("Oversize",() =>{

      beforeEach(async function(){
        VotingInstance= await Voting.new({from: _owner});
        // 1 - We need setup
        await VotingInstance.addVoter(_Voter1);
        await VotingInstance.addVoter(_Voter2);
        await VotingInstance.addVoter(_Voter3);
        await VotingInstance.startProposalsRegistering({from: _owner});
      });

      //proposalsArray Size and value
      it("Big proposalsArray", async () => {
        // 1 - Add a lot of proposals
        for (var i = 1; i < 10; i++) {
          await VotingInstance.addProposal("Proposal "+i,{from: _Voter1});
          let Propos = await VotingInstance.getOneProposal.call(i,{from: _Voter1});
          expect(Propos.description).to.equal("Proposal "+i);
        }  
      }) 

      //Big proposal. Size of string proposal
      it("Big proposal", async () => {     
        // 1 - We test a big proposal
        let bigstring = "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum."
        await VotingInstance.addProposal(bigstring,{from: _Voter1});
        let Propos = await VotingInstance.getOneProposal.call(1,{from: _Voter1});
        expect(Propos.description).to.equal(bigstring);
      }) 
    })
});
