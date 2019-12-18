new Vue({
    // root node
    el: "#login",

    methods: {
        // submit form handler
        async loginGit() {
            this.navigateToInputFormIfLoggedIn();

            const voetbaltaart = "338d81491cc7f65901b4";

            // If a code has not been recieved from Github yet, navigate to Github login screen.
            url = "https://github.com/login/oauth/authorize?client_id=" + voetbaltaart + "&scope=public_repo";
            window.location.assign(url);
        },

        async navigateToInputFormIfLoggedIn() {
            let queryParams = new URLSearchParams(window.location.search);
            let code = queryParams.get("code");
            if (code !== null) {
                const voetbaltaart = "338d81491cc7f65901b4";
                const basketbaltaart = "ac44a104c1a628642561d1b7961644ce681df99c"

                // Construct url with query parameters and using cors-anywhere as reverse proxy to prevent CORS errors.
                url = "https://cors-anywhere.herokuapp.com/https://github.com/login/oauth/access_token?code=" +
                    code +
                    "&client_id=" +
                    voetbaltaart +
                    "&client_secret=" +
                    basketbaltaart;

                // Send request to Github for access-token
                let response = await fetch(url, {
                    headers: {
                        "Accept": "application/x-www-form-urlencoded",
                        "Origin": "bvanderwolf.github.io"
                    }
                });
                window.location.assign(window.location.origin + "\\inputForm.html?" + response);
            }
        }
    },
    created() {
        this.navigateToInputFormIfLoggedIn();
    }
});