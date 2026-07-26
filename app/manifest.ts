import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "漫行 MANXING｜双人旅行计划",
    short_name: "漫行",
    description: "行程、地图、预算与清单，一处协作。",
    start_url: "/",
    display: "standalone",
    background_color: "#f2eee5",
    theme_color: "#1e4a3b",
    orientation: "portrait-primary",
  };
}
