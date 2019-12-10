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
        text: `type commit message here`,
        maxlength: 255
      },
      submitted: false,
      filename: "",
      filecontent: "",
      fileloaded: false
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

    OnInputButtonChange: async function() {
      //@oscar example how to use the createjsonpackageobject function
      var json = this.CreateJSONPackageObject(
        "titlestring",
        "descriptionexample",
        "basestringfotoexample",
        "basestringmodelexample",
        "modeltypeexample",
        "pricestring"
      );
      console.log(json);

      const input = document.querySelector('input[type="file"]');

      if (input.files) {
        if (this.IsFileImage(input.files[0]["type"])) {
          const reader = new FileReader();

          reader.onload = function() {
            const img = new Image();
            img.src = reader.result;
            img.width = 100;
            img.height = 100;

            var fieldset = document.getElementById("input-fieldset");
            fieldset.insertBefore(img, fieldset.children[fieldset.childElementCount - 1]);
          };

          reader.readAsDataURL(input.files[0]);

          // Convert content to Base64
        } else if (this.Is3DModel(input.files[0])) {
          console.log("file loading");
          const ToBase64 = file =>
            new Promise((resolve, reject) => {
              const reader = new FileReader();
              reader.readAsDataURL(file);
              reader.onload = () => resolve(reader.result);
              reader.onerror = () => reject(error);
            });

          this.filename = input.files[0].name;
          // Wait until content is processed completely
          this.filecontent = await ToBase64(input.files[0]);
          this.fileloaded = true;
        }
      }
    },

    /*
      Upload file to Github using the Github Content API endpoint. 
      See https://developer.github.com/v3/repos/contents/#create-or-update-a-file for info.
    */
    submitForm: function() {
      if (!this.fileloaded) {
        console.log("file not loaded yet");
        return;
      }

      const accessToken = this.getGithubAccessToken();

      // Remove header to get valid Base64 encoded content
      this.filecontent = this.filecontent.split(",")[1];
      if (this.message.text == `type commit message here`) {
        this.message.text = "added model with name " + this.filename;
      }

      const url =
        "https://api.github.com/repos/bvanderwolf/bvanderwolf.github.io/contents/models/model" +
        this.getNextModelId().toString() +
        "." +
        this.filename.split(".")[1];

      const requestData = { message: this.message.text, content: this.filecontent };

      const xhttp = new XMLHttpRequest();
      xhttp.open("PUT", url, true);
      // Authorize
      xhttp.setRequestHeader("Authorization", "token " + accessToken);

      xhttp.send(JSON.stringify(requestData));

      // Wait until response from Github is fully recieved
      xhttp.onreadystatechange = function() {
        if (xhttp.readyState === 4) {
          window.alert("File uploaded");
        }
      };
    },

    // Get access token for Github from url
    getGithubAccessToken: function() {
      const queryParams = window.location.href.replace(
        window.location.origin + "/inputForm.html?",
        ""
      );
      var access_token = queryParams.replace("&scope=public_repo&token_type=bearer", "");
      access_token = access_token.replace("access_token=", "");

      return access_token;
    },

    getNextModelId: async function() {
      let response = await fetch(
        "https://api.github.com/repos/bvanderwolf/bvanderwolf.github.io/contents/models"
      );
      let data = await response.json();
      let content = JSON.parse(response);
      let id = content.length;
      return id;
    },

    //creates package usable for JBL website
    CreateJSONPackageObject(title, description, basestringFoto, baseStringModel, modelType, price) {
      var obj = new Object();
      obj.title = title;
      obj.description = description;
      obj.basestringFoto = basestringFoto;
      obj.baseStringModel = baseStringModel;
      obj.modeltype = modelType;
      obj.price = price;
      return JSON.parse(JSON.stringify(obj));
    }
  }
});
