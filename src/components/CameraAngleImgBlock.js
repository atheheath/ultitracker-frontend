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

class CameraAngleImgBlock extends ImgBlock {
    constructor(props) {
        super(props);

        const defaultStateExtension = {
            isValid: null
        };

        this.state = Object.assign({}, this.state, defaultStateExtension);
        this.defaultState = Object.assign(
            {},
            super.defaultState,
            defaultStateExtension
        );

        this.handleKeyPress = this.handleKeyPress.bind(this);

        this.serializeInfo = this.serializeInfo.bind(this);
    }

    handleKeyPress(e, doLog = false) {
        // get which number was pressed and make that the active segment
        var toChangeState = {};

        // affirmative
        if ((e.keyCode === 89) | (e.keyCode === 39)) {
            this.state.isValid = true;
        }
        // negative
        else if ((e.keyCode === 78) | (e.keyCode === 37)) {
            this.state.isValid = false;
        }
        // submit
        else if (e.keyCode === 32) {
            this.postAnnotationAndGetNext();
        }
    }

    drawLegend() {
        var canvas = this.getCanvas();
        var context = this.getCanvasContext();
        var x = 0;
        var y = 0;
        var w = 0.2;
        var h = 0.3;
        var fontsize = 20;
        var textwidthScale = 0.8;

        var canvasX = x;
        var canvasY = y;
        var canvasWidth = w * canvas.width;
        var canvasHeight = h * canvas.height;

        context.fillStyle = "#D1D1D1";
        context.fillRect(canvasX, canvasY, canvasWidth, canvasHeight);

        var keyTexts = [
            "Is valid y, ->",
            "Is NOT valid n, <-",
            "Submit <Space>"
        ];
        var step = canvasHeight / keyTexts.length;

        // lower font size until it fits in the box
        for (var i = 0; i < keyTexts.length; i++) {
            var temptext = keyTexts[i];
            do {
                fontsize--;
                context.font = fontsize + "px Helvetica";
            } while (
                (context.measureText(temptext).width >=
                    canvasWidth * textwidthScale) |
                (context.measureText(temptext).height >= step)
            );
        }

        for (var i = 0; i < keyTexts.length; i++) {
            context.fillStyle = "black";
            context.textBaseline = "middle";
            context.textAlign = "center";
            var centeredX = (textwidthScale * canvasWidth) / 2;
            var centeredY = canvasY + i * step + step / 2;
            context.fillText(keyTexts[i], centeredX, centeredY);

            // context.fillStyle = this.colors[i];
            // var boxX = canvasX + canvasWidth * textwidthScale;
            // var boxY = canvasY + i * step;
            // var boxW = step * .8
            // var boxH = step * .8
            // context.fillRect(boxX, boxY, boxW, boxH);
        }
    }

    drawImage(doLog = false) {
        super.drawImage();
        // this.drawLegend();

        if (doLog) {
            console.log("-----drawImage() End-----");
        }
    }

    serializeInfo() {
        if (this.state.isValid === null) {
            return null
        }
        
        console.log("-----serializeInfo() Start-----");
        var serializedPostData = {};
        serializedPostData["img_id"] = this.state.imgId;
        serializedPostData["is_valid"] = this.state.isValid;
        console.log("isValid " + this.state.isValid);
        console.log("serialized: " + JSON.stringify(serializedPostData));
        console.log("-----serializeInfo() End-----");
        return serializedPostData;
    }

    renderDescription() {
        return (
            <table style={{backgroundColor:"white"}} border="1" rules="cols">
                <tr>
                    <td>Is valid Keys: y, &#8674;</td>
                    <td>Is NOT valid Keys: n, &#8672;</td>
                    <td>Submit &lt;Space&gt;</td>
                </tr>
            </table>
        )
    }
}

export default CameraAngleImgBlock;
