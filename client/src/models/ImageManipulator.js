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

    const image = new Image();
    image.src = URL.createObjectURL(file);
    image.onload = () => resolve(getBase64(image, removeMime));
  });
}
