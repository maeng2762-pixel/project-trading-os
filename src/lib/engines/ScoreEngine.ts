/**
 * ScoreEngine: The Gamification Core (Meta-Layer)
 * "Make preserving capital more addictive than gambling."
 */

export const ScoreEngine = {
    // XP Table
    XP_EVENTS: {
        ENTRY_WITH_SL: 10,       // Discipline: Setting Stop Loss
        WIN_TRADE: 50,           // Skill: Winning
        LOSS_AT_SL: 20,          // Discipline: Taking loss as planned (Good Loss)
        DAILY_SURVIVAL: 100,     // Survival: Ending day without ruin

        // Penalties
        NO_SL_ENTRY: -50,        // Risk: Naked entry
        REVENEGE_TRADE: -200,    // Psychology: Trading while locked/tilted
        MANUAL_CLOSE_PANIC: -30  // Psychology: Breaking plan
    },

    /**
     * Calculate Level based on XP
     * Curve: Simple Square Root
     */
    calculateLevel: (xp: number) => {
        return Math.floor(Math.sqrt(xp / 100)) + 1;
    },

    /**
     * Get Badge status based on stats
     */
    getBadges: (survivalScore: number, mdd: number, daysAlive: number) => {
        const badges = [];
        if (survivalScore >= 90) badges.push({ id: 'IRON_MIND', name: 'Iron Mind', icon: '🛡️' });
        if (mdd > -5) badges.push({ id: 'GUARDIAN', name: 'Guardian', icon: '🏰' });
        if (daysAlive >= 30) badges.push({ id: 'ELITE', name: 'Long Game Elite', icon: '👑' });
        return badges;
    }
};
