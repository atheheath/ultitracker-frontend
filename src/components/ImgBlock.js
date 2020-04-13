import React, { Component } from "react";
import { fieldLinesNames, imgRootPath, vizserverURI } from "../Consts";
import auth from './auth'
import "../stylesheets/ImgBlock.css"

const eps = Number(0.1);

class HttpError extends Error {
    // (1)
    constructor(response) {
        super(`${response.status} for ${response.url}`);
        this.name = "HttpError";
        this.response = response;
    }
}

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

class ImgBlock extends Component {
    constructor(props) {
        super(props);
        // - x_center and y_center are the coordinates of the image that the viewing window is centered on in fractional image scale
        // - scale is the scale of the image, 2 => bigger image
        // - points {'x', 'y'} are the locations of the top left corner of the box
        //   relative to the image (proportional)

        const defaultState = {
            imageStatus: "Please select game to annotate",
            x_center: 0.5,
            y_center: 0.5,
            scale: 1,
            mouseIsOver: false,
            isStale: false,
            firstInitialized: true
            // imageToAnnotatePromise: this.getImageToAnnotate(this.props.annotation_table)
        };

        this.state = defaultState;
        this.defaultState = defaultState;

        this.handleEmptyImagePath = this.handleEmptyImagePath.bind(this);
        this.handleImageErrored = this.handleImageErrored.bind(this);
        this.handleImageLoaded = this.handleImageLoaded.bind(this);
        this.handleKeyPress = this.handleKeyPress.bind(this);
        this.handleWheel = this.handleWheel.bind(this);
        this.handleMouseEnter = this.handleMouseEnter.bind(this);
        this.handleMouseLeave = this.handleMouseLeave.bind(this);
        this.drawImage = this.drawImage.bind(this);
        this.clearImage = this.clearImage.bind(this);
        this.drawTimer = this.drawTimer.bind(this);
        this.convertMS = this.convertMS.bind(this);

        this.getHiddenImageContainer = this.getHiddenImageContainer.bind(this);
        this.getImage = this.getImage.bind(this);
        this.getMainImageContainer = this.getMainImageContainer.bind(this);
        this.getCanvas = this.getCanvas.bind(this);
        this.getCanvasRect = this.getCanvasRect.bind(this);
        this.getCanvasContext = this.getCanvasContext.bind(this);
        this.coordCanvasToImage = this.coordCanvasToImage.bind(this);
        this.coordImageToCanvas = this.coordImageToCanvas.bind(this);
        this.scaleCanvasToImageX = this.scaleCanvasToImageX.bind(this);
        this.scaleCanvasToImageY = this.scaleCanvasToImageY.bind(this);
        this.scaleImageToCanvasX = this.scaleImageToCanvasX.bind(this);
        this.scaleImageToCanvasY = this.scaleImageToCanvasY.bind(this);

        // this.serializeInfo = this.serializeInfo.bind(this);
        this.getImagesToAnnotate = this.getImagesToAnnotate.bind(this);
        this.setNewImageState = this.setNewImageState.bind(this);
        this.setBlankImageState = this.setBlankImageState.bind(this);
        this.getServerTime = this.getServerTime.bind(this);
        this.refreshAnnotationInterval = this.refreshAnnotationInterval.bind(
            this
        );
        this.refreshImageState = this.refreshImageState.bind(this);
        this.postAnnotation = this.postAnnotation.bind(this);
        this.postAnnotationAndGetNext = this.postAnnotationAndGetNext.bind(
            this
        );
        this.getNextImage = this.getNextImage.bind(this);

        this.removeEventListeners = this.removeEventListeners.bind(this);

        this.increaseScale = this.increaseScale.bind(this);
        this.decreaseScale = this.decreaseScale.bind(this);
        this.panLeft = this.panLeft.bind(this);
        this.panRight = this.panRight.bind(this);
        this.panUp = this.panUp.bind(this);
        this.panDown = this.panDown.bind(this);
    }

