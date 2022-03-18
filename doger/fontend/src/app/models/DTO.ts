import {Exchange} from "./Exchange";
import {Trade} from "./Trade";
import {User} from "./User";

export class DTO {
  user: User;
  exchanges: Exchange[];
  trades: Trade[];

  constructor() {
    this.user = new User();
    this.exchanges = [];
    this.trades = [];
  }
}
