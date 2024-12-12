import { useParams } from "@solidjs/router"
import { Component, createEffect, createSignal, For, onCleanup, Show } from "solid-js"
import { createStore } from "solid-js/store"
import { downloadEditorLevel, loadEditorLevel } from "../storage"
import { SavedLevel } from "../types/SavedLevel"
import { LevelContextProvider, useLevelContext } from "./context/LevelContext"
import { UserContextProvider } from "./context/UserContext"
import "./LevelEditor.css"
import { LevelEditorActions } from "./LevelEditorActions"
import { DetailedUserComponent } from "./user/UserEditor"
import { UserComponent } from "./UserQuickEditor"
import { SavedUser } from "../types/SavedUser"

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
        setUser(level.users.find(u => u.id === parseInt(params.id))!)
    })

    const [search, setSearch] = createSignal("");

    return (
        <LevelContextProvider level={level} setLevel={setLevel}>
            <main class="editor">
                <h1>Level Editor</h1>
                <LevelEditorActions />
                <Show when={params.id === undefined} keyed>
                    <div class="level-editor-search">
                        <span>Click profile picture to access detailed edit</span>
                        <div>
                            <input type="text" placeholder="Search" value={search()} onInput={(e) => setSearch(e.target.value)} />
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
    const { createNewUser } = useLevelContext()
    return (<>
        <div class="users">
            <For each={props.users} >
                {user =>
                    <UserContextProvider user={user}>
                        <UserComponent />
                    </UserContextProvider>}
            </For>
        </div>
        <button onClick={createNewUser}>Add User</button>
    </>
    )
}



const onShortcut = (e: KeyboardEvent, level: SavedLevel) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault()
        downloadEditorLevel(level)
    }
}


