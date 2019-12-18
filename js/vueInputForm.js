new Vue({
    // root node
    el: "#app",
    // the instance state
    data: function() {
        return {
            features: ["Animation", "Textures", "Low Poly"],
            selection: {
                member: "0",
                modeltype: "IOS",
                features: []
            },
            message: {
                text: "",
                placeholder: `type commit message here`,
                maxlength: 255
            },
            styles: {
                progressBarWidth: "10%"
            },
            submitted: false,
            priceplaceholder: "100$",
            price: "",
            filename: "",
            photoname: "",
            filecontent: "",
            photocontent: "",
            fileloaded: false,
            photoloaded: false,
            repoName: "Bvanderwolf/bvanderwolf.github.io"
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

        Is3DModel: function(file) {
            const accepted3DModelTypes = [".json", ".usdz"];
            const name = file.name;
            return accepted3DModelTypes.includes(name.substring(name.lastIndexOf(".")));
        },

        IsFileImage: function(file) {
            const acceptedImageTypes = ["image/gif", "image/jpeg", "image/png"];

            return file && acceptedImageTypes.includes(file);
        },

        async OnImageButtonChange() {
            const input = document.querySelector(".imagereader");
            console.log(input.files[0]);
            if (input.files) {
                const inputfile = input.files[0];

                if (this.IsFileImage(inputfile["type"])) {
                    const reader = new FileReader();

                    this.photocontent = await this.getReadableURLString(inputfile);
                    this.photoname = inputfile.name;
                    this.photoloaded = true;

                    const img = new Image();
                    img.src = this.photocontent;
                    img.width = 100;
                    img.height = 100;

                    this.photocontent = this.photocontent.split(",")[1];

                    var fieldset = document.getElementById("input-fieldset");
                    fieldset.insertBefore(img, fieldset.children[fieldset.childElementCount - 1]);

                    reader.readAsDataURL(inputfile);
                }
            }
        },

        async OnInputButtonChange() {
            const input = document.querySelector(".filereader");

            if (input.files) {
                const inputfile = input.files[0];

                if (this.Is3DModel(inputfile)) {
                    console.log("file loading");

                    // Wait until content is processed completely
                    this.filecontent = await this.getReadableURLString(inputfile);
                    // Remove header to get valid Base64 encoded content
                    this.filecontent = this.filecontent.split(",")[1];
                    this.filename = inputfile.name;
                    this.fileloaded = true;
                }
            }
        },

        /*
              Upload file to Github using the Github Content API endpoint. 
              See https://developer.github.com/v3/repos/contents/#create-or-update-a-file for info.
            */
        async submitFormAsync() {
            if (!this.fileloaded || !this.photoloaded) {
                console.log("file or photo not loaded yet");
                return;
            }

            const accessToken = this.getGithubAccessToken();

            var modelMapDict = await this.getModelMap();
            let id = Object.keys(modelMapDict.map).length + 1;

            if (this.message.text == "") {
                this.message.text = "added file with name " + this.filename;
            }

            let fileExtension = this.filename.substring(this.filename.lastIndexOf("."));
            let photoExtension = this.photoname.substring(this.photoname.lastIndexOf("."));

            const modelUrl = "https://api.github.com/repos/" + this.repoName + "/contents/models/model" + id + fileExtension;

            const photoUrl = "https://api.github.com/repos/" + this.repoName + "/contents/placeholderImages/placeholderImage" + id + photoExtension;

            let modelResponse = await this.uploadFile(this.filecontent, accessToken, this.message.text, modelUrl);
            this.progressBarWidth = "17%";
            let photoResponse = await this.uploadFile(this.photocontent, accessToken, this.message.text, photoUrl);
            this.progressBarWidth = "33%";

            var modelMap = modelMapDict.map;
            modelMap["model" + id] = JSON.parse(
                this.createJSONPackageObject(
                    this.filename,
                    this.message.text,
                    "https://raw.githubusercontent.com/" + this.repoName + "/master/placeholderImages/placeholderImage" + id + photoExtension,
                    "https://raw.githubusercontent.com/" + this.repoName + "/master/models/model" + id + fileExtension,
                    this.selection.modeltype,
                    this.price
                )
            );
            console.log(modelMap);

            //package jsonstring content into a blob so it can be turned into a base64 string to sent to github
            var modelMapPackaged = await this.getReadableURLString(new Blob([JSON.stringify(modelMap)], { type: "application/json" }));
            modelMapPackaged = modelMapPackaged.split(",")[1];

            const modelMapUrl = "https://api.github.com/repos/" + this.repoName + "/contents/modelMap.json";

            let modelMapResponse = await this.uploadFile(modelMapPackaged, accessToken, this.message.text, modelMapUrl, modelMapDict.sha);
            this.progressBarWidth = "50%"

            // await this.allUploaded(
            //     modelMapUrl,
            //     modelMapResponse,
            //     photoUrl,
            //     photoResponse,
            //     modelUrl,
            //     modelResponse
            // )
            await this.isUploaded(modelMapUrl, modelMapResponse["content"]["sha"]);
            this.progressBarWidth = "100%"

            this.filecontent = "";
            this.photocontent = "";
            this.fileloaded = false;
            this.photoloaded = false;
        },

        // Get access token for Github from url
        getGithubAccessToken() {
            const queryParams = new URLSearchParams(window.location.search);
            return queryParams.get("access_token");
        },

        async getReadableURLString(blob) {
            const ToBase64 = file =>
                new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.readAsDataURL(file);
                    reader.onload = () => resolve(reader.result);
                    reader.onerror = () => reject(error);
                });

            var readablestring = await ToBase64(blob);
            return readablestring;
        },

        async uploadFile(filecontent, accessToken, _message, url, _sha = "") {
            var requestData;
            if (_sha == "") {
                requestData = { message: _message, content: filecontent };
            } else {
                requestData = { message: "updated modelmap.json", content: filecontent, sha: _sha };
            }

            let response = await fetch(url, {
                method: "PUT",
                headers: {
                    Authorization: "token " + accessToken,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(requestData)
            });

            return await response.json();
        },

        async getModelMap() {
            var request = await fetch("https://api.github.com/repos/" + this.repoName + "/contents/modelMap.json");
            var requestjson = await request.json();
            var content = window.atob(requestjson["content"]);
            console.log(requestjson);
            var modelMap = JSON.parse(content);
            console.log(modelMap);
            return { map: modelMap, sha: requestjson["sha"] };
        },

        //creates package usable for JBL website
        createJSONPackageObject(title, description, photourl, modelURL, modelType, price) {
            var obj = new Object();
            obj.title = title;
            obj.description = description;
            obj.modeltype = modelType;
            obj.price = price;
            obj.photourl = photourl;
            obj.modelurl = modelURL;
            return JSON.stringify(obj);
        },

        async isUploaded(path, sha) {
            let response = await fetch(path);
            let content = await response.json();

            while (content["sha"] !== sha) {
                console.log("checked: " + content["sha"] + " with " + sha);
                await this.sleep(3000);
            }

            return true
        },

        // Sleep for given amount of milliseconds
        sleep(ms) {
            return new Promise(resolve => setTimeout(resolve, ms));
        },

        async allUploaded(modelMapUrl, modelMapResponse, photoUrl, photoResponse, modelUrl, modelResponse) {
            let modelMapResp = await fetch(modelMapUrl);
            let modelMapContent = await modelMapResp.json();

            let photoResp = await fetch(photoUrl);
            let photoContent = await photoResp.json();

            let modelResp = await fetch(modelUrl);
            let modelContent = await modelResp.json();

            let modelMapUpdated = false
            let photoUploaded = false
            let modelUploaded = false
            let allDone = false

            while (!allDone) {
                await this.sleep(3000)
                if (modelMapUpdated || await modelMapContent["sha"] !== modelMapResponse["content"]["sha"]) {
                    modelMapUpdated = true
                }
                if (photoUploaded || await photoContent["sha"] !== photoResp["content"]["sha"]) {
                    modelMapUpdated = true
                }
                if (modelUploaded || await modelContent["sha"] !== modelResp["content"]["sha"]) {
                    modelMapUpdated = true
                }
                allDone = modelMap && photoUploaded && modelUploaded
            }
        }
    }
});