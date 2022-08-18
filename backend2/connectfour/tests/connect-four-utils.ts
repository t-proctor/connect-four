import { newMockEvent } from "matchstick-as"
import { ethereum, Address, BigInt } from "@graphprotocol/graph-ts"
import {
  BoardUpdated,
  GameInitialized,
  GameStarted,
  RewardClaimed
} from "../generated/ConnectFour/ConnectFour"

export function createBoardUpdatedEvent(
  gameId: i32,
  player: i32,
  boardIdx: i32
): BoardUpdated {
  let boardUpdatedEvent = changetype<BoardUpdated>(newMockEvent())

  boardUpdatedEvent.parameters = new Array()

  boardUpdatedEvent.parameters.push(
    new ethereum.EventParam(
      "gameId",
      ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(gameId))
    )
  )
  boardUpdatedEvent.parameters.push(
    new ethereum.EventParam(
      "player",
      ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(player))
    )
  )
  boardUpdatedEvent.parameters.push(
    new ethereum.EventParam(
      "boardIdx",
      ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(boardIdx))
    )
  )

  return boardUpdatedEvent
}

export function createGameInitializedEvent(
  gameId: i32,
  player1: Address,
  betAmount: BigInt
): GameInitialized {
  let gameInitializedEvent = changetype<GameInitialized>(newMockEvent())

  gameInitializedEvent.parameters = new Array()

  gameInitializedEvent.parameters.push(
    new ethereum.EventParam(
      "gameId",
      ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(gameId))
    )
  )
  gameInitializedEvent.parameters.push(
    new ethereum.EventParam("player1", ethereum.Value.fromAddress(player1))
  )
  gameInitializedEvent.parameters.push(
    new ethereum.EventParam(
      "betAmount",
      ethereum.Value.fromUnsignedBigInt(betAmount)
    )
  )

  return gameInitializedEvent
}

export function createGameStartedEvent(
  gameId: i32,
  player2: Address
): GameStarted {
  let gameStartedEvent = changetype<GameStarted>(newMockEvent())

  gameStartedEvent.parameters = new Array()

  gameStartedEvent.parameters.push(
    new ethereum.EventParam(
      "gameId",
      ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(gameId))
    )
  )
  gameStartedEvent.parameters.push(
    new ethereum.EventParam("player2", ethereum.Value.fromAddress(player2))
  )

  return gameStartedEvent
}

export function createRewardClaimedEvent(
  gameId: i32,
  winner: Address,
  recipient: Address,
  rewardAmount: BigInt
): RewardClaimed {
  let rewardClaimedEvent = changetype<RewardClaimed>(newMockEvent())

  rewardClaimedEvent.parameters = new Array()

  rewardClaimedEvent.parameters.push(
    new ethereum.EventParam(
      "gameId",
      ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(gameId))
    )
  )
  rewardClaimedEvent.parameters.push(
    new ethereum.EventParam("winner", ethereum.Value.fromAddress(winner))
  )
  rewardClaimedEvent.parameters.push(
    new ethereum.EventParam("recipient", ethereum.Value.fromAddress(recipient))
  )
  rewardClaimedEvent.parameters.push(
    new ethereum.EventParam(
      "rewardAmount",
      ethereum.Value.fromUnsignedBigInt(rewardAmount)
    )
  )

  return rewardClaimedEvent
}
