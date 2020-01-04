import React, { Component } from "react";
import { fieldLinesNames, vizserverURI } from "../Consts";
import ImgBlock from "./ImgBlock";

const eps = Number(0.1);

function log() {
    var initString = "";
    for (var i = 0; i < arguments.length; i++) {
        if (i > 0) {
            initString = initString + ", ";
        }
        initString = initString + arguments[i];
    }
    console.log(initString);
}

class FieldLinesImgBlock extends ImgBlock {
    constructor(props) {
        super(props);

        const defaultStateExtension = {
            tempLineSegment: null,
            lineSegments: {},
            activeSegment: 0
        };

        this.state = Object.assign({}, this.state, defaultStateExtension);
        this.defaultState = Object.assign(
            {},
            super.defaultState,
            defaultStateExtension
        );

        this.colors = [
            "#a0e3b7",
            "#9d0d6c",
            "#37c454",
            "#eb67f9",
            "#769d31",
            "#330045"
        ];
        this.squareDimCanvasX = 0.02;
        this.handleMouseDown = this.handleMouseDown.bind(this);
        this.handleMouseUp = this.handleMouseUp.bind(this);
        this.handleMouseMove = this.handleMouseMove.bind(this);
        this.handleKeyPress = this.handleKeyPress.bind(this);
        this.handleClick = this.handleClick.bind(this);

        this.drawLineSegment = this.drawLineSegment.bind(this);
        this.drawRect = this.drawRect.bind(this);
        this.drawText = this.drawText.bind(this);
        this.drawLegend = this.drawLegend.bind(this);
        this.drawEndPoints = this.drawEndPoints.bind(this);
        this.getEndPoints = this.getEndPoints.bind(this);

        this.serializeInfo = this.serializeInfo.bind(this);

        this.removeEventListeners = this.removeEventListeners.bind(this);
    }

    pointInRect(point, rect) {
        if (point["x"] > rect["x"] && point["x"] < rect["x"] + rect["w"]) {
            if (point["y"] > rect["y"] && point["y"] < rect["y"] + rect["h"]) {
                return true;
            }
        }
        return false;
    }

    handleMouseDown(e, doLog = true) {
        if (doLog) {
            console.log("-----handleMouseDown() Start-----");
        }

        if (this.state.mouseIsOver) {
            var mouseLocCanvas = this.getMouseLocationCanvas(e);
            var mouseLocImage = this.coordCanvasToImage(
                mouseLocCanvas["x"],
                mouseLocCanvas["y"]
            );

            // check if it's over any of the existing rectangle endpoints
            var isOverRectangle = false;
            var lsegIndex = -1;
            var isPoint1 = true;
            for (var segmentIndex in this.state.lineSegments) {
                var lseg = this.state.lineSegments[segmentIndex];
                var endpoints = this.getEndPoints(
                    lseg["x1"],
                    lseg["y1"],
                    lseg["x2"],
                    lseg["y2"]
                );
                var point1 = endpoints["point1"];
                var point2 = endpoints["point2"];
                if (this.pointInRect(mouseLocImage, point1)) {
                    isOverRectangle = true;
                    lsegIndex = Number(segmentIndex);
                    isPoint1 = true;
                    break;
                } else if (this.pointInRect(mouseLocImage, point2)) {
                    isOverRectangle = true;
                    lsegIndex = Number(segmentIndex);
                    isPoint1 = false;
                    break;
                }
            }

            if (isOverRectangle) {
                var lsegToAdjust = this.state.lineSegments[lsegIndex];
                var newLineSegments = {};
                for (var segmentIndex in this.state.lineSegments) {
                    if (segmentIndex != lsegIndex) {
                        newLineSegments[segmentIndex] = this.state.lineSegments[
                            segmentIndex
                        ];
                    }
                }

                if (isPoint1) {
                    lsegToAdjust["x1"] = mouseLocImage["x"];
                    lsegToAdjust["y1"] = mouseLocImage["y"];
                    lsegToAdjust["anchor"] = 2;
                } else {
                    lsegToAdjust["x2"] = mouseLocImage["x"];
                    lsegToAdjust["y2"] = mouseLocImage["y"];
                    lsegToAdjust["anchor"] = 1;
                }

                this.setState({
                    tempLineSegment: lsegToAdjust,
                    lineSegments: newLineSegments,
                    activeSegment: lsegIndex
                });
            } else {
                var canvasCoords = this.getMouseLocationCanvas(e);
                var imageCoords = this.coordCanvasToImage(
                    canvasCoords["x"],
                    canvasCoords["y"]
                );
                this.setState({
                    tempLineSegment: {
                        x1: imageCoords["x"],
                        y1: imageCoords["y"],
                        x2: imageCoords["x"] + 0.1 / this.state.scale,
                        y2: imageCoords["y"] + 0.1 / this.state.scale,
                        anchor: 1
                    }
                });
            }
        }
    }

