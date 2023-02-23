# Voting
***
This file describes the test file used for the Voting smartcontract. First we setup constants like account and message.
***
***
### **Global Testing, owner and modifier**
We test the modifier and the owner of the contrat.
***
### **Status Workflow require**
We test all require for all workflow from all status. So we change in x status and we test if we have the expectRevert.
***
### **Status Workflow event**
We test all event for all workflow from all status. So we change in x status and we test if we have the event.
***
### **Status Workflow value**
We test all value for all workflow from all status. So we change in x status and we test if we have the correct value.
***
### **WorkflowStatus Addvoter**
We test all value for the Addvoter function from all status. So we change in x status and we test if we have the expectRevert.
***
### **WorkflowStatus addProposal**
We test all value for the addProposal function from all status. So we change in x status and we test if we have the expectRevert.
***
### **WorkflowStatus Vote**
We test all value for the Vote function from all status. So we change in x status and we test if we have the expectRevert.
***
### **WorkflowStatus tallyVotes**
We test all value for the tallyVotes function from all status. So we change in x status and we test if we have the expectRevert.
***
### **Function addVoter**
We test if we have the correct value, event, twice voter.
***
### **Function addProposal**
We test if we have the correct value, event and empty proposal.
***
### **Function Vote**
We test if we have the correct value, event and existing id vote.
***
### **Function tallyVotes**
We test if we have the correct valueand event.
***
### **OverSize**
We test the lenght of proposal, if we can add a lot of proposal.
***

