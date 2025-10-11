# Bug Fix Summary: Runtime TypeError

## Issue
The application was throwing a runtime TypeError:
```
Cannot read properties of undefined (reading 'toLowerCase')
```

This error was occurring in the filtering logic of the leaderboard data, where the code was trying to call `toLowerCase()` on potentially undefined properties.

## Root Cause
The error occurred in the `filteredLeaderboardData` useMemo hook in `src/app/page.tsx`. The filtering logic was directly accessing properties like `user["User Name"]` and `user["User Email"]` without checking if they were defined before calling `toLowerCase()` on them.

When data was loaded from the database or API, some entries might have had undefined values for these properties, causing the TypeError when trying to call methods on undefined.

## Fix Applied

### 1. Fixed Filtering Logic
Updated the filtering logic in `src/app/page.tsx` to properly handle potentially undefined values:

```typescript
const filteredLeaderboardData = useMemo(() => {
    return sortedLeaderboardData.filter(
        user => {
            const userName = user["User Name"] || '';
            const userEmail = user["User Email"] || '';
            const searchLower = searchQuery.toLowerCase();
            
            return userName.toLowerCase().includes(searchLower) || 
                   userEmail.toLowerCase().includes(searchLower);
        }
    );
}, [sortedLeaderboardData, searchQuery]);
```

### 2. Improved Sorting Logic
Enhanced the sorting logic to be more robust when handling undefined or null values:

```typescript
const sortedLeaderboardData = useMemo(() => {
    const sortableData = [...leaderboardData];
    
    sortableData.sort((a, b) => {
        if (sortConfig.key === 'rank') {
            const rankA = a.rank || 0;
            const rankB = b.rank || 0;
            
            if (sortConfig.direction === 'asc') {
                return rankA - rankB;
            } else {
                return rankB - rankA;
            }
        }
        
        let aValue: string | number = a[sortConfig.key as keyof LeaderboardEntry] as string | number;
        let bValue: string | number = b[sortConfig.key as keyof LeaderboardEntry] as string | number;
        
        // Handle potentially undefined values
        if (aValue === undefined || aValue === null) aValue = '';
        if (bValue === undefined || bValue === null) bValue = '';
        
        // ... rest of sorting logic
    });
    
    return sortableData;
}, [leaderboardData, sortConfig]);
```

## Testing
To verify the fix:
1. Start the application
2. Upload some test data through the admin panel
3. Try searching for users in the search bar
4. Try sorting by different columns
5. Verify that no TypeError occurs

## Prevention
The fix ensures that:
1. All string properties are checked for existence before calling string methods
2. Default values are provided for potentially undefined properties
3. The application gracefully handles incomplete or malformed data entries

This resolves the runtime error and makes the application more robust when dealing with data that might have missing fields.