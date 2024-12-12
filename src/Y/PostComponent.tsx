import { Component, Show } from "solid-js";
import "./Post.css";
import { Post } from "../types/Level";
import { A } from "@solidjs/router";
import { ReplyIcon } from "../Icon/ReplyIcon";
import { ThumbsDownIcon, ThumbsUpIcon } from "../Icon/ThumbsIcon";
import { Link } from "./Link";

interface PostProps {
    post: Post;
}

export const PostComponent: Component<PostProps> = ({ post }) => {

    return (
        <div class="post">
            <div class="post-poster">
                <Link href={`/phone/users/${post.poster.id}`}>
                    <img class="poster-profile" src={post.poster.profilePicture} />
                    <span class="post-poster-name">{post.poster.name}</span>
                </Link>
            </div>
            <div class="post-content">
                {post.content}
            </div>

            <Show when={post.replyTo}>
                <ReplyToPostComponent post={post.replyTo!} />
            </Show>
            <div class="post-info">
                <div class="post-date">
                    {formatDate(post.timestamp)}
                </div>
                <div class="post-reviews">
                    <span class="post-reply">
                        {/*<span>{post.replies.length}</span>*/}
                        <span class="icon"><ReplyIcon /></span>
                    </span>
                    <span class="post-likes">
                        <span>{post.likes}</span>
                        <span class="icon"><ThumbsUpIcon /></span>
                    </span>
                    <span class="post-dislikes">
                        <span>{post.dislikes}</span>
                        <span class="icon"><ThumbsDownIcon /></span>
                    </span>
                </div>
            </div>
        </div>
    )
}

const ReplyToPostComponent: Component<PostProps> = ({ post }) => {
    return (
        <div class="post-reply-to">
            <div class="post-reply-to-profile">
                <A href={`/phone/users/${post.poster.id}`}>
                    <img class="post-reply-to-avatar" src={post.poster.profilePicture} />
                    <span class="post-reply-to-name">{post.poster.name}</span>
                </A>
                <div class="post-date">
                    {formatDate(post.timestamp)}
                </div>
            </div>
            <div>
                {post.content}
            </div>
        </div>
    )
}


const formatDate = (timestamp?: number) => {
    if (!timestamp) {
        timestamp = Date.now()
    }
    const date = new Date(timestamp)
    return `${date.getDate()}.${date.getMonth()}.${date.getFullYear()}, ${date.getHours()}:${date.getMinutes()}${date.getHours() > 12 ? "pm" : "am"}`
}