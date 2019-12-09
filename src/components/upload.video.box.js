import React from 'react';
import "../stylesheets/upload.video.box.css";
import { tsPropertySignature } from '@babel/types';


const handleSubmit = (event) => {
    event.preventDefault();
    console.log("Login Submitted")
}



class UploadVideoBoxToggle extends React.Component {
    constructor(props) {
        super()
        this.state = {
            open: 0,
            initialDisplay: "none",
            progress: {
                value: 0,
                max: 0
            }
        }
        this.toggle = this.toggle.bind(this);
        this.uploadFile = this.uploadFile.bind(this);
        this.UploadVideoBoxButton = this.UploadVideoBoxButton.bind(this);
        this.UploadProgressBar = this.UploadProgressBar.bind(this);
        this.HideButton = this.HideButton.bind(this);
    }

    toggle() {
        const newState = 1 - this.state.open;
        const newDisplay = (newState === 0) ? this.state.initialDisplay : "block";

        this.setState({open: newState})

        document.getElementById("uploadVideoBox").style.display = newDisplay;
    }

    uploadFile() {
        let selectedFile = document.getElementById("uploadVideoBoxFileInput").files[0]
        const uri = "http://localhost:3001/upload_file"
    
        let formData = new FormData();
    
        formData.append("upload_file", selectedFile)
        
        var xhr = new XMLHttpRequest()
        xhr.open("POST", uri)
        xhr.onloadstart = function (e) {
            console.log("start")
        }
        xhr.onloadend = function (e) {
            console.log("end")
        }
        
        xhr.upload.addEventListener(
            "progress", 
            function(evt){
                if (evt.lengthComputable) {
                    this.setState({
                        progress: {
                            value: evt.loaded,
                            max: evt.total
                        }
                    })
                }
            }.bind(this), 
            false
        );
        xhr.send(formData);
    }
    
    UploadVideoBoxButton() {
        return (
            <div id="uploadVideoBoxButton">
                <button 
                    onClick={() => {
                        this.uploadFile()
                    }}
                >
                    Upload
                </button>
            </div>
        )
    }
    
    UploadProgressBar() {
        if (this.state.progress.max > 0) {
            return (
                <div id="uploadVideoBoxProgressBarContainer">
                    <progress 
                        value={this.state.progress.value} 
                        max={this.state.progress.max}
                    />
                    {this.state.progress.value >= this.state.progress.max ? "Upload Complete!" : ""}

                </div>
            )
        } else {
            return 
        }
        
    }

    HideButton() {
        if (this.state.display != "none") {
            return (
                <div>
                    <button onClick={() => {this.toggle()}}>Hide window</button>
                </div>
            )
        }
    }

    componentDidMount() {
        document.getElementById("uploadVideoBox").style.display = this.state.initialDisplay;
        document.getElementById("upload-video-button").addEventListener("click", this.toggle, false);
    }

    componentWillUnmount() {
        document.getElementById("upload-video-button").removeEventListener("click", this.toggle, false);
    }

    render() {
        return (
            <div id="uploadVideoBoxContainer">
                <form 
                id="uploadVideoBoxForm"
                method="post" 
                action="http://localhost:3001/upload_file"
                enctype="multipart/form-data"
                required
                >
                    <div id="uploadVideoBoxFile">
                        <input
                            id="uploadVideoBoxFileInput"
                            type="file"
                        />
                    </div>
                    <div id="uploadVideoBoxHomeTeam">
                        <input 
                            id="uploadVideoBoxHomeTeamInput" 
                            name="HomeTeam" 
                            placeholder="Home Team"
                        ></input>
                    </div>
                    <div id="uploadVideoBoxAwayTeam">
                        <input 
                            id="uploadVideoBoxAwayTeamInput" 
                            name="AwayTeam" 
                            placeholder="Away Team"
                        ></input>
                    </div>
                    <div id="uploadVideoBoxDate">
                        <input 
                            id="uploadVideoBoxDateInput" 
                            name="Date" 
                            type="date"
                        ></input>
                    </div>
                </form>
                {this.UploadVideoBoxButton()}
                {this.UploadProgressBar()}
                {this.HideButton()}
            </div>
        )
    }
}

const UploadVideoBox = (props) => {
    return (
        <div id="uploadVideoBox">
            <UploadVideoBoxToggle/>
        </div>
    )
}

export { UploadVideoBox };