export interface LeaderboardEntry {
  rank: number;
  userName: string;
  email: string;
  skillsProfileUrl: string | null;
  skillsProfileStatus: string | null;
  developerProfileUrl: string | null;
  developerProfileStatus: string | null;
  accessCodeRedemptionStatus: string | null;
  milestoneCompleted: string | null;
  gearDigitalBadges: string | null;
  skillBadgesCompleted: number;
  skillBadgesCompletedNames: string | null;
  arcadeGamesCompleted?: number | null;
  allCompleted?: "Yes" | "No" | null;
  createdAt?: string | Date;

  // Legacy field aliases for existing UI bindings
  "User Name": string;
  "User Email": string;
  "# of Skill Badges Completed": number;
  "# of Arcade Games Completed"?: number | string | null;
  "All Skill Badges & Games Completed"?: "Yes" | "No" | null;
  "Google Cloud Skills Boost Profile URL"?: string | null;
}

export interface FrozenUser {
  rank: number;
  timestamp?: string;
}
