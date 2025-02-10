declare module '*.json' {
  const value: Array<{
    country: string;
    percentage: number;
    category: string;
  }>;
  export default value;
} 