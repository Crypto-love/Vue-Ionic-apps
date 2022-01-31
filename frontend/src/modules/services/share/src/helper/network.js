export async function getPublicDetail() {
  let fetching = await fetch('https://www.cloudflare.com/cdn-cgi/trace');
  let text = await fetching.text();
  let result = text.split('\n');
  return result;
}
