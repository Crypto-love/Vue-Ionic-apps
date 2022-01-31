/**
 *
 * @param {String} staticPath
 */
export default function (staticPath) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.src = staticPath;
    img.onload = () => {
      return resolve(img);
    };
    img.onerror = (e) => {
      return reject(e);
    };
  });
}
