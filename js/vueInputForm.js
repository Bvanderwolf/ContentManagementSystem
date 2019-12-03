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

        /*
        Upload file to Github using the Github Content API endpoint. 
        See https://developer.github.com/v3/repos/contents/ for info.
        
        TODO
        - Get file from view and upload file instead of test.txt (replace test.txt in 'url' constant)
        - Get Base64 encoded content from file and replace 'content: "dgVzdA==" with file content
        - Convert function to async await to improve performance
        - Show message that upload was successful or show error message
        */
        submitForm: function() {
            // Get access token from current url
            const queryParams = window.location.href.replace(window.location.origin + "/inputForm.html?", "");
            var access_token = queryParams.replace("&scope=public_repo&token_type=bearer", "");
            access_token = access_token.replace("access_token=", "");

            // TODO: Replace test.txt with actual model from view
            const url = "https://api.github.com/repos/bvanderwolf/bvanderwolf.github.io/contents/test.txt";
            // TODO: Replace content with actual content from file to upload
            const requestData = { message: this.message.text, content: "dGVzdA=="};

            const xhttp = new XMLHttpRequest();
            xhttp.open("PUT", url, true);
            // Authorize
            xhttp.setRequestHeader("Authorization", "token " + access_token);

            xhttp.send(JSON.stringify(requestData));

            // Wait until response from Github is fully recieved
            xhttp.onreadystatechange = function() {
                if (xhttp.readyState === 4) {
                    console.log(xhttp.response);
                }
            } 
            
            // TODO: show user that upload was successful or show error message
        }
    }
});
