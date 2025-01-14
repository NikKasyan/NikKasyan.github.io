import { SavedPost } from "../../../types/SavedUser";
import { useLevelContext } from "./LevelContext";

export interface PostContextType {


	addPost: (userId: number, replyToPost?: number) => void;
	addCompletePost: (post: SavedPost) => void;
	deletePost: (postId: number, savedPosts?: SavedPost[]) => void;
	updatePost: (postId: number, updatePostFn: (post: SavedPost) => unknown) => void;
	createNewPost: (userId: number) => SavedPost;
}
export const usePostContext = (): PostContextType => {
	const context = useLevelContext();
	if (!context) {
		throw new Error("LevelContext not found")
	}
	const updateLevel = context.updateLevel;
	const allPosts = context.allPosts;
	const createNewPost = (userId: number) => {
		return {
			id: getNewPostId(context.allPosts()),
			content: "",
			posterId: userId,
			replyToId: undefined,
			timestamp: Date.now(),
			likes: 0,
			dislikes: 0
		}
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
            const replies = context.getRepliesToPost(post.id);
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
                users[userIndex].posts[postIndex] = post; // Todo: Check if this doesn't lead to bugs
            }
        })
    }
	return {
		addPost,
		addCompletePost,
		deletePost,
		updatePost,
		createNewPost
	}
}


const getNewPostId = (posts: SavedPost[]) => {
	return posts.reduce((max, post) => Math.max(max, post.id), 0) + 1
}