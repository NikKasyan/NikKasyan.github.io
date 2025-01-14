import {Component, createEffect, onCleanup, onMount} from "solid-js";
import {Level, Post, User} from "../../../types/Level";
import "./Result.css";
import * as d3 from "d3";
import {usePreferences} from "../../../theme/PreferencesContext";
import {getSystemTheme} from "../../../util/systemTheme";

interface Data {
    nodes: UserNode[],
    links: Link[]
}

interface UserNode {
    id: string,
    label: string,
    iconHref: string,
    radius: number,
}

interface Link {
    source: UserNode["id"],
    target: UserNode["id"]
}

interface GraphProps {
    level: Level
}

export const Graph: Component<GraphProps> = (props) => {
    const data = parseData(props.level)
    let theme = usePreferences().preferences.theme
    if (theme === "system") {
        theme = getSystemTheme()
    }
    const color = theme === "dark" ? "white" : "black"
    onMount(() => {
        // Get viewport dimensions
        const width = window.innerWidth;
        const height = window.innerHeight;

        // Clear any existing SVG content
        d3.select("#graph").selectAll("*").remove();

        // Setup SVG
        const svg = d3.select("#graph")


        // Create the force simulation
        const simulation = d3.forceSimulation(data.nodes)
            .force("link", d3.forceLink(data.links)
                .id(d => d.id)
                .distance(200))
            .force("charge", d3.forceManyBody().strength(-500))
            .force("center", d3.forceCenter(width / 2, height / 4))
            .force("collision", d3.forceCollide().radius(d => d.radius + 10));

        // Create container for zoom/pan
        const container = svg.append("g");

        // Add zoom behavior
        const zoom = d3.zoom()
            .scaleExtent([0.1, 4])
            .translateExtent([
                [-width, -height],
                [2 * width, 2 * height],])
            .on("zoom", (event) => {
                container.attr("transform", event.transform);
            });
        svg.call(zoom);

        // Create links
        const links = container.selectAll(".link")
            .data(data.links)
            .join("line")
            .attr("class", "link")
            .attr("stroke", "#999")
            .attr("stroke-width", 3)
            .attr("marker-end", "url(#arrowhead)");

        // Create node containers
        const nodes = container.selectAll(".node")
            .data(data.nodes)
            .join("g")
            .attr("class", "node")
            .call(d3.drag()
                .on("start", dragStarted)
                .on("drag", dragging)
                .on("end", dragEnded) as any);

        svg.append("defs")
            .append("clipPath")
            .attr("id", "circleClip")
            .append("circle")
            .attr("cx", 0)
            .attr("cy", 0)
            .attr("r", 30);

        // Add images to nodes
        nodes.append("image")
            .attr("xlink:href", d => d.iconHref)
            .attr("x", d => -d.radius)
            .attr("y", d => -d.radius)
            .attr("width", d => d.radius * 2)
            .attr("height", d => d.radius * 2)
            .attr("clip-path", "url(#circleClip)");

        // Add labels below nodes
        nodes.append("text")
            .text(d => d.label)
            .attr("text-anchor", "middle")
            .attr("dy", d => d.radius + 20)
            .attr("font-size", "16px")
            .attr("fill", color);

        // Update positions on each tick
        simulation.on("tick", () => {
            links
                .attr("x1", d => (d.source as UserNode).x!)
                .attr("y1", d => (d.source as UserNode).y!)
                .attr("x2", d => (d.target as UserNode).x!)
                .attr("y2", d => (d.target as UserNode).y!);

            nodes
                .attr("transform", d => `translate(${d.x},${d.y})`);
        });

        // Drag functions
        function dragStarted(event: d3.D3DragEvent<SVGGElement, UserNode, UserNode>, d: UserNode) {
            if (!event.active) simulation.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
        }

        function dragging(event: d3.D3DragEvent<SVGGElement, UserNode, UserNode>, d: UserNode) {
            d.fx = event.x;
            d.fy = event.y;
        }

        function dragEnded(event: d3.D3DragEvent<SVGGElement, UserNode, UserNode>, d: UserNode) {
            if (!event.active) simulation.alphaTarget(0);
            d.fx = null;
            d.fy = null;
        }

        d3.select(".graph")
            .insert("button", ":first-child")
            .attr("class", "reset-zoom")
            .text("Reset Zoom")
            .on("click", () => {
                svg.transition().duration(500).call(zoom.transform, d3.zoomIdentity);
            });

        // Handle window resize
        const handleResize = () => {
            const newWidth = window.innerWidth;
            const newHeight = window.innerHeight;
            simulation
                .force("center", d3.forceCenter(newWidth / 2, newHeight / 2))
                .restart();
        };

        window.addEventListener("resize", handleResize);

        // Cleanup
        return () => {
            window.removeEventListener("resize", handleResize);
            simulation.stop();
        };
    });

    return (
        <div class="graph">
            <svg id="graph"/>
        </div>
    )
}


const parseData = (level: Level): Data => {
    const links: Link[] = []
    const userMap = new Map<string, UserNode>()
    const replyChain = new Map<string, number>()
    for (const user of level.users) {
        const influence = calculateReplyChainLength(user, replyChain)
        const userNode = {
            id: user.id.toString(),
            label: user.name,
            iconHref: user.profilePicture,
            radius: 30,
            influence
        }
        userMap.set(user.id.toString(), userNode)
        // Todo: Maybe increase radius based on length of reply chain
        // Todo: Or on how many interactions they have (Replies on their posts, replies to other posts)
        for (const post of user.posts) {
            for (const reply of post.replies) {
                const source = user.id.toString()
                const target = reply.poster.id.toString()
                if (!containsLink(links, source, target)) {
                    links.push({source, target})
                }
            }
        }
    }
    return {nodes: [...userMap.values()], links}
}

const calculateReplyChainLength = (user: User, replyChain: Map<string, number>) => {
    let maxChainLength = 0
    for (const post of user.posts) {
        const chainLength = calculateReplyChainLengthRecursive(post, replyChain)
        if (chainLength > maxChainLength) {
            maxChainLength = chainLength
        }
    }
    return maxChainLength
}

const calculateReplyChainLengthRecursive = (post: Post, replyChain: Map<string, number>): number => {
    if (post.replies.length === 0) {
        return 0
    }
    if (replyChain.has(post.id.toString())) {
        return replyChain.get(post.id.toString())!
    }
    let maxChainLength = 0
    for (const reply of post.replies) {
        const chainLength = calculateReplyChainLengthRecursive(reply, replyChain)
        if (chainLength > maxChainLength) {
            maxChainLength = chainLength
        }
    }
    replyChain.set(post.id.toString(), maxChainLength + 1)
    return maxChainLength + 1
}


const containsLink = (links: Link[], source: string, target: string) => {
    for (const link of links) {
        if ((link.source === source && link.target === target)
            || (link.source === target && link.target === source)) {
            return true
        }
    }
    return false
}