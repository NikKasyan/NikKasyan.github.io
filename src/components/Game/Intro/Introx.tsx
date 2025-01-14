import { Component } from "solid-js";
import { useGameStateManager } from "../phone/GameStateContext";
import { State } from "../../../types/SavedGameState";
import "./Intro.css";
export const Intro: Component = () => {
    const gameState = useGameStateManager()
    return (
        <div id="intro">
            <h1>Welcome to the game!</h1>
            <div class="intro-content">
                <p>{gameState.gameState.level.intro}</p>
                <div>
                    <button onClick={() => {
                        gameState.updateGameState((g) => {
                            g.state = State.GAME;
                        })
                    }}>Start Game</button>
                </div>
            </div>
        </div>
    )
}