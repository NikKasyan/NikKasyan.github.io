import { SavedLevel } from "./SavedLevel";

export interface PhoneState {
    battery: number;
    signal: number;
    timeInMinutes: number;
}

enum State {
    INTRO,
    GAME,
    DECISION,
    END
}

export interface GameState {
    level: SavedLevel;
    phone: PhoneState;
    state: State;
}

export const createDefaultGameState = (): GameState => {
    return {
        level: {
            background: "white",
            users: []
        },
        phone: {
            battery: 69,
            signal: 5,
            timeInMinutes: 13 * 60 + 37,
        },
        state: State.INTRO
    }
};