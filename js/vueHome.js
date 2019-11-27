new Vue({
    // root node
    el: "#login",

    methods: {
        // submit form handler
        loginGit: function() {
            const voetbaltaart = "338d81491cc7f65901b4";
            const basketbaltaart = "ac44a104c1a628642561d1b7961644ce681df99c"
            var url = ""

            // Get querystring from url
            const queryParams = window.location.href.replace(window.location.origin + "/", "");
            if (queryParams !== "") {
                // Check if query params includes 'code' because if it doesn't the authorization process is already finished
                if (queryParams.includes("code")) {
                    // Get Github code from querystring
                    const code = queryParams.replace("?code=", "");

                    // Construct url with querystring and using cors-anywhere as reverse proxy to prevent CORS errors.
                    url = "https://cors-anywhere.herokuapp.com/https://github.com/login/oauth/access_token?code=" +
                        code +
                        "&client_id=" +
                        voetbaltaart +
                        "&client_secret=" +
                        basketbaltaart;
                    
                    // Send request to Github for access-token
                    const xhttp = new XMLHttpRequest();
                    xhttp.open("GET", url, true);
                    xhttp.setRequestHeader("X-Requested-With", "XMLHttpRequest"); // Needed for reverse proxy
                    xhttp.send();
                    
                    // Wait until request is fully processed before getting the response
                    xhttp.onreadystatechange = function() {
                        if (xhttp.readyState === 4) {
                    console.log(xhttp.response)
                        }
                    } 

                    // Navigate to input form, passing Github response as querystring
                    window.location.assign(window.location.origin + "\\inputForm.html?" + xhttp.response);
                }
            } else {
                // If a code has not been recieved from Github yet, navigate to Github login screen.
                url = "https://github.com/login/oauth/authorize?client_id=" + voetbaltaart;
                window.location.assign(url);
            }
        }
    }
});
