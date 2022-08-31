const { ApiPromise, WsProvider } = require('@polkadot/api');
require('dotenv').config();

/**
 *
 * @param {number} ms miliseconds
 * @returns
 */
async function wait(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

/**
 * Connect to an xx network blockchain endpoint using websocket
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

/**
 * Check if node is in sync
 * @param {Promise} api
 * @returns {boolean}
 */
async function checkSync(api) {
  const health = await api.rpc.system.health();
  return health.isSyncing.toHuman();
}

/**
 * Get instance of blockchain API from a synced node
 * @returns {Promise} chain api
 */
async function getAPI() {
  // Connect to the node
  const api = await connect();

  // Wait for node to be synced
  const isSyncing = await checkSync(api);
  if (isSyncing) {
    api.disconnect();
    console.log('Node is not synced! Waiting 5 seconds...');
    await wait(5000);
    return getAPI();
  }
  return api;
}

/**
 * Get all transfers in the events of the given block
 * @param {Object} blockEvents list of events
 * @returns {Object} list of transfers
 */
function getTransfers(blockEvents) {
  const transfers = blockEvents
    .filter((record, idx) =>
      // Detect transfers via the balances.Transfer event, but make sure Vested Transfers are not detected
      (record.event.section === 'balances' && record.event.method === 'Transfer') &&
      !(blockEvents[idx+1].event.section === 'vesting' && blockEvents[idx+1].event.method === 'VestingUpdated')
    )
    .map(({ event: { data }, phase }) => ({
      idx: phase.isApplyExtrinsic && phase.asApplyExtrinsic.toNumber(),
      from: data[0].toHuman(),
      to: data[1].toHuman(),
      amount: data[2].toHuman(),
    }));
  return transfers;
}

/**
 * Listen to transfers
 * @param {Promise} api chain api
 * @returns {Promise}
 */
async function listenTransfers(api) {
  console.log('Starting finalized blocks listener...');
  return new Promise((reject, resolve) => {
    api.rpc.chain.subscribeFinalizedHeads(async (header) => {
      // Get block number
      const blockNumber = header.number.toNumber();
      // Get block hash
      const blockHash = await api.rpc.chain.getBlockHash(blockNumber);
      // Get block
      const block = await api.rpc.chain.getBlock(blockHash);
      // Get block events
      const blockEvents = await api.query.system.events.at(blockHash);

      // Get transfers
      const transfers = getTransfers(blockEvents);

      transfers.forEach((tx) => {
        console.log(`Found Transfer in block #${blockNumber}`);
        console.log(`FROM: ${tx.from}`);
        console.log(`TO: ${tx.to}`);
        console.log(`AMOUNT: ${tx.amount}`);
        const extrinsicHash = block.block.extrinsics[tx.idx].hash.toHex();
        console.log(`View it on the Explorer: explorer.xx.network/extrinsics/${extrinsicHash}`);
      })
    });
  });
}

/**
 * Listen to all new finalized blocks after making sure node is in sync
 * and print out details of any transfers
 */
async function main() {
  // Connect to the blockchain
  const api = await getAPI();
  // Listen to transfers (runs forever)
  await listenTransfers(api);
}

main().catch((err) => console.error(err)).finally(() => process.exit());
