import React, { Component } from "react";
import "../stylesheets/annotator.css";
import PlayerBboxImgBlock from "../components/PlayerBboxImgBlock";
import FieldLinesImgBlock from "../components/FieldLinesImgBlock";
import CameraAngleImgBlock from "../components/CameraAngleImgBlock";
import { Sidebar } from "../components/sidebar";
import { AnnotatorBar } from "../components/annotator.bar"

class Annotator extends Component {
    constructor(props) {
        super(props);
        this.state = {
            annotation_table: "player_bbox",
            active_game: null
        };
        this.loadFieldLines = this.loadFieldLines.bind(this);
        this.loadPlayerBbox = this.loadPlayerBbox.bind(this);
        this.loadCameraAngle = this.loadCameraAngle.bind(this);
        this.loadNewBlock = this.loadNewBlock.bind(this);
        this.getImgBlock = this.getImgBlock.bind(this);
        this.setFieldLines = this.setFieldLines.bind(this);
        this.setPlayerBbox = this.setPlayerBbox.bind(this);
        this.setCameraAngle = this.setCameraAngle.bind(this);
        this.lastCall = new Date().getTime();
    }

    setFieldLines(table) {
        console.log("newTimeout");
        this.setState({
            annotation_table: "field_lines"
        });
    }
    setPlayerBbox(table) {
        console.log("newTimeout");
        this.setState({
            annotation_table: "player_bbox"
        });
    }
    setCameraAngle(table) {
        console.log("newTimeout");
        this.setState({
            annotation_table: "camera_angle"
        });
    }

    loadNewBlock(table) {
        var timeout = Math.max(this.lastCall + 1000 - new Date().getTime(), 0);
        console.log("timeout", timeout);
        this.lastCall = new Date().getTime() + timeout;
        if (table == "field_lines") {
            setTimeout(this.setFieldLines, timeout);
        } else if (table == "player_bbox") {
            setTimeout(this.setPlayerBbox, timeout);
        } else if (table == "camera_angle") {
            setTimeout(this.setCameraAngle, timeout);
        }
    }

    loadFieldLines() {
        this.loadNewBlock("field_lines");
    }
    loadPlayerBbox() {
        this.loadNewBlock("player_bbox");
    }
    loadCameraAngle() {
        this.loadNewBlock("camera_angle");
    }

    // componentDidMount() {   }

    // componentWillMount() { }

    setActiveGame(activeGame) {
        this.setState({activeGame: activeGame})
        console.log("ActiveGame: " + activeGame)
    }

    getImgBlock() {
        console.log("ImgBlock: getting imgblock")
        if (this.state.annotation_table == "field_lines") {
            return (
                <FieldLinesImgBlock
                    prefix={this.state.annotation_table}
                    annotation_table={this.state.annotation_table}
                    cookieAuthenticationKey={this.props.cookieAuthenticationKey}
                    game_id={this.state.activeGame}
                />
            );
        } else if (this.state.annotation_table == "player_bbox") {
            return (
                <PlayerBboxImgBlock
                    prefix={this.state.annotation_table}
                    annotation_table={this.state.annotation_table}
                    cookieAuthenticationKey={this.props.cookieAuthenticationKey}
                    game_id={this.state.activeGame}
                />
            );
        } else if (this.state.annotation_table == "camera_angle") {
            return (
                <CameraAngleImgBlock
                    prefix={this.state.annotation_table}
                    annotation_table={this.state.annotation_table}
                    cookieAuthenticationKey={this.props.cookieAuthenticationKey}
                    game_id={this.state.activeGame}
                />
            );
        }
    }

    render() {
        return (
            <div id="annotator">
                <Sidebar />
                <AnnotatorBar 
                    cookieAuthenticationKey={this.props.cookieAuthenticationKey}
                    setActiveGame={(newValue) => this.setActiveGame(newValue)}
                />
                <h1>Annotator</h1>
                <div id="annotator-content">
                    <div id="annotator-content-buttons-container">
                        <button
                            // class="annotationButton"
                            onClick={this.loadPlayerBbox}
                        >
                            Player Bbox
                        </button>
                        <button
                            // class="annotationButton"
                            onClick={this.loadFieldLines}
                        >
                            Field Lines
                        </button>
                        <button
                            // class="annotationButton"
                            onClick={this.loadCameraAngle}
                        >
                            Camera Angle
                        </button>
                    </div>
                    {this.getImgBlock()}
                </div>
                <h1>Annotation table is {this.state.annotation_table}</h1>
                {/* <main>{this.props.children}</main> */}
            </div>
        );
    }
}

export default Annotator;
