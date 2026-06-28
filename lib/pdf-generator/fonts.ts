import { Font } from "@react-pdf/renderer";

Font.register({
  family: "Geist",
  fonts: [
    { src: "https://cdn.jsdelivr.net/npm/geist@1/dist/fonts/geist-sans/Geist-Regular.ttf", fontWeight: 400 },
    { src: "https://cdn.jsdelivr.net/npm/geist@1/dist/fonts/geist-sans/Geist-Medium.ttf", fontWeight: 500 },
    { src: "https://cdn.jsdelivr.net/npm/geist@1/dist/fonts/geist-sans/Geist-SemiBold.ttf", fontWeight: 600 },
    { src: "https://cdn.jsdelivr.net/npm/geist@1/dist/fonts/geist-sans/Geist-Bold.ttf", fontWeight: 700 },
    // Add this if you need italic support
    { src: "https://cdn.jsdelivr.net/npm/geist@1/dist/fonts/geist-sans/Geist-Regular.ttf", fontWeight: 400, fontStyle: "italic" },
  ],
});
