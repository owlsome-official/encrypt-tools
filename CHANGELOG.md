# Changelog

## v0.5.0

- chore: consolidate branches - add compatible test files from origin/main
- chore: remove incompatible cherry-picked tests (written for HMAC crypto)
- chore: update preview image
- feat: refactor crypto.ts - add AES-GCM with optional AAD alongside legacy AES-CBC
- feat: add algorithm, AAD atoms and GCM-aware result atom
- feat: add AES-GCM page (default) with AAD panel + Legacy AES-CBC page with navigation
- test: add AES-GCM test suite - nonce uniqueness, roundtrip, tamper, AAD roundtrip/mismatch/tamper
- fix: resolve hydration mismatch - use stable default for aadTimestampAtom, set now() on client mount
- fix: prevent SSR hydration mismatch - defer result rendering to client via useSyncExternalStore

## v0.4.2

- [Edited] Updated dependencies
- [Edited] Upgraded Astro v6 -> v7, `@astrojs/react` v5 -> v6
- [Edited] Removed deprecated `@astrojs/tailwind` (using `@tailwindcss/vite` directly)
- [Edited] Pinned TypeScript to 6.x (ecosystem compatibility)

## v0.4.1

- [Fixed] TypeScript strict typing error for `Uint8Array<ArrayBufferLike>` incompatible with `BufferSource`
- [Edited] Refactored `decodeBase64ToBuffer` and `resolveBuffer` to return `Uint8Array<ArrayBuffer>` for Web Crypto API compatibility

## v0.4.0

- [Added] Base64 auto-detection and manual toggle for Key and IV inputs
- [Added] `Base64Toggle` pill-button component with accessible switch role
- [Edited] Upgraded `Astro` v5 -> v6, `@astrojs/react` v4 -> v5
- [Edited] Refactored crypto module to support Base64-encoded key/IV via `resolveBuffer`
- [Edited] Refactored Jotai atoms with auto-detect and manual-override pattern for Base64 state

## v0.3.2

- [Edited] updated deps

## v0.3.1

- [Edited] Bump version to 0.3.1

## v0.3.0

- [Edited] Updated `Astro 5.3`, `React 19`, `tailwindcss v4`, `vitest v3`, and much more deps

## v0.2.1

- [Edited] fixed ts-lint
- [Edited] set Astro static build configuration instead of SSR

## v0.2.0

- [Edited] Re-structure into Astro ✨

## v0.1.5

- [Edited] UI Responsive
- [Edited] Changed `grid` into `flex`

## v0.1.4

- [Added] Footer and Version
- [Added] `404.html` page

## v0.1.3

- [Added] Redirect when not match any route

## v0.1.2

- [Added] URL basename
- [Added] Google Fonts "Muli"
- [Added] favicon
- [Fixed] bugs on classname string concatenation
- [Fixed] bugs on demo result

## v0.1.1

- [Edited] Invalid Package Name

## v0.1.0

- [Added] Supported AES Encryption & Decryption with `Key` and `IV`
