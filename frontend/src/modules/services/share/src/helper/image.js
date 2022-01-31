import { production, images_uat, aws_images } from 'src/config';

export const resizeImg = (src, width, height) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const uri = imgToDataUri(img, width, height);
      return resolve(uri);
    };
    img.src = src;
  });
};

const imgToDataUri = (img, width, height) => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  // set its dimension to target size
  canvas.width = width;
  canvas.height = height;

  // draw source image into the off-screen canvas:
  ctx.drawImage(img, 0, 0, width, height);

  // encode image to data-uri with base64 version of compressed image
  return canvas.toDataURL();
};

/**
 * @param {Number} width
 * @param {Number} height
 * @param {Number} target
 */
export const scaleImg = (width, height, target) => {
  let lowerSize, higherSize;
  let isWidthLower = false;

  if (width <= height) {
    lowerSize = width;
    higherSize = height;
    isWidthLower = true;
  } else {
    lowerSize = height;
    higherSize = width;
  }

  const target2 = parseInt(((lowerSize / higherSize) * target).toFixed(0));

  if (isWidthLower) {
    return {
      width: target2,
      height: target
    };
  } else {
    return {
      width: target,
      height: target2
    };
  }
};

export const Img = images_uat;
