import { Provider } from "@ethersproject/abstract-provider";
import { expect } from "chai";
import { ethers } from "hardhat";
import { BigNumber } from "@ethersproject/bignumber";

import { ConnectFour } from "../typechain";

describe("ConnectFour", () => {
  let player1: string;
  let player2: string;

  let provider: Provider;

  const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";
  const MIN_BET = BigNumber.from(0);
  const MAX_BET = ethers.utils.parseUnits("2.0");

  let p1ConnectFour: ConnectFour;
  let p2ConnectFour: ConnectFour;

  const STATUSES = {
    NONEXISTENT: 0,
    INITIALIZED: 1,
    STARTED: 2,
    BETWITHDRAWN: 3,
  };

  const Direction = {
    LeftDiagonal: 0,
    Up: 1,
    RightDiagonal: 2,
    Right: 3,
  };

  beforeEach(async () => {
    const [player1Signer, player2Signer] = await ethers.getSigners();
    player1 = player1Signer.address;
    player2 = player2Signer.address;

    provider = player1Signer.provider as Provider;

    const ConnectFour = await ethers.getContractFactory("ConnectFour");
    p1ConnectFour = await ConnectFour.deploy(MIN_BET, MAX_BET);
    await p1ConnectFour.deployed();

    const actualMinBetAmount = await p1ConnectFour.minBetAmount();
    const actualMaxBetAmount = await p1ConnectFour.maxBetAmount();

    expect(actualMinBetAmount).to.equal(MIN_BET);
    expect(actualMaxBetAmount).to.equal(MAX_BET);

    p2ConnectFour = p1ConnectFour.connect(player2Signer);
  });

  const startGame = async () => {
    await p1ConnectFour.initializeGame({ value: 1 });
    await p2ConnectFour.startGame(0, { value: 1 });
  };

  it("should initialize properly and set Game state", async () => {
    const gameId = 0;
    await expect(p1ConnectFour.initializeGame({ value: 1 }))
      .to.emit(p1ConnectFour, "GameInitialized")
      .withArgs(gameId, player1, 1);

    const game = await p1ConnectFour.games(gameId);

    expect(game.player1).to.equal(player1);
    expect(game.player2).to.equal(ZERO_ADDRESS);
    expect(game.betAmount).to.equal(1);
    expect(game.status).to.equal(STATUSES.INITIALIZED);
    expect(game.isPlayer1Turn).to.equal(true);

    const contractBalance = await provider.getBalance(p1ConnectFour.address);
    expect(contractBalance).to.equal(1);
  });

  it("should initialize 2 games", async () => {
    await expect(p1ConnectFour.initializeGame({ value: 1 }))
      .to.emit(p1ConnectFour, "GameInitialized")
      .withArgs(0, player1, 1);

    await expect(p2ConnectFour.initializeGame({ value: 2 }))
      .to.emit(p2ConnectFour, "GameInitialized")
      .withArgs(1, player2, 2);
  });

  it("should fail to start game if incorrect value sent", async () => {
    await p1ConnectFour.initializeGame({ value: 1 });
    await expect(p2ConnectFour.startGame(0, { value: 0 })).to.be.reverted;
  });

  it("should fail to start game when called by the player who initialized it", async () => {
    await p1ConnectFour.initializeGame({ value: 0 });
    await expect(p1ConnectFour.startGame(0, { value: 0 })).to.be.revertedWith(
      "ConnectFour: can't start the same game you initialized"
    );
  });

  it("should fail to start a game that doesn't exist", async () => {
    await expect(p1ConnectFour.startGame(1, { value: 0 })).to.be.revertedWith(
      "ConnectFour: game hasn't started or already exists"
    );
  });

  it("should fail to start game when it is not in the Initialized state", async () => {
    await p1ConnectFour.initializeGame({ value: 0 });
    await p2ConnectFour.startGame(0, { value: 0 });
    await expect(p2ConnectFour.startGame(0, { value: 0 })).to.be.revertedWith(
      "ConnectFour: game hasn't started or already exists"
    );
  });

  it("should start game in correct state", async () => {
    await p1ConnectFour.initializeGame({ value: 1 });
    await expect(p2ConnectFour.startGame(0, { value: 1 })).to.emit(
      p1ConnectFour,
      "GameStarted"
    );

    const game = await p1ConnectFour.games(0);

    expect(game.player1).to.equal(player1);
    expect(game.player2).to.equal(player2);
    expect(game.betAmount).to.equal(1);
    expect(game.status).to.equal(STATUSES.STARTED);
    expect(game.isPlayer1Turn).to.equal(true);

    const contractBalance = await provider.getBalance(p1ConnectFour.address);
    expect(contractBalance).to.equal(2);
  });

  it("should fail to play move on game that has not started yet", async () => {
    await p1ConnectFour.initializeGame({ value: 1 });
    await expect(p2ConnectFour.playMove(0, 6)).to.be.revertedWith(
      "ConnectFour: game hasn't started, doesn't exist, or is already over"
    );
  });

  it("should fail to play move on a game that doesn't exist", async () => {
    await expect(p1ConnectFour.playMove(0, 3)).to.be.revertedWith(
      "ConnectFour: game hasn't started, doesn't exist, or is already over"
    );
  });

  it("should fail to play move on a column that is out of bounds", async () => {
    await startGame();

    await expect(p1ConnectFour.playMove(0, 10)).to.be.reverted;
  });

  it("should fail to play move when column has all of its discs placed", async () => {
    await startGame();
    await p1ConnectFour.playMove(0, 0);
    await p2ConnectFour.playMove(0, 0);
    await p1ConnectFour.playMove(0, 0);
    await p2ConnectFour.playMove(0, 0);
    await p1ConnectFour.playMove(0, 0);
    await p2ConnectFour.playMove(0, 0);

    await expect(p1ConnectFour.playMove(0, 0)).to.be.reverted;
  });

  it("should fail to play move when it is not the caller's turn", async () => {
    await startGame();
    await expect(p2ConnectFour.playMove(0, 3)).to.be.reverted;
  });

  it("should play move correctly for player 1", async () => {
    await startGame();
    await p1ConnectFour.playMove(0, 3);

    const game = await p1ConnectFour.games(0);

    expect(game.isPlayer1Turn).to.equal(false);
  });

  it("should play move correctly for player 2", async () => {
    await startGame();
    await p1ConnectFour.playMove(0, 3);
    await p2ConnectFour.playMove(0, 4);

    const game = await p1ConnectFour.games(0);

    expect(game.isPlayer1Turn).to.equal(true);
  });

  it("should play 2 moves correctly in the same column", async () => {
    await startGame();
    await p1ConnectFour.playMove(0, 3);
    await p2ConnectFour.playMove(0, 3);

    const game = await p1ConnectFour.games(0);

    expect(game.isPlayer1Turn).to.equal(true);
  });

  it("should fail to claim when game is in the wrong state", async () => {
    await p1ConnectFour.initializeGame({ value: 1 });
    await expect(
      p2ConnectFour.claimReward(0, player2, 0, 0, Direction.LeftDiagonal)
    ).to.be.reverted;
  });

  it("should fail to claim when the four-in-a-row discs are out of bounds", async () => {
    await startGame();
    await expect(p1ConnectFour.claimReward(0, player1, 0, 5, Direction.Up)).to
      .be.reverted;
  });

  it("should fail to claim reward when coordinates are for discs of different players", async () => {
    await startGame();
    await p1ConnectFour.playMove(0, 0);
    await p2ConnectFour.playMove(0, 0);
    await p1ConnectFour.playMove(0, 0);
    await p2ConnectFour.playMove(0, 0);

    await expect(p2ConnectFour.claimReward(0, player2, 0, 0, Direction.Up)).to
      .be.reverted;
  });

  it("should fail to claim reward when four-in-a-row is for the discs of opposing player", async () => {
    await startGame();
    await p1ConnectFour.playMove(0, 0);
    await p2ConnectFour.playMove(0, 1);
    await p1ConnectFour.playMove(0, 0);
    await p2ConnectFour.playMove(0, 1);
    await p1ConnectFour.playMove(0, 0);
    await p2ConnectFour.playMove(0, 1);
    await p1ConnectFour.playMove(0, 0);

    await expect(p2ConnectFour.claimReward(0, player2, 0, 0, Direction.Up)).to
      .be.reverted;
  });

  it("should correctly claim reward in right direction", async () => {
    const player1BalanceBefore = await provider.getBalance(player1);
    await p1ConnectFour.initializeGame({
      value: ethers.utils.parseUnits("1.0"),
    });
    await p2ConnectFour.startGame(0, { value: ethers.utils.parseUnits("1.0") });
    await p1ConnectFour.playMove(0, 0);
    await p2ConnectFour.playMove(0, 5);
    await p1ConnectFour.playMove(0, 1);
    await p2ConnectFour.playMove(0, 5);
    await p1ConnectFour.playMove(0, 2);
    await p2ConnectFour.playMove(0, 5);
    await p1ConnectFour.playMove(0, 3);

    await expect(p1ConnectFour.claimReward(0, player1, 0, 0, Direction.Right))
      .to.emit(p1ConnectFour, "RewardClaimed")
      .withArgs(0, player1, player1, ethers.utils.parseUnits("2.0"));

    const player1BalanceAfter = await provider.getBalance(player1);
    expect(player1BalanceAfter.sub(player1BalanceBefore)).to.be.closeTo(
      ethers.utils.parseUnits("1.0"),
      ethers.utils.parseUnits("0.001").toNumber()
    );

    const contractBalanceAfter = await provider.getBalance(
      p1ConnectFour.address
    );
    expect(contractBalanceAfter).to.equal(0);
  });

  it("should correctly claim reward in up direction", async () => {
    const player1BalanceBefore = await provider.getBalance(player1);
    await p1ConnectFour.initializeGame({
      value: ethers.utils.parseUnits("1.0"),
    });
    await p2ConnectFour.startGame(0, { value: ethers.utils.parseUnits("1.0") });
    await p1ConnectFour.playMove(0, 0);
    await p2ConnectFour.playMove(0, 5);
    await p1ConnectFour.playMove(0, 0);
    await p2ConnectFour.playMove(0, 5);
    await p1ConnectFour.playMove(0, 0);
    await p2ConnectFour.playMove(0, 5);
    await p1ConnectFour.playMove(0, 0);

    await expect(p1ConnectFour.claimReward(0, player1, 0, 0, Direction.Up))
      .to.emit(p1ConnectFour, "RewardClaimed")
      .withArgs(0, player1, player1, ethers.utils.parseUnits("2.0"));

    const player1BalanceAfter = await provider.getBalance(player1);
    expect(player1BalanceAfter.sub(player1BalanceBefore)).to.be.closeTo(
      ethers.utils.parseUnits("1.0"),
      ethers.utils.parseUnits("0.001").toNumber()
    );

    const contractBalanceAfter = await provider.getBalance(
      p1ConnectFour.address
    );
    expect(contractBalanceAfter).to.equal(0);
  });

  it("should correctly claim reward in left diagonal direction", async () => {
    const player1BalanceBefore = await provider.getBalance(player1);
    await p1ConnectFour.initializeGame({
      value: ethers.utils.parseUnits("1.0"),
    });
    await p2ConnectFour.startGame(0, { value: ethers.utils.parseUnits("1.0") });
    await p1ConnectFour.playMove(0, 5);
    await p2ConnectFour.playMove(0, 4);
    await p1ConnectFour.playMove(0, 4);
    await p2ConnectFour.playMove(0, 3);
    await p1ConnectFour.playMove(0, 3);
    await p2ConnectFour.playMove(0, 1);
    await p1ConnectFour.playMove(0, 3);
    await p2ConnectFour.playMove(0, 2);
    await p1ConnectFour.playMove(0, 2);
    await p2ConnectFour.playMove(0, 2);
    await p1ConnectFour.playMove(0, 2);

    await expect(
      p1ConnectFour.claimReward(0, player1, 5, 0, Direction.LeftDiagonal)
    )
      .to.emit(p1ConnectFour, "RewardClaimed")
      .withArgs(0, player1, player1, ethers.utils.parseUnits("2.0"));

    const player1BalanceAfter = await provider.getBalance(player1);
    expect(player1BalanceAfter.sub(player1BalanceBefore)).to.be.closeTo(
      ethers.utils.parseUnits("1.0"),
      ethers.utils.parseUnits("0.001").toNumber()
    );

    const contractBalanceAfter = await provider.getBalance(
      p1ConnectFour.address
    );
    expect(contractBalanceAfter).to.equal(0);
  });

  it("should correctly claim reward in right diagonal direction", async () => {
    const player1BalanceBefore = await provider.getBalance(player1);
    await p1ConnectFour.initializeGame({
      value: ethers.utils.parseUnits("1.0"),
    });
    await p2ConnectFour.startGame(0, { value: ethers.utils.parseUnits("1.0") });
    await p1ConnectFour.playMove(0, 0);
    await p2ConnectFour.playMove(0, 1);
    await p1ConnectFour.playMove(0, 1);
    await p2ConnectFour.playMove(0, 2);
    await p1ConnectFour.playMove(0, 2);
    await p2ConnectFour.playMove(0, 5);
    await p1ConnectFour.playMove(0, 2);
    await p2ConnectFour.playMove(0, 3);
    await p1ConnectFour.playMove(0, 3);
    await p2ConnectFour.playMove(0, 3);
    await p1ConnectFour.playMove(0, 3);

    await expect(
      p1ConnectFour.claimReward(0, player1, 0, 0, Direction.RightDiagonal)
    )
      .to.emit(p1ConnectFour, "RewardClaimed")
      .withArgs(0, player1, player1, ethers.utils.parseUnits("2.0"));
    const player1BalanceAfter = await provider.getBalance(player1);
    expect(player1BalanceAfter.sub(player1BalanceBefore)).to.be.closeTo(
      ethers.utils.parseUnits("1.0"),
      ethers.utils.parseUnits("0.001").toNumber()
    );

    const contractBalanceAfter = await provider.getBalance(
      p1ConnectFour.address
    );
    expect(contractBalanceAfter).to.equal(0);
  });
});
