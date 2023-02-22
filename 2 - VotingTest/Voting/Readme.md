# Voting
***
This file describes the test file used for the Voting smartcontract
***
***
### **Global Testing, owner and modifier**
We test the modifier and the owner of the contrat with it (**Owner of contract,onlyVoters,Status OnlyOwner**)
***
### **Status Workflow, require and event**
We test the different workflow status. When we are in x status, its impossible to go to y or z etc... We test event and the final value with it(**Status Change flow,Status Change events,Status Change Value**)
***
### **WorkflowStatus with functions**
We test the differents workflow when we use functions with it (**Add voter WorkflowStatus,Add proposal WorkflowStatus,Vote WorkflowStatus,tallyVotes WorkflowStatus**)
***
### **Function addVoter**
We test the function add voter. Event, Require, Value with it(**Add voter event,Add double voter,Add voter verification**)
***
### **Function addProposal**
We test the function add proposal. Event, Require, Value with it(**Proposal empty,Proposal event,Proposal verification**)
***
### **Function Vote**
We test the function vote. Event, Require, Value with it(**Already Vote,Vote for non existing id,Vote event**)
***
### **Function tallyVotes**
We test the function tallyVotes. Event, Require, Value with it(**tallyVotes event,tallyVotes result**)
***
### **Oversize**
We test all data, big string, a big array (**Big proposalsArray,Big proposal**)