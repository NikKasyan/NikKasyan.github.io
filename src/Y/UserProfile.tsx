import { useNavigate } from "@solidjs/router";
import { Component, For, onCleanup } from "solid-js";
import { getUser } from "./Level";

import { PostComponent } from "./PostComponent";
import "./UserProfile.css";
interface UserProfileProps {
    userId: number;
}


export const UserProfile: Component<UserProfileProps> = (props) => {
    const user = getUser(props.userId)
    if (!user) {
        return <RedirectingProfile />
    }

    return (
        <div class="user-profile">
            <div class="user-profile-info">
                <img class="user-profile-picture" src={user.profilePicture} />
                <h2 class="user-name">{user.name}</h2>
            </div>
            <div class="user-profile-bio">
                {user.bio}
            </div>
            <div class="user-profile-posts">
                <For each={user.posts}>
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