    decreaseScale() {
        if (Number(this.state.scale) > 0.1 + eps) {
            var newImageScale = Math.pow(
                2.0,
                Math.log2(this.state.scale) - 0.1
            );
            this.setState({ scale: newImageScale });
            return newImageScale
        }
        return this.state.scale
    }

    increaseScale() {
        if (Number(this.state.scale) < 32 - eps) {
            var newImageScale = Math.pow(
                2.0,
                Math.log2(this.state.scale) + 0.1
            )
            this.setState({ scale: newImageScale });
            return newImageScale
        }
        return this.state.scale
    }

    panLeft() {
        var canvasCoords = this.coordImageToCanvas(1, 0);
        console.log("-----panLeft() Start-----");
        console.log(
            "canvasCoords x, y: " + canvasCoords["x"] + ", " + canvasCoords["y"]
        );
        console.log("this.state.scale: " + this.state.scale);

        // check if it'll go off of the canvas
        if (Number(canvasCoords["x"] - 0.1) > 0) {
            var currentCenter = this.coordImageToCanvas(
                this.state.x_center,
                this.state.y_center
            );
            var newXCenter = currentCenter["x"] + 0.1;
            var newCenter = this.coordCanvasToImage(
                newXCenter,
                this.state.y_center
            );
            console.log("newCenter['x'] " + newCenter["x"]);
            this.setState({ x_center: newCenter["x"] });
        }
        console.log("-----panLeft() End-----");
    }

    panRight() {
        var canvasCoords = this.coordImageToCanvas(0, 0);
        console.log("-----panRight() Start-----");
        console.log(
            "canvasCoords x, y: " + canvasCoords["x"] + ", " + canvasCoords["y"]
        );
        console.log("this.state.scale: " + this.state.scale);

        // check if it'll go off of the canvas
        if (Number(canvasCoords["x"] + 0.1) < 1) {
            var currentCenter = this.coordImageToCanvas(
                this.state.x_center,
                this.state.y_center
            );
            var newXCenter = currentCenter["x"] - 0.1;
            var newCenter = this.coordCanvasToImage(
                newXCenter,
                this.state.y_center
            );
            console.log("newCenter['x'] " + newCenter["x"]);
            this.setState({ x_center: newCenter["x"] });
        }
        console.log("-----panRight() End-----");
    }

    panUp() {
        var canvasCoords = this.coordImageToCanvas(0, 1);
        console.log("-----panUp() Start-----");
        console.log(
            "canvasCoords x, y: " + canvasCoords["x"] + ", " + canvasCoords["y"]
        );

        // check if it'll go off of the canvas
        if (Number(canvasCoords["y"] - 0.1) > 0) {
            var currentCenter = this.coordImageToCanvas(
                this.state.x_center,
                this.state.y_center
            );
            var newYCenter = currentCenter["y"] + 0.1;
            var newCenter = this.coordCanvasToImage(
                this.state.x_center,
                newYCenter
            );
            console.log("newCenter['y'] " + newCenter["y"]);
            this.setState({ y_center: newCenter["y"] });
        }
        console.log("-----panUp() End-----");
    }

    panDown() {
        var canvasCoords = this.coordImageToCanvas(0, 0);
        console.log("-----panDown() Start-----");
        console.log(
            "coords x, y: " + canvasCoords["x"] + ", " + canvasCoords["y"]
        );

        // check if it'll go off of the canvas
        if (Number(canvasCoords["y"] + 0.1) < 1) {
            var currentCenter = this.coordImageToCanvas(
                this.state.x_center,
                this.state.y_center
            );
            var newYCenter = currentCenter["y"] - 0.1;
            var newCenter = this.coordCanvasToImage(
                this.state.x_center,
                newYCenter
            );
            console.log("newCenter['y'] " + newCenter["y"]);
            this.setState({ y_center: newCenter["y"] });
        }
        console.log("-----panDown() End-----");
    }

    getImage() {
        return this.refs[this.props.prefix + "ImageToLoad"];
    }

    getMainImageContainer() {
        return document.getElementById(
            "main-image-container"
        );
    }

    getCanvas() {
        return document.getElementById("canvas");
    }

