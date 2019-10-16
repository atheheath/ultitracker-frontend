import React from "react";
import { Route, Redirect } from "react-router-dom";

import auth from './auth';

class ProtectedRoute extends React.Component {
    constructor(props) {
        super()
        this.props = props;
        this.state = {};
    }
    componentDidMount() {
        let toRender = auth.isAuthenticated(this.props, () => {})
            .then((result) => {
                if (result) {
                    this.setState({value: <this.props.component {...this.props} />});
                } else {
                    this.setState({value: "NOT AUTHENTICATED"})
                    // return <Redirect 
                    //     to={
                    //         {
                    //             pathname: "/",
                    //             from: props.location
                    //         }
                    //     }
                    // />
                }
            })
            .catch((err) => {
                console.log(err)
            })
    }

    render() {
        if (!this.state.value) return null
        return <div>{this.state.value}</div>
    }
}

export default ProtectedRoute;