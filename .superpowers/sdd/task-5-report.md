status: DONE_WITH_CONCERNS

files changed:
- electron/ipc/depot-positions.ipc.ts
- electron/ipc/depot-positions.ipc.spec.ts
- electron/main.ts
- electron/preload/preload.ts
- src/app/electron-api.d.ts
- src/app/services/depot-positions.service.ts
- src/app/services/depot-positions.service.spec.ts

test commands run:
- `npm test -- --watch=false --include electron/ipc/depot-positions.ipc.spec.ts --include src/app/services/depot-positions.service.spec.ts`
  - first run: FAIL as expected because `src/app/services/depot-positions.service.ts` did not exist yet
  - final run: PASS, 1 test file passed, 2 tests passed
- `npx vitest run electron/ipc/depot-positions.ipc.spec.ts`
  - first run: FAIL because Electron's `ipcMain` is undefined in the raw Vitest Node environment
  - second run after adding a hoist-safe module mock: PASS, 1 test file passed, 2 tests passed

concerns / follow-ups:
- The exact command from the brief does not execute the Electron IPC spec under the current Angular test setup; only the Angular service spec is included. I verified the IPC spec separately with `npx vitest run electron/ipc/depot-positions.ipc.spec.ts`.
- The Angular test command emits an existing Sass `@import` deprecation warning from `src/styles.scss`.