    handleMouseUp(e, doLog = true) {
        if (doLog) {
            console.log("-----handleMouseUp() Start-----");
        }
        var canvasCoords = this.getMouseLocationCanvas(e);
        var imageCoords = this.coordCanvasToImage(
            canvasCoords["x"],
            canvasCoords["y"]
        );
        var tempLineSegment = this.state.tempLineSegment;
        var newLineSegment = {
            x1: tempLineSegment["x1"],
            y1: tempLineSegment["y1"],
            x2: tempLineSegment["x2"],
            y2: tempLineSegment["y2"],
            anchor: tempLineSegment["anchor"]
        };

        if (newLineSegment["anchor"] == 1) {
            newLineSegment["x2"] = imageCoords["x"];
            newLineSegment["y2"] = imageCoords["y"];
        } else {
            newLineSegment["x1"] = imageCoords["x"];
            newLineSegment["y1"] = imageCoords["y"];
        }

        if (doLog) {
            console.log("tempLineSegment anchor: " + tempLineSegment["anchor"]);
            console.log(
                "newLineSegment x1, y1, x2, y2: " +
                    newLineSegment["x1"] +
                    ", " +
                    newLineSegment["y1"] +
                    ", " +
                    newLineSegment["x2"] +
                    ", " +
                    newLineSegment["y2"]
            );
        }

        var activeSegment = this.state.activeSegment;
        var newAddition = {};
        newAddition[this.state.activeSegment] = newLineSegment;

        var toAdd = Object.assign({}, this.state.lineSegments, newAddition);
        this.setState({
            lineSegments: toAdd,
            tempLineSegment: null
        });
        this.drawImage();
        if (doLog) {
            console.log("-----handleMouseUp() End-----");
        }
    }

    handleMouseMove(e, doLog = false) {
        if (doLog) {
            console.log("-----handleMouseMove Start-----");
        }
        if (!(this.state.tempLineSegment === null)) {
            if (doLog) {
                console.log("TempLineSegment is not null!");
            }
            var canvasCoords = this.getMouseLocationCanvas(e);
            var imageCoords = this.coordCanvasToImage(
                canvasCoords["x"],
                canvasCoords["y"]
            );
            var tempLineSegment = this.state.tempLineSegment;

            if (doLog) {
                console.log(
                    "canvasCoords x, y: " +
                        canvasCoords["x"] +
                        ", " +
                        canvasCoords["y"]
                );
                console.log(
                    "imageCoords x, y: " +
                        imageCoords["x"] +
                        ", " +
                        imageCoords["y"]
                );
            }
            var newLineSegment = {
                x1: tempLineSegment["x1"],
                y1: tempLineSegment["y1"],
                x2: tempLineSegment["x2"],
                y2: tempLineSegment["y2"],
                anchor: tempLineSegment["anchor"]
            };

            if (newLineSegment["anchor"] == 1) {
                newLineSegment["x2"] = imageCoords["x"];
                newLineSegment["y2"] = imageCoords["y"];
            } else {
                newLineSegment["x1"] = imageCoords["x"];
                newLineSegment["y1"] = imageCoords["y"];
            }

            this.setState({ tempLineSegment: newLineSegment });
            this.drawImage((doLog = doLog));
        }
        if (doLog) {
            console.log("-----handleMouseMove End-----");
        }
    }

    handleKeyPress(e, doLog = false) {
        // get which number was pressed and make that the active segment
        var toChangeState = {};
        for (var i = 0; i < fieldLinesNames.length; i++) {
            if ((e.keyCode === 49 + i) | (e.keyCode === 97 + i)) {
                toChangeState["activeSegment"] = i;
            }
        }

        // delete or d keys to remove field line
        if ((e.keyCode === 46) | (e.keyCode === 68)) {
            var newSegments = {};
            for (var lseg in this.state.lineSegments) {
                if (lseg != this.state.activeSegment) {
                    newSegments[lseg] = this.state.lineSegments[lseg];
                }
            }

            toChangeState["lineSegments"] = newSegments;
        }

        if (toChangeState) {
            this.setState(toChangeState);
        }

        super.handleKeyPress(e, doLog);
        this.drawImage();
    }

