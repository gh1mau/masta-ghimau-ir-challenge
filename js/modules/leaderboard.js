/**
 * Masta Ghimau IR Challenge - Leaderboard Module
 * Author: Hussein Mohamed masta ghimau
 * YouTube: https://www.youtube.com/@mastaghimau
 * GitHub: https://github.com/gh1mau
 */

class LeaderboardManager {
    constructor() {
        this.participants = new Map();
        this.maxEntries = 100;
        this.storageKey = 'mastaGhimauIR_leaderboard';
        this.loadFromStorage();
    }

    // Add or update participant
    addParticipant(id, name, score = 0, challengesCompleted = 0) {
        const participant = {
            id,
            name: name || `Player_${id.slice(0, 6)}`,
            score,
            challengesCompleted,
            lastActive: Date.now(),
            joinTime: Date.now()
        };

        // If participant exists, preserve join time
        if (this.participants.has(id)) {
            const existing = this.participants.get(id);
            participant.joinTime = existing.joinTime;
            participant.score = Math.max(existing.score, score);
            participant.challengesCompleted = Math.max(existing.challengesCompleted, challengesCompleted);
        }

        this.participants.set(id, participant);
        this.saveToStorage();
        return participant;
    }

    // Update participant score
    updateScore(id, points) {
        const participant = this.participants.get(id);
        if (participant) {
            participant.score += points;
            participant.lastActive = Date.now();
            this.saveToStorage();
            return participant;
        }
        return null;
    }

    // Complete challenge for participant
    completeChallenge(id, challengeId, score) {
        const participant = this.participants.get(id);
        if (participant) {
            participant.score += score;
            participant.challengesCompleted++;
            participant.lastActive = Date.now();
            
            // Track completed challenges
            if (!participant.completedChallenges) {
                participant.completedChallenges = [];
            }
            participant.completedChallenges.push({
                challengeId,
                score,
                completedAt: Date.now()
            });
            
            this.saveToStorage();
            return participant;
        }
        return null;
    }

    // Get participant by ID
    getParticipant(id) {
        return this.participants.get(id);
    }

    // Get all participants sorted by score
    getLeaderboard(limit = 20) {
        const sorted = Array.from(this.participants.values())
            .sort((a, b) => b.score - a.score)
            .slice(0, limit);
        
        return sorted.map((p, index) => ({
            rank: index + 1,
            ...p
        }));
    }

    // Get top participants
    getTopPlayers(count = 10) {
        return this.getLeaderboard(count);
    }

    // Get participant rank
    getRank(id) {
        const sorted = this.getLeaderboard(this.maxEntries);
        const index = sorted.findIndex(p => p.id === id);
        return index !== -1 ? index + 1 : null;
    }

    // Get statistics
    getStats() {
        const participants = Array.from(this.participants.values());
        const totalParticipants = participants.length;
        const totalScore = participants.reduce((sum, p) => sum + p.score, 0);
        const avgScore = totalParticipants > 0 ? Math.round(totalScore / totalParticipants) : 0;
        const totalChallenges = participants.reduce((sum, p) => sum + p.challengesCompleted, 0);
        
        // Find top scorer
        const topScorer = participants.length > 0 
            ? participants.reduce((max, p) => p.score > max.score ? p : max, participants[0])
            : null;

        return {
            totalParticipants,
            totalScore,
            avgScore,
            totalChallenges,
            topScorer: topScorer ? { name: topScorer.name, score: topScorer.score } : null
        };
    }

    // Remove inactive participants (older than 24 hours)
    cleanupInactive(hours = 24) {
        const cutoff = Date.now() - (hours * 60 * 60 * 1000);
        let removed = 0;
        
        for (const [id, participant] of this.participants) {
            if (participant.lastActive < cutoff) {
                this.participants.delete(id);
                removed++;
            }
        }
        
        if (removed > 0) {
            this.saveToStorage();
        }
        
        return removed;
    }

    // Clear all data
    clear() {
        this.participants.clear();
        this.saveToStorage();
    }

    // Save to localStorage
    saveToStorage() {
        try {
            const data = Array.from(this.participants.entries());
            localStorage.setItem(this.storageKey, JSON.stringify(data));
        } catch (e) {
            console.warn('Failed to save leaderboard to storage:', e);
        }
    }

    // Load from localStorage
    loadFromStorage() {
        try {
            const data = localStorage.getItem(this.storageKey);
            if (data) {
                const entries = JSON.parse(data);
                this.participants = new Map(entries);
            }
        } catch (e) {
            console.warn('Failed to load leaderboard from storage:', e);
        }
    }

    // Export leaderboard data
    exportData() {
        return {
            timestamp: Date.now(),
            participants: Array.from(this.participants.values()),
            stats: this.getStats()
        };
    }

    // Import leaderboard data
    importData(data) {
        if (data && data.participants) {
            this.participants = new Map(
                data.participants.map(p => [p.id, p])
            );
            this.saveToStorage();
            return true;
        }
        return false;
    }

    // Generate participant ID
    static generateId() {
        return 'player_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
    }

    // Get active participants (active in last 5 minutes)
    getActiveParticipants(minutes = 5) {
        const cutoff = Date.now() - (minutes * 60 * 1000);
        return Array.from(this.participants.values())
            .filter(p => p.lastActive >= cutoff)
            .sort((a, b) => b.score - a.score);
    }

    // Get participant progress
    getProgress(id) {
        const participant = this.participants.get(id);
        if (!participant) return null;

        const rank = this.getRank(id);
        const totalParticipants = this.participants.size;
        const percentile = totalParticipants > 0 
            ? Math.round(((totalParticipants - rank) / totalParticipants) * 100)
            : 0;

        return {
            participant,
            rank,
            totalParticipants,
            percentile,
            nextRank: rank > 1 ? this.getLeaderboard(rank)[rank - 2] : null
        };
    }
}

// Real-time leaderboard updates using BroadcastChannel (for same-origin tabs)
class RealtimeLeaderboard extends LeaderboardManager {
    constructor() {
        super();
        this.channel = null;
        this.callbacks = [];
        this.initChannel();
    }

    initChannel() {
        if (typeof BroadcastChannel !== 'undefined') {
            this.channel = new BroadcastChannel('mastaGhimauIR_leaderboard');
            this.channel.onmessage = (event) => {
                this.handleMessage(event.data);
            };
        }
    }

    handleMessage(data) {
        if (data.type === 'update') {
            this.participants = new Map(data.participants);
            this.notifyCallbacks();
        }
    }

    broadcastUpdate() {
        if (this.channel) {
            this.channel.postMessage({
                type: 'update',
                participants: Array.from(this.participants.entries()),
                timestamp: Date.now()
            });
        }
    }

    onUpdate(callback) {
        this.callbacks.push(callback);
        return () => {
            const index = this.callbacks.indexOf(callback);
            if (index > -1) {
                this.callbacks.splice(index, 1);
            }
        };
    }

    notifyCallbacks() {
        const leaderboard = this.getLeaderboard();
        this.callbacks.forEach(cb => cb(leaderboard));
    }

    // Override methods to broadcast updates
    addParticipant(id, name, score, challengesCompleted) {
        const result = super.addParticipant(id, name, score, challengesCompleted);
        this.broadcastUpdate();
        return result;
    }

    updateScore(id, points) {
        const result = super.updateScore(id, points);
        if (result) this.broadcastUpdate();
        return result;
    }

    completeChallenge(id, challengeId, score) {
        const result = super.completeChallenge(id, challengeId, score);
        if (result) this.broadcastUpdate();
        return result;
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { LeaderboardManager, RealtimeLeaderboard };
}
