export const encode = (text) => btoa(encodeURIComponent(text));
export const decode = (encoded) => decodeURIComponent(atob(encoded));
