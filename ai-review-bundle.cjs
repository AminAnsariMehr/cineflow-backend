const fs = require("fs");
const path = require("path");
const readline = require("readline");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const ask = (question) =>
  new Promise((resolve) =>
    rl.question(question, (answer) => resolve(answer.trim())),
  );

const DEFAULT_EXTENSIONS = [
  ".vue",
  ".js",
  ".ts",
  ".jsx",
  ".tsx",
  ".scss",
  ".css",
];

const DEFAULT_EXCLUDE_DIRS = [
  "node_modules",
  ".git",
  "dist",
  "build",
  ".output",
  ".nuxt",
  "coverage",
];

function normalizeExtensions(input) {
  if (!input) return DEFAULT_EXTENSIONS;

  return input
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)
    .map((ext) =>
      ext.startsWith(".") ? ext.toLowerCase() : `.${ext.toLowerCase()}`,
    );
}

function normalizeDirNames(input) {
  if (!input) return DEFAULT_EXCLUDE_DIRS;

  return input
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function shouldExcludeDir(dirName, excludeDirs) {
  return excludeDirs.includes(dirName);
}

function shouldIncludeFile(filePath, extensions) {
  return extensions.includes(path.extname(filePath).toLowerCase());
}

function getAllFiles(dir, options, bucket = []) {
  const { recursive, extensions, excludeDirs } = options;
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      if (shouldExcludeDir(entry.name, excludeDirs)) continue;

      if (recursive) {
        getAllFiles(fullPath, options, bucket);
      }

      continue;
    }

    if (entry.isFile() && shouldIncludeFile(fullPath, extensions)) {
      bucket.push(fullPath);
    }
  }

  return bucket;
}

function findSrcRoot(startDir) {
  let currentDir = path.resolve(startDir);

  while (true) {
    if (path.basename(currentDir) === "src") {
      return currentDir;
    }

    const possibleSrcDir = path.join(currentDir, "src");

    if (
      fs.existsSync(possibleSrcDir) &&
      fs.statSync(possibleSrcDir).isDirectory()
    ) {
      return possibleSrcDir;
    }

    const parentDir = path.dirname(currentDir);

    if (parentDir === currentDir) {
      return null;
    }

    currentDir = parentDir;
  }
}

function toRelativeUnixPath(rootDir, filePath) {
  return path.relative(rootDir, filePath).split(path.sep).join("/");
}

function buildFileHeader(relativePath) {
  return [
    "// ====================================================================",
    `// FILE: ${relativePath}`,
    "// ====================================================================",
    "",
  ].join("\n");
}

function buildBundle(projectRootDir, files) {
  const chunks = [];

  for (const filePath of files) {
    const relativePath = toRelativeUnixPath(projectRootDir, filePath);
    const content = fs.readFileSync(filePath, "utf8");

    chunks.push(buildFileHeader(relativePath));
    chunks.push(content);

    if (!content.endsWith("\n")) {
      chunks.push("\n");
    }

    chunks.push("\n\n");
  }

  return chunks.join("");
}

async function main() {
  try {
    console.log("\n=== AI Review Bundle Generator ===\n");

    const inputRootDir = await ask("Project/target folder path: ");
    const targetDir = inputRootDir ? path.resolve(inputRootDir) : process.cwd();

    if (!fs.existsSync(targetDir)) {
      throw new Error("Target folder does not exist.");
    }

    if (!fs.statSync(targetDir).isDirectory()) {
      throw new Error("Target path must be a directory.");
    }

    const recursiveAnswer = await ask("Scan recursively? (Y/n): ");
    const recursive = recursiveAnswer.toLowerCase() !== "n";

    const extensionsInput = await ask(
      `Extensions [default: ${DEFAULT_EXTENSIONS.join(", ")}]: `,
    );
    const extensions = normalizeExtensions(extensionsInput);

    const excludeDirsInput = await ask(
      `Exclude dirs [default: ${DEFAULT_EXCLUDE_DIRS.join(", ")}]: `,
    );
    const excludeDirs = normalizeDirNames(excludeDirsInput);

    const outputFileNameInput = await ask(
      "Output file name [default: ai-review-bundle.txt]: ",
    );
    const outputFileName = outputFileNameInput || "ai-review-bundle.txt";

    const srcRootDir = findSrcRoot(targetDir);

    if (!srcRootDir) {
      throw new Error(
        'Could not find a "src" directory. Please run the script inside a project that contains src.',
      );
    }

    const projectRootDir = path.dirname(srcRootDir);

    const outputPath = path.join(projectRootDir, outputFileName);

    console.log("\nScanning files...\n");

    const files = getAllFiles(targetDir, {
      recursive,
      extensions,
      excludeDirs,
    })
      .filter((filePath) => path.resolve(filePath) !== path.resolve(outputPath))
      .sort((a, b) => a.localeCompare(b));

    if (!files.length) {
      console.log("No matching files found.");
      return;
    }

    const bundle = buildBundle(projectRootDir, files);

    fs.writeFileSync(outputPath, bundle, "utf8");

    console.log("Bundle generated successfully.\n");
    console.log(`Target Directory : ${targetDir}`);
    console.log(`Source Root      : ${srcRootDir}`);
    console.log(`Path Root        : ${projectRootDir}`);
    console.log(`Files Included   : ${files.length}`);
    console.log(`Extensions       : ${extensions.join(", ")}`);
    console.log(`Excluded Dirs    : ${excludeDirs.join(", ")}`);
    console.log(`Output File      : ${outputPath}\n`);
  } catch (error) {
    console.error("\nError:", error.message);
  } finally {
    rl.close();
  }
}

main();
