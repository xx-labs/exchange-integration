const { ApiPromise, WsProvider } = require('@polkadot/api');
require('dotenv').config();

const ALICE = '6a6XHUGV5mu33rX1vn3iivxxUR4hwoUapsuECGyHpPzfaNtt';

function parseAccountData(accountData) {
    // Account data contains different types of balances
    // Reserved balance is used to store data on chain (for example Identity)
    const { data: { free, miscFrozen, feeFrozen, reserved } } = accountData;
    // Total balance is sum of free and reserved
    let balance = free.add(reserved);
    // Locked balance (for example in Staking or Governance)
    let locked = miscFrozen.gt(feeFrozen) ? miscFrozen : feeFrozen;
    // Liquid (transferrable) balance is the free balance minus the locked balance
    let liquid = free.sub(locked);
    console.log(`Total balance ${balance.toString()}`);
    console.log(`Locked ${locked.toString()}`);
    console.log(`Reserved ${reserved.toString()}`);
    console.log(`Liquid ${liquid.toString()}`);
}

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

async function main () {
    // Connect to the node
    const api = await connect();

    // Get current block
    const header = await api.rpc.chain.getHeader();
    const blockNo = header.number.toNumber();

    // Get account data
    let data = await api.query.system.account(ALICE);
    // Parse account data
    parseAccountData(data);

    // Get balances balances at a past block (wait 20 seconds to let some blocks be produced)
    if (blockNo < 2) {
        await new Promise(r => setTimeout(r, 20000));
    }
    // Get an older block
    const hash = await api.rpc.chain.getBlockHash(2);
    // Get an API instance at that block
    const apiAt = await api.at(hash);
    // Get account data
    data = await apiAt.query.system.account(ALICE);
    // Parse account data
    parseAccountData(data);
}

main().catch(console.error).finally(() => process.exit());
