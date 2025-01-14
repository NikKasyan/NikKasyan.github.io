import { Component, Show } from "solid-js";
import { VerifiedIcon } from "../../Icon/VerifiedIcon";
import "./Verified.css";

interface Props {
	verified?: boolean;
	size: { width: string, height: string };
}

export const Verified: Component<Props> = (props) => {
	return (
		<Show when={props.verified}>
			<div class="verified" title="Verified"><VerifiedIcon size={props.size} /> </div>
		</Show>
	)
}