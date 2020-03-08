import React from "react";
import { Link } from "react-router-dom"
import "../stylesheets/sidebar.css"
import {getUser} from "../pages/explorer"

/* There's gotta be a better way to create this 
arrow in the side bar. We have css between both the 
css file and the javascript code, whereas it should be
located in just one.*/

class SidebarToggle extends React.Component {
    constructor(props) {
        super()
        this.state = {
            open: 0,
            initialMargin: "-17vw",
            initialTransform: ""
        }
        this.toggle = this.toggle.bind(this);
    }

    toggle() {
        const newState = 1 - this.state.open;
        const newWidth = (newState === 0) ? this.state.initialMargin : "0";
        const newTransform = (newState === 0) ? this.state.initialTransform : "rotate(-180deg)";

        this.setState({open: newState})

        document.getElementById("sidebar").style.marginLeft = newWidth;
        document.getElementById("sidebarToggleArrow").style.transform = newTransform;
    }

    componentDidMount() {
        document.getElementById("sidebar").style.marginLeft = this.state.initialMargin;
        document.getElementById("sidebarToggle").addEventListener("click", this.toggle, false);
        console.log("userinfo cak: " + this.props.cookieAuthenticationKey)
        getUser(this.props.cookieAuthenticationKey).then((user) => {
            console.log("user: " + user)
            this.setState({
                username: user.username,
                email: user.email,
                fullName: user.fullName
            })
        })
    }

    componentWillUnmount() {
        document.getElementById("sidebarToggle").removeEventListener("click", this.toggle, false);
    }

    render() {
        return (
            <div id="sidebar">
                <div id="sidebarToggle">
                    <img id="sidebarToggleArrow" src="http://www.stickpng.com/assets/images/585e4773cb11b227491c3385.png"/>
                </div>
                <header id="sidebarHeader">
                    <div id="sidebarUserPlaceholder">
                        <div id="sidebarUserImgPlaceholder">
                            <img src="https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fwww.shareicon.net%2Fdata%2F512x512%2F2015%2F10%2F02%2F649910_user_512x512.png&f=1&nofb=1" />
                        </div>
                        <p>{this.state.fullName}</p>
                    </div>
                    <nav id="main-nav">
                        <ul class="main-navigation">
                            {/* <li><Link to="/">Landing Page</Link></li> */}
                            {/* <li><Link to="/protected">Protected</Link></li> */}
                            <li><Link to="/logout">Logout</Link></li>
                            <li><Link to="/explorer">Game Explorer</Link></li>
                            <li><Link to="/annotator">Annotator</Link></li>
                        </ul>
                    </nav>
                </header>
            </div>
            
        )
    }
}

const Sidebar = (props) => {
    return (
        <SidebarToggle {...props}/>
        // <div id="sidebar">
        //     <SidebarToggle/>
        //     <header id="sidebarHeader">
        //         <div id="sidebarUserPlaceholder">
        //             <div id="sidebarUserImgPlaceholder">
        //                 <img src="https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fwww.shareicon.net%2Fdata%2F512x512%2F2015%2F10%2F02%2F649910_user_512x512.png&f=1&nofb=1" />
        //             </div>
        //             <p>{props.fullName}</p>
        //             <p>Some tagline</p>
        //         </div>
        //         <nav id="main-nav">
        //             <ul class="main-navigation">
        //                 {/* <li><Link to="/">Landing Page</Link></li> */}
        //                 {/* <li><Link to="/protected">Protected</Link></li> */}
        //                 <li><Link to="/explorer">Game Explorer</Link></li>
        //                 <li><Link to="/annotator">Annotator</Link></li>
        //             </ul>
        //         </nav>
        //     </header>
        // </div>
    )
}

export { Sidebar };