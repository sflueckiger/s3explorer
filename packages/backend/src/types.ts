import { t } from "elysia";

export const ConnectionSchema = t.Object({
  id: t.String(),
  name: t.String({ minLength: 1 }),
  bucket: t.String({ minLength: 1 }),
  endpoint: t.Optional(t.String()),
  region: t.Optional(t.String()),
  accessKeyId: t.String({ minLength: 1 }),
  secretAccessKey: t.String({ minLength: 1 }),
  sessionToken: t.Optional(t.String()),
});

export const CreateConnectionSchema = t.Object({
  name: t.String({ minLength: 1 }),
  bucket: t.String({ minLength: 1 }),
  endpoint: t.Optional(t.String()),
  region: t.Optional(t.String()),
  accessKeyId: t.String({ minLength: 1 }),
  secretAccessKey: t.String({ minLength: 1 }),
  sessionToken: t.Optional(t.String()),
});

export const UpdateConnectionSchema = t.Partial(
  t.Object({
    name: t.String({ minLength: 1 }),
    bucket: t.String({ minLength: 1 }),
    endpoint: t.Optional(t.String()),
    region: t.Optional(t.String()),
    accessKeyId: t.String({ minLength: 1 }),
    secretAccessKey: t.String({ minLength: 1 }),
    sessionToken: t.Optional(t.String()),
  })
);
