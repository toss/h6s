import fs from "node:fs";
import path from "node:path";
import { compileMdx } from "nextra/compile";
import { evaluate } from "nextra/evaluate";
import { cache } from "react";
import { useMDXComponents } from "../mdx-components";

type CodeFromFileProps = {
  file: string;
  lang?: string;
  filename?: string;
};

const components = useMDXComponents({});

const compileCode = cache(async (mdx: string) => {
  return compileMdx(mdx, {
    defaultShowCopyCode: true,
  });
});

const buildMdxSnippet = (code: string, lang: string, filename: string) => {
  const trimmed = code.trimEnd();
  const fence = trimmed.includes("```") ? "~~~" : "```";
  const language = lang || "plaintext";

  return [`${fence}${language} filename="${filename}"`, trimmed, fence].join("\n");
};

export async function CodeFromFile({ file, lang = "tsx", filename }: CodeFromFileProps) {
  const absolutePath = path.join(process.cwd(), file);
  const source = fs.readFileSync(absolutePath, "utf8");
  const displayName = filename ?? path.basename(file);
  const mdxSnippet = buildMdxSnippet(source, lang, displayName);
  const compiledSource = await compileCode(mdxSnippet);
  const { default: MDXContent } = evaluate(compiledSource, components);

  return <MDXContent />;
}
