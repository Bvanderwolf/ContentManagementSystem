new Vue({
    // root node
    el: "#app",
    // the instance state
    data: function() {
        return {
            features: ["Animation", "Textures", "Low Poly"],
            selection: {
                member: "0",
                modeltype: "wearable-head",
                features: []
            },
            message: {
                text: ``,
                maxlength: 255
            },
            submitted: false
        };
    },
    methods: {
        // submit form handler
        submit: function() {
            this.submitted = true;
        },
        // check or uncheck all
        checkAll: function(event) {
            this.selection.features = event.target.checked ? this.features : [];
        },

        submitForm: function() {
            const text = this.message.text;
            const features = [];
            const modelType = this.selection.modeltype;
            const voetbaltaart = "338d81491cc7f65901b4";
            const basketbaaltaart = "ac44a104c1a628642561d1b7961644ce681df99c";
            var url = ""

            console.log(this.message.text);
            for (let i = 0; i < this.selection.features.length; i++) {
                console.log(this.selection.features[i]);
                features.push(this.selection.features[i]);
            }
            console.log(this.selection.features);
            console.log(this.selection.modeltype);

            const queryParams = window.location.href.replace(window.location.origin + "/", "");
            if (queryParams !== "") {
                if (queryParams.includes("code")) {
                    const code = queryParams.replace("?code=", "");

                    url = "https://cors-anywhere.herokuapp.com/https://github.com/login/oauth/access_token?code=${code}&client_id=${voetbaltaart}&client_secret=${basketbaltaart}";
                    const xhttp = new XMLHttpRequest();
                    xhttp.open("POST", url, true);
                    xhttp.setRequestHeader("X-Requested-With", "XMLHttpRequest");
                    xhttp.setRequestHeader("Accept", "application/json");
                    xhttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
                    xhttp.send();
                }
            } else {
                url = "https://github.com/login/oauth/authorize?client_id=${voetbaltaart}";
                window.location.assign(url);
            }
        }
    }
});