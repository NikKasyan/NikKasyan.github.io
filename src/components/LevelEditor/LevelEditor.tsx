import { useParams } from "@solidjs/router"
import { Component, createEffect, createSignal, For, onCleanup, Show } from "solid-js"
import { createStore } from "solid-js/store"
import { downloadEditorLevel, loadEditorLevel } from "../../storage"
import { SavedLevel } from "../../types/SavedLevel"
import { checkUsersUnique, LevelContextProvider, useLevelContext } from "./context/LevelContext"
import { UserContextProvider } from "./context/UserContext"
import "./LevelEditor.css"
import { LevelEditorActions } from "./LevelEditorActions"
import { DetailedUserComponent } from "./user/UserEditor"
import { UserComponent } from "./UserQuickEditor"
import { SavedUser } from "../../types/SavedUser"
import { BackgroundEditor } from "./BackgroundEditor"
import { Decisions } from "./Decisions"

export const LevelEditor = () => {
	const params = useParams();

	const [level, setLevel] = createStore<SavedLevel>(loadEditorLevel())

	const download = (e: KeyboardEvent) => onShortcut(e, level)
	window.addEventListener("keydown", download)


	onCleanup(() => {

		window.removeEventListener("keydown", download)
	})

	const [user, setUser] = createStore<SavedUser>(level.users.find(u => u.id === parseInt(params.id))!)

	createEffect(() => {
		try {
			checkUsersUnique(level.users)
			setUser(level.users.find(u => u.id === parseInt(params.id))!)
		} catch (e) {
			setLevel(loadEditorLevel())
		}
	})

	const [search, setSearch] = createSignal("");

	return (
		<LevelContextProvider level={level} setLevel={setLevel}>
			<main class="editor">
				<h1>Level Editor</h1>
				<LevelEditorActions />
				<Show when={params.id === undefined} keyed>
					<BackgroundEditor />
					<Decisions />

					<h2>Users</h2>
					<div class="level-editor-search">
						<span style={{"font-style": "italic"}}>Click profile picture to access and edit posts and profile</span>
						<div style={{ display: "flex", "justify-content": "center", gap: "10px" }}>
							<input type="text" placeholder="Search" value={search()} onInput={(e) => setSearch(e.target.value)} />
							<button onClick={useLevelContext().createNewUser}>Add User</button>
						</div>
					</div>
					<UserList users={level.users.filter(u => u.name.toLowerCase().includes(search().toLowerCase()))} />
				</Show>

				<Show when={params.id !== undefined} keyed>
					<UserContextProvider user={user}>
						<DetailedUserComponent />
					</UserContextProvider>
				</Show>
			</main>
		</LevelContextProvider>
	)
}

interface UserListProps {
	users: SavedLevel["users"]
}
const UserList: Component<UserListProps> = (props) => {
	return (<>
		<div class="users">
			<div class="users-list">
				<For each={props.users} >
					{user =>
						<UserContextProvider user={user}>
							<UserComponent />
						</UserContextProvider>}
				</For>
			</div>
		</div>
	</>
	)
}



const onShortcut = (e: KeyboardEvent, level: SavedLevel) => {
	if ((e.ctrlKey || e.metaKey) && e.key === "s") {
		e.preventDefault()
		downloadEditorLevel(level)
	}
}


