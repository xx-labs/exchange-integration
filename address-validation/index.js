const { decodeAddress } = require('@polkadot/keyring');

// This address is valid
const validXXNetworkAddress = '6VKGAwtDvAZxbCurxD5c5V7s48XREDiEWErHgB14G4qZU9bs';

// Changed the 'C' to lowercase,                      |
// making the address checksum invalid                |
//                                                    v
const invalidChecksumXXNetworkAddress = '6VKGAwtDvAZxbcurxD5c5V7s48XREDiEWErHgB14G4qZU9bs';

// Address is too short
const tooShortXXNetworkAddress = '6VKGAwtDvAZxbcurxD5c5V7s48XREDiEWErHgB14G4qZ';

// Address is too long
const tooLongXXNetworkAddress = '6VKGAwtDvAZxbCurxD5c5V7s48XREDiEWErHgB14G4qZU9bsAb1234';

// Address starting with 0x
const zeroHexAddress = "0x00bfba2388afd7dc756c85840661d67d080c6675f89a7625809041764aed4151"

// These addresses are valid but are from other Substrate based networks
// so not valid in xx network
const validPolkadotAddress = '1nUC7afqmo7zwRFWxDjrUQu9skk6fk99pafb4SiyGSRc8z3';
const validSubstrateAddress = '5GrpknVvGGrGH3EFuURXeMrWHvbpj3VfER1oX5jFtuGbfzCE';

// Check if an address is a valid xx network address
function isValidXXNetworkAddress(address) {
    if (address.startsWith('0x')) {
        return false
    }
    try {
        // Use ss58 format 55, which is registered for xx network
        decodeAddress(address, false, 55);
        return true;
    } catch (error) {
        // In this example we can log the error
        console.log(error);
        return false;
    }
}

// Address Validation
function checkAddress(adddress) {
    console.log(`Address: ${adddress}`)
    console.log(`\t${isValidXXNetworkAddress(adddress)}\n\n`);
}

// Valid
// true
checkAddress(validXXNetworkAddress);

// Invalid Checksum
// false
checkAddress(invalidChecksumXXNetworkAddress);

// Too short
// false
checkAddress(tooShortXXNetworkAddress);

// Too long
// false
checkAddress(tooLongXXNetworkAddress);

// Starts with 0x
// false
checkAddress(zeroHexAddress);

// Wrong network
// false
checkAddress(validPolkadotAddress);

// Wrong network
// false
checkAddress(validSubstrateAddress);

