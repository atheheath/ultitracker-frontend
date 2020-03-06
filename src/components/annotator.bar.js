import React from "react";
import { Link } from "react-router-dom"
import "../stylesheets/annotator.bar.css"
import { getGameList } from "./game.scroll"

/* There's gotta be a better way to create this 
arrow in the side bar. We have css between both the 
css file and the javascript code, whereas it should be
located in just one.*/

class AnnotatorBar extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            gameList: new Array(),
            selectedIndex: null,
            initialMargin: "-17vw",
            initialTransform: ""
        }
        this.toggle = this.toggle.bind(this);
    }

    toggle(event) {
        var target = event.target || event.srcElement;
        console.log(target.innerText);
        console.log(target)
        console.log(target.parentElement)
        console.log(target.parentElement.childNodes.length)
        const listElements = target.parentElement.childNodes;

        listElements.forEach(element => {
            element.style.backgroundColor = null;
        })

        for (
            var clickedElementIndex=0; 
            clickedElementIndex < listElements.length; 
            clickedElementIndex++
        ) {
            var currentElement = listElements[clickedElementIndex]
            if (currentElement === target) {
                break;
            }
        }

        console.log(clickedElementIndex)
        currentElement.style.backgroundColor = 'rgba(1, 1, 1, .2)';
        this.setState({selectedIndex: clickedElementIndex})
        this.props.setActiveGame(this.state.gameList[clickedElementIndex].game_id)
    }

    async componentDidMount() {
        // document.getElementById("sidebar").style.marginLeft = this.state.initialMargin;
        // document.getElementById("annotator-bar-game-list").addEventListener("click", this.toggle, false);
        const gameList = await getGameList(this.props.cookieAuthenticationKey)
        console.log("gameList length: " + gameList.length)
        this.setState({gameList: gameList})
        document.getElementById("annotator-bar-game-list").addEventListener("click", this.toggle, false);
    }

    componentWillUnmount() {
        document.getElementById("annotator-bar-game-list").removeEventListener("click", this.toggle, false);
    }

    constructListText(gameData) {
        return gameData.home + " vs. " + gameData.away + ": " + gameData.date
    }

    constructGameDiv(game) {
        const gameData = game.data
        return (
            <li>{this.constructListText(gameData)}</li>
        )
    }

    constructGameList() {
        var divList = new Array();
        console.log("Gamelist lengt Div is: " + this.state.gameList.length)
        this.state.gameList.forEach((game, index) => {
            divList.push(this.constructGameDiv(game))
        })

        return divList;
    }

    render() {
        return (
            <div id="annotator-bar">
                <header id="annotator-bar-header">
                    <div id="annotator-bar-placeholder">
                        {/* <div id="sidebarUserImgPlaceholder">
                            <img src="https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fwww.shareicon.net%2Fdata%2F512x512%2F2015%2F10%2F02%2F649910_user_512x512.png&f=1&nofb=1" />
                        </div> */}
                        <p>Placeholder</p>
                        <p>Some tagline</p>
                    </div>
                    <div id="annotator-bar-game-list">
                        {this.constructGameList()}
                    </div>
                    {/* <nav id="annotator-bar-main-nav">
                        <ul>
                            <li><Link to="/">Landing Page</Link></li>
                            <li><Link to="/protected">Protected</Link></li>
                            <li><Link to="/explorer">Game Explorer</Link></li>
                            <li><Link to="/annotator">Annotator</Link></li>
                        </ul>
                    </nav> */}
                </header>
            </div>
        )
    }
}


export { AnnotatorBar };