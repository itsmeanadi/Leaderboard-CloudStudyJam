import { LeaderboardEntry } from "./utils";

export function sortLeaderboard(entries: LeaderboardEntry[]): LeaderboardEntry[] {
  return [...entries].sort((a, b) => a.rank - b.rank);
}

export function filterCompletedUsers(entries: LeaderboardEntry[]): LeaderboardEntry[] {
  return entries.filter(
    (entry) =>
      entry["All Skill Badges & Games Completed"] === "Yes" ||
      entry.allCompleted === "Yes"
  );
}

export function calculateLeaderboardStats(entries: LeaderboardEntry[]): {
  totalUsers: number;
  completedUsers: number | string;
  averageSkillBadges: number;
  averageArcadeGames: number | string;
} {
  const totalUsers = entries.length;

  if (totalUsers === 0) {
    return {
      totalUsers: 0,
      completedUsers: "-",
      averageSkillBadges: 0,
      averageArcadeGames: "-",
    };
  }

  // Determine whether completion status was supplied in this dataset
  const hasCompletionData = entries.some(
    (e) =>
      Boolean(e["All Skill Badges & Games Completed"]) ||
      Boolean(e.allCompleted)
  );

  const completedUsers = hasCompletionData
    ? filterCompletedUsers(entries).length
    : "-";

  // Calculate total skill badges
  const totalSkillBadges = entries.reduce((sum, entry) => {
    const rawVal =
      entry.skillBadgesCompleted ?? entry["# of Skill Badges Completed"];
    const count =
      typeof rawVal === "string" ? parseInt(rawVal, 10) : rawVal;
    return sum + (typeof count === "number" && !isNaN(count) ? count : 0);
  }, 0);

  // Check if arcade games exist in the dataset
  const entriesWithArcade = entries.filter((entry) => {
    const val =
      entry.arcadeGamesCompleted ?? entry["# of Arcade Games Completed"];
    return (
      val !== null &&
      val !== undefined &&
      val !== "-" &&
      val !== "" &&
      !isNaN(Number(val))
    );
  });

  let averageArcadeGames: number | string = "-";
  if (entriesWithArcade.length > 0) {
    const totalArcadeGames = entriesWithArcade.reduce((sum, entry) => {
      const val =
        entry.arcadeGamesCompleted ?? entry["# of Arcade Games Completed"];
      const count = typeof val === "string" ? parseInt(val, 10) : val;
      return sum + (typeof count === "number" && !isNaN(count) ? count : 0);
    }, 0);
    averageArcadeGames = totalArcadeGames / entriesWithArcade.length;
  }

  return {
    totalUsers,
    completedUsers,
    averageSkillBadges: totalUsers > 0 ? totalSkillBadges / totalUsers : 0,
    averageArcadeGames,
  };
}

export function getTopUsers(
  entries: LeaderboardEntry[],
  count: number = 10
): LeaderboardEntry[] {
  return sortLeaderboard(entries).slice(0, count);
}
