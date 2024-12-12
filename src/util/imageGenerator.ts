
const colors = [
    "#FF6633", "#FFB399", "#FF33FF", "#FFFF99", "#00B3E6",
    "#E6B333", "#3366E6", "#999966", "#99FF99", "#B34D4D",
    "#80B300", "#809900", "#E6B3B3", "#6680B3", "#66991A",
    "#FF99E6", "#CCFF1A", "#FF1A66", "#E6331A", "#33FFCC",
    "#66994D", "#B366CC", "#4D8000", "#B33300", "#CC80CC",
    "#66664D", "#991AFF", "#E666FF", "#4DB3FF", "#1AB399",
    "#E666B3", "#33991A", "#CC9999", "#B3B31A", "#00E680",
    "#4D8066", "#809980", "#E6FF80", "#1AFF33", "#999933",
    "#FF3380", "#CCCC00", "#66E64D", "#4D80CC", "#9900B3",
    "#E64D66", "#4DB380", "#FF4D4D", "#99E6E6", "#6666FF",
    "#99CCFF", "#FF6666", "#669999", "#00FFCC", "#FFCC99",
    "#FF9900", "#FF6600", "#696996", "#969696", "#003366",
]
const pixelSize = 10;
const canvasSize = 7;

const canvas = document.createElement("canvas");

canvas.width = pixelSize * canvasSize;
canvas.height = pixelSize * canvasSize;
const context = canvas.getContext("2d");   
if (!context) {
    throw new Error("Could not create canvas context");
}

export const createRandomAvatar = (): string => {
 
    const color = colors[Math.floor(Math.random() * colors.length)];

    context.fillStyle = getContrastColor(color);
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.imageSmoothingEnabled = false;
    context.fillStyle = color;

    for (let i = 0; i < Math.ceil(canvasSize / 2.0); i++) {
        for (let j = 0; j < canvasSize; j++) {
            if (Math.random() > 0.7) {
                context.fillRect(i * pixelSize, j * pixelSize, pixelSize, pixelSize);
                context.fillRect((canvasSize - 1 - i) * pixelSize, j * pixelSize, pixelSize, pixelSize);
            }
        }
    }
    return canvas.toDataURL();

}

function getContrastColor(hexColor: string): string {
    // Remove the "#" if it exists
    hexColor = hexColor.replace(/^#/, "");

    // Ensure it's a valid 6-character hex
    if (hexColor.length !== 6) {
        throw new Error("Invalid hex color format. Expected 6 characters.");
    }

    // Parse the RGB components
    const r = parseInt(hexColor.slice(0, 2), 16);
    const g = parseInt(hexColor.slice(2, 4), 16);
    const b = parseInt(hexColor.slice(4, 6), 16);

    // Calculate brightness using the WCAG formula
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;

    // If brightness is high, return a darker contrasting color
    if (brightness > 128) {
        // Dim the color (halve RGB values)
        const dimR = Math.max(0, Math.floor(r / 2)).toString(16).padStart(2, "0");
        const dimG = Math.max(0, Math.floor(g / 2)).toString(16).padStart(2, "0");
        const dimB = Math.max(0, Math.floor(b / 2)).toString(16).padStart(2, "0");
        return `#${dimR}${dimG}${dimB}`;
    } else {
        // Brighten the color (invert and increase intensity)
        const brightR = Math.min(255, r + 128).toString(16).padStart(2, "0");
        const brightG = Math.min(255, g + 128).toString(16).padStart(2, "0");
        const brightB = Math.min(255, b + 128).toString(16).padStart(2, "0");
        return `#${brightR}${brightG}${brightB}`;
    }
}