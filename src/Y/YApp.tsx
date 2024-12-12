
import { useParams } from "@solidjs/router";
import { getBottomPosts } from "./Level";
import "./YApp.css";


import { For, Match, Switch } from "solid-js";
import { PostComponent } from "./PostComponent";
import { UserProfile } from "./UserProfile";


export const YApp = () => {
    const params = useParams();

    return <div class="app">
        <Switch fallback={<DefaultProfile />}>
            <Match when={params.id === undefined}>
                <DefaultProfile />
            </Match>
            <Match when={params.id !== undefined}>
                <UserProfile userId={parseInt(params.id)} />
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