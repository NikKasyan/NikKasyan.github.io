import { useNavigate } from "@solidjs/router";
import { Component, createMemo, For, onCleanup, Show } from "solid-js";

import { User } from "../../../types/Level";
import { PostComponent } from "./PostComponent";
import "./UserProfile.css";
import { Verified } from "./Verified";
interface UserProfileProps {
    user?: User;
}


export const UserProfile: Component<UserProfileProps> = (props) => {
    if (!props.user) {
        return <RedirectingProfile />
    }
	const posts = createMemo(() => {
		return [...(props.user?.posts ?? [])].sort((a, b) => b.timestamp - a.timestamp)
	})
	
    return (
        <div class="user-profile">
            <div class="user-profile-info">
                <img class="user-profile-picture" src={props.user.profilePicture} />
                <h2 class="user-name">{props.user.name}</h2>
				<Verified size={{width: "1rem", height: "1rem"}} verified={props.user.verified}/>
            </div>
			<Show when={props.user.bio.length > 0}>
            <div class="user-profile-bio">
                {props.user.bio}
            </div>
			</Show>
            <div class="user-profile-posts">
                <For each={posts()}>
                    {(post) => <PostComponent post={post} />}
                </For>
            </div>
        </div>
    )
}

const RedirectingProfile: Component = () => {

    const navigator = useNavigate()
    let timeout: number = setTimeout(() => navigator("/"), 5000)
    onCleanup(() => clearTimeout(timeout))
    return <div>
        <div>User not found</div>
        <button onClick={() => navigator("/")}>Go Home</button>
        <div>Navigating in 5 seoncds...</div>
    </div>
}
