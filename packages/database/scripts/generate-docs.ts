import * as schema from "../src/schemas/index";
import { IndexedColumn, type PgColumn } from "drizzle-orm/pg-core";
import { getTableConfig, PgTable } from "drizzle-orm/pg-core";
import { is, type StringChunk } from "drizzle-orm";
import { join } from "node:path";
import { writeFile } from "node:fs/promises";

type TableInfo = NonNullable<ReturnType<typeof extractTableInfo>>;

function parseDefaultValue(col: PgColumn): string {
  if (!col.hasDefault) return "-";

  if (col.onUpdateFn) {
    return "Auto-update";
  }

  if (col.default !== undefined && col.default !== null) {
    if (typeof col.default === "object") {
      // HACK: Traverse Drizzle's internal AST SQL object to extract the raw text representation.
      if (
        Array.isArray(
          (col.default as unknown as { queryChunks: StringChunk[] })
            .queryChunks,
        )
      ) {
        try {
          const rawSql = (
            col.default as unknown as { queryChunks: StringChunk[] }
          ).queryChunks
            .map((chunk) => {
              if (chunk?.value && Array.isArray(chunk.value)) {
                return chunk.value.join("");
              }
              return "";
            })
            .join("");

          return rawSql ? `SQL: ${rawSql}` : "SQL Expression";
        } catch (error) {
          console.error(error);

          return "SQL Expression";
        }
      }
      return "Complex Object";
    }

    if (
      typeof col.default === "string" ||
      typeof col.default === "boolean" ||
      typeof col.default === "number"
    ) {
      return String(col.default);
    }
    return "unknown default";
  }

  if (col.defaultFn) {
    return "Dynamic Fn";
  }

  return "-";
}

function extractTableInfo<T extends PgTable>(table: T, tableName: string) {
  const config = getTableConfig(table);

  const columns = config.columns.map((col) => ({
    name: col.name,
    // The Drizzle team hid 'codec' via @internal, but it exists in the V8 heap.
    type: (col as unknown as { codec: string }).codec ?? "unknown",
    nullable: !col.notNull,
    default: parseDefaultValue(col),
    isPrimary: col.primary,
  }));

  const indexes = config.indexes.map((idx) => ({
    name: idx.config.name,
    columns: idx.config.columns.map((c) => c),
  }));

  const foreignKeys = config.foreignKeys.map((fk) => {
    // Gọi hàm để lấy cấu trúc thật
    const ref = fk.reference();

    // Lấy tên bảng đích an toàn bằng getTableConfig
    let refTableName: string;
    try {
      refTableName = getTableConfig(ref.foreignTable).name;
    } catch (e) {
      console.error(e);

      refTableName = ref.foreignTable._.name || "unknown";
    }

    return {
      // ref.columns chứa mảng các cột ở bảng hiện tại
      column: ref.columns[0]?.name,

      referencedTable: refTableName,

      // ref.foreignColumns chứa mảng các cột ở bảng đích
      referencedColumn: ref.foreignColumns[0]?.name,

      onDelete: fk.onDelete,
    };
  });

  return {
    name: tableName,
    columns,
    indexes,
    foreignKeys,
  };
}

// ==================== MERMAID ERD GENERATOR ====================
function generateMermaidERD(tables: TableInfo[]): string {
  let erd = `erDiagram\n`;

  // Add relationships
  tables.forEach((table) => {
    table.foreignKeys.forEach((fk) => {
      const from = table.name;
      const to = fk.referencedTable;
      erd += `    ${from} ||--o{ ${to} : "${fk.column}"\n`;
    });
  });

  erd += `\n`;

  // Add entities (only show key columns to keep diagram clean)
  tables.forEach((table) => {
    erd += `    ${table.name} {\n`;

    const pk = table.columns.find((c) => c.isPrimary);
    if (pk) {
      erd += `        ${pk.type} ${pk.name} PK\n`;
    }

    table.foreignKeys.forEach((fk) => {
      erd += `        uuid ${fk.column} FK\n`;
    });

    const importantCols = table.columns
      .filter(
        (c) =>
          !c.isPrimary && !table.foreignKeys.some((fk) => fk.column === c.name),
      )
      .slice(0, 4);

    importantCols.forEach((col) => {
      erd += `        ${col.type.split("(")[0]} ${col.name}\n`;
    });

    erd += `    }\n`;
  });

  return erd;
}

