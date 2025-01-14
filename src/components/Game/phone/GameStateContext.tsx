import { createContext, ParentComponent, useContext } from "solid-js";
import { createStore, produce, SetStoreFunction } from "solid-js/store";
import { saveGameState } from "../../../storage";
import { Level, parseFromSavedLevel, Post, User } from "../../../types/Level";
import { SavedGameState, State } from "../../../types/SavedGameState";

interface GameStateManager {
	gameState: SavedGameState;
	level: Level;
	updateGameState: (updateGameStateFn: (gameState: SavedGameState) => unknown) => void;
	getUser: (userId: number) => User;
	getBottomPosts: () => Post[];
	getAllPosts: () => Post[];
	increaseTime: () => void;
	addVisitedUser: (userId: number) => void;

}


interface GameStateContextProviderProps {
	gameState: SavedGameState;
	setGameState: SetStoreFunction<SavedGameState>;
}

export const TIME_INCREMENT = 5;
export const SURVEY_INTERVAL = 120;
const END_TIME = 360;

export const GameStateManagerContextProvider: ParentComponent<GameStateContextProviderProps> = (props) => {

	return (
		<GameStateContext.Provider value={createGameStateManager(props.gameState, props.setGameState)}>
			{props.children}
		</GameStateContext.Provider>
	)
}

const createGameStateManager = (gameState: SavedGameState, setGameState: SetStoreFunction<SavedGameState>): GameStateManager => {
	const [level, setLevel] = createStore(parseFromSavedLevel(gameState.level));
	const getBottomPosts = () => {
		const posts = getAllPosts()
		return posts.filter((post) => !posts.some((p) => p.replyTo?.id === post.id))
	}

	const getAllPosts = () => {
		return level.posts
	}

	const getUser = (userId: number) => {
		if (hasDuplicate(level.users)) { // Weird bug where users are duplicated
			const level = parseFromSavedLevel(gameState.level)
			setLevel(parseFromSavedLevel(gameState.level))
			return level.users.find((user) => user.id === userId)!
		}
		return level.users.find((user) => user.id === userId)!
	}

	const updateGameState = (updateGameStateFn: (gameState: SavedGameState) => void) => {
		setGameState(produce(gameState => {
			updateGameStateFn(gameState);

			saveGameState(gameState);
		}))
	}

	const increaseTime = () => {
		updateGameState((g) => {
			g.phone.timeInMinutes += TIME_INCREMENT;
			g.passedTime += TIME_INCREMENT;
			if(g.passedTime % SURVEY_INTERVAL === 0) {
				g.state = State.SURVEY;
			}
			if(g.passedTime >= END_TIME) {
				g.state = State.DECISION;
			}
		})
	}

	const addVisitedUser = (userId: number) => {
		updateGameState((g) => {
			g.clickedUsers.push(userId);
		})
	}

	return {
		gameState,
		level,
		updateGameState,
		getUser,
		getBottomPosts,
		getAllPosts,
		increaseTime,
		addVisitedUser

	}
}

const GameStateContext = createContext<GameStateManager | undefined>(undefined);

const hasDuplicate = (users: User[]) => {
	const seen = new Set<number>()
	for (const user of users) {
		if (seen.has(user.id)) {
			return true
		}
		seen.add(user.id)
	}
	return false
}

export const useGameStateManager = () => {
	const context = useContext(GameStateContext);
	if (!context) {
		throw new Error("useGameStateContext must be used within a GameStateContextProvider");
	}
	return context;
}