    handleClick(e, doLog = false) {
        if (doLog) {
            console.log("-----handleMouseDown() Start-----");
        }

        if (this.state.mouseIsOver) {
            var mouseLocCanvas = this.getMouseLocationCanvas(e);
            var mouseLocImage = this.coordCanvasToImage(
                mouseLocCanvas["x"],
                mouseLocCanvas["y"]
            );

            // check if it's over any of the existing rectangle endpoints
            var isOverRectangle = false;
            var lsegIndex = -1;
            var isPoint1 = true;
            for (var segmentIndex in this.state.lineSegments) {
                var lseg = this.state.lineSegments[segmentIndex];
                var endpoints = this.getEndPoints(
                    lseg["x1"],
                    lseg["y1"],
                    lseg["x2"],
                    lseg["y2"]
                );
                var point1 = endpoints["point1"];
                var point2 = endpoints["point2"];
                if (this.pointInRect(mouseLocImage, point1)) {
                    isOverRectangle = true;
                    lsegIndex = Number(segmentIndex);
                    isPoint1 = true;
                    break;
                } else if (this.pointInRect(mouseLocImage, point2)) {
                    isOverRectangle = true;
                    lsegIndex = Number(segmentIndex);
                    isPoint1 = false;
                    break;
                }
            }

            if (isOverRectangle) {
                this.setState({
                    activeSegment: lsegIndex
                });
            }
        }
    }

    getEndPoints(x1, y1, x2, y2, doLog = false) {
        if (doLog) {
            console.log("-----getEndPoints Start-----");
        }
        var canvas = this.getCanvas();

        var squareDimCanvasX = this.squareDimCanvasX;
        var squareDimCanvasY =
            squareDimCanvasX * (canvas.width / canvas.height);
        var squareDimImageX = this.scaleCanvasToImageX(squareDimCanvasX);
        var squareDimImageY = this.scaleCanvasToImageY(squareDimCanvasY);

        if (doLog) {
            console.log(
                "squareDimCanvasX, Y: " +
                    squareDimCanvasX +
                    ", " +
                    squareDimCanvasY
            );
            console.log(
                "squareDimImageX, Y: " +
                    squareDimImageX +
                    ", " +
                    squareDimImageY
            );
        }

        var point1X = x1 - squareDimImageX / 2;
        var point1Y = y1 - squareDimImageY / 2;
        var point1W = squareDimImageX;
        var point1H = squareDimImageY;

        var point2X = x2 - squareDimImageX / 2;
        var point2Y = y2 - squareDimImageY / 2;
        var point2W = squareDimImageX;
        var point2H = squareDimImageY;

        if (doLog) {
            console.log(
                "tlX, Y, W, H: " +
                    point1X +
                    ", " +
                    point1Y +
                    ", " +
                    point1W +
                    ", " +
                    point1H
            );
            console.log(
                "brX, Y, W, H: " +
                    point2X +
                    ", " +
                    point2Y +
                    ", " +
                    point2W +
                    ", " +
                    point2H
            );
            console.log("-----getEndPoints End-----");
        }
        return {
            point1: { x: point1X, y: point1Y, w: point1W, h: point1H },
            point2: { x: point2X, y: point2Y, w: point2W, h: point2H }
        };
    }

    // draws line segments that are in normalized image coordinates
    drawLineSegment(
        x1,
        y1,
        x2,
        y2,
        { color = "#000000", lineWidth = 1, doLog = false }
    ) {
        var canvas = this.getCanvas();
        var context = this.getCanvasContext();
        var coords1 = this.coordImageToCanvas(x1, y1);
        var canvasX1 = coords1["x"] * canvas.width;
        var canvasY1 = coords1["y"] * canvas.height;

        var coords2 = this.coordImageToCanvas(x2, y2);
        var canvasX2 = coords2["x"] * canvas.width;
        var canvasY2 = coords2["y"] * canvas.height;

        if (doLog) {
            console.log(
                "lseg_x1, lseg_y1, lseg_x2, lseg_y2: " +
                    canvasX1 +
                    ", " +
                    canvasY1 +
                    ", " +
                    canvasX2 +
                    ", " +
                    canvasY2
            );
        }

        context.strokeStyle = color;
        context.lineWidth = lineWidth;
        context.beginPath();
        context.moveTo(canvasX1, canvasY1);
        context.lineTo(canvasX2, canvasY2);
        context.stroke();
    }

