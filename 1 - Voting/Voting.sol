// SPDX-License-Identifier: GPL-3.0
pragma solidity 0.8.18;

import "@openzeppelin/contracts/access/Ownable.sol";

contract Voting is Ownable {

    struct Voter {
        bool isRegistered;
        bool hasVoted;
        uint256 votedProposalId;
    }

    struct Proposal {
        string description;
        uint256 voteCount; 
    }

    enum WorkflowStatus {
        RegisteringVoters,
        ProposalsRegistrationStarted,
        ProposalsRegistrationEnded,
        VotingSessionStarted,
        VotingSessionEnded,
        VotesTallied
    }

    WorkflowStatus workflowStatus=WorkflowStatus.VotesTallied;

    // Returns uint
    // RegisteringVoters  - 0
    // ProposalsRegistrationStarted  - 1
    // ProposalsRegistrationEnded - 2
    // VotingSessionStarted - 3
    // VotingSessionEnded - 4
    // VotesTallied - 5

     // event for EVM logging
    event OwnerSet(address indexed oldOwner, address indexed newOwner);
    event VoterRegistered(address voterAddress); 
    event WorkflowStatusChange(WorkflowStatus previousStatus, WorkflowStatus newStatus);
    event ProposalRegistered(uint proposalId);
    event Voted (address voter, uint proposalId);
    event EventAddWhitelist (address whitelist);
    event EventRemoveWhitelist (address whitelist);

    mapping(address=> bool) public Whitelist;
    mapping(address => Voter) public VoterList;
    address [] WhiteListArray;
    Proposal[] proposals;

    /**
     * @dev Modifier if the user is whitelist
     */
    modifier checkWhitelist() { 
       require(Whitelist[msg.sender]== true,"Not whitelist.");
       _;
    }

    /**
     * @dev Modifier if the user is registered
     */
    modifier checkRegistered() { 
       require(VoterList[msg.sender].isRegistered== true,"Not Registered.");
       _;
    }

    /**
     * @dev Change owner
     * @param _newOwner address of new owner
     */
    function changeOwner(address _newOwner) public onlyOwner {
        transferOwnership(_newOwner); //Function from ownable openzeppelin
        emit OwnerSet(owner(), _newOwner);
    }

    /**
     * @dev Add address to Whitelist
     * @param _address Address
    */
    function AddWhitelist(address _address) public onlyOwner {
        require(!Whitelist[_address], "This address is already whitelisted !");
        Whitelist[_address] = true;
        WhiteListArray.push(_address); 
        emit EventAddWhitelist(_address);
    }

    /**
     * @dev Remove address to Whitelist
     * @param _address Address
    */
    function RemoveWhitelist(address _address) public onlyOwner {
        Whitelist[_address] = false; //No Check because we set to false

        for(uint256 i = 0; i < WhiteListArray.length; i++) {
            if (WhiteListArray[i]==_address){
                delete WhiteListArray[i];
                break;
            }
        }

        emit EventRemoveWhitelist(_address);
    }


    /**
     * @dev Set for enum WorkflowStatus
     * @param _workflowStatus Status of new WorkflowStatus
    */
    function setWorkflowStatus(WorkflowStatus _workflowStatus) private {
        WorkflowStatus oldWorkflowStatus = workflowStatus;
        workflowStatus = _workflowStatus;
        emit WorkflowStatusChange(oldWorkflowStatus,_workflowStatus);
    }

    /**
     * @dev Get for enum WorkflowStatus
    */
    function getWorkflowStatus() public view returns (WorkflowStatus) {
        return workflowStatus;
    }

    //We reset all voted data
    function openRegistration() public onlyOwner{
        require(workflowStatus==WorkflowStatus.VotesTallied, "The registration is not open");
        setWorkflowStatus(WorkflowStatus.RegisteringVoters);

        //We reset all data
        resetMappingVoted();
    }

    /**
     * @dev We open the ProposalsRegistration
    */
    function openProposalsRegistration() public onlyOwner{
        require(workflowStatus==WorkflowStatus.RegisteringVoters, "The vote is not in RegisteringVoters");
        setWorkflowStatus(WorkflowStatus.ProposalsRegistrationStarted);
    }

    /**
     * @dev We close the ProposalsRegistration
    */
    function closeProposalsRegistration() public onlyOwner{
        require(workflowStatus==WorkflowStatus.ProposalsRegistrationStarted, "The vote is not in ProposalsRegistrationStarted");
        setWorkflowStatus(WorkflowStatus.ProposalsRegistrationEnded);
    }

    /**
     * @dev We open the ProposalsRegistration
    */
    function openVotingSession() public onlyOwner{
        require(workflowStatus==WorkflowStatus.ProposalsRegistrationEnded, "The vote is not in ProposalsRegistrationEnded");
        setWorkflowStatus(WorkflowStatus.VotingSessionStarted);
    }

    /**
     * @dev We close the ProposalsRegistration
    */
    function closeVotingSession() public onlyOwner{
        require(workflowStatus==WorkflowStatus.VotingSessionStarted, "The vote is not in VotingSessionStarted");
        setWorkflowStatus(WorkflowStatus.VotingSessionEnded);
    }

    /**
     * @dev We taillied votes
    */
    function votesTallied() public onlyOwner{
        require(workflowStatus==WorkflowStatus.VotingSessionEnded, "The vote is not in VotingSessionEnded");
        setWorkflowStatus(WorkflowStatus.VotesTallied);
    }

    /**
     * @dev Reset all data for Voters. Its a new session id.
    */
    function resetMappingVoted() private onlyOwner{
        for(uint256 i = 0; i < WhiteListArray.length; i++) {
            VoterList[WhiteListArray[i]].isRegistered=false;
            VoterList[WhiteListArray[i]].hasVoted=false;
            VoterList[WhiteListArray[i]].votedProposalId=0;
        }

        delete proposals;
    }


    /**
     * @dev We register voter only for the whitelist address. Each voter register himself
    */
    function registerVoter() public checkWhitelist{
        require(workflowStatus==WorkflowStatus.RegisteringVoters, "The registration is not open");
        VoterList[msg.sender].isRegistered=true;
        emit VoterRegistered(msg.sender);
    }

    /**
     * @dev New proposal for the msg.sender. Only one proposal per user per session id
	 * @param _description of the proposal
    */
    function registerProposals(string memory _description) public checkRegistered{
        bytes memory EmptyDescription = bytes(_description);

        require(workflowStatus==WorkflowStatus.ProposalsRegistrationStarted, "The proposal registration is not open");
        require(EmptyDescription.length!=0,"Name is empty");

        //Push the proposal to the proposals array
        proposals.push(Proposal(_description,0));

        emit ProposalRegistered(proposals.length);
    }

    /**
     * @dev Vote for the proposal
     * @param proposalId Proposal ID
    */
    function voteProposal(uint256 proposalId) public{
        require(workflowStatus==WorkflowStatus.VotingSessionStarted,"Vote is not open");
        require( VoterList[msg.sender].isRegistered==true,"Not registered for this vote");
        require( VoterList[msg.sender].hasVoted==false,"Already voted");
        require( VoterList[msg.sender].votedProposalId==0,"Already voted");
        require( proposalId<=proposals.length,"This proposal not exist");
        require( proposalId>0,"This proposal not exist");

        uint256 proposalIdArray;
        proposalIdArray=proposalId-1;

        VoterList[msg.sender].hasVoted=true;
        VoterList[msg.sender].votedProposalId=proposalId;

        proposals[proposalIdArray].voteCount+=1;
      
        emit Voted(msg.sender,proposalId);
    }
	
    /**
     * @dev ProposalId Winner
    */
    function getWinnerProposalId() public view returns (uint256){
        require(workflowStatus==WorkflowStatus.VotesTallied,"Vote is not tallaied");

        uint256 winningVoteCount = 0;
        uint256 winningProposal = 0;
        bool ErrResult;

        for (uint256 i = 0; i < proposals.length; i++) {
            if (proposals[i].voteCount > winningVoteCount) {
                winningVoteCount = proposals[i].voteCount;
                winningProposal = i;
            }

            //Same votecount for proposals
            if ((proposals[i].voteCount>0) && (proposals[i].voteCount==winningVoteCount)){
                ErrResult=true;
            }
        }

        //No vote
        if(winningVoteCount==0){
            ErrResult=true;
        }   

        if (ErrResult==true){
            winningProposal=0;
        }else{
            winningProposal+=1;
        }

        return winningProposal;
    } 

    /**
     * @dev Proposal Description Winner
    */
    function getWinnerProposalName() public view returns (string memory){    
        uint256 proposal;
        proposal=getWinnerProposalId();

        if(proposal==0){
            return "No winner";
        }else{
            return proposals[getWinnerProposalId()].description;
        }
    } 

}