# @h6s/table

## 2.0.5

### Patch Changes

- 80ad99f: Lazily initialize the core instance in `useTable` to avoid constructing unused table models on subsequent renders. Existing source updates and column selection behavior are preserved.
- 20bd869: Cache the maximum row span as merge groups are updated to avoid scanning every group for each row. This also avoids argument-limit errors with large datasets and returns a default row span of 1 when no merge rules apply.

## 2.0.4

### Patch Changes

- a185823: fix: update main field to point to built files in package.json

## 2.0.3

### Patch Changes

- 96d248e: ci: oidc

## 2.0.2

### Patch Changes

- 803c2f7: replace JSX.Element type to ReactNode

## 2.0.1

### Patch Changes

- 1248860: access to public

## 2.0.0

### Major Changes

- 794d3c0: upgrade dependencies
