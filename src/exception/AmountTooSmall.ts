import BigNumber from 'bignumber.js';

import { Token } from '../const/model';
import { toReadableAmount } from '../utils/common';

class AmountTooSmall extends Error {
  public amount: string;
  public token: Token;
  public message: string;

  constructor(amount: string, token: Token) {
    const message = `Token ${Token[token]} with amount ${toReadableAmount(
      amount
    )} is less than minimum requirement`;
    super(message);
    this.amount = amount;
    this.token = token;
    this.message = message;
  }
}

export default AmountTooSmall;
