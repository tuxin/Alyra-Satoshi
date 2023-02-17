README

Le fichier vient d'écrire les différentes étapes des tests pour le contrats Voting
J'ai décider de séparer pour chaque flow, le test du WorkflowStatus et le reste. Je trouve cela plus clair

TEST
//Global Testing
Création d'un test qui vérifie si le owner du contract est bien celui qui a déployé
 
//State Testing OnlyOwner
Création de test afin de s'assurer que tous les changements de state se font via le onlyowner. 

//State Testing Status
Création d'un test pour s'assurer que le workflow des changements des status fonctionne pour les require et event

//Add voter. Check the require WorkflowStatus
Création d'un test pour s'assurer qu'on ne peut pas ajouter un Voter dans n'importe quel status

//Add voter. if we added the voter, if we added twice and event
Création d'un test pour s'assurer que l'ajout d'un Voter fonctionne et qu'on ne peut pas l'ajouter deux fois ansi que l'event

//Add proposal. Check the require WorkflowStatus
Création d'un test pour s'assurer qu'on ne peut pas ajouter une Proposal dans n'importe quel status      

//Add proposal. if we added the proposal, if the proposal is empty and event
Création d'un test pour s'assurer que la proposal n'est pas vide et que l'event se déclenche

//Vote. Check the require WorkflowStatus
Création d'un test pour s'assurer qu'on ne peut pas voter dans n'importe quel status  

//Vote. if we vote, already vote, id exist and event
Création d'un test pour s'assurer que le voter n'a pas déjà voté, qu'il vote pour un bon id et que l'event se déclenche

//tallyVotes. Check the require WorkflowStatus
Création d'un test pour s'assurer qu'on ne peut pas voter dans n'importe quel status  



    //tallyVotes. if the proposal is not 0 and event
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
      const resulttallyVotes = await VotingInstance.tallyVotes({from: _owner});
      
      expectEvent(resulttallyVotes, 'WorkflowStatusChange', {
        previousStatus: new BN(4),
        newStatus: new BN(5)
    }) 