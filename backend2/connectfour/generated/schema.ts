// THIS IS AN AUTOGENERATED FILE. DO NOT EDIT THIS FILE DIRECTLY.

import {
  TypedMap,
  Entity,
  Value,
  ValueKind,
  store,
  Bytes,
  BigInt,
  BigDecimal
} from "@graphprotocol/graph-ts";

export class Game extends Entity {
  constructor(id: string) {
    super();
    this.set("id", Value.fromString(id));
  }

  save(): void {
    let id = this.get("id");
    assert(id != null, "Cannot save Game entity without an ID");
    if (id) {
      assert(
        id.kind == ValueKind.STRING,
        `Entities of type Game must have an ID of type String but the id '${id.displayData()}' is of type ${id.displayKind()}`
      );
      store.set("Game", id.toString(), this);
    }
  }

  static load(id: string): Game | null {
    return changetype<Game | null>(store.get("Game", id));
  }

  get id(): string {
    let value = this.get("id");
    return value!.toString();
  }

  set id(value: string) {
    this.set("id", Value.fromString(value));
  }

  get betAmount(): BigInt {
    let value = this.get("betAmount");
    return value!.toBigInt();
  }

  set betAmount(value: BigInt) {
    this.set("betAmount", Value.fromBigInt(value));
  }

  get player1(): Bytes {
    let value = this.get("player1");
    return value!.toBytes();
  }

  set player1(value: Bytes) {
    this.set("player1", Value.fromBytes(value));
  }

  get player2(): Bytes {
    let value = this.get("player2");
    return value!.toBytes();
  }

  set player2(value: Bytes) {
    this.set("player2", Value.fromBytes(value));
  }

  get status(): string {
    let value = this.get("status");
    return value!.toString();
  }

  set status(value: string) {
    this.set("status", Value.fromString(value));
  }

  get moves(): Array<i32> {
    let value = this.get("moves");
    return value!.toI32Array();
  }

  set moves(value: Array<i32>) {
    this.set("moves", Value.fromI32Array(value));
  }

  get nextPlayer(): Bytes {
    let value = this.get("nextPlayer");
    return value!.toBytes();
  }

  set nextPlayer(value: Bytes) {
    this.set("nextPlayer", Value.fromBytes(value));
  }

  get winner(): Bytes {
    let value = this.get("winner");
    return value!.toBytes();
  }

  set winner(value: Bytes) {
    this.set("winner", Value.fromBytes(value));
  }
}
