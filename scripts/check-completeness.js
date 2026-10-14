const assert = require("assert");
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const sourceRoots = [path.join(root, "pages"), path.join(root, "PageComponents")];
const files = [];

const collect = (directory) => {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const target = path.join(directory, entry.name);
    if (entry.isDirectory()) collect(target);
    else if (/\.(js|jsx)$/.test(entry.name)) files.push(target);
  }
};
sourceRoots.forEach(collect);

const placeholderPattern = /return\s+<div>\s*(?:about|active|blog|blogdetail|contact|editProfile|forget|fourm|indexOld|login|news|pageNotFound|privacy|product|ranking|signup|upcoming|[A-Z][A-Za-z]+(?:One|Two|Three|Four|Five|Six|Seven|Eight))\s*<\/div>/;
const placeholders = files.filter((file) => placeholderPattern.test(fs.readFileSync(file, "utf8")));
assert.deepEqual(placeholders, [], `Placeholder components remain:\n${placeholders.join("\n")}`);

const requiredRoutes = ["404", "about", "active", "author", "blog", "blogdetail", "collection", "connect", "contact", "create", "creator", "detail", "edit-profile", "explor", "forget", "fourm", "login", "news", "privacy", "product", "ranking", "signup", "upcoming", "update"];
for (const route of requiredRoutes) assert(fs.existsSync(path.join(root, "pages", `${route}.js`)), `Missing route: ${route}`);

const envExample = fs.readFileSync(path.join(root, ".env.example"), "utf8");
assert(envExample.includes("PINATA_JWT="), "Pinata server credential example is missing.");
assert(!envExample.includes("NEXT_PUBLIC_PINATA_JWT"), "Pinata JWT must not be public.");
console.log(`Completeness checks passed: ${requiredRoutes.length} routes and ${files.length} source files contain no starter placeholders.`);