    getCanvasRect() {
        var canvas = this.getCanvas();
        return canvas.getBoundingClientRect();
    }

    getCanvasContext() {
        var canvas = this.getCanvas();
        var context = canvas.getContext("2d");
        return context;
    }

    // given an x and y normalized pixel canvas location, returns the location
    // relative to the image in fractional measurements
    // x, y: double [0, 1]
    coordCanvasToImage(x, y, doLog = false) {
        if (doLog) {
            console.log("-----coordCanvasToImage() Start-----");
        }
        var canvas = this.getCanvas();
        var rect = canvas.getBoundingClientRect();

        var img = this.getImage();
        var deltaXCanvas = x - 0.5;
        var deltaYCanvas = y - 0.5;

        var deltaXImg = this.scaleCanvasToImageX(deltaXCanvas);
        var deltaYImg = this.scaleCanvasToImageY(deltaYCanvas);

        if (doLog) {
            console.log("x, y: " + x + ", " + y);
            console.log(
                "deltaXCanvas, deltaYCanvas: " +
                    deltaXCanvas +
                    ", " +
                    deltaYCanvas
            );
            console.log(
                "deltaXImg, deltaYImg: " + deltaXImg + ", " + deltaYImg
            );
            console.log("-----coordCanvasToImage() End-----");
        }
        return {
            x: this.state.x_center + deltaXImg,
            y: this.state.y_center + deltaYImg
        };
    }

    // given an x and y normalized pixel image location, returns the location
    // relative to the canvas in fractional measurements
    // x, y: double [-inf, inf]
    coordImageToCanvas(x, y, doLog = false) {
        if (doLog) {
            console.log("-----coordImageToCanvas() Start-----");
        }
        var canvas = this.getCanvas();
        var rect = canvas.getBoundingClientRect();
        var img = this.getImage();

        var deltaXImage = x - this.state.x_center;
        var deltaYImage = y - this.state.y_center;

        var deltaXCanvas = this.scaleImageToCanvasX(deltaXImage);
        var deltaYCanvas = this.scaleImageToCanvasY(deltaYImage);

        if (doLog) {
            console.log("x, y: " + x + ", " + y);
            console.log(
                "deltaXImage, deltaYImage: " + deltaXImage + ", " + deltaYImage
            );
            console.log(
                "deltaXCanvas, deltaYCanvas: " +
                    deltaXCanvas +
                    ", " +
                    deltaYCanvas
            );
            console.log("-----coordImageToCanvas() End-----");
        }

        return { x: 0.5 + deltaXCanvas, y: 0.5 + deltaYCanvas };
    }

    // given a distance in image space relative to the image, will return
    // the distance in canvas space relative to the canvas
    scaleImageToCanvasX(x) {
        var img = this.getImage();
        var canvas = this.getCanvas();
        return (x / (canvas.width / img.width)) * this.state.scale;
    }

    scaleImageToCanvasY(y) {
        var img = this.getImage();
        var canvas = this.getCanvas();
        return (y / (canvas.height / img.height)) * this.state.scale;
    }

    scaleCanvasToImageX(x) {
        var img = this.getImage();
        var canvas = this.getCanvas();
        return x / (img.width / canvas.width) / this.state.scale;
    }

    scaleCanvasToImageY(y) {
        var img = this.getImage();
        var canvas = this.getCanvas();
        return y / (img.height / canvas.height) / this.state.scale;
    }

    getMouseLocationCanvas(e) {
        var canvas = this.getCanvas();
        var rect = canvas.getBoundingClientRect();

        // get pixel location relative to the canvas
        var x_pixel = (e.clientX - rect.left) / rect.width;
        var y_pixel = (e.clientY - rect.top) / rect.height;

        return { x: x_pixel, y: y_pixel };
    }

