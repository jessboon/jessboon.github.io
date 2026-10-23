import rssPlugin from "@11ty/eleventy-plugin-rss";

export default function (eleventyConfig) {
  eleventyConfig.ignores.add("AGENTS.md");

  eleventyConfig.addPlugin(rssPlugin);

  eleventyConfig.addFilter("dateDisplay", (date) =>
    new Date(date).toLocaleDateString("en-GB", { year: "numeric", month: "short", day: "numeric" })
  );

  eleventyConfig.addFilter("readingTime", (text) => {
    const words = String(text)
      .replace(/^---[\s\S]*?---/, "")
      .replace(/<[^>]+>/g, " ")
      .split(/\s+/)
      .filter(Boolean).length;
    return Math.max(1, Math.round(words / 200));
  });
}
