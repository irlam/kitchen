const fs = require("fs");
const path = require("path");

const projectRoot = path.resolve(__dirname, "..");
const distDir = path.join(projectRoot, "dist");

const foldersToCopy = ["css", "models", "rooms", "api", "sql"];
const filesToCopy = ["index.static.html", "LICENSE.txt"];

function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

function copyFile(src, dest) {
  ensureDir(path.dirname(dest));
  fs.copyFileSync(src, dest);
}

function copyDir(srcDir, destDir) {
  if (!fs.existsSync(srcDir)) {
    return;
  }
  ensureDir(destDir);
  fs.readdirSync(srcDir).forEach((entry) => {
    const srcPath = path.join(srcDir, entry);
    const destPath = path.join(destDir, entry);
    const stat = fs.statSync(srcPath);
    if (stat.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      copyFile(srcPath, destPath);
    }
  });
}

ensureDir(distDir);

foldersToCopy.forEach((folder) => {
  copyDir(path.join(projectRoot, folder), path.join(distDir, folder));
});

filesToCopy.forEach((file) => {
  const srcPath = path.join(projectRoot, file);
  if (fs.existsSync(srcPath)) {
    copyFile(srcPath, path.join(distDir, file));
  }
});