    // draws rects that are in normalized image coordinates
    drawRect(x, y, w, h, { color = "#000000", lineWidth = 1, doLog = false }) {
        var canvas = this.getCanvas();
        var context = this.getCanvasContext();
        var coords = this.coordImageToCanvas(x, y);
        var canvasX = coords["x"] * canvas.width;
        var canvasY = coords["y"] * canvas.height;
        var canvasWidth = this.scaleImageToCanvasX(w) * canvas.width;
        var canvasHeight = this.scaleImageToCanvasY(h) * canvas.height;

        if (doLog) {
            console.log(
                "rect_x, rect_y, rect_w, rect_h: " +
                    canvasX +
                    ", " +
                    canvasY +
                    ", " +
                    canvasWidth +
                    ", " +
                    canvasHeight
            );
        }

        context.strokeStyle = color;
        context.lineWidth = lineWidth;
        context.beginPath();
        context.rect(canvasX, canvasY, canvasWidth, canvasHeight);
        context.stroke();
    }

    drawText(x, y, w, h, text) {
        var canvas = this.getCanvas();
        var context = this.getCanvasContext();
        var coords = this.coordImageToCanvas(x, y);
        var canvasX = coords["x"] * canvas.width;
        var canvasY = coords["y"] * canvas.height;
        var canvasWidth = this.scaleImageToCanvasX(w) * canvas.width;
        var canvasHeight = this.scaleImageToCanvasY(h) * canvas.height;

        var textScale = 0.6;

        canvasX = canvasX + (canvasWidth * (1 - textScale)) / 2;
        canvasY = canvasY + (canvasHeight * (1 - textScale)) / 2;
        canvasWidth = canvasWidth * textScale;
        canvasHeight = canvasHeight * textScale;

        var fontsize = 20;

        // lower font size until it fits in the box
        do {
            fontsize--;
            context.font = fontsize + "px Helvetica";
        } while (
            (context.measureText(text).width >= canvasWidth) |
            (context.measureText(text).height >= canvasHeight)
        );

        context.fillStyle = "greenyellow";
        context.textBaseline = "middle";
        context.textAlign = "center";
        context.fillText(
            text,
            canvasX + canvasWidth / 2,
            canvasY + canvasHeight / 2
        );
    }

    // draws little squares around the top left and bottom right corners of a
    // rectangle to be able to modify existing rectangles
    drawEndPoints(
        x1,
        y1,
        x2,
        y2,
        { color = "#000000", lineWidth = 1, doLog = false }
    ) {
        if (doLog) {
            console.log("-----drawEndPoints Start-----");
        }
        var endpoints = this.getEndPoints(x1, y1, x2, y2);
        var point1 = endpoints["point1"];
        var point2 = endpoints["point2"];
        this.drawRect(point1["x"], point1["y"], point1["w"], point1["h"], {
            color: color,
            lineWidth: lineWidth,
            doLog: doLog
        });
        this.drawRect(point2["x"], point2["y"], point2["w"], point2["h"], {
            color: color,
            lineWidth: lineWidth,
            doLog: doLog
        });

        this.drawText(point1["x"], point1["y"], point1["w"], point1["h"], "1");
        this.drawText(point2["x"], point2["y"], point2["w"], point2["h"], "2");

        if (doLog) {
            log(
                "tlX, Y, W, H: " + point1["x"],
                point1["y"],
                point1["w"],
                point1["h"]
            );
            log(
                "brX, Y, W, H: " + point2["x"],
                point2["y"],
                point2["w"],
                point2["h"]
            );
            log("-----drawEndPoints End-----");
        }
    }

