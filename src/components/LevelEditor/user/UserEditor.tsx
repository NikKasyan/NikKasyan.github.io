import { Component, createSignal, For } from "solid-js";
import { createRandomAvatar } from "../../../util/imageGenerator";
import { UserNameTextarea } from "../UserQuickEditor";
import { useUserContext } from "../context/UserContext";

import { SavedPost } from "../../../types/SavedUser";
import { EditPostComponent, NewPostComponent } from "./PostEditor";
import "./UserEditor.css";

export const DetailedUserComponent: Component = () => {
	const userContext = useUserContext();
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
				userContext.updateUser((user) =>
					user.profilePicture = e.target?.result as string
				);
			}
			reader.readAsDataURL(files[0]);
		}

	};

	return (
		<div class="user-edit">
			<div class="user-edit-avatar">
				<img class="user-profile-picture" src={userContext.user.profilePicture} alt="avatar" onClick={() => input()?.click()} />
				<input type="file" accept="image/*" ref={setInput} onChange={() => onAvatarChange()} />
				<button onClick={() => {
					userContext.updateUser((user) => user.profilePicture = createRandomAvatar());
				}}>Generate</button>
			</div>

			<div class="user-edit-verified">
				<label for="verified">Verified</label>
				<input type="checkbox" name="verified" checked={userContext.user.verified} onChange={(e) => {
					const target = e.target as HTMLInputElement;
					userContext.updateUser((user) =>
						user.verified = target.checked
				)
				}}/>
			</div>
			<div class="user-edit-name">
				<div>Name: </div>
				<UserNameTextarea />
			</div>
			<div class="user-edit-bio">
				<div>Bio: </div>
				<textarea value={userContext.user.bio} onInput={(e) => {
					const target = e.target as HTMLTextAreaElement;
					userContext.updateUser((user) =>
						user.bio = target.value
					);
				}} />
			</div>
			<div class="user-edit-posts">
				<NewPostComponent />
				<For each={sortedPosts(userContext.user.posts)}>
					{post => <EditPostComponent post={post} />}
				</For>
			</div>

		</div>
	);
}

const sortedPosts = (posts: SavedPost[]) => {
	return [...posts].sort((a, b) => b.timestamp - a.timestamp);
}
