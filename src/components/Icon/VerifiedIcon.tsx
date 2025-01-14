import { Component } from "solid-js"

interface VerifiedIconProps {
	size?: { width?: string, height?: string }
}
export const VerifiedIcon: Component<VerifiedIconProps> = (props) => {
	if(!props.size)
		props.size = props.size ?? {}
	props.size.width = props.size.width ?? "36px"
	props.size.height = props.size.height ?? "36px"
	return (
		<svg id="Layer_1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000" fill="#20cedf" width={props.size.width} height={props.size.height}>
			<path d="M883.44,316.65h-.1c-130.84,0-246.8-84.25-287.23-208.71l-.05-.07c-30.03-92.48-160.87-92.48-190.89,0l-.05.07c-40.43,124.46-156.39,208.71-287.23,208.71h-.1c-97.23,0-137.65,124.41-58.99,181.57l.07.05c105.85,76.91,150.15,213.24,109.72,337.67l-.05.1c-30.03,92.46,75.8,169.37,154.46,112.2l.07-.05c105.85-76.91,249.21-76.91,355.06,0l.07.05c78.66,57.16,184.49-19.74,154.46-112.2l-.05-.1c-40.43-124.44,3.88-260.77,109.72-337.67l.07-.05c78.66-57.16,38.24-181.57-58.99-181.57ZM679.62,487.08l-214.97,214.97-.77.75-132.48-132.45c-18.66-18.68-18.66-48.95,0-67.61l41.1-41.1,91.35,91.35,204.16-204.13,11.61,11.61c34.96,34.96,34.96,91.64,0,126.63Z" />
		</svg>)
}