import { A } from "@solidjs/router";
import { Component, createMemo, createSignal, For, Show } from "solid-js";
import { createStore, produce, SetStoreFunction } from "solid-js/store";
import { ThumbsDownIcon, ThumbsUpIcon } from "../../Icon/ThumbsIcon";
import { SavedPost } from "../../types/SavedUser";
import { UserContextType, useUserContext } from "../context/UserContext";
import "./PostEditor.css";
import { AutoCompleteSelect } from "./UserSelection";


type PostUpdateFunction = (updateFun: (post: SavedPost) => unknown) => void;
type PostActions = {
    onDelete?: () => void;
    onUpdate: PostUpdateFunction;
    onCreate?: () => void;
    onReply?: () => void;
}

interface PostProps {
    post: SavedPost;
    isReply?: boolean;
    isReplyTo?: boolean;
}

export const NewPostComponent: Component = () => {
    const userContext = useUserContext();
    const [post, setPost] = createStore<SavedPost>(createNewPost(userContext.user.id));
    const actions = createNewPostActions(post, setPost, userContext);
    return <DetailedPostComponent post={post} actions={actions} />
}

const createNewPostActions = (post: SavedPost, setPost: SetStoreFunction<SavedPost>, userContext: UserContextType): PostActions => {
    return {
        onUpdate: (updateFun) => {
            setPost(produce((post) => {
                updateFun(post);
                return post;
            }))
        },
        onCreate: () => {
            userContext.addCompletePost(post);
            setPost(createNewPost(userContext.user.id));
        }
    }
}

export const EditPostComponent: Component<PostProps> = (props) => {
    const userContext = useUserContext();
    return <DetailedPostComponent post={props.post} actions={createEditPostActions(props.post, userContext)} isReply={props.isReply} isReplyTo={props.isReplyTo} />
}

const createEditPostActions = (post: SavedPost, userContext: UserContextType): PostActions => {
    return {
        onDelete: () => {
            console.log("delete post", post.id);
            userContext.deletePost(post.id);
        },
        onUpdate: (updateFun) => userContext.updatePost(post.id, updateFun),
        onReply: () => { throw new Error("Not implemented") }
    }
}

interface DetailedPostProps extends PostProps {
    actions: PostActions;
}

