import rssPlugin from "@11ty/eleventy-plugin-rss";

export default function (eleventyConfig) {
  eleventyConfig.ignores.add("AGENTS.md");
  eleventyConfig.addPassthroughCopy("og");
  eleventyConfig.addPassthroughCopy("images");
  eleventyConfig.addPassthroughCopy("robots.txt");
  eleventyConfig.addPassthroughCopy("llms.txt");
  eleventyConfig.addPassthroughCopy("CNAME");

  eleventyConfig.addPlugin(rssPlugin);

  eleventyConfig.addFilter("encodeURI", (str) => encodeURI(str));
  eleventyConfig.addFilter("isoDate", (date) => new Date(date).toISOString());
  eleventyConfig.addFilter("yearNow", () => String(new Date().getFullYear()));

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
