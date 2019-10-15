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

    login(loginForm, callback) {
        console.log("Submitting Form");
        loginForm.submit();
        console.log("Submitted Form");
        console.log("Calling login form callback");
        callback();
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
            "http://localhost:5678/renew_token",
            requestInit
        )

        fetch(request)
            .then((response) => response.text())
            .then((json) => {
                console.log("Gotcha");
                window.location.reload(true);
            }).catch((err) => {
                console.log(err);
            })
    }

}

export default new Auth();