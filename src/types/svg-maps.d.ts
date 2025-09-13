declare module '@svg-maps/india' {
  export type SvgMapNode = { id: string; name: string; path: string };
  export type SvgMap = { label: string; viewBox: string; locations: SvgMapNode[] };
  const content: SvgMap;
  export default content;
}
