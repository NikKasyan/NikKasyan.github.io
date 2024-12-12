import SavedL from "../level.json";
import { parseFromSavedLevel, Post, User } from "../types/Level";
import { SavedLevel } from "../types/SavedLevel";
import { SavedPost } from "../types/SavedUser";

const Level = parseFromSavedLevel(SavedL as SavedLevel)

export const getBottomPosts = (): Post[] => {
    const posts = getAllPosts()
    return posts.filter((post) => !posts.some((p) => p.replyTo?.id === post.id))
}

const getAllPosts = (): Post[] => {
    return Level.posts
}

const postUserMap = new Map<number, User>()
export const getUserByPost = (post: SavedPost): User => {
    if (postUserMap.has(post.posterId)) {
        return postUserMap.get(post.posterId)!
    }
    const user = Level.users.find((user) => user.id === post.posterId)
    if (!user) {
        throw new Error("User not found")
    }
    postUserMap.set(post.posterId, user)
    return user
}

export const getUser = (userId: number) => {
    return Level.users.find((user) => user.id === userId)
}

export const getAllPostsRepliedTo = (userId: number)=> {
    const posts = getAllPosts()
    return posts.filter((post) => post.poster.id === userId && post.replyTo?.id !== undefined)    
    
}



