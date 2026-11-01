export type HeroRole = 'Đấu sĩ' | 'Pháp sư' | 'Xạ thủ' | 'Sát thủ' | 'Đỡ đòn' | 'Trợ thủ';

export type HeroLane = 'Caesar' | 'Rừng' | 'Mid' | 'AD' | 'Support';

export type DamageType = 'Vật lý' | 'Phép' | 'Chuẩn' | 'Hỗn hợp';

export type HeroDifficulty = 'Dễ' | 'Trung bình' | 'Khó' | 'Rất khó';

export interface HeroRatings {
  tankiness: number;      // 1-10: Khả năng chống chịu
  damage: number;         // 1-10: Sát thương dồn / DPS
  crowdControl: number;   // 1-10: Khả năng khống chế cứng/mềm
  engage: number;         // 1-10: Khả năng mở giao tranh
  peel: number;           // 1-10: Khả năng bảo kê chủ lực / hồi phục
  mobility: number;       // 1-10: Độ cơ động / lướt
  earlyGame: number;      // 1-10: Sức mạnh đầu game
  lateGame: number;       // 1-10: Sức mạnh cuối game
}

export interface DraftHero {
  id: string;
  name: string;
  title: string;
  role: HeroRole;
  secondaryRole?: HeroRole;
  primaryLane: HeroLane;
  secondaryLane?: HeroLane;
  damageType: DamageType;
  avatar: string;
  ratings: HeroRatings;
  signatureSkill: string;
  counters: string[];     // Tướng khắc chế được tướng này
  synergies: string[];    // Tướng kết hợp tốt
  tags: string[];
  difficulty: HeroDifficulty;
  isActive: boolean;
  notes?: string;
}

export interface TeamSlot {
  slotIndex: number;
  lane: HeroLane;
  laneName: string;
  hero: DraftHero | null;
}

export interface TeamEvaluation {
  overallScore: number;            // 0 - 100
  grade: 'S+' | 'S' | 'A' | 'B' | 'C' | 'D';
  laneBalanceScore: number;        // 0 - 100
  damageBalanceScore: number;      // 0 - 100
  tankinessScore: number;          // 0 - 100
  burstDamageScore: number;        // 0 - 100
  crowdControlScore: number;       // 0 - 100
  engageScore: number;             // 0 - 100
  peelScore: number;               // 0 - 100
  teamfightScore: number;          // 0 - 100
  earlyGamePower: number;          // 0 - 100
  lateGamePower: number;           // 0 - 100
  damageComposition: {
    physical: number;              // Percentage (e.g. 50%)
    magic: number;                 // Percentage (e.g. 40%)
    trueDamage: number;            // Percentage (e.g. 10%)
  };
  strengths: string[];
  weaknesses: string[];
  tacticalAdvice: string;
  missingRoles: string[];
  suggestedReplacements: {
    slotIndex: number;
    currentHeroName: string;
    suggestedHero: DraftHero;
    reason: string;
  }[];
}

export interface LaneMatchup {
  lane: HeroLane;
  laneName: string;
  heroA: DraftHero | null;
  heroB: DraftHero | null;
  winner: 'teamA' | 'teamB' | 'even';
  summary: string;
}

export interface DraftComparisonResult {
  id: string;
  title: string;
  teamA: DraftHero[];
  teamB: DraftHero[];
  teamAName: string;
  teamBName: string;
  evalA: TeamEvaluation;
  evalB: TeamEvaluation;
  headToHead: {
    laneMatchups: LaneMatchup[];
    earlyGameWinner: 'teamA' | 'teamB' | 'even';
    earlyGameAdvantageNote: string;
    lateGameWinner: 'teamA' | 'teamB' | 'even';
    lateGameAdvantageNote: string;
    teamfightAdvantage: 'teamA' | 'teamB' | 'even';
    teamfightAdvantageNote: string;
    objectiveControlAdvantage: 'teamA' | 'teamB' | 'even';
    objectiveControlAdvantageNote: string;
    overallAdvantage: 'teamA' | 'teamB' | 'even';
    detailedVerdict: string;
  };
  createdAt: string;
  userId?: string;
  userEmail?: string;
  isSaved?: boolean;
}

export interface SavedDraftItem {
  id: string;
  userId: string;
  userEmail: string;
  title: string;
  teamAName: string;
  teamBName: string;
  teamAHeroIds: string[];
  teamBHeroIds: string[];
  resultSummary: {
    scoreA: number;
    scoreB: number;
    advantage: 'teamA' | 'teamB' | 'even';
  };
  createdAt: string;
  updatedAt?: string;
}

export interface DraftLabSettings {
  enabled: boolean;
  allowDuplicatesBetweenTeams: boolean;
  maxSavedDraftsFree: number;
  maxSavedDraftsPremium: number;
  announcementNotice?: string;
}
