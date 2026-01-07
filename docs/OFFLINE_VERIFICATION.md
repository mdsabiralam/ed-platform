# Offline First Verification Plan

**Objective:** Verify that the mobile app maintains critical functionality when disconnected and synchronizes correctly upon reconnection.

## Verification Steps (Manual/Simulated)

### 1. Codebase Analysis (Static Verification)
- **Library Check:**
  - Verify `pubspec.yaml` contains `drift` or `watermelon_db`.
  - *Result:* Found `drift: ^2.14.0`. The prompt mentioned WatermelonDB, but the codebase uses Drift (SQLite) for offline persistence.
- **Sync Logic Check:**
  - Inspect `apps/mobile/lib/core/services/sync_service.dart`.
  - Confirm existence of `syncPendingChanges()` or similar methods.
  - Verify `ConnectivityService` listens to network state changes.

### 2. "Survival Mode" Test Protocol (13.G.09)
1. **Initial Sync:**
   - Log in to the app while online.
   - Ensure all `Student`, `Class`, and `Fee` data is downloaded to local SQLite.
2. **Disconnect:**
   - Enable Airplane Mode.
3. **Perform Actions:**
   - **Mark Attendance:** Mark 5 students as "Absent".
   - **Collect Fees:** Record a cash payment for Student A.
   - **Issue Book:** Check out "Book X" to Student B.
4. **Reconnect:**
   - Disable Airplane Mode.
   - Observe logs for "Sync started".
5. **Verify Backend:**
   - Check `Attendance` table: 5 records created.
   - Check `FeeLedger`: Payment recorded.
   - Check `LibraryCirculation`: Book marked as ISSUED.

## Automated Testing Strategy
- Use Flutter Integration Tests (`integration_test` package).
- Mock `ConnectivityPlus` to simulate offline state.
- Assert that API calls are queued in the local DB and flushed when the mock connectivity is restored.
