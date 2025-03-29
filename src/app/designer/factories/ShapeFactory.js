class ShapeFactory {
    static createShape(type, props) {
        const baseProps = {
            color: props.color || "#3b82f6",
            lineWidth: props.lineWidth || 2,
            fill: props.fill ?? true
        };

        switch (type.toLowerCase()) {
            case "rectangle":
                return {
                    type: "rectangle",
                    ...baseProps,
                    x: props.x,
                    y: props.y,
                    width: props.width,
                    height: props.height
                };
            case "square":
                const size = Math.max(Math.abs(props.width), Math.abs(props.height)) * Math.sign(props.width);
                return {
                    type: "square",
                    ...baseProps,
                    x: props.x,
                    y: props.y,
                    width: size,
                    height: size
                };
            case "circle":
                const radius = Math.sqrt(props.width * props.width + props.height * props.height);
                return {
                    type: "circle",
                    ...baseProps,
                    x: props.x - radius,
                    y: props.y - radius,
                    width: radius * 2,
                    height: radius * 2
                };
            case "oval":
                return {
                    type: "oval",
                    ...baseProps,
                    x: props.x,
                    y: props.y,
                    width: props.width,
                    height: props.height
                };
            case "line":
                return {
                    type: "line",
                    ...baseProps,
                    startX: props.startX,
                    startY: props.startY,
                    endX: props.endX,
                    endY: props.endY
                };
            case "text":
                return {
                    type: "text",
                    ...baseProps,
                    text: props.text,
                    x: props.x,
                    y: props.y,
                    fontSize: props.fontSize || props.lineWidth * 10
                };
            default:
                throw new Error(`Unknown shape type: ${type}`);
        }
    }

    static normalizeShape(shape) {
        if (shape.width < 0) {
            shape.x += shape.width;
            shape.width = Math.abs(shape.width);
        }

        if (shape.height < 0) {
            shape.y += shape.height;
            shape.height = Math.abs(shape.height);
        }

        return shape;
    }
}

export default ShapeFactory; 