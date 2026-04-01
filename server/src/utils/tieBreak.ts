type TieBreakRow = {
  userId: string;
  registrationDate: string | Date;
  totalPoints: number;
  exactScores: number;
  correctWinners: number;
  championPredictionCorrect: boolean;
};

export const sortByTieBreak = <T extends TieBreakRow>(rows: T[]): T[] => {
  return [...rows].sort((a, b) => {
    if (b.totalPoints !== a.totalPoints) return b.totalPoints - a.totalPoints;
    if (b.exactScores !== a.exactScores) return b.exactScores - a.exactScores;
    if (b.correctWinners !== a.correctWinners) return b.correctWinners - a.correctWinners;

    const aChampion = a.championPredictionCorrect ? 1 : 0;
    const bChampion = b.championPredictionCorrect ? 1 : 0;
    if (bChampion !== aChampion) return bChampion - aChampion;

    const aRegistered = new Date(a.registrationDate).getTime();
    const bRegistered = new Date(b.registrationDate).getTime();
    return aRegistered - bRegistered;
  });
};
