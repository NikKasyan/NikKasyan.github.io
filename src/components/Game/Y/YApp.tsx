
import { useParams } from "@solidjs/router";
import "./YApp.css";


import { createEffect, For, Match, Switch } from "solid-js";
import { createStore } from "solid-js/store";
import { User } from "../../../types/Level";
import { useGameStateManager } from "../phone/GameStateContext";
import { PostComponent } from "./PostComponent";
import { UserProfile } from "./UserProfile";
import { BackIcon } from "../../Icon/BackIcon";
import { HomeIcon } from "../../Icon/HomeIcon";

export const YApp = () => {
	const params = useParams();
	const gameStateManager = useGameStateManager()
	const [user, setUser] = createStore<User>(gameStateManager.getUser(parseInt(params.id))!)
	createEffect(() => {
		const user = gameStateManager.getUser(parseInt(params.id))
		setUser(user)
	})
	return <div class="app">
		<nav>
			<button onClick={() => {
				history.back()
			}}><BackIcon />Back</button>
			<a href="/phone"><HomeIcon />Home</a>
		</nav>
		<div class="app-content">
			<Switch fallback={<DefaultProfile />}>
				<Match when={params.id === undefined} keyed>
					<DefaultProfile />
				</Match>
				<Match when={params.id !== undefined && user !== undefined} keyed>
					<UserProfile user={user} />
				</Match>
			</Switch>
		</div>
	</div>
}

const DefaultProfile = () => {
	const gameStateManager = useGameStateManager()
	const bottomPosts = gameStateManager.getBottomPosts().sort((a, b) => (b.likes + b.dislikes) - (a.likes + a.dislikes))
	return (
		<For each={bottomPosts}>
			{(post) => <PostComponent post={post} />}
		</For>
	);

}