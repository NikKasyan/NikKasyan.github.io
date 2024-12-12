import { createContext, ParentComponent, useContext } from "solid-js";
import { produce, SetStoreFunction } from "solid-js/store";
import { SavedLevel } from "../../types/SavedLevel";
import { SavedUser } from "../../types/SavedUser";
import { randomName } from "../../util/nameGenerator";
import { createRandomAvatar } from "../../util/imageGenerator";
import { saveEditorLevel } from "../../storage";


export type UpdateLevelFunction = (updateLevelFnOrLevel: SavedLevel | ((level: SavedLevel) => unknown)) => void;
type UpdateLevelFunctionParam = Parameters<UpdateLevelFunction>[0];

const isUpdateFunction = (updateLevelFnOrLevel: UpdateLevelFunctionParam): updateLevelFnOrLevel is (level: SavedLevel) => unknown => {
    return typeof updateLevelFnOrLevel === "function"
}

export type LevelContextType = {
    level: SavedLevel;
    updateLevel: UpdateLevelFunction;
    createNewUser: () => void;
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
                profilePicture: createRandomAvatar()
            })
        })
    }
    return {
        level,
        updateLevel,
        createNewUser: addUser
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