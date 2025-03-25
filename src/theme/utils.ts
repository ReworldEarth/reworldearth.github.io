export function makeShouldForwardProp(forbiddenProps: string[]) {
  return function shouldForwardProp(propName: string): boolean {
    return !forbiddenProps.includes(propName);
  };
}
