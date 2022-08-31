# Project Overview

[xx network](https://xx.network) is a fast, low-fee quantum-ready layer 1 blockchain built in tandem with the most private communications network in the world ([cMix](https://xxnetwork.wiki/What_is_cMix%3F)). Founded by the godfather of digital currency and privacy technology David Chaum, the xx network mainnet launched in November 2021. Nominated Proof-of-Stake (NPoS) incentivizes coin holders to run and elect nodes as well as to participate in the governance of the platform via on-chain DAO. The total supply of coins will grow to about 1 billion xx coins over the next five years and will be offset by a number of deflationary mechanisms.

By leveraging the [xxDK](https://xxdk-dev.xx.network/), any application or blockchain can route their traffic through the xx network's communications layer in order to provide metadata privacy and quantum-secure encryption for all types of data communications. [xx messenger](https://elixxir.io/), the first ever decentralized, quantum-secure, and E2E encrypted messaging app, is the first of many real-world applications built on this technology. Available on all major app stores, xx messenger's performance and unprecedented [privacy](https://elixxir.io/messenger/tech-specs) has already attracted daily users in more than 65 countries.

Currency name: `xx network`

Currency ticker: `XX`

Official Contact: listings@xxfoundation.org

## Useful Links

Website: https://xx.network

Foundation Website: https://xxfoundation.org/

Block Explorers
* Official: https://explorer.xx.network
* Community built: https://xxscan.io

Web-based wallet: https://wallet.xx.network 

Github: https://github.com/xx-labs 

Technical Help: https://discord.gg/XDda235jFM 

# Blockchain Overview

The xx network is a **native layer 1 blockchain** built using [Substrate](https://substrate.io/). Any exchange that already supports a Substrate based network (such as Polkadot, Kusama, Acala, Moonbeam, etc.) can easily add support for xx network and its native xx coin with minor changes to their code. Balances in the xx network use **9 decimals** and addresses are encoded using the SS58 address format defined by Substrate, with an SS58 **prefix** of **55**. This means that all xx network addresses begin with a **6**, for example: *6WSH4iFzYY3ATabSuQwSaaacFLs9JVAhH7R3xAFf1UyWoEsH*.

Block target rate: 6 seconds

Balance precision: 9 decimals

Substrate SS58 prefix: 55 (registry [entry](https://github.com/paritytech/ss58-registry/blob/main/ss58-registry.json#L502))

Transaction finality: Usually 3 blocks/18 seconds, can use API to check block finality (See [Sample Scripts](#sample-scripts))

Memo functionality: No

## Wallet Generation

Currently, in the xx network blockchain, all transactions and wallets use the standard Substrate cryptography, which by default is **sr25519** (other signature algorithms available are ed25519 and ecdsa/secp256k1).

In the future, the xx network blockchain will add the ability to use **WOTS+** quantum secure hash based cryptography to sign transactions. This is expected to become the new default scheme, but **sr25519** will continue to be supported.

The xx network uses a unique state of the art wallet generation algorithm, called [Sleeve](https://eprint.iacr.org/2021/872.pdf), which embeds a quantum secure WOTS+ based wallet within generated entropy, that is then encoded into a mnemonic phrase using BIP39. The golang implementation of WOTS+, Sleeve and a CLI wallet generator can be found [here](https://github.com/xx-labs/sleeve).

The uniqueness of Sleeve means that 2 recovery phrases are created when a wallet is generated:
* The **quantum secure recovery phrase**: creates the WOTS+ wallet and the Sleeve private key. This is not currently used, but will be necessary in the future in order to transition existing non quantum secure wallets into quantum secure wallets.
* The **standard recovery phrase**: is the one currently used to generate standard Substrate sr25519 accounts, using the substrate-bip39 generation algorithm. This phrase can be generated from the quantum secure one, so keeping the second safe will always be of utmost importance.

Currently, Sleeve wallet generation is available using the wallet generation [app](https://xx.network/archive/mainnet-wallet-gen/) or the web-based [wallet](https://wallet.xx.network/#/accounts/generate). While not strictly mandatory, we highly recommend that all wallets generated for use in xx network follow the Sleeve specification, to allow for future seamless transition into a quantum secure wallet.

While not recommended, sr25519 wallets without a quantum-secure backup can be generated using [subkey](https://docs.substrate.io/reference/command-line-tools/subkey/#subkey-generate). We recommend always using 24 words for recovery phrases, so the generate command will look like this:
```sh
subkey generate --words 24 --network xxnetwork
```

# Interacting with the xx network blockchain

The following libraries are built to interact with Substrate based networks, and therefore are compatible with the xx network blockchain:
* JS: [polkadot-js/api](https://github.com/polkadot-js/api) ([docs](https://polkadot.js.org/docs/))
* Python: [py-substrate-interface](https://github.com/polkascan/py-substrate-interface)
* Golang: [GSRPC](https://github.com/centrifuge/go-substrate-rpc-client/)
* Rust: [subxt](https://github.com/paritytech/subxt)
* HTTP: [substrate-api-sidecar](https://github.com/paritytech/substrate-api-sidecar)

Documentation for accessing the xx network blockchain using the polkadot-js/api library can be found [here](https://blockchainapi.xx.network/). A general list of available JSON-RPC calls available in Substrate nodes (according to configuration) can be found [here](https://blockchainapi.xx.network/rpc). For example, the latest finalized block hash can be obtained using `curl` as follows:
```sh
curl -H "Content-Type: application/json" -d '{"id":"1", "jsonrpc":"2.0", "method": "chain_getBlockHash", "params":[]}' http://localhost:9933
```

Regardless of the choice of library, in order to connect to the xx network blockchain, an endpoint must be specified.

## Connect to Public Endpoint
The xx Foundation is currently providing a public endpoint for exchanges to test their integrations. There are no guarantees to the availability, performance, or security of this endpoint and it is strongly recommended that you set up your own node for interacting with the xx network blockchain. If you would like to use this endpoint then please contact listings@xxfoundation.org 

## Setup a Node

Running a non-validator node in pruning mode is the easiest way to have access to the xx network blockchain. This type of node maintains all blocks and transactions in its database, but discards the state of blocks that are older than the latest N configurable number of blocks, which by default is set to 256.

You can find the latest releases of xx network blockchain in the GitHub [repository](https://github.com/xx-labs/xxchain/releases). The binary included in each release is compiled for Debian Linux machines, and for this guide we will assume Ubuntu 20.04 is being used. If you wish to compile your own binary, follow the instructions provided in the repository.

The xx network blockchain binary has many command line arguments, of which the following are most relevant:
```
-d, --base-path <PATH>      Specify custom base path of blockchain data [default: /home/$user/.local/share/xxnetwork-chain/]
--in-peers <COUNT>          Specify the maximum number of incoming connections we're accepting [default: 25]
--out-peers <COUNT>         Specify the number of outgoing connections we're trying to maintain [default: 25]
--port <PORT>               Specify p2p protocol TCP port [default: 30333]
--prometheus-port <PORT>    Specify Prometheus exporter TCP Port [default: 9615]
--rpc-methods <METHOD SET>  RPC methods to expose. [default: Auto]  [possible values: Auto, Safe, Unsafe]
--rpc-port <PORT>           Specify HTTP RPC server TCP port [default: 9933]
--ws-port <PORT>            Specify WebSockets RPC server TCP port [default: 9944]
```

When the `xxnetwork-chain` binary is started, it will start to synchronize the xx network blockchain data, according to the latest block stored in the blockchain data folder (as specified via `-d`). This can take quite some time, especially on the first run.

In order to speed up the synchronization process, a snapshot of the xx network mainnet blockchain data can be found [here](https://drive.google.com/file/d/1Lpl2yYmDDBUMgtuPdJtQ14ygicf5Qbx8). This snapshot contains all blocks up to 29th of August 2022, and is compatible with a pruned database, with the last 256 blocks being maintained, i.e., the default configuration. The xx foundation will aim to provide more frequent snapshots and post them to a known link. This page will be updated when that happens.

We recommend using the snapshots just for speeding up synchronization for testing purposes. For production, it is strongly recommended to synchronize the chain from scratch, in order to avoid potential issues with the snapshot (for example, data corruption).


## Sample Scripts

The following scripts are meant to showcase simple interactions with the xx network blockchain. The current list of available scripts is:
* [address validation](#address-validation)
* [detect transfers](#detect-transfers)
* [offline sign](#offline-sign)
* [query balances](#query-balances)
* [simple transfer](#simple-transfer)
* [transfer](#transfer)

To run any of the scripts, run the following commands:

```sh
cd [script-folder] # example cd address-validation
yarn && yarn start
```

For development or testing purposes, we recommend starting a local `xxnetwork-chain` instance in `dev` mode, using the following command:

```sh
./xxnetwork-chain -d devchain --dev --ws-port=63007
```

The `dev` mode blockchain contains special development accounts preloaded with funds. You can use the web-based [wallet](https://wallet.xx.network/?rpc=ws%3A%2F%2F127.0.0.1%3A63007#/explorer) to connect to your local blockchain instance. In the [accounts](https://wallet.xx.network/?rpc=ws%3A%2F%2F127.0.0.1%3A63007#/accounts) page, you will find the development accounts, and can use them to send transfers, or any other transactions for testing purposes.

### Address validation
This script shows how to validate a correctly formed xx network address, using the SS58 address format. It contains examples of various invalid addresses, including ones from other Substrate-based networks. It can be found in [address-validation](address-validation).

### Detect transfers
This script shows how to listen for new finalized blocks, and then filter the events emitted, to detect all the transfers that happened in the block. It can be found in [detect-transfers](detect-transfers).

### Offline sign
This script shows how to sign a transaction without being connected to a node. It is meant to be used together with the [transfer](transfer) script. This script waits for a signing payload to be input into the console, and then signs it using Alice's wallet. Then it outputs the signature, which can be input into the [transfer](transfer) script. It can be found in [offline-sign](offline-sign).

### Query balances
This script shows how to get the current and past balances breakdown of a given account. It can be found in [query-balances](query-balances).

### Simple transfer
This script shows how to perform basic simple transfers between accounts, including how to send all transferrable funds. It can be found in [simple-transfer](simple-transfer).

### Transfer
This script shows how to create a transfer, add the signature generated by an offline signer to it, and then broadcast it. It is meant to be used together with the [offline-sign](offline-sign) script. This script waits for the offline generated signature to be input, before broadcasting the transfer. It can be found in [transfer](transfer).
