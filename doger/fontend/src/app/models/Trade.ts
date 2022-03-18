export class Trade {
  id: number;
  ticker: string;
  price: string;
  amount: string;
  pnl?: string;
  command: string;
  userId: string;
  exchangeId: string;
  creationDate?: any;
  executionDate?: string;
  state: number;
}
