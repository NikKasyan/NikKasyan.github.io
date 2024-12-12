import { Component, createEffect, createMemo, createSignal, For, onCleanup } from "solid-js";
import { SavedPost, SavedUser } from "../../types/SavedUser";
import "./UserSelection.css";
import { A } from "@solidjs/router";

interface UserSelectionProps {
    user: SavedUser;
    onSelect: () => void;
}


export const UserSelectionComponent: Component<UserSelectionProps> = (props) => {
    return (
        <div class="user-selection" onClick={(e) => {
            e.preventDefault();
            props.onSelect!();
        }}>
            <img class="user-selection-avatar" src={props.user.profilePicture} alt="avatar" />
            <div class="user-selection-name">{props.user.name}</div>
        </div>
    )
}

interface AutoCompleteSelectProps {
    users: SavedUser[];
    post: SavedPost;
    selectedUser: SavedUser;
    onPostChange: (user: SavedUser) => void;
    onSelect: (user: SavedUser) => void;
}

export const AutoCompleteSelect: Component<AutoCompleteSelectProps> = (props) => {
    const [isFocused, setIsFocused] = createSignal(false);
    const [search, setSearch] = createSignal(props.selectedUser.name);
    createEffect(() => {
        setSearch(props.selectedUser.name);
    })
    const filteredUsers = createMemo(() => props.users.filter(user => user.name.toLowerCase().includes(search().toLowerCase())));
    const close = () => setIsFocused(false);
    const onEscape = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
            close();
        }
    }
    window.addEventListener("keydown", onEscape)

    onCleanup(() => {
        window.removeEventListener("keydown", onEscape)
    })


    return (
        <div class="auto-complete-select">
            <div>
                <A href={`/editor/${props.selectedUser.id}`}>
                    <img class="user-selection-avatar" src={props.selectedUser.profilePicture} alt="avatar" />
                </A>
                <div class="user-selection-name">{props.selectedUser.name}</div>
            </div>
            <div class="auto-complete-search">
                <div class="auto-complete-search-input">
                    <input type="text" value={search()} onFocus={() => setIsFocused(true)} onInput={(e) => setSearch(e.target.value)} />
                    <button disabled={props.post.posterId === props.selectedUser.id} onClick={() => props.onPostChange(props.selectedUser)}>Change Poster</button>
                </div>
                <div class="auto-complete-select-options" classList={{ "hidden": !isFocused() }}>
                    <For each={filteredUsers()}>
                        {user => <UserSelectionComponent user={user} onSelect={() => (props.onSelect(user), setSearch(user.name), close())} />}
                    </For>
                </div>
            </div>
        </div>
    )
}