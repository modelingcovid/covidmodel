# Migration `20200521095122-location-name-not-unique`

This migration has been generated by Will Bunting at 5/21/2020, 9:51:22 AM.
You can check out the [state of the schema](./schema.prisma) after the migration.

## Database Steps

```sql
DROP INDEX "public"."Location.name"
```

## Changes

```diff
diff --git schema.prisma schema.prisma
migration 20200520182518-add-prod-flag..20200521095122-location-name-not-unique
--- datamodel.dml
+++ datamodel.dml
@@ -1,6 +1,6 @@
 datasource postgresql {
-  url = "***"
+  url      = env("DATABASE_URL")
   provider = "postgresql"
 }
 generator client {
@@ -61,9 +61,9 @@
 }
 model Location {
   id                       Int         @default(autoincrement()) @id
-  name                     String      @unique
+  name                     String
   dateModelRun             String
   icuBeds                  Int
   importtime               Float
   mostRecentDistancingDate String
```


