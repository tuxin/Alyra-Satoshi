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
    function _setWorkflowStatus(WorkflowStatus _workflowStatus) private {
        WorkflowStatus oldWorkflowStatus = workflowStatus;
        workflowStatus = _workflowStatus;
        emit WorkflowStatusChange(oldWorkflowStatus,_workflowStatus);
    }

    /**
     * @dev Get for enum WorkflowStatus
     * @return return WorkflowStatus for the current status
    */
    function getWorkflowStatus() external view returns (WorkflowStatus) {
        return workflowStatus;
    }

    /**
     * @dev We open the Registration
    */
    function openRegistration() public onlyOwner{
        require(workflowStatus==WorkflowStatus.VotesTallied, "We have vote in progress");
        _setWorkflowStatus(WorkflowStatus.RegisteringVoters);

        //We reset all data
        resetMappingVoted();
    }

    /**
     * @dev We open the ProposalsRegistration
    */
    function openProposalsRegistration() public onlyOwner{
        require(workflowStatus==WorkflowStatus.RegisteringVoters, "The vote is not in RegisteringVoters");
        _setWorkflowStatus(WorkflowStatus.ProposalsRegistrationStarted);
    }

    /**
     * @dev We close the ProposalsRegistration
    */
    function closeProposalsRegistration() public onlyOwner{
        require(workflowStatus==WorkflowStatus.ProposalsRegistrationStarted, "The vote is not in ProposalsRegistrationStarted");
        _setWorkflowStatus(WorkflowStatus.ProposalsRegistrationEnded);
    }

    /**
     * @dev We open the ProposalsRegistration
    */
    function openVotingSession() public onlyOwner{
        require(workflowStatus==WorkflowStatus.ProposalsRegistrationEnded, "The vote is not in ProposalsRegistrationEnded");
        _setWorkflowStatus(WorkflowStatus.VotingSessionStarted);
    }

    /**
     * @dev We close the ProposalsRegistration
    */
    function closeVotingSession() public onlyOwner{
        require(workflowStatus==WorkflowStatus.VotingSessionStarted, "The vote is not in VotingSessionStarted");
        _setWorkflowStatus(WorkflowStatus.VotingSessionEnded);
    }

    /**
     * @dev We taillied votes
    */
    function votesTallied() public onlyOwner{
        require(workflowStatus==WorkflowStatus.VotingSessionEnded, "The vote is not in VotingSessionEnded");
        _setWorkflowStatus(WorkflowStatus.VotesTallied);
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
     * @param _proposalId Proposal ID
    */
    function voteProposal(uint256 _proposalId) public{
        require(workflowStatus==WorkflowStatus.VotingSessionStarted,"Vote is not open");
        require( VoterList[msg.sender].isRegistered==true,"Not registered for this vote");
        require( VoterList[msg.sender].hasVoted==false,"Already voted");
        require( VoterList[msg.sender].votedProposalId==0,"Already voted");
        require( _proposalId<=proposals.length,"This proposal not exist");
        require( _proposalId>0,"This proposal not exist");

        uint256 proposalIdArray;
        proposalIdArray=_proposalId-1;

        VoterList[msg.sender].hasVoted=true;
        VoterList[msg.sender].votedProposalId=_proposalId;

        proposals[proposalIdArray].voteCount+=1;
      
        emit Voted(msg.sender,_proposalId);
    }
	
    /**
     * @dev ProposalId Winner
     * @return return uint for the proposal id for the winner
    */
    function getWinnerProposalId() public view returns (uint256){
        require(workflowStatus==WorkflowStatus.VotesTallied,"Vote is not tallaied");

        uint256 winningVoteCount = 0;
        uint256 winningProposal = 0;
        bool ErrResult;

        for (uint256 i = 0; i < proposals.length; i++) {

            //Same votecount for proposals
            if ((proposals[i].voteCount>0) && (proposals[i].voteCount==winningVoteCount)){
                ErrResult=true;
            }

            if (proposals[i].voteCount > winningVoteCount) {
                winningVoteCount = proposals[i].voteCount;
                winningProposal = i;
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
     * @dev Proposal description Winner
     * @return return string for the description of vote  for the winner
    */
    function getWinnerProposalName() external view returns (string memory){    
        uint256 proposal;
        proposal=getWinnerProposalId();

        if(proposal==0){
            return "No winner";
        }else{
            proposal-=1; //To have the good table index
            return proposals[proposal].description;
        }
    } 

    /**
    * @dev Proposal vote number winner
    * @return return uint for the number of vote  for the winner
    */
    function getWinnerProposalVoteCount() external view returns (uint256){    
        uint256 proposal;
        proposal=getWinnerProposalId();

        if(proposal==0){
            return 0;
        }else{
            proposal-=1; //To have the good table index
            return proposals[proposal].voteCount;
        }
    } 

    /**
     * @dev Return the proposal id for a address voter
     * @param _address address of the voter
     * @return return uint for the voted proposal id
    */
    function getVotePerson(address _address) external view returns (uint256){
            return VoterList[_address].votedProposalId;
    }

}