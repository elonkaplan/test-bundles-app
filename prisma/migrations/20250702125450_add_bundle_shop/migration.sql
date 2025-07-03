-- RedefineTables
PRAGMA defer_foreign_keys = ON;

PRAGMA foreign_keys = OFF;

CREATE TABLE "new_Bundle" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "shop" TEXT NOT NULL DEFAULT '',
    "title" TEXT NOT NULL,
    "price" REAL NOT NULL,
    "selectedProducts" JSONB NOT NULL,
    "productAmount" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO
    "new_Bundle" (
        "createdAt",
        "id",
        "price",
        "productAmount",
        "selectedProducts",
        "title"
    )
SELECT "createdAt", "id", "price", "productAmount", "selectedProducts", "title"
FROM "Bundle";

DROP TABLE "Bundle";

ALTER TABLE "new_Bundle" RENAME TO "Bundle";

PRAGMA foreign_keys = ON;

PRAGMA defer_foreign_keys = OFF;