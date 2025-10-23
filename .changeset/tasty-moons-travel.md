---
"@h6s/calendar": patch
"@h6s/table": patch
---

Fix package.json main field to point to built files instead of TypeScript source files. npm does not support overriding the main field via publishConfig, which caused the published package to incorrectly reference src/index.ts, resulting in module resolution errors.
