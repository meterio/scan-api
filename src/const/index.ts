export * from './address';
export * from './genesis';
export * from './network';
export * from './token';
export * from './abi';
export * from './model';

export const enumVals = (es: any) => {
  return Object.keys(es).map((key) => es[key] as string);
};
export const RECENT_WINDOW = 5;
export const LIMIT_WINDOW = 10;
export const UNIT_SHANNON = 1e9;
export const UNIT_WEI = 1e18;
export const ENERGY_SYM = 'STPT';
export const BALANCE_SYM = 'STPD';
