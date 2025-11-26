// vitest.config.ts
import { mergeConfig } from "file:///C:/Users/ryanm/Repos/Create-Incremental-Profectus/node_modules/vite/dist/node/index.js";
import { defineConfig as defineConfig2 } from "file:///C:/Users/ryanm/Repos/Create-Incremental-Profectus/node_modules/vitest/dist/config.js";

// vite.config.ts
import vue from "file:///C:/Users/ryanm/Repos/Create-Incremental-Profectus/node_modules/@vitejs/plugin-vue/dist/index.mjs";
import vueJsx from "file:///C:/Users/ryanm/Repos/Create-Incremental-Profectus/node_modules/@vitejs/plugin-vue-jsx/dist/index.mjs";
import { defineConfig } from "file:///C:/Users/ryanm/Repos/Create-Incremental-Profectus/node_modules/vite/dist/node/index.js";
import { VitePWA } from "file:///C:/Users/ryanm/Repos/Create-Incremental-Profectus/node_modules/vite-plugin-pwa/dist/index.js";
import tsconfigPaths from "file:///C:/Users/ryanm/Repos/Create-Incremental-Profectus/node_modules/vite-tsconfig-paths/dist/index.mjs";

// src/data/projInfo.json
var projInfo_default = {
  $schema: "./projInfo-schema.json",
  title: "Create Incremental",
  description: "A project made in Profectus",
  id: "CreateIncrementalProfectus",
  author: "BanaCubed",
  discordName: "Create Incremental Server",
  discordLink: "https://discord.gg/wt5XyPRtte",
  versionNumber: "0.5",
  versionTitle: "Profectus",
  allowGoBack: true,
  defaultShowSmall: true,
  defaultDecimalsShown: 2,
  useHeader: false,
  banner: null,
  logo: "",
  initialTabs: ["main"],
  maxTickLength: 3600,
  offlineLimit: 24,
  enablePausing: true,
  exportEncoding: "base64",
  disableHealthWarning: false
};

// vite.config.ts
import Icons from "file:///C:/Users/ryanm/Repos/Create-Incremental-Profectus/node_modules/unplugin-icons/dist/vite.js";
var vite_config_default = defineConfig({
  base: "./",
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            return id.toString().split("node_modules/")[1].split("/")[0].toString();
          }
        }
      }
    }
  },
  resolve: {
    alias: {
      vue: "vue/dist/vue.esm-bundler.js"
    }
  },
  plugins: [
    vue(),
    vueJsx({
      // options are passed on to @vue/babel-plugin-jsx
    }),
    tsconfigPaths(),
    VitePWA({
      registerType: "autoUpdate",
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg}"]
      },
      manifest: {
        name: projInfo_default.title,
        short_name: projInfo_default.title,
        description: projInfo_default.description,
        theme_color: "#2E3440",
        icons: [
          {
            src: "pwa-192x192.png",
            sizes: "192x192",
            type: "image/png"
          },
          {
            src: "pwa-512x512.png",
            sizes: "512x512",
            type: "image/png"
          },
          {
            src: "pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable"
          }
        ]
      }
    }),
    Icons({ compiler: "vue3" })
  ]
});

