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
            const url = `https://github.com/login/oauth/authorize?client_id=${voetbaltaart}`;

            console.log(this.message.text);
            for (let i = 0; i < this.selection.features.length; i++) {
                console.log(this.selection.features[i]);
                features.push(this.selection.features[i]);
            }
            console.log(this.selection.features);
            console.log(this.selection.modeltype);

            window.location.assign(url)

            // const xhttp = new XMLHttpRequest();

            // xhttp.open("GET", url);
            // xhttp.setRequestHeader("X-Requested-With", "XMLHttpRequest")
            // xhttp.responseType = "document"
            // xhttp.send(null);
        }
    }
});