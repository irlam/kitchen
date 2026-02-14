#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

function parseArgs(argv) {
  const args = {};
  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    if (!token.startsWith("--")) {
      continue;
    }
    const key = token.slice(2);
    const next = argv[index + 1];
    if (!next || next.startsWith("--")) {
      args[key] = true;
      continue;
    }
    args[key] = next;
    index += 1;
  }
  return args;
}

function slugify(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function isUrl(value) {
  return /^https?:\/\//i.test(String(value || ""));
}

async function downloadToFile(url, destinationPath) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to download ${url} (${response.status})`);
  }
  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  fs.mkdirSync(path.dirname(destinationPath), { recursive: true });
  fs.writeFileSync(destinationPath, buffer);
}

function copyToFile(sourcePath, destinationPath) {
  if (!fs.existsSync(sourcePath)) {
    throw new Error(`Source not found: ${sourcePath}`);
  }
  fs.mkdirSync(path.dirname(destinationPath), { recursive: true });
  fs.copyFileSync(sourcePath, destinationPath);
}

async function importAsset(input, destinationPath) {
  if (isUrl(input)) {
    await downloadToFile(input, destinationPath);
  } else {
    copyToFile(path.resolve(input), destinationPath);
  }
}

function addCatalogEntry({ name, type, format, premium, modelPath, imagePath }) {
  const itemsFilePath = path.resolve("src", "items.js");
  const source = fs.readFileSync(itemsFilePath, "utf8");

  if (source.includes(`name: "${name}"`) || source.includes(`model: "${modelPath}"`)) {
    console.log("Catalog entry already exists. Skipping registration.");
    return;
  }

  const insertionPoint = source.indexOf("\n  ];\n  var modelTypesNum");
  if (insertionPoint < 0) {
    throw new Error("Could not find items array end in src/items.js");
  }

  const entry = [
    "    {",
    `      name: \"${name.replace(/\"/g, '\\\"')}\",`,
    `      model: \"${modelPath}\",`,
    `      type: \"${type}\",`,
    `      image: \"${imagePath}\",`,
    `      format: \"${format}\",`,
    premium ? "      premium: true" : "      premium: false",
    "    },",
  ].join("\n");

  const nextSource =
    source.slice(0, insertionPoint) +
    `\n${entry}` +
    source.slice(insertionPoint);

  fs.writeFileSync(itemsFilePath, nextSource);
  console.log("Registered item in src/items.js");
}

async function main() {
  const args = parseArgs(process.argv.slice(2));

  const name = args.name;
  const model = args.model;
  const image = args.image;

  if (!name || !model || !image) {
    throw new Error(
      "Required: --name <item name> --model <path|url> --image <path|url>"
    );
  }

  const type = String(args.type || "1");
  const format = String(args.format || "gltf");
  const premium = args.premium === true || String(args.premium || "").toLowerCase() === "true";
  const register = args.register === true || String(args.register || "").toLowerCase() === "true";

  const modelExt = path.extname(isUrl(model) ? new URL(model).pathname : model) || ".glb";
  const imageExt = path.extname(isUrl(image) ? new URL(image).pathname : image) || ".png";
  const slug = args.slug || slugify(name);

  const modelFileName = `${slug}${modelExt}`;
  const imageFileName = `${slug}${imageExt}`;

  const modelDestination = path.resolve("models", "gltf", modelFileName);
  const imageDestination = path.resolve("models", "thumbnails_new", imageFileName);

  await importAsset(model, modelDestination);
  console.log(`Imported model: models/gltf/${modelFileName}`);

  await importAsset(image, imageDestination);
  console.log(`Imported thumbnail: models/thumbnails_new/${imageFileName}`);

  const textureInputs = String(args.textures || "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);

  for (const textureInput of textureInputs) {
    const textureName = path.basename(
      isUrl(textureInput) ? new URL(textureInput).pathname : textureInput
    );
    const textureDestination = path.resolve("models", "gltf", textureName);
    await importAsset(textureInput, textureDestination);
    console.log(`Imported texture: models/gltf/${textureName}`);
  }

  const modelPath = `models/gltf/${modelFileName}`;
  const imagePath = `models/thumbnails_new/${imageFileName}`;

  if (register) {
    addCatalogEntry({
      name,
      type,
      format,
      premium,
      modelPath,
      imagePath,
    });
  } else {
    console.log("Registration skipped. Use --register true to append into src/items.js");
    console.log("Catalog snippet:");
    console.log("{");
    console.log(`  name: \"${name}\",`);
    console.log(`  model: \"${modelPath}\",`);
    console.log(`  type: \"${type}\",`);
    console.log(`  image: \"${imagePath}\",`);
    console.log(`  format: \"${format}\",`);
    console.log(`  premium: ${premium}`);
    console.log("},");
  }
}

main().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
