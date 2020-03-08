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

const pushToHome = (props) => {
    props.history.push("/");
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

    getAuthorizationHeader(cookieAuthenticationKey) {
        var myHeaders = new Headers();
        console.log("Document cookie: " + document.cookie);
        const cookieValue = readCookie(document.cookie, cookieAuthenticationKey);
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
            .then((is_valid) => {
                console.log("Returned value")
                console.log("is_valid: " + is_valid)
                if (is_valid) {
                    console.log("Calling login form callback");
                    callback();
                    return true;
                } else {
                    return false
                }
            })

        return result;
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
                .then((isValid) => {
                    if (isValid) {
                        console.log("Calling login form callback");
                        callback();
                        return true
                    }
                    else {
                        console.log("Username already exists")
                        return false
                    }
                })
            
            return result;
        }
        catch(e) {
            if ((e.name === "UserException") && (e.message === "NonmatchingPasswords")) {
                console.log("Nonmatching passwords")
            }
            return e.message
            // console.error(e.message, e.name);
        }
    }

    async isAuthenticated(cookieAuthenticationKey) {
        var headers = this.getAuthorizationHeader(cookieAuthenticationKey)
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

    redirectToHome(props) {
        console.log("Redirected to Home, Please login")
        props.history.push("/")
    }

}

export default new Auth();