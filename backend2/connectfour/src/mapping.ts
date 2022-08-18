import { BigInt } from "@graphprotocol/graph-ts";
import { Address } from "@graphprotocol/graph-ts";
import {
  ConnectFour,
  BoardUpdated,
  GameInitialized,
  GameStarted,
  RewardClaimed,
} from "../generated/ConnectFour/ConnectFour";
import { Game } from "../generated/schema";

export function handleGameInitialized(event: GameInitialized): void {
  let game = new Game(event.params.gameId.toString().padStart(5, "0"));
  game.betAmount = event.params.betAmount;
  game.player1 = event.params.player1;
  game.status = "initialized";
  game.nextPlayer = new Address(0);
  game.id = event.params.gameId.toString().padStart(5, "0");
  game.player2 = new Address(0);
  game.moves = new Array();
  game.winner = new Address(0);
  game.save();
}
// game.id = event.params.gameId;

// game.id = event.params.gameId.toString().padStart(5, "0");
// game.player2 = new Address(0);
// game.moves = new Array();
// game.winner = new Address(0);

export function handleGameStarted(event: GameStarted): void {
  let id = event.params.gameId.toString().padStart(5, "0");
  let game = Game.load(id);
  if (game == null) {
    return;
  }
  game.player2 = event.params.player2;
  game.status = "started";
  game.nextPlayer = game.player1;
  game.save();
}

export function handleBoardUpdated(event: BoardUpdated): void {
  let id = event.params.gameId.toString().padStart(5, "0");
  let game = Game.load(id);
  if (game == null) {
    return;
  }
  let moves = game.moves;
  moves.push(event.params.boardIdx);
  game.moves = moves;
  if (event.params.player == 1) {
    game.nextPlayer = game.player2;
  } else {
    game.nextPlayer = game.player1;
  }
  game.save();
}

export function handleRewardClaimed(event: RewardClaimed): void {
  let id = event.params.gameId.toString().padStart(5, "0");
  let game = Game.load(id);
  if (game == null) {
    return;
  }
  game.winner = event.params.winner;
  game.status = "finished";
  game.save();
}
