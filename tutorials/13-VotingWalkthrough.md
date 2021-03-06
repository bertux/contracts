# Voting Walkthrough

### Requirements

Your environment is setup as described [here](./Tutorials.md#requirements).

### Goals

This tutorial will show you how to create a Voting Session for a specific Token and give you an overview of the voting process.

We will guide you through the following steps:
- deploy a Token
- deploy a Voting Session contract
- submit a proposal for minting new tokens
- go through all the steps of the voting session

### Start

##### 1- Go into the governance module and start truffle

```bash
cd governance && yarn develop
```

##### 2- Load definitions

You shall to load the definitions needed for this tutorial:

```javascript
accounts = await web3.eth.getAccounts()

TokenCore = await artifacts.require('TokenCore')
TokenDelegate = await artifacts.require('TokenDelegate')
TokenProxy = await artifacts.require('TokenProxy')
VotingSessionDelegate = await artifacts.require('VotingSessionDelegate')
VotingSessionManager = await artifacts.require('VotingSessionManager')
```

### Steps

##### 3- Token creation

First things first! We need a new Token to play with. Here we are simply repeating the main steps from the [token creation tutorial](./01-TokenCreation.md)
```javascript
core = await TokenCore.new('TokenCore', [ accounts[0] ])
delegate = await TokenDelegate.new()
```

```
await core.defineTokenDelegate(1, delegate.address, [0,1])
token = await TokenProxy.new(core.address)
```

```
await core.defineToken(token.address, 1, "Token", "TKN", "18")
await core.mint(token.address, [accounts[0], accounts[1]], ['1000','500'])
```

So far so good? We have just created a new `TKN` token and minted a few tokens for `accounts[0]` and `accounts[1]`. Let's double check:
```
await token.totalSupply().then(x => x.toString())
await token.balanceOf(accounts[0]).then(x => x.toString())
await token.balanceOf(accounts[1]).then(x => x.toString())
```

##### 4- Setup of a new voting contract 

A new voting session manager can be created using the `VotingSessionManager` contract. This contract will manage periodic voting session instances. In the rest of this tutorial, the VotingSessionManager contract will be referred to as the "voting contract" and the voting session instances will be referred to as the "voting sessions".
```
votingDelegate = await VotingSessionDelegate.new()
voting = await VotingSessionManager.new(token.address, votingDelegate.address) 
```

The voting contract needs its own lock to prevent tokens transfer during the voting period. We create one when defining a proxy with a Lockable Delegate:

```
await core.defineProxy(voting.address, 1);
```

We can the assign the newly created lock to the token
```
await core.defineTokenLocks(token.address, [token.address, voting.address]);
```

Then the voting contract needs to be granted sufficient permissions to operate its lock. We will grant the 'AllPriviledges' role to the voting contract for itself (the privileges topic is covered in more details in another tutorial):
```
ALL_PRIVILEGES = web3.utils.fromAscii('AllPrivileges').padEnd(66, '0');
await core.assignProxyOperators(voting.address, ALL_PRIVILEGES, [ voting.address ]);
```

As we will try to mint more tokens through the voting contract, we need to provide the voting contract with some privileges on the token. Let's reuse the same command:
```
await core.assignProxyOperators(token.address, ALL_PRIVILEGES, [ voting.address ]);
```

Each voting session will go through the following states:
- 0: UNDEFINED,
- 1: PLANNED, a new session is planned and proposals can be submitted
- 2: CAMPAIGN, proposals can not be submitted anymore, people can promote their proposals
- 3: VOTING, votes can be submitted
- 4: EXECUTION, standard resolutions may be executed
- 5: GRACE, rules or resolution requirements may be changed
- 6: CLOSED,
- 7: ARCHIVED, removed from the blockchain state

Proposals also have different states as described below
- 0: UNDEFINED,
- 1: DEFINED, the proposal was created
- 2: CANCELLED, the proposal was cancelled
- 3: LOCKED, the proposal is locked (We are in the campaign or voting period)
- 4: APPROVED, the proposal is approved and may be executed if we are in the correct execution period
- 5: REJECTED, the proposal is rejected
- 6: RESOLVED, the proposal was executed
- 7: CLOSED, the proposal has been closed
- 8: ARCHIVED, the proposal is removed from the state

##### 5- Configure the rules

By default, a voting session will last 2 weeks. As we do not want the tutorial to last 2 weeks, we can change these values with the following parameters (feel free to modify those values):
- campaign period of 5 minutes
- voting period of 5 minutes
- execution period of 5 minutes
- grace period of 10 minutes
- offset for the first period of 0 minutes
- The 10 first proposals are open to anyone with the minimum requirement
- maximum of 20 proposals for each voting session
- maximum of 25 proposals that can be submitted by the quaestor
- requirement to have a minimum of 1 tokens to be able to submit proposals
- non voting addresses (ie: liquidity pool, wrapped token, ...)
```
await voting.updateSessionRule(5*60, 5*60, 5*60, 10*60, 0, 10, 20, 25, 1, [])
```
So now it is possible to schedule a new voting session every 20 minutes. 

##### 6- Submit a proposal 

Let's assume that our proposal consists in minting 500 new tokens for accounts[2]. We first need to encode this request: 
```
request = core.contract.methods.mint(token.address, [accounts[2]], ['500']).encodeABI()
```

We can now submit this proposal. We will use the defineProposal function that takes as parameters:
- the name of the proposal
- a URL describing the proposal
- a checksum of the URL content
- the SmartContract to call 
- the encoded request to submit to the Smart Contract
- the reference proposal if this is an alternative, 0 otherwise
- the execution dependency if orders matter, 0 otherwise
```
await voting.defineProposal("mint", "Description URL", "0x".padEnd(66,"0"), core.address, request, 0, 0)  
```

##### 7- Inspect the current voting session 

We can get the id of the current voting session using the sessions count function:
```
await voting.currentSessionId().then(x => x.toString())
 ```
This returns "1" as a new voting session has been dynamically created when we submitted our proposal. 

Let's check where we are with session 1:
```
await voting.sessionStateAt(1,Math.floor((new Date()).getTime()/1000)).then(x => x.toString())
```
This returns "0", indicating that the session is in the PLANNED stage.
After a few minutes, "1" will be returned instead, indicating that the voting session is in the CAMPAIGN state.

We can also check the proposal:
```
await voting.proposalStateAt(1, 1, Math.floor((new Date()).getTime()/1000)).then(x => x.toString())
```
If we are still in the PLANNED state, the proposal should return it is DEFINED, otherwise it will return LOCKED during the CAMPAIGN or VOTING period.

The length of the voting sessions being 20 minutes, the next voting session will start at the beginning of the next twenty minutes (e.g. if you submitted the proposal at 9:03, the next vote will start at 9:20).

We can double check by querying the session:
```
await voting.session(1).then(x => new Date(x.voteAt*1000))
```

##### 8- Modify the proposal

Until the CAMPAIGN period starts, it is still possible to update the proposal:
```
await voting.updateProposal(1, "mint", "Better description URL", "0x".padEnd(66,"0"), core.address, request)  
```
We can check that the proposal has been properly updated:
```
await voting.proposal(1)
```

##### 9- Voting 

When the VOTING period begins, we can vote as account 1 for the proposal. The given value is a 256 bits number where each bit code for a proposal approval. For example, if there were 3 proposals and you wanted to vote for the 1rst and the last you would give the following value: `2**0 + 2**2 = 5`
```
await voting.submitVote(1, {from: accounts[1]})
```
Note here that we could have used instead the hexadecimal representation of this bit map: `0x0000000000000000000000000000000000000000000000000000000000000001`

We can check if the proposal has been approved:
```
await voting.proposalApproval(1, 1)
```
The proposal is not approved, as accounts[1] only holds 1/3 of the tokens.

Let's simulate a new vote supporting the proposal from accounts[0] and check that the proposal is then approved:
```
await voting.submitVote(1)
await voting.proposalApproval(1, 1)
```

##### 10- Execution of the proposal

When the VOTING period is closed (in our case 5 minutes after it began), the session state will enter the EXECUTION period:
```
await voting.sessionStateAt(1, Math.floor((new Date()).getTime()/1000)).then(x => x.toString())
```

Once in EXECUTION, the proposal state will confirmed it has been APPROVED:
```
await voting.proposalStateAt(1, 1, Math.floor((new Date()).getTime()/1000)).then(x => x.toString())
```

Anyone who owns enough tokens (10 tokens in our case)  may now trigger the execution of the approved resolutions, including people who did not participate to the vote:
```
await voting.executeResolutions([1], {from: accounts[1]})
```

Let's verify that the new tokens have been minted:
```
await token.totalSupply().then(x => x.toString())
await token.balanceOf(accounts[2]).then(x => x.toString())
```

