
# Tutorial

A Step by Step learning for the C-Layer.
This tutorial requires you have truffle already installed.

See the [requirements](#requirements) for more information.

### Beginner level

01. [Your First Token](./01-TokenCreation.md)
02. [Basic Compliance](./02-BasicTokenCompliance.md)
03. [Becoming a rates provider](./03-RatesProvider.md)
04. [Any Users can register](./04-UserRegistry.md)

### Intermediate level

11. [A Simple Token Sale](./11-TokenSale.md)
12. [Planning a sale and bonuses](./12-AdvancedSale.md)
13. [A voting walkthrough](./13-VotingWalkthrough.md)
14. [Running as a DAO](./14-RunningADAO.md)
15. Distributing Dividends
16. Playing with the rules

### Expert level

21. [Running a Token Factory](./21-TokenFactory.md)
22. Operating a token with AML and KYC compliance
23. Compliance Tokensale with offchain investments and AML
24. Enterprise access control
25. Upgrading Tokens

### Requirements

##### 1- Truffle
You can use truffle environment provided with the [start.sh](../start.sh) script.
This will ensure you have the correct environment required and avoid any versions conflict with already installed dependencies.
The provided docker image is based on ethereum/solc but includes as well the environment for installing node packages. 

An alternative is to install node on your environment and add truffle and the needed requirements globally: 
`npm i -g truffle ganache-cli`

##### 2- Node packages
Once truffle is installed, you may proceed to install the dependencies for each module.
Run `yarn install` from the root directory.

##### 3- Live network
If you plan to run the tutorial on a live network (either ropsten or mainnet), you will need to configure an infura projectId and your mnemonic.

The infura projectId may be obtained from infura website once logged in.
A mnemonic can be generated with [myetherwallet](https://www.myetherwallet.com/create-wallet)

Finally, copy the `secret.json` file into `.secret.json` and edit it with the correct projectId and mnemonic values.



