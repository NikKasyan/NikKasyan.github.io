import { StatusBar } from "./StatusBar"
import "./Phone.css"
import { Component, JSX } from "solid-js";
import { Display } from "./Display";
import { YApp } from "../Y/YApp";
import { GameStateManagerContextProvider } from "./GameStateContext";
import { createStore } from "solid-js/store";
import { createDefaultGameState, GameState } from "../types/GameState";
interface DisplayProps {
    width?: number;
    height?: number;
}

export const Phone: Component<DisplayProps> = ({ width, height }) => {
    const style: JSX.CSSProperties = {
        width: width ? `${width}px` : "100%",
        height: height ? `${height}px` : "100%",
        "border-radius": "10px",
    }
    const [gameState, setGameState] = createStore<GameState>(createDefaultGameState())
    return (
        <GameStateManagerContextProvider gameState={gameState} setGameState={setGameState}>
            <main id="phone" style={style}>
                <StatusBar timeInMinutes={gameState.phone.timeInMinutes} 
                    batteryPercentage={gameState.phone.battery}
                    wifi={{ enabled: true, strength: 5 }}
                    network={{ strength: 5, type: "5G" }}
                />
                <Display>
                    <YApp />
                </Display>
            </main>
        </GameStateManagerContextProvider>
    )
}