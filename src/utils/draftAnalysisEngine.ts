import {
  DraftHero,
  TeamEvaluation,
  DraftComparisonResult,
  LaneMatchup,
  HeroLane
} from '../types/draftLab';
import { INITIAL_DRAFT_HEROES } from '../data/draftHeroesData';

export const DISCLAIMER_TEXT =
  'Đánh giá chiến thuật tham khảo dựa trên bộ quy tắc phân tích chuyên sâu của LQ Draft Lab (không phải thống kê thi đấu chính thức từ Garena).';

/**
 * Evaluates a single 5-man team lineup according to Arena of Valor competitive principles.
 */
export function evaluateTeam(
  rawHeroes: (DraftHero | null)[],
  teamName: string = 'Đội hình'
): TeamEvaluation {
  const heroes = rawHeroes.filter((h): h is DraftHero => h !== null);

  if (heroes.length === 0) {
    return {
      overallScore: 0,
      grade: 'D',
      laneBalanceScore: 0,
      damageBalanceScore: 0,
      tankinessScore: 0,
      burstDamageScore: 0,
      crowdControlScore: 0,
      engageScore: 0,
      peelScore: 0,
      teamfightScore: 0,
      earlyGamePower: 0,
      lateGamePower: 0,
      damageComposition: { physical: 0, magic: 0, trueDamage: 0 },
      strengths: ['Chưa chọn tướng nào cho đội hình.'],
      weaknesses: ['Đội hình đang trống, vui lòng chọn ít nhất 1-5 tướng.'],
      tacticalAdvice: 'Chọn đủ 5 tướng theo các vị trí: Tà Thần Caesar, Rừng, Đường Giữa, Xạ Thủ và Trợ Thủ để nhận phân tích chi tiết.',
      missingRoles: ['Đấu sĩ', 'Pháp sư', 'Xạ thủ', 'Sát thủ', 'Trợ thủ'],
      suggestedReplacements: []
    };
  }

  // 1. Roles & Lanes Analysis
  const coveredLanes = new Set<string>();
  const coveredRoles = new Set<string>();
  let physicalCount = 0;
  let magicCount = 0;
  let trueDamageCount = 0;

  let totalTankiness = 0;
  let totalDamage = 0;
  let totalCC = 0;
  let totalEngage = 0;
  let totalPeel = 0;
  let totalEarly = 0;
  let totalLate = 0;

  for (const h of heroes) {
    coveredLanes.add(h.primaryLane);
    if (h.secondaryLane) coveredLanes.add(h.secondaryLane);

    coveredRoles.add(h.role);
    if (h.secondaryRole) coveredRoles.add(h.secondaryRole);

    if (h.damageType === 'Vật lý') physicalCount++;
    else if (h.damageType === 'Phép') magicCount++;
    else if (h.damageType === 'Chuẩn') trueDamageCount++;
    else if (h.damageType === 'Hỗn hợp') {
      physicalCount += 0.5;
      magicCount += 0.5;
    }

    totalTankiness += h.ratings.tankiness;
    totalDamage += h.ratings.damage;
    totalCC += h.ratings.crowdControl;
    totalEngage += h.ratings.engage;
    totalPeel += h.ratings.peel;
    totalEarly += h.ratings.earlyGame;
    totalLate += h.ratings.lateGame;
  }

  const n = heroes.length;
  const avg = (val: number) => Math.round((val / (n * 10)) * 100);

  const tankinessScore = avg(totalTankiness);
  const burstDamageScore = avg(totalDamage);
  const crowdControlScore = avg(totalCC);
  const engageScore = avg(totalEngage);
  const peelScore = avg(totalPeel);
  const earlyGamePower = avg(totalEarly);
  const lateGamePower = avg(totalLate);

  // Teamfight potency: calculated from combination of CC, Engage, Damage, and Tankiness
  const teamfightScore = Math.min(
    100,
    Math.round(
      crowdControlScore * 0.3 +
        engageScore * 0.25 +
        tankinessScore * 0.25 +
        burstDamageScore * 0.2
    )
  );

  // Lane balance calculation (5 core lanes: Caesar, Rừng, Mid, AD, Support)
  const coreLanes: HeroLane[] = ['Caesar', 'Rừng', 'Mid', 'AD', 'Support'];
  let lanesCoveredCount = 0;
  for (const l of coreLanes) {
    if (coveredLanes.has(l)) lanesCoveredCount++;
  }
  const laneBalanceScore = Math.round((lanesCoveredCount / coreLanes.length) * 100);

  // Damage composition
  const totalDmgShares = physicalCount + magicCount + trueDamageCount || 1;
  const damageComposition = {
    physical: Math.round((physicalCount / totalDmgShares) * 100),
    magic: Math.round((magicCount / totalDmgShares) * 100),
    trueDamage: Math.round((trueDamageCount / totalDmgShares) * 100)
  };

  // Damage balance score: Best when mixed (both physical and magic have at least 25%)
  let damageBalanceScore = 80;
  if (damageComposition.physical > 75) {
    damageBalanceScore -= 30; // Heavy pure physical penalty
  } else if (damageComposition.magic > 75) {
    damageBalanceScore -= 30; // Heavy pure magic penalty
  } else if (damageComposition.physical >= 30 && damageComposition.magic >= 25) {
    damageBalanceScore = 100; // Ideal hybrid damage mix
  } else {
    damageBalanceScore = 85;
  }
  if (damageComposition.trueDamage >= 15) {
    damageBalanceScore = Math.min(100, damageBalanceScore + 10); // True damage bonus
  }

  // Overall Score (Weighted combination)
  const overallScore = Math.min(
    100,
    Math.max(
      30,
      Math.round(
        laneBalanceScore * 0.25 +
          damageBalanceScore * 0.15 +
          teamfightScore * 0.2 +
          tankinessScore * 0.15 +
          crowdControlScore * 0.15 +
          peelScore * 0.1
      )
    )
  );

  let grade: 'S+' | 'S' | 'A' | 'B' | 'C' | 'D' = 'B';
  if (overallScore >= 92) grade = 'S+';
  else if (overallScore >= 84) grade = 'S';
  else if (overallScore >= 74) grade = 'A';
  else if (overallScore >= 64) grade = 'B';
  else if (overallScore >= 50) grade = 'C';
  else grade = 'D';

  // Strengths identification
  const strengths: string[] = [];
  if (crowdControlScore >= 75) {
    strengths.push('Lượng khống chế cứng dồi dào, khả năng giữ chân và ngắt chiêu đối thủ cực kỳ đáng gờm.');
  }
  if (tankinessScore >= 75) {
    strengths.push('Tuyến đầu (frontline) kiên cố, khả năng chống chịu và câu kéo sát thương trong combat dài hơi rất tốt.');
  }
  if (engageScore >= 75) {
    strengths.push('Khả năng mở giao tranh chủ động siêu tốc, dễ ép góc đối phương tại các hang Rồng/Caesar.');
  }
  if (peelScore >= 75) {
    strengths.push('Bảo kê chủ lực và hồi phục ấn tượng, xạ thủ có nhiều khoảng trống tự do bắn hạ tanker đối phương.');
  }
  if (damageComposition.physical >= 30 && damageComposition.magic >= 25) {
    strengths.push('Nguồn sát thương phân bổ cân bằng (Vật lý & Phép), buộc đối phương phải lên cả song giáp.');
  }
  if (damageComposition.trueDamage >= 15) {
    strengths.push('Có sát thương chuẩn uy lực, khắc chế triệt để các tướng đỡ đòn nhiều giáp/khiên.');
  }
  if (earlyGamePower >= 75) {
    strengths.push('Sức ép đầu trận cực mạnh, rất dễ lăn cầu tuyết (snowball) cướp bùa và ép đường sớm.');
  }
  if (lateGamePower >= 85) {
    strengths.push('Sức mạnh tăng tiến theo thời gian vượt trội, càng về late game giao tranh 5v5 càng áp đảo.');
  }
  if (strengths.length === 0) {
    strengths.push('Đội hình có độ đa dạng vai trò cơ bản, linh hoạt tùy theo tình huống thực chiến.');
  }

  // Weaknesses identification
  const weaknesses: string[] = [];
  if (tankinessScore < 55) {
    weaknesses.push('Tuyến đầu mỏng manh (thiếu tanker thực thụ), dễ bốc hơi nếu bị đối phương mở giao tranh bất ngờ.');
  }
  if (crowdControlScore < 55) {
    weaknesses.push('Thiếu khống chế cứng diện rộng, gặp các sát thủ cơ động cao (Nakroth, Aoi, Florentino) sẽ rất khó bắt lại.');
  }
  if (damageComposition.physical >= 75) {
    weaknesses.push('Quá phụ thuộc sát thương vật lý, đối phương chỉ cần lên Khiên Thất Truyền + Giáp Thống Khổ là sẽ giảm tải đáng kể.');
  }
  if (damageComposition.magic >= 75) {
    weaknesses.push('Quá thiên về sát thương phép, đối phương lên Huân Chương Troy + Giáp Gaia sẽ dễ dàng trụ vững.');
  }
  if (peelScore < 50) {
    weaknesses.push('Khả năng bảo hộ xạ thủ kém, chủ lực dễ trở thành miếng mồi ngon cho sát thủ vòng sau.');
  }
  if (lanesCoveredCount < 5) {
    const missingLanes = coreLanes.filter(l => !coveredLanes.has(l));
    weaknesses.push(`Chưa tối ưu hóa đường đi: còn thiếu vị trí chuyên biệt cho ${missingLanes.join(', ')}.`);
  }
  if (earlyGamePower < 55 && lateGamePower >= 80) {
    weaknesses.push('Đầu trận tương đối thụ động và yếu ớt, nếu bị đối phương xâm lăng rừng sớm sẽ rất dễ vỡ trận trước phút 10.');
  }
  if (weaknesses.length === 0) {
    weaknesses.push('Đội hình tương đối hoàn thiện, cần chú ý phối hợp giữ khoảng cách và cắm mắt kiểm soát bụi.');
  }

  // Missing Roles
  const missingRoles: string[] = [];
  for (const r of ['Đấu sĩ', 'Pháp sư', 'Xạ thủ', 'Sát thủ', 'Trợ thủ'] as const) {
    if (!coveredRoles.has(r)) missingRoles.push(r);
  }

  // Tactical Advice formulation
  let tacticalAdvice = '';
  if (earlyGamePower >= 75 && lateGamePower < 70) {
    tacticalAdvice = `${teamName} nên chủ động xâm lăng bùa rừng đối phương từ cấp 2, gank mạnh đường Rồng để ăn Rồng Ánh Sáng đầu tiên. Cần duy trì nhịp độ ép trụ liên tục và kết thúc trận đấu trước phút 15, tránh kéo dài để đối phương hồi phục late game.`;
  } else if (lateGamePower >= 80 && earlyGamePower < 65) {
    tacticalAdvice = `${teamName} nên đánh chậm, tập trung cắm mắt thủ rừng và dọn lính an toàn trong 8 phút đầu. Chỉ giao tranh khi có đủ trang bị chủ lực. Tận dụng tối đa bùa Caesar Bạo Chúa từ phút 15 trở đi để đẩy đường và dứt điểm ván đấu.`;
  } else if (tankinessScore >= 70 && crowdControlScore >= 70) {
    tacticalAdvice = `${teamName} sở hữu bộ combo giao tranh tổng rất mạnh. Hãy ép đối phương combat ở các địa hình hẹp quanh hang mục tiêu lớn. Tanker chủ động mở chiêu thức giữ chân, tạo góc cho pháp sư và xạ thủ xả sát thương tối đa.`;
  } else {
    tacticalAdvice = `${teamName} nên giữ đội hình theo chiến thuật 1-3-1 hoặc 4-1: Cho đấu sĩ solo đẩy lẻ tạo áp lực cánh, trong khi 4 thành viên còn lại kiểm soát tầm nhìn và giữ nhịp đường giữa.`;
  }

  // Intelligent Suggestions for Replacements
  const suggestedReplacements: TeamEvaluation['suggestedReplacements'] = [];

  if (tankinessScore < 55 || !coveredRoles.has('Đỡ đòn')) {
    const candidate = INITIAL_DRAFT_HEROES.find(h => h.role === 'Đỡ đòn' && !heroes.some(x => x.id === h.id));
    if (candidate) {
      suggestedReplacements.push({
        slotIndex: 4,
        currentHeroName: heroes[4]?.name || 'Vị trí 5',
        suggestedHero: candidate,
        reason: 'Bổ sung Đỡ đòn cứng cáp (như Thane/Toro/Maloch) để làm dày tuyến đầu và hút sát thương.'
      });
    }
  }

  if (damageComposition.physical >= 75 && !coveredRoles.has('Pháp sư')) {
    const candidate = INITIAL_DRAFT_HEROES.find(h => h.role === 'Pháp sư' && !heroes.some(x => x.id === h.id));
    if (candidate) {
      suggestedReplacements.push({
        slotIndex: 2,
        currentHeroName: heroes[2]?.name || 'Đường Giữa',
        suggestedHero: candidate,
        reason: 'Bổ sung Pháp sư sốc dame phép (Liliana/Raz/Krixi) để đa dạng hóa nguồn sát thương, chống đối phương lên giáp.'
      });
    }
  }

  if (crowdControlScore < 50) {
    const candidate = INITIAL_DRAFT_HEROES.find(h => h.ratings.crowdControl >= 9 && !heroes.some(x => x.id === h.id));
    if (candidate) {
      suggestedReplacements.push({
        slotIndex: 0,
        currentHeroName: heroes[0]?.name || 'Trợ thủ',
        suggestedHero: candidate,
        reason: `Cần thêm tướng có khống chế diện rộng như ${candidate.name} để dễ mở giao tranh và giữ chân kẻ địch.`
      });
    }
  }

  return {
    overallScore,
    grade,
    laneBalanceScore,
    damageBalanceScore,
    tankinessScore,
    burstDamageScore,
    crowdControlScore,
    engageScore,
    peelScore,
    teamfightScore,
    earlyGamePower,
    lateGamePower,
    damageComposition,
    strengths,
    weaknesses,
    tacticalAdvice,
    missingRoles,
    suggestedReplacements
  };
}

