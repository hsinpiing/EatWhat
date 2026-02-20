const WeightedRandom = {
  pick(candidates, mode, count = 2) {
    if (candidates.length === 0) return [];
    if (candidates.length <= count) return [...candidates];

    if (mode === 'random') {
      const shuffled = [...candidates].sort(() => Math.random() - 0.5);
      return shuffled.slice(0, count);
    }

    // weighted mode: higher rating = higher weight
    const weighted = candidates.map(p => ({
      place: p,
      weight: Math.pow(p.rating || 3, 3) * Math.log((p.user_ratings_total || 1) + 1)
    }));

    const results = [];
    const pool = [...weighted];

    for (let i = 0; i < count && pool.length > 0; i++) {
      const totalWeight = pool.reduce((sum, p) => sum + p.weight, 0);
      let rand = Math.random() * totalWeight;
      for (let j = 0; j < pool.length; j++) {
        rand -= pool[j].weight;
        if (rand <= 0) {
          results.push(pool[j].place);
          pool.splice(j, 1);
          break;
        }
      }
    }
    return results;
  }
};
