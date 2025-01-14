import { createContext, ParentComponent, useContext } from "solid-js";
import { SavedUser } from "../../../types/SavedUser";
import { UpdateLevelFunction, useLevelContext } from "./LevelContext";
import { usePostContext } from "./PostContext";

export type UserContextType = {
    user: SavedUser;
    updateUser: (updateUserFn: (user: SavedUser) => unknown) => void;
    deleteUser: () => void;
}

interface UserContextProviderProps {
    user: SavedUser;
}

export const UserContextProvider: ParentComponent<UserContextProviderProps> = (props) => {

    const { updateLevel, } = useLevelContext()
    return (
        <UserContext.Provider value={createUserContext(props.user, updateLevel)}>
            {props.children}
        </UserContext.Provider>
    )
}


export const createUserContext = (user: SavedUser, updateLevel: UpdateLevelFunction): UserContextType => {
	const postContext = usePostContext();
    const updateUser = (updateUserFn: (user: SavedUser) => void) => {
        updateLevel(level => {
            const users = level.users;
            const index = users.findIndex(u => u.id === user.id);
            updateUserFn(users[index]);
        })
    }


    const deleteUser = () => {
        updateLevel(level => {
            const users = level.users;
            const index = users.findIndex(u => u.id === user.id);
            const posts = users[index].posts;
            posts.forEach(p => {
                postContext.deletePost(p.id, posts);
            })
            users.splice(index, 1);
        })
    }
	


    return {
        user,
        updateUser,
        deleteUser,
    }

}


const UserContext = createContext<UserContextType | undefined>(undefined);
export const useUserContext = () => {
    const context = useContext(UserContext);
    if (!context) {
        throw new Error("UserContext not found")
    }
    return context;
}