# Migration `20200522232746-add-days`

This migration has been generated by Will Bunting at 5/22/2020, 11:27:46 PM.
You can check out the [state of the schema](./schema.prisma) after the migration.

## Database Steps

```sql
ALTER TABLE "public"."Location" ADD COLUMN "days" integer []  ;
```

## Changes

```diff
diff --git schema.prisma schema.prisma
migration 20200521143002-containment-is-int..20200522232746-add-days
--- datamodel.dml
+++ datamodel.dml
@@ -1,6 +1,6 @@
 datasource postgresql {
-  url = "***"
+  url      = env("DATABASE_URL")
   provider = "postgresql"
 }
 generator client {
@@ -69,8 +69,9 @@
   mostRecentDistancingDate String
   population               Int
   r0                       Float
   ventilators              Int
+  days                     Int[]
   scenarios                Scenario[]
   parameters               Parameter[]
   modelRun                 ModelRun?   @relation(fields: [modelRunId], references: [id])
   modelRunId               Int?
```


