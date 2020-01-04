import React, { Component } from "react";
import { imgRootPath, vizserverURI } from "../Consts";
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

class PlayerBboxImgBlock extends ImgBlock {
    constructor(props) {
        super(props);

        const defaultStateExtension = {
            tempRect: null,
            rects: [],
            activeRect: 0
        };

        this.state = Object.assign({}, this.state, defaultStateExtension);
        this.defaultState = Object.assign(
            {},
            super.defaultState,
            defaultStateExtension
        );

        this.squareDimCanvasX = 0.02;
        this.handleMouseDown = this.handleMouseDown.bind(this);
        this.handleMouseUp = this.handleMouseUp.bind(this);
        this.handleMouseMove = this.handleMouseMove.bind(this);
        this.handleKeyPress = this.handleKeyPress.bind(this);
        this.handleClick = this.handleClick.bind(this);
        this.drawRect = this.drawRect.bind(this);
        this.drawEndPoints = this.drawEndPoints.bind(this);
        this.getEndPoints = this.getEndPoints.bind(this);

        this.drawImage = this.drawImage.bind(this);

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

    handleMouseDown(e, doLog = false) {
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
            var rectIndex = -1;
            var isTl = true;
            for (var i = 0; i < this.state.rects.length; i++) {
                var rect = this.state.rects[i];
                var endpoints = this.getEndPoints(
                    rect["x"],
                    rect["y"],
                    rect["w"],
                    rect["h"]
                );
                var tl = endpoints["tl"];
                var br = endpoints["br"];
                if (this.pointInRect(mouseLocImage, tl)) {
                    isOverRectangle = true;
                    rectIndex = Number(i);
                    isTl = true;
                    break;
                } else if (this.pointInRect(mouseLocImage, br)) {
                    isOverRectangle = true;
                    rectIndex = Number(i);
                    isTl = false;
                    break;
                }
            }

            if (isOverRectangle) {
                var rectToAdjust = this.state.rects[rectIndex];
                var newRects = this.state.rects
                    .slice(0, rectIndex)
                    .concat(
                        this.state.rects.slice(
                            rectIndex + 1,
                            this.state.rects.length
                        )
                    );
                console.log(
                    "rects, newRects Length: " +
                        this.state.rects.length +
                        ", " +
                        newRects.length
                );

                // if we clicked the top left corner, then the bottom right corner
                // now the anchor, and vice versa
                if (isTl) {
                    rectToAdjust["initialX"] =
                        rectToAdjust["x"] + rectToAdjust["w"];
                    rectToAdjust["initialY"] =
                        rectToAdjust["y"] + rectToAdjust["h"];
                } else {
                    rectToAdjust["initialX"] = rectToAdjust["x"];
                    rectToAdjust["initialY"] = rectToAdjust["y"];
                }
                this.setState({
                    tempRect: rectToAdjust,
                    rects: newRects,
                    activeRect: newRects.length
                });
            } else {
                var canvasCoords = this.getMouseLocationCanvas(e);
                var imageCoords = this.coordCanvasToImage(
                    canvasCoords["x"],
                    canvasCoords["y"]
                );
                this.setState({
                    tempRect: {
                        x: imageCoords["x"],
                        y: imageCoords["y"],
                        w: 0.1 / this.state.scale,
                        h: 0.1 / this.state.scale,
                        initialX: imageCoords["x"],
                        initialY: imageCoords["y"]
                    },
                    activeRect: this.state.rects.length
                });
            }
        }

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
            console.log("-----handleMouseDown() End-----");
        }
    }

    handleMouseUp(e, doLog = false) {
        if (doLog) {
            console.log("-----handleMouseUp() Start-----");
        }
        var canvasCoords = this.getMouseLocationCanvas(e);
        var imageCoords = this.coordCanvasToImage(
            canvasCoords["x"],
            canvasCoords["y"]
        );
        var tempRect = this.state.tempRect;
        var newRect = {
            x: tempRect["x"],
            y: tempRect["y"],
            w: tempRect["w"],
            h: tempRect["h"],
            initialX: tempRect["initialX"],
            initialY: tempRect["initialY"]
        };

        if (Number(imageCoords["x"] - tempRect["initialX"]) < 0) {
            newRect["x"] = imageCoords["x"];
            newRect["w"] = tempRect["initialX"] - imageCoords["x"];
        } else {
            newRect["w"] = imageCoords["x"] - tempRect["initialX"];
        }
        if (Number(imageCoords["y"] - tempRect["initialY"]) < 0) {
            newRect["y"] = imageCoords["y"];
            newRect["h"] = tempRect["initialY"] - imageCoords["y"];
        } else {
            newRect["h"] = imageCoords["y"] - tempRect["initialY"];
        }

        if (doLog) {
            console.log(
                "tempRectInitialX,Y: " +
                    tempRect["initialX"] +
                    ", " +
                    tempRect["initialY"]
            );
            console.log(
                "newRect x, y, w, h: " +
                    newRect["x"] +
                    ", " +
                    newRect["y"] +
                    ", " +
                    newRect["w"] +
                    ", " +
                    newRect["h"]
            );
        }

        this.setState({
            rects: this.state.rects.concat(newRect),
            tempRect: null,
            activeRect: this.state.rects.length
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
        if (!(this.state.tempRect === null)) {
            if (doLog) {
                console.log("TempRect is not null!");
            }
            var canvasCoords = this.getMouseLocationCanvas(e);
            var imageCoords = this.coordCanvasToImage(
                canvasCoords["x"],
                canvasCoords["y"]
            );
            var tempRect = this.state.tempRect;

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
            var newRect = {
                x: tempRect["x"],
                y: tempRect["y"],
                w: tempRect["w"],
                h: tempRect["h"],
                initialX: tempRect["initialX"],
                initialY: tempRect["initialY"]
            };

            if (Number(imageCoords["x"] - tempRect["initialX"]) < 0) {
                newRect["x"] = imageCoords["x"];
                newRect["w"] = tempRect["initialX"] - imageCoords["x"];
            } else {
                newRect["w"] = imageCoords["x"] - tempRect["x"];
            }
            if (Number(imageCoords["y"] - tempRect["initialY"]) < 0) {
                newRect["y"] = imageCoords["y"];
                newRect["h"] = tempRect["initialY"] - imageCoords["y"];
            } else {
                newRect["h"] = imageCoords["y"] - tempRect["y"];
            }

            this.setState({ tempRect: newRect });
            this.drawImage((doLog = doLog));
        }
        if (doLog) {
            console.log("-----handleMouseMove End-----");
        }
    }

    handleKeyPress(e, doLog = false) {
        // get which number was pressed and make that the active segment
        var toChangeState = {};

        // delete or d keys to remove bbox
        if ((e.keyCode === 46) | (e.keyCode === 68)) {
            toChangeState["activeRect"] = null;
            var rectIndex = this.state.activeRect;
            var newRects = this.state.rects
                .slice(0, rectIndex)
                .concat(
                    this.state.rects.slice(
                        rectIndex + 1,
                        this.state.rects.length
                    )
                );
            toChangeState["rects"] = newRects;
        }

        if (toChangeState) {
            this.setState(toChangeState);
        }

        super.handleKeyPress(e, doLog);
        this.drawImage();
    }

    handleClick(e, doLog = false) {
        if (this.state.mouseIsOver) {
            var mouseLocCanvas = this.getMouseLocationCanvas(e);
            var mouseLocImage = this.coordCanvasToImage(
                mouseLocCanvas["x"],
                mouseLocCanvas["y"]
            );

            // check if it's over any of the existing rectangle endpoints
            var isOverRectangle = false;
            var rectIndex = -1;
            var isTl = true;
            for (var i = 0; i < this.state.rects.length; i++) {
                var rect = this.state.rects[i];
                var endpoints = this.getEndPoints(
                    rect["x"],
                    rect["y"],
                    rect["w"],
                    rect["h"]
                );
                var tl = endpoints["tl"];
                var br = endpoints["br"];
                if (this.pointInRect(mouseLocImage, tl)) {
                    isOverRectangle = true;
                    rectIndex = Number(i);
                    isTl = true;
                    break;
                } else if (this.pointInRect(mouseLocImage, br)) {
                    isOverRectangle = true;
                    rectIndex = Number(i);
                    isTl = false;
                    break;
                }
            }

            if (isOverRectangle) {
                this.setState({
                    activeRect: rectIndex
                });
            }
        }
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

    getEndPoints(x, y, w, h, doLog = false) {
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

        var tlX = x - squareDimImageX / 2;
        var tlY = y - squareDimImageY / 2;
        var tlW = squareDimImageX;
        var tlH = squareDimImageY;

        var brX = x + w - squareDimImageX / 2;
        var brY = y + h - squareDimImageY / 2;
        var brW = squareDimImageX;
        var brH = squareDimImageY;

        if (doLog) {
            console.log(
                "tlX, Y, W, H: " + tlX + ", " + tlY + ", " + tlW + ", " + tlH
            );
            console.log(
                "brX, Y, W, H: " + brX + ", " + brY + ", " + brW + ", " + brH
            );
            console.log("-----getEndPoints End-----");
        }
        return {
            tl: { x: tlX, y: tlY, w: tlW, h: tlH },
            br: { x: brX, y: brY, w: brW, h: brH }
        };
    }

    // draws little squares around the top left and bottom right corners of a
    // rectangle to be able to modify existing rectangles
    drawEndPoints(
        x,
        y,
        w,
        h,
        { color = "#000000", lineWidth = 1, doLog = false }
    ) {
        if (doLog) {
            console.log("-----drawEndPoints Start-----");
        }
        var endpoints = this.getEndPoints(x, y, w, h);
        var tl = endpoints["tl"];
        var br = endpoints["br"];
        this.drawRect(tl["x"], tl["y"], tl["w"], tl["h"], {
            color: color,
            lineWidth: lineWidth,
            doLog: doLog
        });
        this.drawRect(br["x"], br["y"], br["w"], br["h"], {
            color: color,
            lineWidth: lineWidth,
            doLog: doLog
        });

        if (doLog) {
            console.log(
                "tlX, Y, W, H: " +
                    tl["x"] +
                    ", " +
                    tl["y"] +
                    ", " +
                    tl["w"] +
                    ", " +
                    tl["h"]
            );
            console.log(
                "brX, Y, W, H: " +
                    br["x"] +
                    ", " +
                    br["y"] +
                    ", " +
                    br["w"] +
                    ", " +
                    br["h"]
            );
            console.log("-----drawEndPoints End-----");
        }
    }

    drawImage(doLog = false) {
        super.drawImage();

        // Draw rectangles
        for (var i = 0; i < this.state.rects.length; i++) {
            var rect = this.state.rects[i];
            if (i == this.state.activeRect) {
                this.drawRect(rect["x"], rect["y"], rect["w"], rect["h"], {
                    lineWidth: 10,
                    doLog: doLog
                });
                this.drawEndPoints(rect["x"], rect["y"], rect["w"], rect["h"], {
                    lineWidth: 10,
                    doLog: doLog
                });
            } else {
                this.drawRect(rect["x"], rect["y"], rect["w"], rect["h"], {
                    doLog: doLog
                });
                this.drawEndPoints(rect["x"], rect["y"], rect["w"], rect["h"], {
                    doLog: doLog
                });
            }
        }

        // Draw tempRect
        if (!(this.state.tempRect === null)) {
            var rect = this.state.tempRect;
            this.drawRect(rect["x"], rect["y"], rect["w"], rect["h"], {
                lineWidth: 10,
                doLog: doLog
            });
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
        serializedPostData["bboxes"] = [];
        for (var i = 0; i < this.state.rects.length; i++) {
            var rect = this.state.rects[i];
            var newRect = {
                x1: rect["x"],
                x2: rect["x"] + rect["w"],
                y1: rect["y"],
                y2: rect["y"] + rect["h"]
            };
            serializedPostData["bboxes"].push(newRect);
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

export default PlayerBboxImgBlock;
