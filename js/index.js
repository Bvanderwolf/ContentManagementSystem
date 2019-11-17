const input = document.querySelector('input[type="file"]');
console.log("test");
input.addEventListener(
  "change",
  function(e) {
    console.log(input.files);
    const reader = new FileReader();
    reader.onload = function() {
      if (isFileImage(reader.result)) {
        const img = new Image();
        img.src = reader.result;
        img.width = 100;
        img.height = 100;
        //document.body.appendChild(img);
        var fieldset = document.getElementById("input-fieldset");
        fieldset.insertBefore(
          img,
          fieldset.children[fieldset.childElementCount - 1]
        );
      }
    };

    reader.readAsDataURL(input.files[0]);
  },
  false
);

function isFileImage(file) {
  const acceptedImageTypes = [
    "data:image/gif",
    "data:image/jpeg",
    "data:image/png"
  ];

  return file && acceptedImageTypes.includes(file.split(";")[0]);
}
