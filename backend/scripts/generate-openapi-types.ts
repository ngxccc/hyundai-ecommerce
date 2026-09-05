import "reflect-metadata";
import path from "node:path";
process.env["SKIP_ENV_VALIDATION"] = "true";

async function generate() {
  const { NestFactory } = await import("@nestjs/core");
  const { AppModule } = await import("../src/app.module");
  const { createOpenApiDocument } =
    await import("../src/common/config/openapi.config");

  const app = await NestFactory.create(AppModule, { logger: false });
  const document = createOpenApiDocument(app);
  await app.close();

  const openapiTSModule = await import("openapi-typescript");
  const openapiTS = openapiTSModule.default;
  const { astToString } = openapiTSModule;
  const prettierModule = await import("prettier");
  const prettier = prettierModule.default;

  const prettierConfig = (await prettier.resolveConfig(process.cwd())) ?? {};

  // 1. Export raw OpenAPI specification to openapi.json
  const rawSpec = JSON.stringify(document, null, 2);
  const formattedSpec = await prettier.format(rawSpec, {
    ...prettierConfig,
    parser: "json",
  });
  const specPath = "openapi.json";
  await Bun.write(specPath, formattedSpec);
  console.log(`OpenAPI specification successfully exported to ${specPath}`);

  // 2. Generate typed TypeScript definitions from the OpenAPI specification
  const ast = await openapiTS(
    document as unknown as Parameters<typeof openapiTS>[0],
  );
  const rawContents = astToString(ast);
  const formattedContents = await prettier.format(rawContents, {
    ...prettierConfig,
    parser: "typescript",
  });

  const outputPaths = [
    path.resolve(import.meta.dirname, "../test/generated/api-schema.d.ts"),
    path.resolve(import.meta.dirname, "../../admin/src/types/api-schema.d.ts"),
    path.resolve(
      import.meta.dirname,
      "../../storefront/src/types/api-schema.d.ts",
    ),
  ];

  for (const outPath of outputPaths) {
    await Bun.write(outPath, formattedContents);
    console.log(`OpenAPI types successfully generated at ${outPath}`);
  }
}

generate().catch((err: unknown) => {
  console.error("Failed to generate OpenAPI types:", err);
  process.exit(1);
});
