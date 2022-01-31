export function getNewDate() {
  const curentDateTime = new Date();
  const offset = (curentDateTime.getTimezoneOffset() / 60) * -1;
  curentDateTime.setHours(curentDateTime.getHours() + offset);
  return curentDateTime;
}
