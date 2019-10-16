import React from "react";
import { Link } from "react-router-dom"
import "../stylesheets/sidebar.css"

class SidebarToggle extends React.Component {
    constructor(props) {
        super()
        this.state = {
            buttonChar: "->",
            open: 0
        }
        this.toggle = this.toggle.bind(this);
    }

    toggle() {
        const newState = 1 - this.state.open;
        const newWidth = (newState === 0) ? "-20%" : "0";
        const newChar = (newState === 0) ? "->" : "<-";

        this.setState({open: newState, buttonChar: newChar})

        document.getElementById("sidebar").style.marginLeft = newWidth;
    }

    componentDidMount() {
        document.getElementById("sidebar").style.marginLeft = "-20%";
        document.getElementById("sidebarToggle").addEventListener("click", this.toggle, false);
    }

    componentWillUnmount() {
        document.getElementById("sidebarToggle").removeEventListener("click", this.toggle, false);
    }

    render() {
        return (
            <button id="sidebarToggle">{this.state.buttonChar}</button>
        )
    }
}

const Sidebar = (props) => {
    return (
        <div id="sidebar">
            <SidebarToggle/>
            <header id="header">
                <div id="img-placeholder">
                    <a href="/">
                        <img src="/"/>
                    </a>
                    <h1>Placeholder</h1>
                    <p>Some tagline</p>
                </div>
                <nav id="main-nav">
                    <ul class="main-navigation">
                        <li><Link to="/">Landing Page</Link></li>
                        <li><Link to="/protected">Protected</Link></li>
                        <li><Link to="/game-explorer">Game Explorer</Link></li>
                        <li><Link to="/annotator">Annotator</Link></li>
                    </ul>
                </nav>
            </header>
        </div>
    )
}

export { Sidebar };