import { Component, Show } from "solid-js";
import "./StatusBar.css";
import { useGameStateManager } from "./GameStateContext";

type NetworkType = "None" | "2G" | "3G" | "4G" | "5G";
type Network = {
    type: NetworkType;
    strength: number;
}

type Wifi = {
    enabled: boolean;
    strength: number;
}

export const StatusBar: Component = () => {
    const gameStateManager = useGameStateManager()

    return (
        <div class="statusbar">
            <span>{formatTime(gameStateManager.gameState.phone.timeInMinutes)}</span>
            <div class="info">
                <Show when={gameStateManager.gameState.phone.wifi !== undefined}>
                    <WifiIndicator wifi={gameStateManager.gameState.phone.wifi!} />
                </Show>
                <Show when={gameStateManager.gameState.phone.network !== undefined}>
                    <NetworkSignal network={gameStateManager.gameState.phone.network} wifiEnabled={gameStateManager.gameState.phone.wifi?.enabled ?? false} />
                </Show>
                <BatteryIndicator battery={gameStateManager.gameState.phone.battery} />
            </div>
        </div>
    )
}

const BatteryIndicator = ({ battery }: { battery: number }) => {
    const getColor = () => {
        if (battery > 50) return "green";
        if (battery > 20) return "orange";
        return "red";
    }
    return <div style={{display:"flex", "align-items": "center"}}>
        <svg width="24" height="20" viewBox="0 0 24 12" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ transform: 'rotate(270deg)' }}>
            <rect x="1" y="1" width="19" height="10" rx="2" stroke={getColor()} stroke-width="2" />
            <rect
                x="3"
                y="3"
                width={15 * (battery / 100)}
                height="6"
                fill={getColor()}
            />
            <path
                d="M22 4V8C22.8047 7.66122 23.328 6.87313 23.328 6C23.328 5.12687 22.8047 4.33878 22 4Z"
                fill={getColor()}
            />
        </svg>
        <span class="text-xs">{battery}%</span>
    </div>
}


const WifiIndicator = ({ wifi }: { wifi: Wifi }) => {
    const getOpacity = (strength: number) => {
        return wifi.strength >= strength ? '1' : '0.3';
    }

    return (
        <svg width="24" height="24" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" style={{
            display: "flex",
            "align-items": "center",
        }}>
            <g transform="translate(0, 2)">
                <path
                    d="M2 4.5C5.5 1 10.5 1 14 4.5"
                    stroke="currentColor"
                    stroke-width="1.5"
                    opacity={getOpacity(1)}
                    fill="none"
                />
                <path
                    d="M4 6.5C6.5 4 9.5 4 12 6.5"
                    stroke="currentColor"
                    stroke-width="1.5"
                    opacity={getOpacity(2)}
                    fill="none"
                />
                <path
                    d="M6 8.5C7.5 7 8.5 7 10 8.5"
                    stroke="currentColor"
                    stroke-width="1.5"
                    opacity={getOpacity(3)}
                    fill="none"
                />
                <circle
                    cx="8"
                    cy="10.5"
                    r="0.75"
                    fill="currentColor"
                    opacity={getOpacity(4)}
                />
            </g>
        </svg>
    )

}

const NetworkSignal = ({ network, wifiEnabled }: { network: Network, wifiEnabled: boolean }) => {
    const getOpacity = (threshold: number) =>
        network.strength >= threshold ? '1' : '0.3';
    return (
        <div style={{display: "flex", "align-items": "center"}}>
            <svg width="24" height="24" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect
                    x="2"
                    y="10"
                    width="2"
                    height="4"
                    fill="currentColor"
                    opacity={getOpacity(1)}
                />
                <rect
                    x="6"
                    y="8"
                    width="2"
                    height="6"
                    fill="currentColor"
                    opacity={getOpacity(2)}
                />
                <rect
                    x="10"
                    y="6"
                    width="2"
                    height="8"
                    fill="currentColor"
                    opacity={getOpacity(3)}
                />
                <rect
                    x="14"
                    y="4"
                    width="2"
                    height="10"
                    fill="currentColor"
                    opacity={getOpacity(4)}
                />
            </svg>
            {wifiEnabled ? null : <span>{network.type}</span>}
        </div>
    )
}


const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}`.padStart(2, "0") + ":" + `${remainingMinutes}`.padStart(2, "0");
}