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
  color: t.Optional(t.String()),
});

export const CreateConnectionSchema = t.Object({
  name: t.String({ minLength: 1 }),
  bucket: t.String({ minLength: 1 }),
  endpoint: t.Optional(t.String()),
  region: t.Optional(t.String()),
  accessKeyId: t.String({ minLength: 1 }),
  secretAccessKey: t.String({ minLength: 1 }),
  sessionToken: t.Optional(t.String()),
  color: t.Optional(t.String()),
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
    color: t.Optional(t.String()),
  })
);

export const ReorderConnectionsSchema = t.Object({
  configPath: t.String({ minLength: 1 }),
  connectionIds: t.Array(t.String({ minLength: 1 })),
});

export const MoveConnectionSchema = t.Object({
  connectionId: t.String({ minLength: 1 }),
  sourceConfigPath: t.String({ minLength: 1 }),
  targetConfigPath: t.String({ minLength: 1 }),
  targetIndex: t.Optional(t.Number()),
});
