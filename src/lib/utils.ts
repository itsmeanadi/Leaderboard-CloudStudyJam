export interface LeaderboardEntry {
  rank: number;
  "User Name": string;
  "User Email": string;
  "# of Skill Badges Completed": number | string;
  "# of Arcade Games Completed": number | string;
  "All Skill Badges & Games Completed"?: "Yes" | "No";
  "Google Cloud Skills Boost Profile URL"?: string;
}


export interface FrozenUser {
  rank: number;
  timestamp?: string; // optional, in case you want to track when the rank was frozen
}
