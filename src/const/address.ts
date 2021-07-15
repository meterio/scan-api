export const ParamsAddress =
  '0x' + Buffer.from('Params').toString('hex').padStart(40, '0');
export const MeterAddress =
  '0x' + Buffer.from('Meter').toString('hex').padStart(40, '0');
export const MeterGovAddress =
  '0x' + Buffer.from('MeterGov').toString('hex').padStart(40, '0');
export const MeterNativeAddress =
  '0x' + Buffer.from('MeterNative').toString('hex').padStart(40, '0');
export const ExecutorAddress =
  '0x' + Buffer.from('Executor').toString('hex').padStart(40, '0');
export const PrototypeAddress =
  '0x' + Buffer.from('Prototype').toString('hex').padStart(40, '0');
export const ExtensionAddress =
  '0x' + Buffer.from('Extension').toString('hex').padStart(40, '0');
export const MeasureAddress =
  '0x' + Buffer.from('Measure').toString('hex').padStart(40, '0');

export const StakingModuleAddress =
  '0x' +
  Buffer.from('staking-module-address')
    .toString('hex')
    .padStart(40, '0')
    .slice(-40);
export const AuctionModuleAddress =
  '0x' +
  Buffer.from('auction-account-address')
    .toString('hex')
    .padStart(40, '0')
    .slice(-40);
export const AccountLockModuleAddress =
  '0x' +
  Buffer.from('account-lock-address')
    .toString('hex')
    .padStart(40, '0')
    .slice(-40);
export const ValidatorBenefitAddress =
  '0x' +
  Buffer.from('validator-benefit-address')
    .toString('hex')
    .padStart(40, '0')
    .slice(-40);
export const AuctionAccountAddress =
  '0x' +
  Buffer.from('auction-account-address')
    .toString('hex')
    .padStart(40, '0')
    .slice(-40);
export const AuctionLeftOverAddress =
  '0xe852f654dfaee0e2b60842657379a56e1cafa292';

export const ZeroAddress = '0x0000000000000000000000000000000000000000';
export const BridgePoolAddress = '0x5c5713656c6819ebe3921936fd28bed2a387cda5';

export const KnowExchange = new Map<string, string>();

// Thanks to Fabian(creator of vechainstats.com) for the information
KnowExchange.set('0x0f53ec6bbd2b6712c07d8880e5c8f08753d0d5d5', 'BigONE');
