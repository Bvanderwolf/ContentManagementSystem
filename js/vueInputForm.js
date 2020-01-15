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
      // Commit message for GitHub
      message: {
        text: "",
        placeholder: `type commit message here`,
        maxlength: 255
      },
      styles: {
        progressBarWidth: "0%",
        progressBarText: "",
        progressBarTextIndex: -1,
        progressBarColor: "#2c3e50",
        progressBarTexts: [
          "getting model map",
          "uploading model",
          "uploading placeholderImage",
          "sending new model map",
          "looking for github api update",
          "Done!"
        ]
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
    //returns whether the file conforms to a set of file extensions related to models
    Is3DModel: function(file) {
      const accepted3DModelTypes = [".json", ".usdz", ".reality"];
      const name = file.name;
      return accepted3DModelTypes.includes(name.substring(name.lastIndexOf(".")));
    },
    //returns whether the file conforms to a set of file extensions related to images
    IsFileImage: function(file) {
      const acceptedImageTypes = ["image/gif", "image/jpeg", "image/png"];

      return file && acceptedImageTypes.includes(file);
    },

    async OnImageButtonChange() {
      const input = document.querySelector(".imagereader");
      //if there are input files we check whether the first is an image, if so
      //we convert it to a base64 string to show and store it

      if (input.files) {
        const inputfile = input.files[0];

        var fieldset = document.getElementById("input-fieldset");
        var images = document.getElementsByTagName('img').length;

        // check if there is already images uploaded, if so. 
        // it will remove the older elements with the img tag.
        if (images >= 1) {
          $("#preview-image").remove();
        }

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

          // we insert the image into the fieldset, 2 positions from the bottom
          // and give it the id preview-image
          fieldset.insertBefore(img, fieldset.children[fieldset.childElementCount - 2]).setAttribute("id", "preview-image");

          reader.readAsDataURL(inputfile);
        }
      }
    },

    async OnInputButtonChange() {
      const input = document.querySelector(".filereader");
      //if there are input files we check if the first one is a model, if so
      //we convert it to a base64 string which we can store for submittion of the form
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

    async submitFormAsync() {
      if (!this.fileloaded || !this.photoloaded) {
        console.log(`file: ${this.fileloaded} / photo: ${this.photoloaded} not loaded yet`);
        return;
      }

      //if the progressbar was already 100% we reset its value back to 0%
      if (this.styles.progressBarWidth == "100%") {
        this.styles.progressBarWidth = "0%";
        this.styles.progressBarTextIndex = -1;
      }

      //get the token necessary for committing on github api
      const accessToken = this.getGithubAccessToken();

      //increase the progressbar as it's fetching for the modelmap
      this.incrementProgressBar(17);

      //increase the progressbar after which the modelmap gets fetched
      this.incrementProgressBar(17);
      var modelMapDict = await this.getModelMap();

      //id for our new submittion is based on the key count of the modelmap json file
      let id = Object.keys(modelMapDict.map).length;

      //if there is no message written we set a default message
      if (this.message.text == "") {
        this.message.text = "added file with name " + this.filename;
      }

      //we make sure that the file extension of the model correctly corresponds to the modelType attribute in the form
      let fileExtension = this.filename.substring(this.filename.lastIndexOf("."));
      if (fileExtension == ".json" && this.selection.modeltype == "IOS") {
        this.selection.modeltype = "Android";
      } else if ((fileExtension == ".usdz" || fileExtension == ".reality") && this.selection.modeltype == "Android") {
        this.selection.modeltype = "IOS";
      }
      let photoExtension = this.photoname.substring(this.photoname.lastIndexOf("."));

      const modelUrl = "https://api.github.com/repos/" + this.repoName + "/contents/models/model" + id + fileExtension;

      const photoUrl = "https://api.github.com/repos/" + this.repoName + "/contents/placeholderImages/placeholderImage" + id + photoExtension;

      //after increasing our progressbar by another 20% we upload the model and wait for its response
      this.incrementProgressBar(17);
      let modelResponse = await this.uploadFile(this.filecontent, accessToken, this.message.text, modelUrl);

      // set an error message if the user fails to upload.
      if (modelResponse === null) {
        this.styles.progressBarText = "failed to upload model :: due to unauthorized access";
        this.styles.progressBarColor = "#ed0707";
        return;
      }
      //after increasing our progressbar by another 20% we upload the placeholderImage and wait for its response
      this.incrementProgressBar(17);
      let photoResponse = await this.uploadFile(this.photocontent, accessToken, this.message.text, photoUrl);

      //we add a new entry to the modelmap using all the info gained from the form and fetches from the github api
      var modelMap = modelMapDict.map;
      modelMap["model" + id] = JSON.parse(
        this.createJSONPackageObject(
          this.filename,
          this.message.text,
          photoResponse["content"]["sha"],
          "https://raw.githubusercontent.com/Bvanderwolf/bvanderwolf.github.io/master/models/model" + id + fileExtension,
          this.selection.modeltype,
          this.price
        )
      );

      //package jsonstring content into a blob so it can be turned into a base64 string to sent to github
      var modelMapPackaged = await this.getReadableURLString(new Blob([JSON.stringify(modelMap)], { type: "application/json" }));
      modelMapPackaged = modelMapPackaged.split(",")[1];

      const modelMapUrl = "https://api.github.com/repos/" + this.repoName + "/contents/modelMap.json";

      //after increasing our progressbar by another 20% we upload the new modelMap and wait for its response
      this.incrementProgressBar(17);
      await this.uploadFile(modelMapPackaged, accessToken, this.message.text, modelMapUrl, modelMapDict.sha);

      //after increasing our progressbar by another 20% we start waiting for our
      //modelMap, placeholderImage and model to be updated live on the github Api so they can be fetched by the JBL demo website
      this.incrementProgressBar(15);
      await this.getUploadStatus(modelResponse["content"]["sha"], photoResponse["content"]["sha"], modelMapDict);

      //reset all form attribute values and finish up by incrementing the progressbar one last time
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

      // Upload data to GitHub
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
    createJSONPackageObject(title, description, photosha, modelurl, modelType, price) {
      var obj = new Object();
      obj.title = title;
      obj.description = description;
      obj.modeltype = modelType;
      obj.price = price;
      obj.photosha = photosha;
      obj.modelurl = modelurl;
      return JSON.stringify(obj);
    },

    // Check if modelMap.json on GitHub repository is updated
    // by comparing the old most highest id to new highest id
    async isModelMapUpdated(modelMap) {
      // Get old id
      let oldId = Object.keys(modelMap.map).length;
      // Get new id
      let newModelMap = await this.getModelMap();
      let newId = Object.keys(newModelMap.map).length;

      return newId === oldId;
    },
    //returns whether a given url gives a valid response
    async doesFileExist(url) {
      let response = await fetch(url);
      return response.ok;
    },
    //checks whether photo, model and model map are uploaded or not by checking with intervals of 3 seconds
    async getUploadStatus(photoSha, modelSha, modelMap) {
      photoDone = false;
      modelDone = false;
      modelMapDone = false;

      const photourl = `https://api.github.com/repos/${this.repoName}/git/blobs/${photoSha}`;
      const modelurl = `https://api.github.com/repos/${this.repoName}/git/blobs/${modelSha}`;

      while (!photoDone || !modelDone || !modelMapDone) {
        if (!modelMapDone && this.isModelMapUpdated(modelMap)) {
          modelMapDone = true;
        }
        if (!photoDone && this.doesFileExist(photourl)) {
          photoDone = true;
        }
        if (!modelDone && this.doesFileExist(modelurl)) {
          modelDone = true;
        }

        await this.sleep(3000);
      }
    },

    // Wait for given amount of milliseconds
    sleep(ms) {
      return new Promise(resolve => setTimeout(resolve, ms));
    },

    // Increment progress bar by given amount
    incrementProgressBar(amount) {
      let currentAmount = Number(this.styles.progressBarWidth.slice(0, -1));
      let newAmount = currentAmount + amount;

      // Avoid progress values above 100
      if (newAmount > 100) {
        newAmount = 100;
      }

      this.styles.progressBarTextIndex++;
      this.styles.progressBarWidth = Math.round(newAmount).toString() + "%";
      this.styles.progressBarText = `${this.styles.progressBarWidth} (${this.styles.progressBarTexts[this.styles.progressBarTextIndex]})`;
    }
  }
});
