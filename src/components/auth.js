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

function UserException(message) {
    this.message = message;
    this.name = "UserException"
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

    const request = new Request("http://localhost:3001/token", {
        method: "POST",
        credentials: "include",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: urlencodeParams({
            username: username,
            password: password
        })
    });
    return request;
}

const constructAddUserForm = (
    usernameInputId, 
    passwordInputId,
    confirmPasswordInputId,
    emailInputId,
    fullNameInputId
) => {

    var username = document.getElementById(usernameInputId).value;
    var password = document.getElementById(passwordInputId).value;
    var confirmPassword = document.getElementById(confirmPasswordInputId).value;
    var email = document.getElementById(emailInputId).value;
    var fullName = document.getElementById(fullNameInputId).value;

    if ( !(password === confirmPassword) ) {
        throw new UserException("NonmatchingPasswords");
    }

    const request = new Request("http://localhost:3001/add_user", {
        method: "POST",
        credentials: "include",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: urlencodeParams({
            username: username,
            password: password,
            email: email,
            full_name: fullName
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
        console.log("Submitting Login Form");
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
    
    async addUser(
        usernameInputId, 
        passwordInputId,
        confirmPasswordInputId,
        emailInputId,
        fullNameInputId, 
        callback) 
    {
        console.log("Submitting Add User Form");
        try {
            const request = constructAddUserForm(
                usernameInputId, 
                passwordInputId,
                confirmPasswordInputId,
                emailInputId,
                fullNameInputId
            );

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
        catch(e) {
            if ((e.name === "UserException") && (e.message === "NonmatchingPasswords")) {
                console.log("Nonmatching passwords")
            }
            
            console.error(e.message, e.name);
        }
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