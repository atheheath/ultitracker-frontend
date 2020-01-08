import React, { Component } from "react";
import "../stylesheets/annotator.css";
import PlayerBboxImgBlock from "../components/PlayerBboxImgBlock";
import FieldLinesImgBlock from "../components/FieldLinesImgBlock";
import GameplayStateImgBlock from "../components/GameplayStateImgBlock";
import { Sidebar } from "../components/sidebar";

class Annotator extends Component {
    constructor(props) {
        super(props);
        this.state = {
            annotation_table: "player_bbox"
        };
        this.loadFieldLines = this.loadFieldLines.bind(this);
        this.loadPlayerBbox = this.loadPlayerBbox.bind(this);
        this.loadGameplayState = this.loadGameplayState.bind(this);
        this.loadNewBlock = this.loadNewBlock.bind(this);
        this.getImgBlock = this.getImgBlock.bind(this);
        this.setFieldLines = this.setFieldLines.bind(this);
        this.setPlayerBbox = this.setPlayerBbox.bind(this);
        this.setGameplayState = this.setGameplayState.bind(this);
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
    setGameplayState(table) {
        console.log("newTimeout");
        this.setState({
            annotation_table: "gameplay_state"
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
        } else if (table == "gameplay_state") {
            setTimeout(this.setGameplayState, timeout);
        }
    }

    loadFieldLines() {
        this.loadNewBlock("field_lines");
    }
    loadPlayerBbox() {
        this.loadNewBlock("player_bbox");
    }
    loadGameplayState() {
        this.loadNewBlock("gameplay_state");
    }

    // componentDidMount() {   }

    // componentWillMount() { }

    getImgBlock() {
        if (this.state.annotation_table == "field_lines") {
            return (
                <FieldLinesImgBlock
                    prefix={this.state.annotation_table}
                    annotation_table={this.state.annotation_table}
                />
            );
        } else if (this.state.annotation_table == "player_bbox") {
            return (
                <PlayerBboxImgBlock
                    prefix={this.state.annotation_table}
                    annotation_table={this.state.annotation_table}
                />
            );
        } else if (this.state.annotation_table == "gameplay_state") {
            return (
                <GameplayStateImgBlock
                    prefix={this.state.annotation_table}
                    annotation_table={this.state.annotation_table}
                />
            );
        }
    }

    render() {
        return (
            <div id="annotator">
                <Sidebar />
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
                            onClick={this.loadGameplayState}
                        >
                            Gameplay State
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