// ==================== MARKDOWN GENERATOR ====================
function generateMarkdown(tables: TableInfo[]): string {
  const erd = generateMermaidERD(tables);

  let md = `---
title: Database Schema
description: Complete database schema with ERD for Hyundai E-commerce project (auto-generated from Drizzle)
date: ${new Date().toISOString().split("T")[0]}
---

# Database Schema

**Generated automatically** from Drizzle schema on ${new Date().toISOString().split("T")[0]}

---

## Entity Relationship Diagram (ERD)

\`\`\`mermaid
${erd}
\`\`\`

---

## Tables Overview

`;

  tables.forEach((table) => {
    md += `- [${table.name}](#${table.name.toLowerCase().replace(/_/g, "-")})\n`;
  });

  md += `\n---\n\n`;

  tables.forEach((table) => {
    md += `## ${table.name}\n\n`;

    md += `### Columns\n\n`;
    md += `| Column | Type | Nullable | Default | Primary |\n`;
    md += `|--------|------|----------|---------|---------|\n`;

    table.columns.forEach((col) => {
      md += `| ${col.name} | ${col.type} | ${col.nullable ? "YES" : "NO"} | ${col.default || "-"} | ${col.isPrimary ? "YES" : "-"} |\n`;
    });

    if (table.foreignKeys.length > 0) {
      md += `\n### Foreign Keys\n\n`;
      table.foreignKeys.forEach((fk) => {
        md += `- \`${fk.column}\` → \`${fk.referencedTable}.${fk.referencedColumn}\``;
        if (fk.onDelete) md += ` (ON DELETE ${fk.onDelete})`;
        md += `\n`;
      });
    }

    if (table.indexes.length > 0) {
      md += `\n### Indexes\n\n`;
      table.indexes.forEach((idx) => {
        const columnNames = idx.columns.map((col) => {
          if (col instanceof IndexedColumn) {
            return col.name;
          }

          return "unknown";
        });

        md += `- \`${idx.name}\`: (${columnNames.join(", ")})\n`;
      });
    }

    md += `\n---\n\n`;
  });

  return md;
}

async function main() {
  console.log("🔄 Generating database schema documentation...");

  const tables: TableInfo[] = [];

  // Get all exported tables (exclude enums and helper objects)
  const tableExports = Object.entries(schema).filter((entry) => {
    // HACK: dùng hàm is() của Drizzle để check ở Runtime
    return is(entry[1], PgTable);
  }) as [string, PgTable<any>][];

  for (const [name, table] of tableExports) {
    try {
      const tableInfo = extractTableInfo(table, name);
      tables.push(tableInfo);
      console.log(`  ✓ Processed: ${name}`);
    } catch (error) {
      console.warn(`  ⚠️  Skipped ${name}:`, (error as Error).message);
    }
  }

  const markdown = generateMarkdown(tables);

  const outputPath = join(
    process.cwd(),
    "../../apps/docs/content/docs/database-schema.mdx",
  );
  await writeFile(outputPath, markdown, "utf-8");

  console.log(`\n✅ Documentation generated successfully!`);
  console.log(`📄 Output: ${outputPath}`);
  console.log(`📊 Total tables: ${tables.length}`);
  console.log(
    `📈 Mermaid ERD included with ${tables.reduce((sum, t) => sum + t.foreignKeys.length, 0)} relationships`,
  );
}

main().catch(console.error);
