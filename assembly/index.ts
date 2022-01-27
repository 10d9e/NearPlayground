// @nearfile
import { context, storage, logging, PersistentMap } from "near-sdk-as";

/**
 * Interface of the NEP141 Fungible Token Standard as defined in the NEP.
 */
 interface StandardFungibleTokenNEP141 {

  /**
   * Returns the amount of tokens in existence.
   */
  totalSupply(): u64;

  /**
   * Returns the amount of tokens owned by `account`.
   */
  balanceOf(tokenOwner: string): u64;

  /**
   * Returns the remaining number of tokens that `spender` will be
   * allowed to spend on behalf of `owner` through {transferFrom}. This is
   * zero by default.
   *
   * This value changes when {approve} or {transferFrom} are called.
   */
  allowance(tokenOwner: string, spender: string): u64;

  /**
   * Moves `amount` tokens from the caller's account to `recipient`.
   *
   * Returns a boolean value indicating whether the operation succeeded.
   *
   */
  transfer(to: string, tokens: u64): boolean;

  /**
   * @dev Sets `amount` as the allowance of `spender` over the caller's tokens.
   *
   * Returns a boolean value indicating whether the operation succeeded.
   *
   * IMPORTANT: Beware that changing an allowance with this method brings the risk
   * that someone may use both the old and the new allowance by unfortunate
   * transaction ordering. One possible solution to mitigate this race
   * condition is to first reduce the spender's allowance to 0 and set the
   * desired value afterwards:
   * https://github.com/ethereum/EIPs/issues/20#issuecomment-263524729
   *
   */
  approve(spender: string, tokens: u64): boolean;

  /**
   * Moves `amount` tokens from `sender` to `recipient` using the
   * allowance mechanism. `amount` is then deducted from the caller's
   * allowance.
   *
   * Returns a boolean value indicating whether the operation succeeded.
   *
   */
  transferFrom(from: string, to: string, tokens: u64): boolean;
}

// --- contract code goes below
class DogeNearFungibleToken implements StandardFungibleTokenNEP141 {

  _name: string = 'DogeNear Token';
  _symbol: string = 'DGN';
  _totalSupply: u64 = 1000000;
  
  _balances: PersistentMap<string, u64> = new PersistentMap("_balances");
  _approves: PersistentMap<string, u64> = new PersistentMap("_approves");

  init(initialOwner: string): void {
    logging.log("initialOwner: " + initialOwner);
    assert(storage.get<string>("init") == null, "Already initialized token supply");
    this._balances.set(initialOwner, this._totalSupply);
    storage.set("init", "done");
  }

  totalSupply(): u64 {
    return this._totalSupply;
  }

  balanceOf(tokenOwner: string): u64 {
    logging.log("balanceOf: " + tokenOwner);
    if (!this._balances.contains(tokenOwner)) {
      return 0;
    }
    const result = this._balances.getSome(tokenOwner);
    return result;
  }

  allowance(tokenOwner: string, spender: string): u64 {
    const key = tokenOwner + ":" + spender;
    if (!this._approves.contains(key)) {
      return 0;
    }
    return this._approves.getSome(key);
  }

  transfer(to: string, tokens: u64): boolean {
    logging.log("transfer from: " + context.sender + " to: " + to + " tokens: " + tokens.toString());
    const fromAmount = this.getBalance(context.sender);
    assert(fromAmount >= tokens, "not enough tokens on account");
    this._balances.set(context.sender, fromAmount - tokens);
    this._balances.set(to, this.getBalance(to) + tokens);
    return true;
  }

  approve(spender: string, tokens: u64): boolean {
    logging.log("approve: " + spender + " tokens: " + tokens.toString());
    this._approves.set(context.sender + ":" + spender, tokens);
    return true;
  }

  transferFrom(from: string, to: string, tokens: u64): boolean {
    const fromAmount = this.getBalance(from);
    assert(fromAmount >= tokens, "not enough tokens on account");
    const approvedAmount = this.allowance(from, to);
    assert(tokens <= approvedAmount, "not enough tokens approved to transfer");
    this._balances.set(from, fromAmount - tokens);
    this._balances.set(to, this.getBalance(to) + tokens);
    return true;
  }

  getBalance(owner: string): u64 {
    return this._balances.contains(owner) ? this._balances.getSome(owner) : 0;
  }
}

export { DogeNearFungibleToken }
