import type { LeaderboardEntry } from "@/lib/utils";

export const uploadCSV = async (file: File): Promise<LeaderboardEntry[]> => {
    const text = await file.text();
    const rows = text.split("\n").map(row => row.split(","));
    
    if (rows.length < 2) {
        throw new Error("CSV file is empty or invalid");
    }
    
    const headers = rows.shift()?.map(h => cleanCSVValue(h)) || [];
    
    const requiredHeaders = ['User Name', 'User Email'];
    const missingHeaders = requiredHeaders.filter(header => !headers.includes(header));
    
    if (missingHeaders.length > 0) {
        throw new Error(`Missing required columns: ${missingHeaders.join(', ')}`);
    }

    const data: LeaderboardEntry[] = [];
    
    rows.forEach(row => {
        if (row.length < headers.length) return;
        
        const entry: Record<string, any> = {};
        headers.forEach((header, i) => {
            if (row[i]) {
                const cleanVal = cleanCSVValue(row[i]);
                if (header === "# of Skill Badges Completed" || header === "# of Arcade Games Completed") {
                    entry[header] = parseInt(cleanVal) || 0;
                } else {
                    entry[header] = cleanVal;
                }
            }
        });
        
        if (entry["User Name"] && entry["User Email"]) {
            data.push(entry as LeaderboardEntry);
        }
    });

    return sortLeaderboardData(data);
};

const cleanCSVValue = (value: string): string => {
    if (!value) return "";
    let cleanValue = value.trim();
    if (cleanValue.startsWith('"') && cleanValue.endsWith('"')) {
        cleanValue = cleanValue.substring(1, cleanValue.length - 1);
    }
    return cleanValue;
};

const sortLeaderboardData = (data: LeaderboardEntry[]): LeaderboardEntry[] => {
    return [...data].sort((a, b) => {
        const skillBadgesA = typeof a["# of Skill Badges Completed"] === 'string' ? parseInt(a["# of Skill Badges Completed"]) : a["# of Skill Badges Completed"];
        const skillBadgesB = typeof b["# of Skill Badges Completed"] === 'string' ? parseInt(b["# of Skill Badges Completed"]) : b["# of Skill Badges Completed"];
        
        if (skillBadgesB !== skillBadgesA) {
            return skillBadgesB - skillBadgesA;
        }
        
        const arcadeGamesA = typeof a["# of Arcade Games Completed"] === 'string' ? parseInt(a["# of Arcade Games Completed"]) : a["# of Arcade Games Completed"];
        const arcadeGamesB = typeof b["# of Arcade Games Completed"] === 'string' ? parseInt(b["# of Arcade Games Completed"]) : b["# of Arcade Games Completed"];
        
        return arcadeGamesB - arcadeGamesA;
    }).map((entry, index) => ({
        ...entry,
        rank: index + 1
    }));
};