// vitest.config.ts
var vitest_config_default = mergeConfig(vite_config_default, defineConfig2({
  test: {
    environment: "jsdom"
  }
}));
export {
  vitest_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZXN0LmNvbmZpZy50cyIsICJ2aXRlLmNvbmZpZy50cyIsICJzcmMvZGF0YS9wcm9qSW5mby5qc29uIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiQzpcXFxcVXNlcnNcXFxccnlhbm1cXFxcUmVwb3NcXFxcQ3JlYXRlLUluY3JlbWVudGFsLVByb2ZlY3R1c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiQzpcXFxcVXNlcnNcXFxccnlhbm1cXFxcUmVwb3NcXFxcQ3JlYXRlLUluY3JlbWVudGFsLVByb2ZlY3R1c1xcXFx2aXRlc3QuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9DOi9Vc2Vycy9yeWFubS9SZXBvcy9DcmVhdGUtSW5jcmVtZW50YWwtUHJvZmVjdHVzL3ZpdGVzdC5jb25maWcudHNcIjtpbXBvcnQgeyBtZXJnZUNvbmZpZyB9IGZyb20gJ3ZpdGUnXHJcbmltcG9ydCB7IGRlZmluZUNvbmZpZyB9IGZyb20gJ3ZpdGVzdC9jb25maWcnXHJcbmltcG9ydCB2aXRlQ29uZmlnIGZyb20gJy4vdml0ZS5jb25maWcnXHJcblxyXG5leHBvcnQgZGVmYXVsdCBtZXJnZUNvbmZpZyh2aXRlQ29uZmlnLCBkZWZpbmVDb25maWcoe1xyXG4gICAgdGVzdDoge1xyXG4gICAgICAgIGVudmlyb25tZW50OiBcImpzZG9tXCJcclxuICAgIH1cclxufSkpXHJcbiIsICJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiQzpcXFxcVXNlcnNcXFxccnlhbm1cXFxcUmVwb3NcXFxcQ3JlYXRlLUluY3JlbWVudGFsLVByb2ZlY3R1c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiQzpcXFxcVXNlcnNcXFxccnlhbm1cXFxcUmVwb3NcXFxcQ3JlYXRlLUluY3JlbWVudGFsLVByb2ZlY3R1c1xcXFx2aXRlLmNvbmZpZy50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vQzovVXNlcnMvcnlhbm0vUmVwb3MvQ3JlYXRlLUluY3JlbWVudGFsLVByb2ZlY3R1cy92aXRlLmNvbmZpZy50c1wiO2ltcG9ydCB2dWUgZnJvbSBcIkB2aXRlanMvcGx1Z2luLXZ1ZVwiO1xyXG5pbXBvcnQgdnVlSnN4IGZyb20gXCJAdml0ZWpzL3BsdWdpbi12dWUtanN4XCI7XHJcbmltcG9ydCB7IGRlZmluZUNvbmZpZyB9IGZyb20gXCJ2aXRlXCI7XHJcbmltcG9ydCB7IFZpdGVQV0EgfSBmcm9tIFwidml0ZS1wbHVnaW4tcHdhXCI7XHJcbmltcG9ydCB0c2NvbmZpZ1BhdGhzIGZyb20gXCJ2aXRlLXRzY29uZmlnLXBhdGhzXCI7XHJcbmltcG9ydCBwcm9qSW5mbyBmcm9tIFwiLi9zcmMvZGF0YS9wcm9qSW5mby5qc29uXCI7XHJcbmltcG9ydCBJY29ucyBmcm9tIFwidW5wbHVnaW4taWNvbnMvdml0ZVwiO1xyXG5cclxuLy8gaHR0cHM6Ly92aXRlanMuZGV2L2NvbmZpZy9cclxuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKHtcclxuICAgIGJhc2U6IFwiLi9cIixcclxuICAgIGJ1aWxkOiB7XHJcbiAgICAgICAgcm9sbHVwT3B0aW9uczoge1xyXG4gICAgICAgICAgICBvdXRwdXQ6IHtcclxuICAgICAgICAgICAgICAgIG1hbnVhbENodW5rcyhpZCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChpZC5pbmNsdWRlcyhcIm5vZGVfbW9kdWxlc1wiKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gaWQudG9TdHJpbmcoKS5zcGxpdChcIm5vZGVfbW9kdWxlcy9cIilbMV0uc3BsaXQoXCIvXCIpWzBdLnRvU3RyaW5nKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuICAgIHJlc29sdmU6IHtcclxuICAgICAgICBhbGlhczoge1xyXG4gICAgICAgICAgICB2dWU6IFwidnVlL2Rpc3QvdnVlLmVzbS1idW5kbGVyLmpzXCJcclxuICAgICAgICB9XHJcbiAgICB9LFxyXG4gICAgcGx1Z2luczogW1xyXG4gICAgICAgIHZ1ZSgpLFxyXG4gICAgICAgIHZ1ZUpzeCh7XHJcbiAgICAgICAgICAgIC8vIG9wdGlvbnMgYXJlIHBhc3NlZCBvbiB0byBAdnVlL2JhYmVsLXBsdWdpbi1qc3hcclxuICAgICAgICB9KSxcclxuICAgICAgICB0c2NvbmZpZ1BhdGhzKCksXHJcbiAgICAgICAgVml0ZVBXQSh7XHJcbiAgICAgICAgICAgIHJlZ2lzdGVyVHlwZTogJ2F1dG9VcGRhdGUnLFxyXG4gICAgICAgICAgICB3b3JrYm94OiB7XHJcbiAgICAgICAgICAgICAgZ2xvYlBhdHRlcm5zOiBbJyoqLyoue2pzLGNzcyxodG1sLGljbyxwbmcsc3ZnfSddXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIG1hbmlmZXN0OiB7XHJcbiAgICAgICAgICAgICAgICBuYW1lOiBwcm9qSW5mby50aXRsZSxcclxuICAgICAgICAgICAgICAgIHNob3J0X25hbWU6IHByb2pJbmZvLnRpdGxlLFxyXG4gICAgICAgICAgICAgICAgZGVzY3JpcHRpb246IHByb2pJbmZvLmRlc2NyaXB0aW9uLFxyXG4gICAgICAgICAgICAgICAgdGhlbWVfY29sb3I6IFwiIzJFMzQ0MFwiLFxyXG4gICAgICAgICAgICAgICAgaWNvbnM6IFtcclxuICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHNyYzogXCJwd2EtMTkyeDE5Mi5wbmdcIixcclxuICAgICAgICAgICAgICAgICAgICAgICAgc2l6ZXM6IFwiMTkyeDE5MlwiLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiBcImltYWdlL3BuZ1wiXHJcbiAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHNyYzogXCJwd2EtNTEyeDUxMi5wbmdcIixcclxuICAgICAgICAgICAgICAgICAgICAgICAgc2l6ZXM6IFwiNTEyeDUxMlwiLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiBcImltYWdlL3BuZ1wiXHJcbiAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHNyYzogXCJwd2EtNTEyeDUxMi5wbmdcIixcclxuICAgICAgICAgICAgICAgICAgICAgICAgc2l6ZXM6IFwiNTEyeDUxMlwiLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiBcImltYWdlL3BuZ1wiLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBwdXJwb3NlOiBcImFueSBtYXNrYWJsZVwiXHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgXVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSksXHJcbiAgICAgICAgSWNvbnMoeyBjb21waWxlcjogXCJ2dWUzXCIgfSlcclxuICAgIF1cclxufSk7XHJcbiIsICJ7XHJcblx0XCIkc2NoZW1hXCI6IFwiLi9wcm9qSW5mby1zY2hlbWEuanNvblwiLFxyXG5cclxuXHRcInRpdGxlXCI6IFwiQ3JlYXRlIEluY3JlbWVudGFsXCIsXHJcblx0XCJkZXNjcmlwdGlvblwiOiBcIkEgcHJvamVjdCBtYWRlIGluIFByb2ZlY3R1c1wiLFxyXG5cdFwiaWRcIjogXCJDcmVhdGVJbmNyZW1lbnRhbFByb2ZlY3R1c1wiLFxyXG5cdFwiYXV0aG9yXCI6IFwiQmFuYUN1YmVkXCIsXHJcblx0XCJkaXNjb3JkTmFtZVwiOiBcIkNyZWF0ZSBJbmNyZW1lbnRhbCBTZXJ2ZXJcIixcclxuXHRcImRpc2NvcmRMaW5rXCI6IFwiaHR0cHM6Ly9kaXNjb3JkLmdnL3d0NVh5UFJ0dGVcIixcclxuXHJcblx0XCJ2ZXJzaW9uTnVtYmVyXCI6IFwiMC41XCIsXHJcblx0XCJ2ZXJzaW9uVGl0bGVcIjogXCJQcm9mZWN0dXNcIixcclxuXHJcblx0XCJhbGxvd0dvQmFja1wiOiB0cnVlLFxyXG5cdFwiZGVmYXVsdFNob3dTbWFsbFwiOiB0cnVlLFxyXG5cdFwiZGVmYXVsdERlY2ltYWxzU2hvd25cIjogMixcclxuXHRcInVzZUhlYWRlclwiOiBmYWxzZSxcclxuXHRcImJhbm5lclwiOiBudWxsLFxyXG5cdFwibG9nb1wiOiBcIlwiLFxyXG5cdFwiaW5pdGlhbFRhYnNcIjogWyBcIm1haW5cIiBdLFxyXG5cclxuXHRcIm1heFRpY2tMZW5ndGhcIjogMzYwMCxcclxuXHRcIm9mZmxpbmVMaW1pdFwiOiAyNCxcclxuXHRcImVuYWJsZVBhdXNpbmdcIjogdHJ1ZSxcclxuXHRcImV4cG9ydEVuY29kaW5nXCI6IFwiYmFzZTY0XCIsXHJcblx0XCJkaXNhYmxlSGVhbHRoV2FybmluZ1wiOiBmYWxzZVxyXG59XHJcbiJdLAogICJtYXBwaW5ncyI6ICI7QUFBbVYsU0FBUyxtQkFBbUI7QUFDL1csU0FBUyxnQkFBQUEscUJBQW9COzs7QUNEa1QsT0FBTyxTQUFTO0FBQy9WLE9BQU8sWUFBWTtBQUNuQixTQUFTLG9CQUFvQjtBQUM3QixTQUFTLGVBQWU7QUFDeEIsT0FBTyxtQkFBbUI7OztBQ0oxQjtBQUFBLEVBQ0MsU0FBVztBQUFBLEVBRVgsT0FBUztBQUFBLEVBQ1QsYUFBZTtBQUFBLEVBQ2YsSUFBTTtBQUFBLEVBQ04sUUFBVTtBQUFBLEVBQ1YsYUFBZTtBQUFBLEVBQ2YsYUFBZTtBQUFBLEVBRWYsZUFBaUI7QUFBQSxFQUNqQixjQUFnQjtBQUFBLEVBRWhCLGFBQWU7QUFBQSxFQUNmLGtCQUFvQjtBQUFBLEVBQ3BCLHNCQUF3QjtBQUFBLEVBQ3hCLFdBQWE7QUFBQSxFQUNiLFFBQVU7QUFBQSxFQUNWLE1BQVE7QUFBQSxFQUNSLGFBQWUsQ0FBRSxNQUFPO0FBQUEsRUFFeEIsZUFBaUI7QUFBQSxFQUNqQixjQUFnQjtBQUFBLEVBQ2hCLGVBQWlCO0FBQUEsRUFDakIsZ0JBQWtCO0FBQUEsRUFDbEIsc0JBQXdCO0FBQ3pCOzs7QURwQkEsT0FBTyxXQUFXO0FBR2xCLElBQU8sc0JBQVEsYUFBYTtBQUFBLEVBQ3hCLE1BQU07QUFBQSxFQUNOLE9BQU87QUFBQSxJQUNILGVBQWU7QUFBQSxNQUNYLFFBQVE7QUFBQSxRQUNKLGFBQWEsSUFBSTtBQUNiLGNBQUksR0FBRyxTQUFTLGNBQWMsR0FBRztBQUM3QixtQkFBTyxHQUFHLFNBQVMsRUFBRSxNQUFNLGVBQWUsRUFBRSxDQUFDLEVBQUUsTUFBTSxHQUFHLEVBQUUsQ0FBQyxFQUFFLFNBQVM7QUFBQSxVQUMxRTtBQUFBLFFBQ0o7QUFBQSxNQUNKO0FBQUEsSUFDSjtBQUFBLEVBQ0o7QUFBQSxFQUNBLFNBQVM7QUFBQSxJQUNMLE9BQU87QUFBQSxNQUNILEtBQUs7QUFBQSxJQUNUO0FBQUEsRUFDSjtBQUFBLEVBQ0EsU0FBUztBQUFBLElBQ0wsSUFBSTtBQUFBLElBQ0osT0FBTztBQUFBO0FBQUEsSUFFUCxDQUFDO0FBQUEsSUFDRCxjQUFjO0FBQUEsSUFDZCxRQUFRO0FBQUEsTUFDSixjQUFjO0FBQUEsTUFDZCxTQUFTO0FBQUEsUUFDUCxjQUFjLENBQUMsZ0NBQWdDO0FBQUEsTUFDakQ7QUFBQSxNQUNBLFVBQVU7QUFBQSxRQUNOLE1BQU0saUJBQVM7QUFBQSxRQUNmLFlBQVksaUJBQVM7QUFBQSxRQUNyQixhQUFhLGlCQUFTO0FBQUEsUUFDdEIsYUFBYTtBQUFBLFFBQ2IsT0FBTztBQUFBLFVBQ0g7QUFBQSxZQUNJLEtBQUs7QUFBQSxZQUNMLE9BQU87QUFBQSxZQUNQLE1BQU07QUFBQSxVQUNWO0FBQUEsVUFDQTtBQUFBLFlBQ0ksS0FBSztBQUFBLFlBQ0wsT0FBTztBQUFBLFlBQ1AsTUFBTTtBQUFBLFVBQ1Y7QUFBQSxVQUNBO0FBQUEsWUFDSSxLQUFLO0FBQUEsWUFDTCxPQUFPO0FBQUEsWUFDUCxNQUFNO0FBQUEsWUFDTixTQUFTO0FBQUEsVUFDYjtBQUFBLFFBQ0o7QUFBQSxNQUNKO0FBQUEsSUFDSixDQUFDO0FBQUEsSUFDRCxNQUFNLEVBQUUsVUFBVSxPQUFPLENBQUM7QUFBQSxFQUM5QjtBQUNKLENBQUM7OztBRDdERCxJQUFPLHdCQUFRLFlBQVkscUJBQVlDLGNBQWE7QUFBQSxFQUNoRCxNQUFNO0FBQUEsSUFDRixhQUFhO0FBQUEsRUFDakI7QUFDSixDQUFDLENBQUM7IiwKICAibmFtZXMiOiBbImRlZmluZUNvbmZpZyIsICJkZWZpbmVDb25maWciXQp9Cg==
