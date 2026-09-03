import "reflect-metadata";
process.env["SKIP_ENV_VALIDATION"] = "true";

async function generate() {
  const { NestFactory } = await import("@nestjs/core");
  const { DocumentBuilder, SwaggerModule } = await import("@nestjs/swagger");
  const { AppModule } = await import("../src/app.module");

  const app = await NestFactory.create(AppModule, { logger: false });

  const config = new DocumentBuilder()
    .setTitle("Ticket Booking API")
    .setDescription("The API specification for the Ticket Booking System")
    .setVersion("1.0.0")
    .setOpenAPIVersion("3.1.0")
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  await app.close();

  const openapiTSModule = await import("openapi-typescript");
  const openapiTS = openapiTSModule.default;
  const { astToString } = openapiTSModule;
  const prettierModule = await import("prettier");
  const prettier = prettierModule.default;

  const ast = await openapiTS(
    document as unknown as Parameters<typeof openapiTS>[0],
  );
  const rawContents = astToString(ast);
  const prettierConfig = (await prettier.resolveConfig(process.cwd())) ?? {};
  const formattedContents = await prettier.format(rawContents, {
    ...prettierConfig,
    parser: "typescript",
  });

  const outputPath = "test/generated/api-schema.d.ts";
  await Bun.write(outputPath, formattedContents);

  console.log(`OpenAPI types successfully generated at ${outputPath}`);
}

generate().catch((err: unknown) => {
  console.error("Failed to generate OpenAPI types:", err);
  process.exit(1);
});