    handleKeyPress(e) {
        if (e.keyCode === 37) {
            this.panRight();
            console.log("Hit Left!");
            // block page from scrolling
            e.preventDefault();
        } else if (e.keyCode === 39) {
            this.panLeft();
            console.log("Hit Right!");
            // block page from scrolling
            e.preventDefault();
        } else if (e.keyCode === 38) {
            this.panDown();
            console.log("Hit Up!");
            // block page from scrolling
            e.preventDefault();
        } else if (e.keyCode === 40) {
            this.panUp();
            console.log("Hit Down!");
            // block page from scrolling
            e.preventDefault();
        } else if (e.keyCode === 173 || e.keyCode === 189) {
            this.decreaseScale();
            console.log("Hit Minus!");
            // block page from scrolling
            e.preventDefault();
        } else if (e.keyCode === 61 || e.keyCode === 187) {
            this.increaseScale();
            console.log("Hit Equals!");
            // block page from scrolling
            e.preventDefault();
        }
        log("Key was pressed");
        this.drawImage();
    }

    handleWheel(e) {
        if (this.state.mouseIsOver) {
            var currentScale = this.state.scale
            var newScale = currentScale + 0.
            if (e.deltaY > 0) {
                newScale = this.decreaseScale();
            } else if (e.deltaY < 0) {
                newScale = this.increaseScale();
            }
            // block page from scrolling
            e.preventDefault();

            var deltaX = 1. + (newScale - currentScale)
            var deltaY = 1. + (newScale - currentScale)
            var mouseLocCanvas = this.getMouseLocationCanvas(e);
            
            var currentCenter = this.coordImageToCanvas(
                this.state.x_center,
                this.state.y_center
            );

            var prevCanvasXDelta = mouseLocCanvas["x"] - 0.5
            var prevCanvasYDelta = mouseLocCanvas["y"] - 0.5
            var canvasXDelta = (mouseLocCanvas["x"] - 0.5) * deltaX
            var canvasYDelta = (mouseLocCanvas["y"] - 0.5) * deltaY
            var newXCenter = canvasXDelta - prevCanvasXDelta + .5
            var newYCenter = canvasYDelta - prevCanvasYDelta + .5
            var newCenter = this.coordCanvasToImage(
                newXCenter,
                newYCenter
            );
            // log("mouseLocCanvas", mouseLocCanvas["x"], mouseLocCanvas["y"])
            // log("currentCenter", currentCenter["x"], currentCenter["y"])
            // log("delta", deltaX, deltaY)
            // log("canvasDelta", canvasXDelta, canvasYDelta)
            // log("newCanvasCenter", newXCenter, newYCenter)
            // log("newCenter", newCenter["x"], newCenter["y"])
            
            // console.log("newCenter['x'] " + newCenter["x"]);
            this.setState({
                x_center: newCenter["x"],
                y_center: newCenter["y"]
            });

        }
        this.drawImage();
    }

    handleMouseEnter(e, doLog = false) {
        this.setState({ mouseIsOver: true });
        if (doLog) {
            console.log("Mouse Entered");
        }
    }

    handleMouseLeave(e, doLog = false) {
        this.setState({ mouseIsOver: false });
        if (doLog) {
            console.log("Mouse Left");
        }
    }

    handleImageLoaded() {
        var canvas = this.getCanvas();
        var context = this.getCanvasContext();
        var img = this.getImage();
        var w_scale = img.width / Number(canvas.width);
        var h_scale = img.height / Number(canvas.height);
        this.setState({
            wScale: w_scale,
            hScale: h_scale
        });

        // pause redrawing the image to make sure the state
        // is updated
        setTimeout(this.drawImage, 500);
        console.log("Image loaded");
    }

    handleImageErrored() {
        var canvas = this.getCanvas();
        var context = this.getCanvasContext();
        console.log("Image failed to load");
        context.fillStyle = "black";
        context.font = "24px Arial";
        context.textAlign = "center";
        var centeredX = 0.5 * canvas.width;
        var centeredY = 0.5 * canvas.height;
        var topErrorMessage = "Image failed to load.";
        var bottomErrorMessage = "Reason: " + this.state.errorCause;
        context.fillText(topErrorMessage, centeredX, centeredY);
        context.fillText(
            bottomErrorMessage,
            centeredX,
            centeredY + context.measureText("M").width
        );
        console.log("handleImageErrored called")
    }

