import { Component } from "solid-js";
import { JSX } from "solid-js/h/jsx-runtime";

interface ThumbsIconProps {
    style?: JSX.CSSProperties;
}
export const BackIcon:Component<ThumbsIconProps> = (props) => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		fill="none"
		viewBox="0 0 24 24"
		stroke="currentColor"
		style={props.style ?? {width: "24px", height: "24px"}}
	>
		<path
			stroke-linecap="round"
			stroke-linejoin="round"
			stroke-width={2}
			d="M15 19l-7-7 7-7"
		/>
	</svg>
);