/**
 * Compares two teams head-to-head across lanes, early/late phases, and objective control.
 */
export function compareTeams(
  teamA: DraftHero[],
  teamB: DraftHero[],
  teamAName: string = 'Đội A (Xanh)',
  teamBName: string = 'Đội B (Đỏ)'
): DraftComparisonResult {
  const evalA = evaluateTeam(teamA, teamAName);
  const evalB = evaluateTeam(teamB, teamBName);

  const lanes: { lane: HeroLane; name: string }[] = [
    { lane: 'Caesar', name: 'Đường Tà Thần Caesar' },
    { lane: 'Rừng', name: 'Đường Rừng' },
    { lane: 'Mid', name: 'Đường Giữa' },
    { lane: 'AD', name: 'Đường Rồng (Xạ Thủ)' },
    { lane: 'Support', name: 'Trợ Thủ / SP' }
  ];

  const laneMatchups: LaneMatchup[] = lanes.map((l, idx) => {
    // Match by slot or preferred lane
    const heroA = teamA[idx] || teamA.find(h => h.primaryLane === l.lane) || null;
    const heroB = teamB[idx] || teamB.find(h => h.primaryLane === l.lane) || null;

    if (!heroA && !heroB) {
      return {
        lane: l.lane,
        laneName: l.name,
        heroA: null,
        heroB: null,
        winner: 'even',
        summary: 'Cả hai đội chưa xếp tướng vào đường này.'
      };
    }
    if (!heroA) {
      return {
        lane: l.lane,
        laneName: l.name,
        heroA: null,
        heroB,
        winner: 'teamB',
        summary: `${teamBName} có lợi thế áp đảo do ${teamAName} bỏ trống vị trí này.`
      };
    }
    if (!heroB) {
      return {
        lane: l.lane,
        laneName: l.name,
        heroA,
        heroB: null,
        winner: 'teamA',
        summary: `${teamAName} có lợi thế áp đảo do ${teamBName} bỏ trống vị trí này.`
      };
    }

    // Direct head-to-head calculation
    const scoreA =
      heroA.ratings.damage * 0.35 +
      heroA.ratings.tankiness * 0.25 +
      heroA.ratings.crowdControl * 0.2 +
      heroA.ratings.mobility * 0.2;

    const scoreB =
      heroB.ratings.damage * 0.35 +
      heroB.ratings.tankiness * 0.25 +
      heroB.ratings.crowdControl * 0.2 +
      heroB.ratings.mobility * 0.2;

    // Check specific counter logic
    const aCountersB = heroA.counters?.includes(heroB.name) || heroB.counters?.includes(heroA.name);
    const bCountersA = heroB.counters?.includes(heroA.name);

    let winner: 'teamA' | 'teamB' | 'even' = 'even';
    let summary = '';

    if (bCountersA) {
      winner = 'teamB';
      summary = `${heroB.name} là khắc chế cứng đối với ${heroA.name}, có lợi thế áp đảo trong các pha trao đổi chiêu thức đơn đấu.`;
    } else if (aCountersB) {
      winner = 'teamA';
      summary = `${heroA.name} có chất tướng nhỉnh hơn và khắc chế tốt lối đánh của ${heroB.name}.`;
    } else if (scoreA > scoreB + 0.4) {
      winner = 'teamA';
      summary = `${heroA.name} nhỉnh hơn về khả năng đi đường và kiểm soát lính so với ${heroB.name}.`;
    } else if (scoreB > scoreA + 0.4) {
      winner = 'teamB';
      summary = `${heroB.name} có áp lực tay đôi và khả năng hồi phục tốt hơn ${heroA.name}.`;
    } else {
      winner = 'even';
      summary = `Kèo đấu cân tài cân sức giữa ${heroA.name} và ${heroB.name}, kết quả chủ yếu phụ thuộc vào kỹ năng cá nhân và sự hỗ trợ của Rừng.`;
    }

    return {
      lane: l.lane,
      laneName: l.name,
      heroA,
      heroB,
      winner,
      summary
    };
  });

  // Early game verdict
  let earlyGameWinner: 'teamA' | 'teamB' | 'even' = 'even';
  let earlyGameAdvantageNote = '';
  if (evalA.earlyGamePower > evalB.earlyGamePower + 5) {
    earlyGameWinner = 'teamA';
    earlyGameAdvantageNote = `${teamAName} (${evalA.earlyGamePower}đ) vượt trội về sức ép đầu trận, có thể chủ động cướp rừng và kiểm soát đợt lính đầu.`;
  } else if (evalB.earlyGamePower > evalA.earlyGamePower + 5) {
    earlyGameWinner = 'teamB';
    earlyGameAdvantageNote = `${teamBName} (${evalB.earlyGamePower}đ) áp đảo giai đoạn đầu trận, dễ dàng kiểm soát các mục tiêu nhỏ và bùa lợi.`;
  } else {
    earlyGameWinner = 'even';
    earlyGameAdvantageNote = 'Hai đội có sức mạnh giai đoạn đầu trận cân bằng, không bên nào có lợi thế tuyệt đối trước cấp độ 4.';
  }

  // Late game verdict
  let lateGameWinner: 'teamA' | 'teamB' | 'even' = 'even';
  let lateGameAdvantageNote = '';
  if (evalA.lateGamePower > evalB.lateGamePower + 5) {
    lateGameWinner = 'teamA';
    lateGameAdvantageNote = `${teamAName} (${evalA.lateGamePower}đ) có ngưỡng sức mạnh late game cực kỳ đáng sợ với sát thương duy trì lớn.`;
  } else if (evalB.lateGamePower > evalA.lateGamePower + 5) {
    lateGameWinner = 'teamB';
    lateGameAdvantageNote = `${teamBName} (${evalB.lateGamePower}đ) nhỉnh hơn khi trận đấu kéo dài trên 15 phút nhờ chất tướng tăng tiến mạnh.`;
  } else {
    lateGameWinner = 'even';
    lateGameAdvantageNote = 'Cả hai bên đều giữ được sức mạnh ổn định về giai đoạn cuối ván đấu.';
  }

  // Teamfight advantage
  let teamfightAdvantage: 'teamA' | 'teamB' | 'even' = 'even';
  let teamfightAdvantageNote = '';
  if (evalA.teamfightScore > evalB.teamfightScore + 4) {
    teamfightAdvantage = 'teamA';
    teamfightAdvantageNote = `${teamAName} sở hữu khả năng mở combat và khống chế diện rộng vượt trội hơn, dễ quét sạch đối thủ nếu chọn được góc đẹp.`;
  } else if (evalB.teamfightScore > evalA.teamfightScore + 4) {
    teamfightAdvantage = 'teamB';
    teamfightAdvantageNote = `${teamBName} có sự gắn kết và khả năng dồn sát thương wombo combo trong giao tranh 5v5 nhỉnh hơn rõ rệt.`;
  } else {
    teamfightAdvantage = 'even';
    teamfightAdvantageNote = 'Giao tranh tổng giữa hai đội phụ thuộc hoàn toàn vào vị trí cắm mắt và khả năng trúng chiêu của các vị trí chủ lực.';
  }

  // Objective control (Caesar / Dragon)
  let objectiveControlAdvantage: 'teamA' | 'teamB' | 'even' = 'even';
  let objectiveControlAdvantageNote = '';
  const objScoreA = evalA.tankinessScore * 0.4 + evalA.burstDamageScore * 0.4 + evalA.engageScore * 0.2;
  const objScoreB = evalB.tankinessScore * 0.4 + evalB.burstDamageScore * 0.4 + evalB.engageScore * 0.2;

  if (objScoreA > objScoreB + 4) {
    objectiveControlAdvantage = 'teamA';
    objectiveControlAdvantageNote = `${teamAName} có khả năng ép góc và dứt điểm nhanh Rồng/Caesar nhờ lượng sát thương dồn lớn và hàng chắn vững.`;
  } else if (objScoreB > objScoreA + 4) {
    objectiveControlAdvantage = 'teamB';
    objectiveControlAdvantageNote = `${teamBName} kiểm soát hang mục tiêu lớn tốt hơn, có thể ăn lén hoặc trừng trị cướp mục tiêu rất uy tín.`;
  } else {
    objectiveControlAdvantage = 'even';
    objectiveControlAdvantageNote = 'Khả năng tranh chấp bùa Rồng và Caesar Bạo Chúa giữa 2 bên là 50-50, phụ thuộc vào tay Trừng Trị của người đi Rừng.';
  }

  // Overall advantage
  let overallAdvantage: 'teamA' | 'teamB' | 'even' = 'even';
  if (evalA.overallScore > evalB.overallScore + 3) {
    overallAdvantage = 'teamA';
  } else if (evalB.overallScore > evalA.overallScore + 3) {
    overallAdvantage = 'teamB';
  } else {
    overallAdvantage = 'even';
  }

  let detailedVerdict = '';
  if (overallAdvantage === 'teamA') {
    detailedVerdict = `${teamAName} chiếm ưu thế chiến thuật tổng thể (${evalA.overallScore}đ so với ${evalB.overallScore}đ). Đội hình có sự cân bằng giữa các nguồn sát thương và độ dày hàng trước tốt hơn.`;
  } else if (overallAdvantage === 'teamB') {
    detailedVerdict = `${teamBName} chiếm ưu thế chiến thuật tổng thể (${evalB.overallScore}đ so với ${evalA.overallScore}đ). Sở hữu khả năng giao tranh và kiểm soát thế trận nhỉnh hơn.`;
  } else {
    detailedVerdict = `Kèo đấu chiến thuật cực kỳ cân bằng (${evalA.overallScore}đ vs ${evalB.overallScore}đ). Trận đấu sẽ được định đoạt bởi sự chính xác trong khâu ra vào giao tranh và khống chế mục tiêu của tuyển thủ.`;
  }

  return {
    id: `draft_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    title: `${teamAName} vs ${teamBName}`,
    teamA,
    teamB,
    teamAName,
    teamBName,
    evalA,
    evalB,
    headToHead: {
      laneMatchups,
      earlyGameWinner,
      earlyGameAdvantageNote,
      lateGameWinner,
      lateGameAdvantageNote,
      teamfightAdvantage,
      teamfightAdvantageNote,
      objectiveControlAdvantage,
      objectiveControlAdvantageNote,
      overallAdvantage,
      detailedVerdict
    },
    createdAt: new Date().toISOString()
  };
}
