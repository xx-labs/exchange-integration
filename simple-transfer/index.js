const { ApiPromise, WsProvider } = require('@polkadot/api');
const { Keyring } = require('@polkadot/keyring');
require('dotenv').config();

const ALICE = '6a6XHUGV5mu33rX1vn3iivxxUR4hwoUapsuECGyHpPzfaNtt';
const BOB = '6YXN1Q6Lx3u8tr2WVr5myb3zNa3pVG5FL3ku8uqckR5RoA21';

/**
 * Connect to an xx network node using websocket
 * @return {Promise} chain api
 */
async function connect() {
    const provider = new WsProvider(process.env.WS_CHAIN);
    const api = await ApiPromise.create({
        provider,
    });
    await api.isReady;
    return api;
}

async function signAndSend(extrinsic, signer) {
    return new Promise((resolve, reject) => {
        // Sign and send the extrinsic using the signer, and track its status
        extrinsic.signAndSend(signer, ({ txHash, status }) => {
            if (status.isInBlock) {
                console.log(`Transfer ${txHash.toHex()} included in block ${status.asInBlock}`);
            }
            if (status.isFinalized) {
                console.log(`Transfer ${txHash.toHex()} is finalized`);
                resolve(txHash);
            }
        });
    })
}

async function main () {
    // Connect to the node
    const api = await connect();

    // Construct the keying, using ss58 format 55, which is registered for xx network
    const keyring = new Keyring({ type: 'sr25519', ss58Format: 55 });

    // Add Alice to our keyring with a hard-derived path (empty phrase, so uses dev account)
    const alice = keyring.addFromUri('//Alice');

    // Add Charlie to our keyring with a hard-derived path (empty phrase, so uses dev account)
    const charlie = keyring.addFromUri('//Charlie');

    // Create a extrinsic, transferring 1000 units to Bob (with 9 decimals)
    const transfer = api.tx.balances.transfer(BOB, 1000_000000000);

    // Sign and send the transaction using Alice's account and return the hash
    let hash = await signAndSend(transfer, alice);
    console.log(`View the transfer on the Explorer: explorer.xx.network/extrinsics/${hash}`);

    // Create a extrinsic, transferring all liquid coins, except the existential deposit to Alice
    const transferAll = api.tx.balances.transferAll(ALICE, true);

    // Sign and send the transaction using Charlie's account and return the hash
    hash = await signAndSend(transferAll, charlie);
    console.log(`View the transfer on the Explorer: explorer.xx.network/extrinsics/${hash}`);
}

main().catch(console.error).finally(() => process.exit());
