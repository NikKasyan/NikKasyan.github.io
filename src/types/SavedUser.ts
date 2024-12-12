type Base64String = string;
export type SavedUser = {
    id: number;
    name: string;
    bio: string;
    posts: SavedPost[];
    profilePicture: Base64String;
}

export type SavedPost = {
    id: number;
    timestamp: number;
    posterId: SavedUser['id'];
    replyToId?: SavedPost['id'];
    likes: number;
    dislikes: number;
    content: string;
}

export type PostWithReplies = SavedPost & {
    replies: PostWithReplies[];
}

