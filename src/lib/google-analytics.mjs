export function createGoogleTagCommandQueue(dataLayer) {
  return function gtag() {
    dataLayer.push(arguments);
  };
}
