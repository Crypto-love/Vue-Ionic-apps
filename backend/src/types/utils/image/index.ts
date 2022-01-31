const { IMAGES, IMAGES_UAT, AWS_IMAGES, NODE_ENV } = process.env;

export const getImageUrl = (filename: string, size = 'large'): string => {
  const statics = NODE_ENV === 'production' ? IMAGES : IMAGES_UAT;
  const noImage = `${AWS_IMAGES}/images/no_image.png`;
  if (!filename) return noImage;
  return `${statics}/${size}/${filename}.png`;
};