    handleEmptyImagePath() {
        var canvas = this.getCanvas();
        var context = this.getCanvasContext();
        console.log("Empty image path");
        context.fillStyle = "black";
        context.font = "24px Arial";
        context.textAlign = "center";
        var centeredX = 0.5 * canvas.width;
        var centeredY = 0.5 * canvas.height;
        var topErrorMessage = "Empty Image Path";
        var bottomErrorMessage = "Reason: " + this.state.errorCause;
        context.fillText(topErrorMessage, centeredX, centeredY);
        context.fillText(
            bottomErrorMessage,
            centeredX,
            centeredY + context.measureText("M").width
        );
    }

    convertMS(milliseconds) {
        var day, hour, minute, seconds;
        seconds = Math.floor(milliseconds / 1000);
        minute = Math.floor(seconds / 60);
        seconds = seconds % 60;
        hour = Math.floor(minute / 60);
        minute = minute % 60;
        day = Math.floor(hour / 24);
        hour = hour % 24;
        return (
            day.toString().padStart(2, "0") +
            " Days, " +
            hour.toString().padStart(2, "0") +
            ":" +
            minute.toString().padStart(2, "0") +
            ":" +
            seconds.toString().padStart(2, "0")
        );
    }

    drawTimer(doLog = false) {
        var canvas = this.getCanvas();
        var context = this.getCanvasContext();
        var x = 0.5;
        var y = 0;
        var w = 0.5;
        var h = 0.1;
        var fontsize = 20;
        var textwidthScale = 0.8;

        var canvasX = x * canvas.width;
        var canvasY = y * canvas.height;
        var canvasWidth = w * canvas.width;
        var canvasHeight = h * canvas.height;

        context.fillStyle = "#D1D1D1";
        context.fillRect(canvasX, canvasY, canvasWidth, canvasHeight);

        // lower font size until it fits in the box
        do {
            fontsize--;
            context.font = fontsize + "px Helvetica";
        } while (
            (context.measureText(Date.now()).width >=
                canvasWidth * textwidthScale) |
            (context.measureText(Date.now()).height >= canvasHeight)
        );

        context.fillStyle = "black";
        context.textBaseline = "middle";
        context.textAlign = "center";
        var centeredX = canvasX + (textwidthScale * canvasWidth) / 2;
        var centeredY = canvasY + canvasHeight / 2;
        // context.fillText(this.convertMS(this.state.timeUntilExpiration), centeredX, centeredY);
        context.fillText(
            this.convertMS(this.timeUntilExpiration),
            centeredX,
            centeredY
        );
    }

    clearImage() {
        var canvas = this.getCanvas();
        var context = this.getCanvasContext();
        context.clearRect(0, 0, canvas.width, canvas.height);
    }

    drawImage(doLog = false) {
        if (doLog) {
            console.log("-----drawImage() Start-----");
        }

        var img = this.getImage();
        var canvas = this.getCanvas();
        var context = this.getCanvasContext();
        // context.clearRect(0, 0, canvas.width, canvas.height);
        this.clearImage();

        var width = img.width * this.state.scale;
        var height = img.height * this.state.scale;

        var coords = this.coordImageToCanvas(0, 0);
        var img_tl_x = coords["x"];
        var img_tl_y = coords["y"];

        context.drawImage(
            img,
            img_tl_x * canvas.width,
            img_tl_y * canvas.height,
            width,
            height
        );

        if (doLog) {
            console.log("Image width, height: " + width + ", " + height);
            console.log("img_tl_x, y: " + img_tl_x + ", " + img_tl_y);
            console.log(
                "Canvas width, height: " + canvas.width + ", " + canvas.height
            );
        }

        if (doLog) {
            console.log("-----drawImage() End-----");
        }
        // this.drawTimer();
    }

