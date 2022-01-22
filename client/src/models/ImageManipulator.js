function dataURItoBlob(dataURI) {
  // convert base64 to raw binary data held in a string
  // doesn't handle URLEncoded DataURIs - see SO answer #6850276 for code that does this
  const byteString = atob(dataURI.split(',')[1]);

  // separate out the mime component
  const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];

  // write the bytes of the string to an ArrayBuffer
  const ab = new ArrayBuffer(byteString.length);

  // create a view into the buffer
  const ia = new Uint8Array(ab);

  // set the bytes of the buffer to the correct values
  for (const i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }

  // write the ArrayBuffer to a blob, and you're done
  const blob = new Blob([ab], { type: mimeString });
  return blob;
}

function createCanvas(image, width, height) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(image, 0, 0, width, height);

  return canvas;
}

function setDimensions(image) {
  const maxSize = 900;
  let width = image.width;
  let height = image.height;

  if (width > height) {
    if (width > maxSize) {
      height = height * (maxSize / width);
      width = maxSize;
    }
  } else {
    if (height > maxSize) {
      width = width * (maxSize / height);
      height = maxSize;
    }
  }

  return { width, height };
}

function getBase64(image, removeMime = false) {
  const { width, height } = setDimensions(image);
  const canvas = createCanvas(image, width, height);
  const dataUrl = canvas.toDataURL();

  return removeMime ? dataUrl.split(',')[1] : dataUrl;
}

export function resize(file, removeMime = false) {
  return new Promise((resolve, reject) => {
    if (!file) {
      reject(new Error('Image file required!'));
    }

    if (typeof file === 'string') {
      file = dataURItoBlob(file);
    }

    const image = new Image();
    image.src = URL.createObjectURL(file);
    image.onload = () => resolve(getBase64(image, removeMime));
  });
}
