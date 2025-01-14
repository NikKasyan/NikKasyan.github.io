import Default from "../level.json"
import { createDefaultGameState, SavedGameState } from "../types/SavedGameState"
import { SavedLevel } from "../types/SavedLevel"

const DefaultLevel = Default as SavedLevel
const GAME_STATE_KEY = "gameState"


export const getSavedGameState = (savedLevel: SavedLevel = DefaultLevel): SavedGameState => {
    const savedGameState = localStorage.getItem(GAME_STATE_KEY)
    const gameState: SavedGameState = savedGameState ? JSON.parse(savedGameState) : createDefaultGameState(savedLevel)
	return gameState
}

export const hasSavedGameState = () => {
    return localStorage.getItem(GAME_STATE_KEY) !== null
}
export const saveGameState = (gameState: unknown) => {
    localStorage.setItem(GAME_STATE_KEY, JSON.stringify(gameState))
}

export const resetGameState = () => {
    localStorage.removeItem(GAME_STATE_KEY)
}