    async getImagesToAnnotate(game_ids, annotation_type, order_type) {
        this.setState({imageStatus: "loading"})
        order_type = "random"
        console.log("getting Images To annotate")
        var uri =
            vizserverURI + "/annotator/get_images_to_annotate";

        let formData = new FormData()

        formData.append("game_ids", game_ids.join(" "))
        formData.append("annotation_type", annotation_type)
        formData.append("order_type", order_type)

        var headers = auth.getAuthorizationHeader(this.props.cookieAuthenticationKey)
        var requestInit = {
            method: "POST",
            headers: headers,
            credentials: "include",
            body: formData
        }

        const request = new Request(
            uri,
            requestInit
        )

        console.log("ImgBlock: cookieAuthenticationKey: " + this.props.cookieAuthenticationKey)
        console.log("ImgBlock: game_ids: " + game_ids.join(" "));
        console.log("ImgBlock: annotation_type: " + annotation_type);
        console.log("ImgBlock: order_type: " + order_type);

        let response = await fetch(request)

        // geturi += "game_ids=" + game_ids;
        // geturi += "annotation_type=" + annotation_type;
        // geturi += "order_type=" + order_type;
        
        // log("geturi", geturi);
        // let response = await fetch(geturi);
        if (response.status == 200) {
            log("response status is 200");
            return response.json();
        } else {
            log("response status is not 200");
            log(response);
            throw new HttpError(response);
        }
    }

    async getServerTime() {
        var geturi = vizserverURI + "/time";
        let response = await fetch(geturi);
        if (response.status == 200) {
            return response.json();
        } else {
            throw new HttpError(response);
        }
    }

    async postRefreshAnnotationInterval(imageId, table) {
        var posturi =
            vizserverURI +
            "/refresh_annotation_interval?image_id=" +
            imageId +
            "&annotation_table=" +
            table;

        let response = await fetch(posturi, {
            method: "POST"
        }).then(res => {
            console.log("Request complete! response:", res);
            return res;
        });

        if (response.status == 200) {
            return response.json();
        } else {
            throw new HttpError(response);
        }
    }

    async postAnnotation() {
        var posturi =
            vizserverURI +
            "/annotator/insert_annotation?img_id=" +
            this.state.imgId +
            "&annotation_table=" +
            this.props.annotation_table;

        var serializedPostData = this.serializeInfo();

        if (serializedPostData === null) {
            throw Error("Serialized data may not be null")
        }
        // let formData = new FormData()

        // formData.append("game_ids", game_ids.join(" "))
        // formData.append("annotation_type", annotation_type)
        // formData.append("order_type", order_type)

        var headers = auth.getAuthorizationHeader(this.props.cookieAuthenticationKey)
        var requestInit = {
            method: "POST",
            headers: headers,
            credentials: "include",
            body: JSON.stringify(serializedPostData)
        }

        const request = new Request(
            posturi,
            requestInit
        )
        

        console.log("Submitting request")
        let response = await fetch(request)
        console.log("Got response")
        if (response.status == 200) {
            return response.json();
        } else {
            throw new HttpError(response);
        }
    }

    setNewImageState({ img_id, img_path, annotation_expiration_utc_time }) {
        log("img_path, img_id", img_path, img_id);

        log("annotation_expiration_utc_time", annotation_expiration_utc_time)
        const date = new Date(annotation_expiration_utc_time);
//         var serverExpTime = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(),
//  date.getUTCHours(), date.getUTCMinutes(), date.getUTCSeconds());
        var serverExpTime = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds())
        log("serverExpTime", serverExpTime)
 
        this.setState({
            imgPath: img_path,
            imgId: img_id,
            annotationExpirationUTCTime: serverExpTime,
            imageStatus: "loaded"
        });

