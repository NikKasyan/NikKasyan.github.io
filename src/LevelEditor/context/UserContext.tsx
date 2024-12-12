import { createContext, createMemo, ParentComponent, useContext } from "solid-js";
import { SavedPost, SavedUser } from "../../types/SavedUser";
import { SavedLevel } from "../../types/SavedLevel";
import { UpdateLevelFunction, useLevelContext } from "./LevelContext";

export type UserContextType = {
    user: SavedUser;
    users: SavedUser[];
    level: SavedLevel;

    updateUser: (updateUserFn: (user: SavedUser) => unknown) => void;
    deleteUser: () => void;
    getUser: (userId: number) => SavedUser;

    allPosts: () => SavedPost[];
    addPost: (userId: number, replyToPost?: number) => void;
    addCompletePost: (post: SavedPost) => void;
    deletePost: (postId: number) => void;
    updatePost: (postId: number, updatePostFn: (post: SavedPost) => unknown) => void;
    getRepliesToPost: (postId: number) => SavedPost[];
    getPost: (postId: number) => SavedPost;

}

interface UserContextProviderProps {
    user: SavedUser;
}

export const UserContextProvider: ParentComponent<UserContextProviderProps> = (props) => {

    const { level, updateLevel } = useLevelContext()
    return (
        <UserContext.Provider value={createUserContext(level, props.user, updateLevel)}>
            {props.children}
        </UserContext.Provider>
    )
}


export const createUserContext = (level: SavedLevel, user: SavedUser, updateLevel: UpdateLevelFunction): UserContextType => {
    const users = level.users;
    const updateUser = (updateUserFn: (user: SavedUser) => void) => {
        updateLevel(level => {
            const users = level.users;
            const index = users.findIndex(u => u.id === user.id);
            updateUserFn(users[index]);
        })
    }

    const allPosts = createMemo(() => users.flatMap(u => u.posts));
    const getUser = (userId: number) => users.find(u => u.id === userId)!;

    const getRepliesToPost = (postId: number) => {
        return allPosts().filter(p => p.replyToId === postId);
    }

    const deleteUser = () => {
        updateLevel(level => {
            const users = level.users;
            const index = users.findIndex(u => u.id === user.id);
            const posts = users[index].posts;
            posts.forEach(p => {
                deletePost(p.id, posts);
            })
            users.splice(index, 1);
        })
    }

    const addPost = (userId: number, replyToPost?: number) => {
        updateLevel(level => {
            const users = level.users;
            const index = users.findIndex(u => u.id === userId);
            users[index].posts.push({
                id: getNewPostId(allPosts()),
                content: "",
                posterId: userId,
                replyToId: replyToPost,
                timestamp: Date.now(),
                likes: 0,
                dislikes: 0
            });
        })
    }

    const getPost = (postId: number) => {
        return allPosts().find(p => p.id === postId)!;
    }

    const addCompletePost = (post: SavedPost): SavedPost => {
        updateLevel(level => {
            const users = level.users;
            if (post.id === -1)
                post.id = getNewPostId(allPosts());
            const userIndex = users.findIndex(u => u.id === post.posterId);
            users[userIndex].posts.push({ ...post });
        })
        return post;
    }


    const deletePost = (postId: number, posts?: SavedPost[]) => {
        updateLevel(level => {
            const users = level.users;
            if (posts === undefined)
                posts = allPosts()
            const post = posts.find(p => p.id === postId)!;
            const poster = users.find(u => u.id === post.posterId)!;
            poster.posts = poster.posts.filter(p => p.id !== postId);
            const replies = getRepliesToPost(post.id);
            replies.forEach(r => deletePost(r.id, posts));
        });
    }

    const updatePost = (postId: number, updatePostFn: (post: SavedPost) => unknown) => {
        updateLevel(level => {
            const users = level.users;
            const post = users.flatMap(u => u.posts).find(p => p.id === postId)!;
            const userIndex = users.findIndex(u => u.id === post.posterId);
            const postIndex = users[userIndex].posts.findIndex(p => p.id === post.id);
            const oldPosterId = post.posterId; 
            updatePostFn(post);
            if (oldPosterId !== post.posterId) {
                const oldUserIndex = users.findIndex(u => u.id === oldPosterId);
                users[oldUserIndex].posts = users[oldUserIndex].posts.filter(p => p.id !== post.id);
                addCompletePost(post);
            } else {
                users[userIndex].posts[postIndex] = post;
            }
        })
    }

    return {
        user,
        users,
        level,
        updateUser,
        deleteUser,
        addPost,
        addCompletePost,
        deletePost,
        updatePost,
        allPosts,
        getRepliesToPost,
        getUser,
        getPost
    }

}

const getNewPostId = (posts: SavedPost[]) => {
    return posts.reduce((max, post) => Math.max(max, post.id), 0) + 1
}

const UserContext = createContext<UserContextType | undefined>(undefined);
export const useUserContext = () => {
    const context = useContext(UserContext);
    if (!context) {
        throw new Error("UserContext not found")
    }
    return context;
}