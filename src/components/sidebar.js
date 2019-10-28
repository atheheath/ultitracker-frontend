import React from "react";
import { Link } from "react-router-dom"
import "../stylesheets/sidebar.css"

class SidebarToggle extends React.Component {
    constructor(props) {
        super()
        this.state = {
            open: 0,
            initialMargin: "-15vw"
        }
        this.toggle = this.toggle.bind(this);
    }

    toggle() {
        const newState = 1 - this.state.open;
        const newWidth = (newState === 0) ? this.state.initialMargin : "0";

        this.setState({open: newState})

        document.getElementById("sidebar").style.marginLeft = newWidth;
        document.getElementById("sidebarToggleButton").classList.toggle('rotated');
    }

    componentDidMount() {
        document.getElementById("sidebar").style.marginLeft = this.state.initialMargin;
        document.getElementById("sidebarToggle").addEventListener("click", this.toggle, false);
    }

    componentWillUnmount() {
        document.getElementById("sidebarToggle").removeEventListener("click", this.toggle, false);
    }

    render() {
        return (
            <div id="sidebarToggle">
                <button id="sidebarToggleButton"/>
            </div>
            
        )
    }
}

const Sidebar = (props) => {
    return (
        <div id="sidebar">
            <SidebarToggle/>
            <header id="sidebarHeader">
                <div id="sidebarUserPlaceholder">
                    <div id="sidebarUserImgPlaceholder"></div>
                    <p>Placeholder</p>
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