export const DetailedPostComponent: Component<DetailedPostProps> = (props) => {
    if (props.actions.onCreate !== undefined && props.actions.onReply !== undefined) {
        throw new Error("onReply must be implemented if onCreate is not");
    }
    const isNew = props.actions.onCreate !== undefined;
    const { user, users, updatePost, getRepliesToPost, getUser, addCompletePost, getPost } = useUserContext();
    const replies = createMemo(() => sortedPosts(getRepliesToPost(props.post.id)));

    const [selectedUserId, setSelectedUserId] = createSignal(props.post.posterId);
    const selectedUser = createMemo(() => getUser(selectedUserId()));
    const [showReplies, setShowReplies] = createSignal(false);

    const reply = createMemo(() => props.post.replyToId ? getPost(props.post.replyToId) : undefined);

    return (
        <div class="level-editor-post post" id={createPostHtmlId(props.post, props.isReply)} style={{ border: props.isReplyTo ? "none" : undefined }}>
            <Show when={!isNew} fallback={<span>New Post:</span>}>
                <AutoCompleteSelect post={props.post} users={users} selectedUser={selectedUser()} onSelect={(user) => {
                    setSelectedUserId(user.id);
                }}
                    onPostChange={(u) => {
                        updatePost(props.post.id, (post) => post.posterId = u.id);
                    }} />
            </Show>
            <Show when={props.isReply}>
                <A href={`/editor/${props.post.posterId}#${createPostHtmlId(props.post, false)}`}>Show original post</A>
            </Show>
            <Show when={props.actions.onDelete !== undefined}>
                <button class="post-edit-delete" onClick={props.actions.onDelete}>&times;</button>
            </Show>
            <textarea value={props.post.content} onInput={(e) => {
                const target = e.target as HTMLTextAreaElement;
                props.actions.onUpdate((post) => post.content = target.value);
            }} />

            <Show when={reply() !== undefined && !props.isReply && !props.isReplyTo}>
                <div class="post-edit-reply-to">
                    <EditPostComponent post={reply()!} isReplyTo />
                    <A href={`/editor/${reply()!.posterId}#${createPostHtmlId(reply()!, false)}`}>Show original post</A>
                </div>
            </Show>
            <div class="post-edit-info">
                <div class="post-edit-timestamp">
                    <label>Timestamp:</label>

                    <input type="datetime-local" value={toLocalTime(props.post.timestamp)} onInput={(e) => {
                        const target = e.target as HTMLInputElement;
                        const timestamp = new Date(target.value).getTime();
                        props.actions.onUpdate((post) => post.timestamp = timestamp);
                    }} />
                </div>
                <div class="post-edit-reactions">
                    <Show when={!isNew && !props.isReplyTo}>
                        <button onClick={() => {
                            if (!showReplies())
                                setShowReplies(true);
                            const post = createNewPost(user.id);
                            post.replyToId = props.post.id;
                            addCompletePost(post);
                            setTimeout(() => {
                                const htmlId = createPostHtmlId(post, true);
                                window.scrollTo({ top: document.getElementById(htmlId)?.offsetTop, behavior: "smooth" });
                                const input = document.getElementById(htmlId)?.querySelector("textarea");
                                input?.focus();
                            }, 0)
                        }}>
                            Reply
                        </button>
                    </Show>
                    <Show when={!props.isReplyTo}>
                        <button onClick={() => {
                            if (props.actions.onReply !== undefined) {
                                setShowReplies((replies) => !replies);
                            }
                            if (props.actions.onCreate !== undefined) {
                                props.actions.onCreate();
                            }

                        }} disabled={(isNew && props.post.content.length === 0) || (!isNew && replies().length == 0)}>
                            {isNew ? "Post" : `${showReplies() ? "Hide" : "Show"} ${replies().length} replies`}
                        </button>
                    </Show>
                    <div class="reaction">
                        <input class="reaction-input" type="number" value={props.post.likes} onInput={(e) => {
                            const target = e.target as HTMLInputElement;
                            props.actions.onUpdate((post) => post.likes = parseInt(target.value));
                        }} min={0} max={1000000} />
                        <span class="icon">
                            <ThumbsUpIcon />
                        </span>
                    </div>
                    <div class="reaction">
                        <input class="reaction-input" type="number" value={props.post.dislikes} onInput={(e) => {
                            const target = e.target as HTMLInputElement;
                            props.actions.onUpdate((post) => post.dislikes = parseInt(target.value));
                        }} min={0} max={1000000} />

                        <span class="icon">
                            <ThumbsDownIcon />
                        </span>
                    </div>
                </div>
            </div>
            <Show when={!isNew && showReplies()}>
                <For each={replies()}>
                    {reply => <EditPostComponent post={reply} isReply />}
                </For>
            </Show>
        </div>
    );
}

const createPostHtmlId = (post: SavedPost, isReply?: boolean) => `post-${post.id}-${isReply ? "reply" : "main"}`;

const createNewPost = (userId: number): SavedPost => {
    return { id: -1, posterId: userId, content: "", timestamp: Date.now(), likes: 0, dislikes: 0 }
}

const toLocalTime = (timestamp: number) => {
    if (timestamp === undefined || timestamp === null || timestamp === 0) {
        timestamp = Date.now();
    }
    const date = new Date(timestamp);
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

const pad = (n: number) => {
    return n < 10 ? `0${n}` : n;
}

const sortedPosts = (posts: SavedPost[]) => {
    return [...posts].sort((a, b) => b.timestamp - a.timestamp);
}