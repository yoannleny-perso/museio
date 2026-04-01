import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { apiEnv } from "./config/env";

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    rawBody: true
  });

  const localhostOrigins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:8081",
    "http://127.0.0.1:8081",
    "http://localhost:8082",
    "http://127.0.0.1:8082",
    "http://localhost:19000",
    "http://127.0.0.1:19000",
    "http://localhost:19006",
    "http://127.0.0.1:19006",
    "http://localhost:19007",
    "http://127.0.0.1:19007",
    "http://localhost:19008",
    "http://127.0.0.1:19008",
    "http://localhost:19009",
    "http://127.0.0.1:19009"
  ];

  const localOriginPattern =
    /^https?:\/\/(?:localhost|127\.0\.0\.1|10(?:\.\d{1,3}){3}|192\.168(?:\.\d{1,3}){2}|172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?::\d+)?$/;

  const configuredOrigins = (apiEnv.CORS_ALLOWED_ORIGINS ?? "")
    .split(",")
    .map((origin) => origin.trim())
    .filter((origin) => origin.length > 0);

  const allowedOrigins = new Set(
    [
      ...localhostOrigins,
      process.env.NEXT_PUBLIC_APP_URL,
      ...configuredOrigins
    ].filter((value): value is string => Boolean(value))
  );

  app.enableCors({
    origin: (origin: string | undefined, callback: (error: Error | null, allow?: boolean) => void) => {
      if (!origin || allowedOrigins.has(origin) || localOriginPattern.test(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error(`Origin ${origin} is not allowed by CORS.`));
    },
    credentials: true
  });
  app.setGlobalPrefix("api");

  await app.listen(Number(apiEnv.API_PORT), "0.0.0.0");
}

void bootstrap();
