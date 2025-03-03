/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_MAPBOX_TOKEN: string;
  // Add other environment variables here
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// For backward compatibility with CRA
declare namespace NodeJS {
  interface ProcessEnv {
    readonly REACT_APP_MAPBOX_TOKEN?: string;
    // Add other CRA environment variables here
  }
} 