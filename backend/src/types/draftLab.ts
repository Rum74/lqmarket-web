export type HeroRole = 'Đấu sĩ' | 'Pháp sư' | 'Xạ thủ' | 'Sát thủ' | 'Đỡ đòn' | 'Trợ thủ';

export type HeroLane = 'Caesar' | 'Rừng' | 'Mid' | 'AD' | 'Support';

export type DamageType = 'Vật lý' | 'Phép' | 'Chuẩn' | 'Hỗn hợp';

export type HeroDifficulty = 'Dễ' | 'Trung bình' | 'Khó' | 'Rất khó';

export interface HeroRatings {
  tankiness: number;
  damage: number;
  crowdControl: number;
  engage: number;
  peel: number;
  mobility: number;
  earlyGame: number;
  lateGame: number;
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
  counters: string[];
  synergies: string[];
  tags: string[];
  difficulty: HeroDifficulty;
  isActive: boolean;
  notes?: string;
}

export interface TeamEvaluation {
  overallScore: number;
  grade: 'S+' | 'S' | 'A' | 'B' | 'C' | 'D';
  laneBalanceScore: number;
  damageBalanceScore: number;
  tankinessScore: number;
  burstDamageScore: number;
  crowdControlScore: number;
  engageScore: number;
  peelScore: number;
  teamfightScore: number;
  earlyGamePower: number;
  lateGamePower: number;
  damageComposition: {
    physical: number;
    magic: number;
    trueDamage: number;
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

export interface DraftLabSettings {
  enabled: boolean;
  allowDuplicatesBetweenTeams: boolean;
  maxSavedDraftsFree: number;
  maxSavedDraftsPremium: number;
  announcementNotice?: string;
}
