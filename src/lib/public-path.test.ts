import assert from "node:assert/strict";
import test from "node:test";
import { publicPath } from "./public-path";

test("publicPath stays root-relative without a pages prefix", () => {
  const previous = process.env.NEXT_PUBLIC_BASE_PATH;
  delete process.env.NEXT_PUBLIC_BASE_PATH;
  try {
    assert.equal(publicPath("/portrait.webp"), "/portrait.webp");
    assert.equal(publicPath("projects/room.webp"), "/projects/room.webp");
  } finally {
    if (previous === undefined) delete process.env.NEXT_PUBLIC_BASE_PATH;
    else process.env.NEXT_PUBLIC_BASE_PATH = previous;
  }
});

test("publicPath prefixes GitHub Pages project path", () => {
  const previous = process.env.NEXT_PUBLIC_BASE_PATH;
  process.env.NEXT_PUBLIC_BASE_PATH = "/portfolio/";
  try {
    assert.equal(publicPath("/pdf.worker.min.mjs"), "/portfolio/pdf.worker.min.mjs");
    assert.equal(publicPath("/projects/cube.webp"), "/portfolio/projects/cube.webp");
  } finally {
    if (previous === undefined) delete process.env.NEXT_PUBLIC_BASE_PATH;
    else process.env.NEXT_PUBLIC_BASE_PATH = previous;
  }
});
