import { Component, Show } from "solid-js";

import { A } from "@solidjs/router";
import "./UserQuickEditor.css";
import { useUserContext } from "./context/UserContext";
import { VerifiedIcon } from "../Icon/VerifiedIcon";

const MAX_NAME_LENGTH = 50;

export const UserComponent: Component = () => {
    const userContext = useUserContext();
    return (
        <div class="user">
            <A href={`/editor/${userContext.user.id}`}>
                <img class="user-profile-picture" src={userContext.user.profilePicture} alt="avatar" />
            </A>
            <UserNameTextarea />
			<Show when={userContext.user.verified}>
				<VerifiedIcon/>
			</Show>
            <button onClick={() => userContext.deleteUser()}>&times;</button>
        </div>
    );
}

export const UserNameTextarea: Component = () => {
    const userContext = useUserContext();
    return (
        <textarea maxLength={MAX_NAME_LENGTH} value={userContext.user.name} rows={1} onInput={(e) => {
            const target = e.target as HTMLTextAreaElement;
            userContext.updateUser((user) => user.name = target.value);
        }} />
    );
}
