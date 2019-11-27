new Vue({
    // root node
    el: "#login",

    methods: {
        // submit form handler
        loginGit: function() {
            const voetbaltaart = "338d81491cc7f65901b4";
            const url = `https://github.com/login/oauth/authorize?client_id=${voetbaltaart}`;
            window.location.assign(url);
        
            console.log("Hoi !");
        }
    }
});