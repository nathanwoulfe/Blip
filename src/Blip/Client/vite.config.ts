import { defineConfig } from "vite";

export default defineConfig({
  build: {
    lib: {
      entry: "src/index.ts", // your web component source file
      formats: ["es"],
    },
    outDir: "../wwwroot", // all compiled files will be placed here
    emptyOutDir: false,
    sourcemap: true,
    rollupOptions: {
      external: [/^@umbraco/], // ignore the Umbraco Backoffice package in the build
      onwarn: () => { },
      output: {
        chunkFileNames: "[name].js",
      },
    },
  },
});
