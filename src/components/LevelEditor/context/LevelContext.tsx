import { createContext, createMemo, ParentComponent, useContext } from "solid-js";
import { produce, SetStoreFunction } from "solid-js/store";
import { SavedLevel } from "../../../types/SavedLevel";
import { SavedPost, SavedUser } from "../../../types/SavedUser";
import { randomName } from "../../../util/nameGenerator";
import { createRandomAvatar } from "../../../util/imageGenerator";
import { saveEditorLevel } from "../../../storage";


export type UpdateLevelFunction = (updateLevelFnOrLevel: SavedLevel | ((level: SavedLevel) => unknown)) => void;
type UpdateLevelFunctionParam = Parameters<UpdateLevelFunction>[0];

const isUpdateFunction = (updateLevelFnOrLevel: UpdateLevelFunctionParam): updateLevelFnOrLevel is (level: SavedLevel) => unknown => {
	return typeof updateLevelFnOrLevel === "function"
}

export type LevelContextType = {
	level: SavedLevel;
	updateLevel: UpdateLevelFunction;
	createNewUser: () => void;
	getUser: (userId: number) => SavedUser;


	getRepliesToPost: (postId: number) => SavedPost[];
	getPost: (postId: number) => SavedPost;
	allPosts: () => SavedPost[];
}

interface LevelContextProviderProps {
	level: SavedLevel;
	setLevel: SetStoreFunction<SavedLevel>;
}


const nextUserId = (users: SavedUser[]) => {
	const maxId = users.reduce((max, user) => Math.max(max, user.id), 0)
	return maxId + 1
}

export const LevelContextProvider: ParentComponent<LevelContextProviderProps> = (props) => {
	return (
		<LevelContext.Provider value={createLevelContext(props.level, props.setLevel)}>
			{props.children}
		</LevelContext.Provider>
	)
}

export const createLevelContext = (level: SavedLevel, setLevel: SetStoreFunction<SavedLevel>): LevelContextType => {

	const updateLevel: UpdateLevelFunction = (updateLevelFn) => {
		if (!isUpdateFunction(updateLevelFn)) {
			setLevel(updateLevelFn)
		} else {
			setLevel(produce(level => {
				updateLevelFn(level);
			}))
		}

		checkUsersUnique(level.users)
		saveEditorLevel(level)
	}

	const addUser = () => {
		updateLevel(level => {
			const users = level.users

			users.push({
				id: nextUserId(users),
				name: randomName(),
				bio: "",
				posts: [],
				profilePicture: createRandomAvatar(),
				verified: false
			})
		})
	}

	const getUser = (userId: number) => {
		return level.users.find(u => u.id === userId)!
	}

	const allPosts = createMemo(() => level.users.flatMap(u => u.posts));

	const getPost = (postId: number) => {
		return allPosts().find(p => p.id === postId)!;
	}

	const getRepliesToPost = (postId: number) => {
		return allPosts().filter(p => p.replyToId === postId);
	}

	return {
		level,

		updateLevel,
		createNewUser: addUser,
		getUser,

		getRepliesToPost,
		getPost,
		allPosts
	}

}

export const checkUsersUnique = (users: SavedUser[]) => {
	const ids = new Set<number>()
	for (const user of users) {
		if (ids.has(user.id)) {
			throw new Error("User ids must be unique")
		}
		ids.add(user.id)
	}
}


const LevelContext = createContext<LevelContextType | undefined>(undefined);
export const useLevelContext = () => {
	const context = useContext(LevelContext);
	if (!context) {
		throw new Error("LevelContext not found")
	}
	return context;
}