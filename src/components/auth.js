function parseJwt (token) {
    var base64Url = token.split('.')[1];
    var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    var jsonPayload = decodeURIComponent(
        atob(base64)
            .split('')
            .map(
                function(c) {
                    return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
                }
            )
            .join('')
    );

    return JSON.parse(jsonPayload);
};

function readCookie(cookieString, name) {
	var nameEQ = name + "=";
	var ca = document.cookie.split(';');
	for(var i=0;i < ca.length;i++) {
		var c = ca[i];
		while (c.charAt(0)==' ') c = c.substring(1,c.length);
		if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
	}
	return null;
}

const urlencodeParams = (params) => {
    var paramsArray = Array()

    for (var key in params) {
        paramsArray.push(key + "=" + params[key])
    }

    const encodedString = paramsArray.join("&");

    return encodedString;
}

const constructLoginForm = (usernameInputId, passwordInputId) => {
    var username = document.getElementById(usernameInputId).value;
    var password = document.getElementById(passwordInputId).value;
    var redirect_url = "http://localhost:3000/protected";

    const formData = new FormData();
    formData.append("username", username);
    formData.append("password", password);
    formData.append("redirect_url", redirect_url);

    // return formData;
    const request = new Request("http://localhost:3001/token", {
        method: "POST",
        credentials: "include",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: urlencodeParams({
            username: username,
            password: password,
            redirect_url: redirect_url
        })
    });
    return request;
}

class Auth {

    getAuthorizationHeader(props) {
        var myHeaders = new Headers();
        console.log("cookieAuthenticationKey: " + props.cookieAuthenticationKey)
        console.log("Document cookie: " + document.cookie);
        const cookieValue = readCookie(document.cookie, props.cookieAuthenticationKey);
        myHeaders.set("Authorization", "Bearer " + cookieValue);
        myHeaders.set("Accept", "Application/json");
        myHeaders.set("Credentials", "Include");
        return myHeaders;
    }

    async login(usernameInputId, passwordInputId, callback) {
        console.log("Submitting Form");
        const request = constructLoginForm(usernameInputId, passwordInputId);
        let result = fetch(request)
            .then((response) => {
                console.log("Received response");
                return response.ok;
            })
            .then(() => {
                console.log("Calling login form callback");
                callback();
            })
    }
    
    logout(callback) {
        this.authenticated = false;
        callback();
    }

    async isAuthenticated(props, callback) {
        var headers = this.getAuthorizationHeader(props)
        var requestInit = {
            method: "POST",
            headers: headers,
            credentials: "include"
        }
        const request = new Request(
            "http://localhost:3001/renew_token",
            requestInit
        )

        let result = fetch(request)
            .then((response) => {
                return response.ok;
            })
            .catch((err) => {
                console.log(err);
                return false;
            })

        return result
    }

}

export default new Auth();