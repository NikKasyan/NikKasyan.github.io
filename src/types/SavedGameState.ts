import { SavedLevel } from "./SavedLevel";

export interface PhoneState {
    battery: number;
    network: {
        type: "4G" | "3G" | "2G";
        strength: number;
    }
    timeInMinutes: number;
    wifi?: {
        enabled: boolean;
        strength: number;
    }
}

export enum SurveyDecision {
	STRONGLY_AGREE,
	AGREE,
	NEUTRAL,
	DISAGREE,
	STRONGLY_DISAGREE
}

export enum State {
    INTRO,
    GAME,
	SURVEY,
    DECISION,
	RESULT,
}

export interface SavedGameState {
    level: SavedLevel;
    phone: PhoneState;
    state: State;
	clickedUsers: number[];
	surveyDecisions: SurveyDecision[][];
	passedTime: number;

}

export const createDefaultGameState = (savedLevel: SavedLevel): SavedGameState => {
    return {
        level: savedLevel,
        phone: {
            battery: 69,
            network: {
                type: "4G",
                strength: 5
            },
            wifi: {
                enabled: true,
                strength: 5
            },
            timeInMinutes: 13 * 60 + 37,
        },
        state: State.INTRO,
		clickedUsers: [],
		surveyDecisions: [],
		passedTime: 0
    }
};