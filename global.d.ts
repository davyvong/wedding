interface Navigator extends Navigator {
  msMaxTouchPoints?: number;
}

declare module '*.eml' {
  const content: string;
  export default content;
}
