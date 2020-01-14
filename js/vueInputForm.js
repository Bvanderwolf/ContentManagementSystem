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
        progressBarWidth: "0",
        progressBarText: "",
        progressBarTextIndex: 0,
        progressBarTexts: [
          "Feeling Sleepy",
          "getting model map",
          "uploading model",
          "uploading placeholderImage",
          "sending new model map",
          "looking github api update",
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

    async submitFormAsync() {
      if (!this.fileloaded || !this.photoloaded) {
        console.log(`file: ${this.fileloaded} / photo: ${this.photoloaded} not loaded yet`);
        return;
      }

      this.styles.progressBarText = this.styles.progressBarTexts[this.styles.progressBarTextIndex];

      const accessToken = this.getGithubAccessToken();

      var modelMapDict = await this.getModelMap();
      this.incrementProgressBar(20);
      let id = Object.keys(modelMapDict.map).length;

      if (this.message.text == "") {
        this.message.text = "added file with name " + this.filename;
      }

      let fileExtension = this.filename.substring(this.filename.lastIndexOf("."));
      if (fileExtension == ".json" && this.selection.modeltype == "IOS") {
        this.selection.modeltype = "Android";
      } else if (fileExtension == ".usdz" && this.selection.modeltype == "Android") {
        this.selection.modeltype = "IOS";
      }
      let photoExtension = this.photoname.substring(this.photoname.lastIndexOf("."));

      const modelUrl = "https://api.github.com/repos/" + this.repoName + "/contents/models/model" + id + fileExtension;

      const photoUrl = "https://api.github.com/repos/" + this.repoName + "/contents/placeholderImages/placeholderImage" + id + photoExtension;

      let modelResponse = await this.uploadFile(this.filecontent, accessToken, this.message.text, modelUrl);
      this.incrementProgressBar(20);

      let photoResponse = await this.uploadFile(this.photocontent, accessToken, this.message.text, photoUrl);
      this.incrementProgressBar(20);

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
      console.log(modelMap);

      //package jsonstring content into a blob so it can be turned into a base64 string to sent to github
      var modelMapPackaged = await this.getReadableURLString(new Blob([JSON.stringify(modelMap)], { type: "application/json" }));
      modelMapPackaged = modelMapPackaged.split(",")[1];

      const modelMapUrl = "https://api.github.com/repos/" + this.repoName + "/contents/modelMap.json";

      let modelMapResponse = await this.uploadFile(modelMapPackaged, accessToken, this.message.text, modelMapUrl, modelMapDict.sha);
      this.incrementProgressBar(20);

      await this.getUploadStatus(modelResponse["content"]["sha"], photoResponse["content"]["sha"], modelMapDict);

      this.filecontent = "";
      this.photocontent = "";
      this.fileloaded = false;
      this.photoloaded = false;
      this.incrementProgressBar(0);
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

    async doesFileExist(url) {
      let response = await fetch(url);
      return response.ok;
    },

    async getUploadStatus(photoSha, modelSha, modelMap) {
      photoDone = false;
      modelDone = false;
      modelMapDone = false;
      console.log(photoSha);
      console.log(modelSha);
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
      this.incrementProgressBar(20);
    },

    // Wait for given amount of milliseconds
    sleep(ms) {
      return new Promise(resolve => setTimeout(resolve, ms));
    },

    // Increment progress bar by given amount
    incrementProgressBar(amount) {
      let currentAmount = Number(this.styles.progressBarWidth);
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