    drawLegend() {
        var canvas = this.getCanvas();
        var context = this.getCanvasContext();
        var x = 0;
        var y = 0;
        var w = 0.2;
        var h = 0.5;
        var fontsize = 20;
        var textwidthScale = 0.8;

        var canvasX = x;
        var canvasY = y;
        var canvasWidth = w * canvas.width;
        var canvasHeight = h * canvas.height;

        context.fillStyle = "#D1D1D1";
        context.fillRect(canvasX, canvasY, canvasWidth, canvasHeight);

        var step = canvasHeight / fieldLinesNames.length;

        // lower font size until it fits in the box
        for (var i = 0; i < fieldLinesNames.length; i++) {
            var temptext = fieldLinesNames[i];
            do {
                fontsize--;
                context.font = fontsize + "px Helvetica";
            } while (
                (context.measureText(temptext).width >=
                    canvasWidth * textwidthScale) |
                (context.measureText(temptext).height >= step)
            );
        }

        for (var i = 0; i < fieldLinesNames.length; i++) {
            context.fillStyle = "black";
            context.textBaseline = "middle";
            context.textAlign = "center";
            var centeredX = (textwidthScale * canvasWidth) / 2;
            var centeredY = canvasY + i * step + step / 2;
            context.fillText(fieldLinesNames[i], centeredX, centeredY);

            context.fillStyle = this.colors[i];
            var boxX = canvasX + canvasWidth * textwidthScale;
            var boxY = canvasY + i * step;
            var boxW = step * 0.8;
            var boxH = step * 0.8;
            context.fillRect(boxX, boxY, boxW, boxH);
        }
    }

    drawImage(doLog = false) {
        super.drawImage();
        this.drawLegend();
        // Draw line segments
        for (var segmentIndex in this.state.lineSegments) {
            var lseg = this.state.lineSegments[segmentIndex];
            if (segmentIndex == this.state.activeSegment) {
                this.drawLineSegment(
                    lseg["x1"],
                    lseg["y1"],
                    lseg["x2"],
                    lseg["y2"],
                    {
                        color: this.colors[segmentIndex],
                        lineWidth: 10,
                        doLog: doLog
                    }
                );
                this.drawEndPoints(
                    lseg["x1"],
                    lseg["y1"],
                    lseg["x2"],
                    lseg["y2"],
                    {
                        color: this.colors[segmentIndex],
                        lineWidth: 10,
                        doLog: doLog
                    }
                );
            } else {
                this.drawLineSegment(
                    lseg["x1"],
                    lseg["y1"],
                    lseg["x2"],
                    lseg["y2"],
                    { color: this.colors[segmentIndex], doLog: doLog }
                );
                this.drawEndPoints(
                    lseg["x1"],
                    lseg["y1"],
                    lseg["x2"],
                    lseg["y2"],
                    { color: this.colors[segmentIndex], doLog: doLog }
                );
            }
        }

        // Draw tempRect
        if (!(this.state.tempLineSegment === null)) {
            var lseg = this.state.tempLineSegment;
            this.drawLineSegment(
                lseg["x1"],
                lseg["y1"],
                lseg["x2"],
                lseg["y2"],
                {
                    color: this.colors[this.state.activeSegment],
                    lineWidth: 10,
                    doLog: doLog
                }
            );
        }

        if (doLog) {
            console.log("-----drawImage() End-----");
        }
    }

    serializeInfo() {
        console.log("-----serializeInfo() Start-----");
        console.log("rects: " + this.state.rects);
        var serializedPostData = {};
        serializedPostData["image_id"] = this.state.imgId;
        serializedPostData["line_coords"] = [];
        for (var segmentIndex in this.state.lineSegments) {
            var lseg = this.state.lineSegments[segmentIndex];
            var newLseg = {
                x1: lseg["x1"],
                x2: lseg["x2"],
                y1: lseg["y1"],
                y2: lseg["y2"],
                line_id: fieldLinesNames[segmentIndex]
            };
            serializedPostData["line_coords"].push(newLseg);
        }
        console.log("serialized: " + JSON.stringify(serializedPostData));
        console.log("-----serializeInfo() End-----");
        return serializedPostData;
    }

    removeEventListeners() {
        super.removeEventListeners();
        this.getCanvas().removeEventListener("click", this.handleClick, false);
        this.getCanvas().removeEventListener(
            "mousedown",
            this.handleMouseDown,
            false
        );
        this.getCanvas().removeEventListener(
            "mouseup",
            this.handleMouseUp,
            false
        );
        this.getCanvas().removeEventListener(
            "mousemove",
            this.handleMouseMove,
            false
        );
    }

    componentDidMount() {
        super.componentDidMount();
        this.getCanvas().addEventListener("click", this.handleClick, false);
        this.getCanvas().addEventListener(
            "mousedown",
            this.handleMouseDown,
            false
        );
        this.getCanvas().addEventListener("mouseup", this.handleMouseUp, false);
        this.getCanvas().addEventListener(
            "mousemove",
            this.handleMouseMove,
            false
        );
    }
}

export default FieldLinesImgBlock;
