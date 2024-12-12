
import { useParams } from "@solidjs/router";
import { getBottomPosts, getUser } from "./Level";
import "./YApp.css";


import { createEffect, For, Match, Switch } from "solid-js";
import { User } from "../types/Level";
import { PostComponent } from "./PostComponent";
import { UserProfile } from "./UserProfile";
import { createStore } from "solid-js/store";

export const YApp = () => {
    const params = useParams();
    const [user, setUser] = createStore<User>(getUser(parseInt(params.id))!)

    createEffect(() => {
        setUser(getUser(parseInt(params.id))!)
    })
    return <div class="app">
        <Switch fallback={<DefaultProfile />}>
            <Match when={params.id === undefined}>
                <DefaultProfile />
            </Match>
            <Match when={params.id !== undefined && user !== undefined}>
                <UserProfile user={user} />
            </Match>
        </Switch>
        </div>
}

const DefaultProfile = () => {
    const bottomPosts = getBottomPosts()
    return (
        <For each={bottomPosts}>
            {(post) => <PostComponent post={post} />}
        </For>
    );

}