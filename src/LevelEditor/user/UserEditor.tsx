import { Component, createSignal, For } from "solid-js";
import { createRandomAvatar } from "../../util/imageGenerator";
import { UserNameTextarea } from "../UserQuickEditor";
import { useUserContext } from "../context/UserContext";

import { EditPostComponent, NewPostComponent } from "./PostEditor";
import "./UserEditor.css";
import { SavedPost } from "../../types/SavedUser";
import { useParams } from "@solidjs/router";

export const DetailedUserComponent: Component = () => {
    const { user, updateUser } = useUserContext();
    const params = useParams();
    console.info("Rendering DetailedUserComponent", user.id, params.id);

    const [input, setInput] = createSignal<HTMLInputElement | null>(null);
    const onAvatarChange = () => {
        const files = input()?.files;
        if (files && files.length) {
            const file = files[0];
            if (file.size > 1024 * 1024) {
                alert("File size must be less than 1MB");
                return;
            }
            const reader = new FileReader();
            reader.onload = (e) => {
                updateUser((user) =>
                    user.profilePicture = e.target?.result as string
                );
            }
            reader.readAsDataURL(files[0]);
        }

    };

    return (
        <div class="user-edit">
            <div class="user-edit-avatar">
                <img class="user-profile-picture" src={user.profilePicture} alt="avatar" onClick={() => input()?.click()} />
                <input type="file" accept="image/*" ref={setInput} onChange={() => onAvatarChange()} />
                <button onClick={() => {
                    updateUser((user) => user.profilePicture = createRandomAvatar());
                }}>Generate</button>
            </div>
            <div class="user-edit-name">
                <div>Name: </div>
                <UserNameTextarea />
            </div>
            <div class="user-edit-bio">
                <div>Bio: </div>
                <textarea value={user.bio} onInput={(e) => {
                    const target = e.target as HTMLTextAreaElement;
                    updateUser((user) =>
                        user.bio = target.value
                    );
                }} />
            </div>
            <div class="user-edit-posts">
                <NewPostComponent />
                <For each={sortedPosts(user.posts)}>
                    {post => <EditPostComponent post={post} />}
                </For>
            </div>

        </div>
    );
}

const sortedPosts = (posts: SavedPost[]) => {
    return [...posts].sort((a, b) => b.timestamp - a.timestamp);
}