        clearInterval(this.timer);
        this.timer = setInterval(() => {
            var now = new Date();
            var untilExpiration = this.state.annotationExpirationUTCTime - now;
            // this.setState({timeUntilExpiration: untilExpiration});
            this.timeUntilExpiration = untilExpiration;
            this.drawImage();
            // this.drawTimer();
        }, 1000);

    }

    setBlankImageState() {
        this.clearImage();
        this.setState({ imgPath: null, imgId: "", isStale: true });
        clearInterval(this.timer);
        // this.removeEventListeners();
        log("Event listeners removed");
    }

    getNextImage() {
        // Use this to use promises for loading images
        if (this.props.game_id == null) {
            return
        }
        if (this.props.game_id.length === 0) {
            return
        }
        var result = this.getImagesToAnnotate(
            Array(this.props.game_id), 
            this.props.annotation_table,
            this.props.order_type
        )
            .then(
                imagesToAnnotate => {
                    log("imagesToAnnotate", imagesToAnnotate);
                    if (imagesToAnnotate.img_locations.length === 0) {
                        this.setState({imageStatus: "No more images to annotate"})
                        this.setBlankImageState()
                        this.setState({ errorCause: "No more images to annotate" })
                    }
                    else {
                        this.setNewImageState(imagesToAnnotate.img_locations[0]);
                    }
                },
                error => {
                    if (!this.state.firstInitialized) {
                        this.setState({imageStatus: "loaded"})
                        log("Error in fetching image to annotate");
                        log("Error", error.message);
                        this.setBlankImageState();
                        this.setState({ errorCause: error.message });
                    }
                }   
            )
            .catch(error => {
                log("Error in setting new image state");
                this.setBlankImageState();
                this.setState({ errorCause: error["detail"] });
            });
    }

    postAnnotationAndGetNext() {
        this.postAnnotation()
            .then(res => {
                // set this timeout here to make sure that the post has percolated
                // through the database before getting the next image
                setTimeout(this.getNextImage, 100);
            })
            .then(res => {
                this.setState(this.defaultState);
            })
            .catch(error => {
                console.log(error)
                if (error.response.status == 422) {
                    throw Error(
                        "Bad post submission for annotation: ",
                        error.response
                    );
                }
            });
    }

    refreshImageState({ annotation_expiration_utc_time }) {
        const serverExpTime = new Date.UTC(annotation_expiration_utc_time);

        console.log("annotation_expiration_utc_time: " + annotation_expiration_utc_time)
        console.log("serverExpTime: " + serverExpTime)
        this.setState({
            annotationExpirationUTCTime: serverExpTime
        });

        clearInterval(this.timer);
        this.timer = setInterval(() => {
            var now = new Date().getUTCDate();
            var untilExpiration = this.state.annotationExpirationUTCTime - now;
            // this.setState({timeUntilExpiration: untilExpiration});
            this.timeUntilExpiration = untilExpiration;
            this.drawImage();
        }, 1000);
    }

    refreshAnnotationInterval() {
        var result = this.postRefreshAnnotationInterval(
            this.state.imgId,
            this.props.annotation_table
        )
            .then(imageToAnnotate => {
                this.refreshImageState(imageToAnnotate);
            })
            .catch(error => {
                if (error.response.status == 422) {
                    throw Error(
                        "Bad post submission for annotation interval refresh: ",
                        error.response
                    );
                }
            });
    }

    removeEventListeners() {
        document.removeEventListener("keydown", this.handleKeyPress, false);
        document.removeEventListener("wheel", this.handleWheel, false);
        this.getMainImageContainer().removeEventListener(
            "mouseover",
            this.handleMouseEnter,
            false
        );
        this.getMainImageContainer().removeEventListener(
            "mouseout",
            this.handleMouseLeave,
            false
        );
    }

    componentDidMount() {
        document.addEventListener("keydown", this.handleKeyPress, false);
        document.addEventListener("wheel", this.handleWheel, false);
        this.getMainImageContainer().addEventListener(
            "mouseover",
            this.handleMouseEnter,
            false
        );
        this.getMainImageContainer().addEventListener(
            "mouseout",
            this.handleMouseLeave,
            false
        );
        log("eventListeners added");
        // Use this to use promises for loading images
        this.getNextImage();
    }

    componentWillUnmount() {
        clearInterval(this.timer);
        this.removeEventListeners();
    }

    // shouldComponentUpdate() {
    //     return !this.state.isStale;
    // }

    componentDidUpdate(prevProps) {
        if (this.props != prevProps) {
            console.log("prevProps.game_id: + ", prevProps.game_id)    
            log("Updating?");

            // Use this to use promises for loading images
            this.setState({firstInitialized: false})

            var result = this.getImagesToAnnotate(
                Array(this.props.game_id), 
                this.props.annotation_table,
                this.props.order_type
            )
                .then(imagesToAnnotate => {
                    
                    if (imagesToAnnotate.img_locations.length === 0) {
                        this.setState({imageStatus: "No more images to annotate"})
                        log("No images to annotate")
                        this.setState({ errorCause: "No images to annotate" })
                        this.setBlankImageState();
                    } else {
                        this.setNewImageState(imagesToAnnotate.img_locations[0]);
                    }
                })
                .catch(error => {
                    this.setState({imageStatus: "loaded"})
                    this.setBlankImageState();
                    this.setState({ errorCause: error });
                });
            log("Component updated");
        }
        
    }

    loadingStatus() {
        if (this.state.imageStatus === "loaded") {
            return;
        } else {
            return <p>{this.state.imageStatus}</p>;
        }
    }

    // generate_cell(index) {
    //     if (index == 0 || index == 5) {
    //         return <td colspan="4" style={this.generate_cell_style(index)}>{this.generate_cell_name(index)}</td>    
    //     } else {
    //         return <td style={this.generate_cell_style(index)}>{this.generate_cell_name(index)}</td>
    //     }
    // }

    // render_field_lines_description() {
    //     if ('colors' in this) {
    //         return (
    //             <table>
    //                 <tr>
    //                     {this.generate_cell(0)}
    //                 </tr>
    //                 <tr>
    //                     {this.generate_cell(1)}
    //                     {this.generate_cell(2)}
    //                     {this.generate_cell(3)}
    //                     {this.generate_cell(4)}
    //                 </tr>
    //                 <tr>
    //                     {this.generate_cell(5)}
    //                 </tr>
    //             </table>
    //         )
    //     }
    // }

    getHiddenImageContainer() {
        // if ("imgPath" in this.state) {
        //     if (this.state.imgPsath != null) {
        //         return (
        //             <div id="hidden-img-container">
        //                 {
        //                     <img
        //                         ref={this.props.prefix + "ImageToLoad"}
        //                         style={{ display: "none" }}
        //                         src={this.state.imgPath}
        //                         onLoad={this.handleImageLoaded}
        //                         onError={this.handleImageErrored}
        //                     ></img>
        //                 }
        //             </div>
        //         )
        //     } 
        // }
        return (
            <div id="hidden-img-container">
                {
                    <img
                        ref={this.props.prefix + "ImageToLoad"}
                        style={{ display: "none" }}
                        src={this.state.imgPath}
                        alt="Loading Image"
                        onLoad={this.handleImageLoaded}
                        onError={this.handleImageErrored}
                    ></img>
                }
            </div>
        )
    }

    render() {
        return (
            <div>
                <div id="annotation-description-container">
                    {this.renderDescription()}
                </div>
                <div id="main-image-container">
                    {this.loadingStatus()}
                    {/* Note the 480 x 270 is the 1920 * 1080 ratio */}
                    <div id="canvas-container">
                        <canvas
                            id="canvas"
                            className={this.props.prefix + "Canvas"}
                            width="960"
                            height="540"
                        ></canvas>
                        {this.getHiddenImageContainer()}
                    </div>
                </div>
                <div id="annotation-buttons-container">
                    {/* <button
                        id="serialize-info-button"
                        onClick={this.serializeInfo}
                    >
                        Serialize
                    </button> */}
            
                    <button
                        id="post-annotation-button"
                        onClick={this.postAnnotationAndGetNext}
                    >
                        PostAnnotation
                    </button>
            
                    {/* <button
                        id="refresh-interval-button"
                        onClick={this.refreshAnnotationInterval}
                    >
                        Refresh Interval
                    </button> */}
                </div>
            </div>
        );
    }
}

export default ImgBlock;
