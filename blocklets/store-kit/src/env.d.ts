declare var blocklet: { prefix: string } | undefined;

declare module '*.svg';
declare module '@arcblock/did-connect-react/*';
declare module '@arcblock/ux/*';
// declare module '@blocklet/ui-react';
declare module '@blocklet/list';
declare module '@blocklet/util';

declare interface Window {
  blocklet: any;
}
