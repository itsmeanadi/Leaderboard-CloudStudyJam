import { LeaderboardEntry } from "./utils";


function sortLeaderboard(entries: LeaderboardEntry[]): LeaderboardEntry[] {
  return [...entries].sort((a, b) => a.rank - b.rank);
}


function filterCompletedUsers(entries: LeaderboardEntry[]): LeaderboardEntry[] {
  return entries.filter(entry => entry["All Skill Badges & Games Completed"] === "Yes");
}


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


export function getTopUsers(entries: LeaderboardEntry[], count: number = 10): LeaderboardEntry[] {
  return sortLeaderboard(entries).slice(0, count);
}
