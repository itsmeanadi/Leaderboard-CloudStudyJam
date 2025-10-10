import { LeaderboardEntry } from "./utils";

/**
 * Sort leaderboard entries by rank
 */
export function sortLeaderboard(entries: LeaderboardEntry[]): LeaderboardEntry[] {
  return [...entries].sort((a, b) => a.rank - b.rank);
}

/**
 * Filter leaderboard entries based on completion status
 */
export function filterCompletedUsers(entries: LeaderboardEntry[]): LeaderboardEntry[] {
  return entries.filter(entry => entry["All Skill Badges & Games Completed"] === "Yes");
}

/**
 * Calculate statistics for the leaderboard
 */
export function calculateLeaderboardStats(entries: LeaderboardEntry[]): {
  totalUsers: number;
  completedUsers: number;
  averageSkillBadges: number;
  averageArcadeGames: number;
} {
  const totalUsers = entries.length;
  const completedUsers = filterCompletedUsers(entries).length;
  
  const totalSkillBadges = entries.reduce((sum, entry) => {
    const count = typeof entry["# of Skill Badges Completed"] === 'string' 
      ? parseInt(entry["# of Skill Badges Completed"]) 
      : entry["# of Skill Badges Completed"];
    return sum + (isNaN(count) ? 0 : count);
  }, 0);
  
  const totalArcadeGames = entries.reduce((sum, entry) => {
    const count = typeof entry["# of Arcade Games Completed"] === 'string' 
      ? parseInt(entry["# of Arcade Games Completed"]) 
      : entry["# of Arcade Games Completed"];
    return sum + (isNaN(count) ? 0 : count);
  }, 0);
  
  return {
    totalUsers,
    completedUsers,
    averageSkillBadges: totalUsers > 0 ? totalSkillBadges / totalUsers : 0,
    averageArcadeGames: totalUsers > 0 ? totalArcadeGames / totalUsers : 0
  };
}

/**
 * Get top N users from the leaderboard
 */
export function getTopUsers(entries: LeaderboardEntry[], count: number = 10): LeaderboardEntry[] {
  return sortLeaderboard(entries).slice(0, count);
}

/**
 * Find a user by email
 */
export function findUserByEmail(entries: LeaderboardEntry[], email: string): LeaderboardEntry | undefined {
  return entries.find(entry => entry["User Email"] === email);
}

/**
 * Update user rank based on completion metrics
 */
export function updateRanks(entries: LeaderboardEntry[]): LeaderboardEntry[] {
  // Sort by completion metrics (higher is better)
  const sortedEntries = [...entries].sort((a, b) => {
    // First sort by skill badges completed
    const skillBadgesA = typeof a["# of Skill Badges Completed"] === 'string' 
      ? parseInt(a["# of Skill Badges Completed"]) 
      : a["# of Skill Badges Completed"];
    const skillBadgesB = typeof b["# of Skill Badges Completed"] === 'string' 
      ? parseInt(b["# of Skill Badges Completed"]) 
      : b["# of Skill Badges Completed"];
      
    if (skillBadgesB !== skillBadgesA) {
      return skillBadgesB - skillBadgesA;
    }
    
    // Then sort by arcade games completed
    const arcadeGamesA = typeof a["# of Arcade Games Completed"] === 'string' 
      ? parseInt(a["# of Arcade Games Completed"]) 
      : a["# of Arcade Games Completed"];
    const arcadeGamesB = typeof b["# of Arcade Games Completed"] === 'string' 
      ? parseInt(b["# of Arcade Games Completed"]) 
      : b["# of Arcade Games Completed"];
      
    return arcadeGamesB - arcadeGamesA;
  });
  
  // Assign new ranks
  return sortedEntries.map((entry, index) => ({
    ...entry,
    rank: index + 1
  }));
}