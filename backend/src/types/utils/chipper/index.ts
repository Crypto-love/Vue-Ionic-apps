import { hash } from 'bcryptjs';
/**
 * This code block below is a legacy code that coming from v2 app.
 * Basically we save this function and export / import this only
 * for usage in SignIn mutation where we need to convert the password from
 * chipped / encrypted / hashed version from v2 to the new encrypted version
 * of v3 app using bcrypt.
 */

/**
 * Ref: https://stackoverflow.com/a/54026460
 */
const salt = '9Ptu3rgxnQ9vWgnT';

export const cipher = () => {
  const textToChars = (text) => text.split('').map((c) => c.charCodeAt(0));
  const byteHex = (n) => ('0' + Number(n).toString(16)).substr(-2);
  const applySaltToChar = (code) => textToChars(salt).reduce((a, b) => a ^ b, code);

  return (text) => text.split('').reverse().map(textToChars).map(applySaltToChar).map(byteHex).join('');
};

export const decipher = () => {
  const textToChars = (Text) => Text.split('').map((c) => c.charCodeAt(0));
  const applySaltToChar = (code) => textToChars(salt).reduce((a, b) => a ^ b, code);

  return (encoded) =>
    encoded
      .match(/.{1,2}/g)
      .reverse()
      .map((hex) => parseInt(hex, 16))
      .map(applySaltToChar)
      .map((charCode) => String.fromCharCode(charCode))
      .join('');
};

export const encryptPassword = async (plaintTextPassword) => {
  const decipherFunction = decipher();
  const sterilizedPassword = await decipherFunction(plaintTextPassword);
  return await hash(sterilizedPassword, 10);
};
