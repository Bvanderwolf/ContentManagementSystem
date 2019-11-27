new Vue({
    // root node
    el: "#login",

    methods: {
        // submit form handler
        loginGit: function() {
            const voetbaltaart = "338d81491cc7f65901b4";
            const basketbaltaart = "ac44a104c1a628642561d1b7961644ce681df99c";
            var url = ""

            const queryParams = window.location.href.replace(window.location.origin + "/", "");
            if (queryParams !== "") {
                if (queryParams.includes("code")) {
                    const code = queryParams.replace("?code=", "");

                    url = "https://cors-anywhere.herokuapp.com/https://github.com/login/oauth/access_token?code=" +
                        code +
                        "&client_id=" +
                        voetbaltaart +
                        "&client_secret=" +
                        basketbaltaart;
                    const xhttp = new XMLHttpRequest();


                    xhttp.open("POST", url, true);
                    xhttp.setRequestHeader("X-Requested-With", "XMLHttpRequest");
                    xhttp.setRequestHeader("Accept", "application/json");
                    xhttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
                    xhttp.send();
                    xhttp.responseType = "json";

                    window.location.assign(window.location.origin + "\inputForm.html" + xhttp.response);
                }
            } else {
                url = "https://github.com/login/oauth/authorize?client_id=${voetbaltaart}";
                window.location.assign(url);
            }
        }
    }
});