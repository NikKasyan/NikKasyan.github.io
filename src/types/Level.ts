import { SavedLevel } from "./SavedLevel";
import { SavedPost, SavedUser } from "./SavedUser";

export interface Level {
    background: string;
	intro: string;
    users: User[];
    posts: Post[];
}

export interface User {
    id: number;
    name: string;
    bio: string;
    posts: Post[];
    profilePicture: string;
	verified: boolean;
}


export interface Post {
    id: number;
    timestamp: number;
    poster: User;
    replyTo?: Post;
    content: string;
    replies: Post[];
    likes: number;
    dislikes: number;
}

export const parseFromSavedLevel = (savedLevel: SavedLevel): Level => {
    return new LevelParser().parse(savedLevel)
}

class LevelParser {
    users: Map<number, User> = new Map()
    posts: Map<number, Post> = new Map()
    parse(savedLevel: SavedLevel): Level {
        const level = this.parseFromSavedLevel(savedLevel)
        level.posts = Array.from(this.posts.values())
		const savedPosts = savedLevel.users.flatMap(user => user.posts)
        this.setReplies(level.users, savedPosts)
        this.setPosters(level.users, level.posts)
        return level
    }

    setPosters(users: User[], posts: Post[]) {
        posts.forEach((post) => {
            const user = users.find((user) => user.id === post.poster.id)
            if (!user) {
                throw new Error("User not found")
            }

            post.poster = user
            const existingPost = user.posts.find((existingPost) => existingPost.id === post.id)
            if (existingPost) {
                return
            }
            user.posts.push(post)
        })


    }

    parseFromSavedLevel(savedLevel: SavedLevel): Level {
        return {
			intro: savedLevel.intro,
            background: savedLevel.background,
            users: savedLevel.users.map((savedUser) => this.parseUser(savedUser)),
            posts: []
        }
    }

    parseUser(savedUser: SavedUser): User {
        if (this.users.has(savedUser.id)) {
            return this.users.get(savedUser.id)!
        }
        const user: User = {
            id: savedUser.id,
            name: savedUser.name,
            profilePicture: savedUser.profilePicture,
            bio: savedUser.bio ?? "",
            posts: [],
			verified: savedUser.verified ?? false
        }
        this.users.set(savedUser.id, user)
        user.posts = savedUser.posts.map((savedPost) => this.parsePost(savedPost))
        return user
    }

    parsePost(savedPost: SavedPost): Post {
        if (this.posts.has(savedPost.id)) {
            return this.posts.get(savedPost.id)!
        }


        const post: Post = {
            id: savedPost.id,
            timestamp: savedPost.timestamp ?? Date.now(),
            poster: { id: savedPost.posterId, name: "", profilePicture: "", posts: [], bio: "", verified: false },
            replyTo: savedPost.replyToId ? this.posts.get(savedPost.replyToId) : undefined,
            content: savedPost.content,
            likes: savedPost.likes ?? 0,
            dislikes: savedPost.dislikes ?? 0,
            replies: []
        }
        this.posts.set(savedPost.id, post)
        return post
    }

    setReplies(users: User[], savedPosts: SavedPost[]) {
        users.forEach((user) => {
            user.posts.forEach((post) => {

				if(post.replyTo === undefined) {
					const savedPost = savedPosts.find((savedPost) => savedPost.id === post.id)
					if (!savedPost) {
						throw new Error("Post not found")
					}
					if (savedPost.replyToId) {
						post.replyTo = this.posts.get(savedPost.replyToId)
					}
				}

                if (post.replyTo) {
                    const replyToPost = this.posts.get(post.replyTo.id)
                    if (!replyToPost) {
                        throw new Error("Post not found")
                    }
                    replyToPost.replies.push(post)
                }
            })
        })
    }
}