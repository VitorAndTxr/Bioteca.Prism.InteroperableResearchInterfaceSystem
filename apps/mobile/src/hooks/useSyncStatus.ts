/**
 * useSyncStatus Hook
 *
 * Convenience hook for accessing sync status and triggering manual syncs.
 *
 * Example:
 * ```typescript
 * function SettingsScreen() {
 *   const { syncReport, syncNow, isRunning, isSyncing } = useSyncStatus();
 *
 *   const handleManualSync = async () => {
 *     try {
 *       const report = await syncNow();
 *       Alert.alert('Sync Complete', `Synced ${report.sessions.synced} sessions`);
 *     } catch (error) {
 *       Alert.alert('Sync Failed', error.message);
 *     }
 *   };
 *
 *   return (
 *     <View>
 *       <Text>Sync Status: {isRunning ? 'Running' : 'Stopped'}</Text>
 *       {syncReport && (
 *         <Text>Last sync: {new Date(syncReport.timestamp).toLocaleString()}</Text>
 *       )}
 *       <Button
 *         title={isSyncing ? 'Syncing...' : 'Sync Now'}
 *         onPress={handleManualSync}
 *         disabled={isSyncing}
 *       />
 *     </View>
 *   );
 * }
 * ```
 */

import { useSyncContext } from '../context/SyncContext';

export function useSyncStatus() {
    return useSyncContext();
}
