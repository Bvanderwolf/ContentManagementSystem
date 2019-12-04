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
      submitted: false,
      filename: "",
      filecontent: ""
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
      const accepted3DModelTypes = [".obj", ".glb", ".fbx", ".usdz"];
      const name = file.name;
      return accepted3DModelTypes.includes(name.substring(name.lastIndexOf(".")));
    },

    IsFileImage: function(file) {
      const acceptedImageTypes = ["image/gif", "image/jpeg", "image/png"];

      return file && acceptedImageTypes.includes(file);
    },

    OnInputButtonChange: function() {
      const input = document.querySelector('input[type="file"]');

      if (input.files) {
        console.log(input.files);
        console.log(input.files[0]["type"]);
        console.log(this.Is3DModel(input.files[0]));
        const reader = new FileReader();

        if (this.IsFileImage(input.files[0]["type"])) {
          console.log(this.IsFileImage(input.files[0]["type"]));

          reader.onload = function() {
            const img = new Image();
            img.src = reader.result;
            img.width = 100;
            img.height = 100;

            var fieldset = document.getElementById("input-fieldset");
            fieldset.insertBefore(img, fieldset.children[fieldset.childElementCount - 1]);
          };

          reader.readAsDataURL(input.files[0]);
        } else if (this.Is3DModel(input.files[0])) {
          console.log("test");
          reader.onload = function() {
            console.log("3d model loaded");
            this.filecontent = reader.result;
            this.filename = input.files[0]["name"];
            console.log(this.filename);
            console.log(this.filecontent);
          };
          reader.readAsDataURL(input.files[0]);
        }
      }
    },

    /*
        Upload file to Github using the Github Content API endpoint. 
        See https://developer.github.com/v3/repos/contents/#create-or-update-a-file for info.
        
        TODO
        - Get file from view and upload file instead of test.txt (replace test.txt in 'url' constant)
        - Get Base64 encoded content from file and replace 'content: "dgVzdA==" with file content
        - Convert function to async await to improve performance
        - Show message that upload was successful or show error message
        */
    submitForm: function() {
      const accessToken = this.getGithubAccessToken();

      // TODO: Replace test.txt with actual model from view
      const url =
        "https://api.github.com/repos/bvanderwolf/bvanderwolf.github.io/contents/models/" +
        this.file.name;

      const reader = new FileReader();
      // TODO: Replace content with actual content from file to upload
      const requestData = { message: this.message.text, content: this.file };

      const xhttp = new XMLHttpRequest();
      xhttp.open("PUT", url, true);
      // Authorize
      xhttp.setRequestHeader("Authorization", "token " + accessToken);

      xhttp.send(JSON.stringify(requestData));

      // Wait until response from Github is fully recieved
      xhttp.onreadystatechange = function() {
        if (xhttp.readyState === 4) {
          console.log(xhttp.response);
        }
      };

      // TODO: show user that upload was successful or show error message
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
    }
  }
});
