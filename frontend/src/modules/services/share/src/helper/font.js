export async function getFont(countryCode = 'en') {
  /* ttf file must convert to base64 manually, and save as countryCode file name in any path, eg: en, ch, th and so on */
  /* but later can improve to load directly from ttf files */
  const data = await fetch(`https://treedots-statics.s3-ap-southeast-1.amazonaws.com/files/${countryCode}`);
  const font = await data.text();
  return font;
}
