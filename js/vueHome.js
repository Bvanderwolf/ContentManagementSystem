new Vue({
  // root node
  el: "#login",

  methods: {
    // submit form handler
    async loginGit() {
      this.navigateToInputFormIfLoggedIn();

      const voetbaltaart = "client-id";

      // If a code has not been recieved from Github yet, navigate to Github login screen.
      url = "https://github.com/login/oauth/authorize?client_id=" + voetbaltaart + "&scope=public_repo";
      window.location.assign(url);
    },

    async navigateToInputFormIfLoggedIn() {
      const queryParams = new URLSearchParams(window.location.search);
      if (!queryParams.has("code")) return;

      const code = queryParams.get("code");
      const voetbaltaart = "client-id";
      const basketbaltaart = "client-secret";

      // Construct url with query parameters and using cors-anywhere as reverse proxy to prevent CORS errors.
      url =
        "https://cors-anywhere.herokuapp.com/https://github.com/login/oauth/access_token?code=" +
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
          // Navigate to input form, passing Github response as querystring
          window.location.assign(window.location.origin + "\\inputForm.html?" + xhttp.response);
        }
      };
    }
  },
  created() {
    this.navigateToInputFormIfLoggedIn();
  }
});
