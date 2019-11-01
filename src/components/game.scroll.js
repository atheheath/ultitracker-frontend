import React from 'react';
import auth from './auth';
import User from './user';
import "../stylesheets/game.scroll.css";


async function getGameListRequest(cookieAuthenticationKey) {
    var headers = auth.getAuthorizationHeader(cookieAuthenticationKey)
    var requestInit = {
        method: "GET",
        headers: headers,
        credentials: "include"
    }
    const request = new Request(
        "http://localhost:3001/get_game_list",
        requestInit
    )

    const gameList = await fetch(request)
        .then((response) => {
            if (!response.ok) {
                throw Error("Can't fetch: " + response)
            }
            return response.json()
        })
        .then((payload) => {
            return payload.game_list
        })
        .catch((err) => {
            console.log(err);
            return false;
        })

    return gameList
}

async function getGameList(cookieAuthenticationKey) {
    
    const isAuthenticated = await auth.isAuthenticated(cookieAuthenticationKey)
    
    if (!isAuthenticated) {
        console.log("Not authenticated");
        throw Error("Not authenticated");
    }

    console.log("Calling constructUserRequest")
    const gameList = getGameListRequest(cookieAuthenticationKey)
    
    return gameList;
}

const constructGameDiv = (gameData) => {
    return (
        <div>
            <p>{gameData.home + " vs. " + gameData.away}</p>
            <img src={gameData.thumbnail}/>
            <p>{"Date: " + gameData.date}</p>
            <p>{"Length: " + gameData.length}</p>
        </div>
    )
}

class GameScrollList extends React.Component {
    constructor(props) {
        super()
        this.state = {
            gameList: new Array()
        }

        this.constructDivList = this.constructDivList.bind(this)
    }

    async componentDidMount() {
        const gameList = await getGameList(this.props.cookieAuthenticationKey)
        console.log("gameList length: " + gameList.length)
        this.setState({gameList: gameList})
    }

    constructDivList() {
        var divList = new Array();
        console.log("Gamelist length Div is: " + this.state.gameList.length)
        this.state.gameList.forEach((game, index) => {
            divList.push(constructGameDiv(game.data))
        })

        return divList;
    }

    render() {
        return (
            <div id="gameScrollList">
                {this.constructDivList()}
            </div>
            
        )
    }
}

export { GameScrollList };