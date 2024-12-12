import { createContext, ParentComponent, useContext } from "solid-js";
import { GameState } from "../types/GameState";
import { produce, SetStoreFunction } from "solid-js/store";

interface GameStateManager {
    gameState: GameState;
    updateGameState: (updateGameStateFn: (gameState: GameState) => unknown) => void;
}

interface GameStateContextProviderProps {
    gameState: GameState;
    setGameState: SetStoreFunction<GameState>;
}
export const GameStateManagerContextProvider: ParentComponent<GameStateContextProviderProps> = (props) => {

    return (
        <GameStateContext.Provider value={createGameStateManager(props.gameState, props.setGameState)}>
            {props.children}
        </GameStateContext.Provider>
    )
}

const createGameStateManager = (gameState: GameState, setGameState: SetStoreFunction<GameState>): GameStateManager => {
    return {
        gameState,
        updateGameState: (updateGameStateFn: (gameState: GameState) => void) => {
            setGameState(produce(gameState => {
                updateGameStateFn(gameState);
            }))
        }
    }
}

const GameStateContext = createContext<GameStateManager | undefined>(undefined);


export const useGameStateManagerContext = () => {
    const context = useContext(GameStateContext);
    if (!context) {
        throw new Error("useGameStateContext must be used within a GameStateContextProvider");
    }
    return context;
}