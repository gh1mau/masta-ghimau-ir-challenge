/**
 * Firebase Configuration & Leaderboard Manager - BUG FREE VERSION
 * Real-time leaderboard for IR Challenge
 * Author: Hussein Mohamed masta ghimau
 */

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, set, onValue, push, update, remove, onDisconnect } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";
import { logger } from "./logger.js";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyANKcGHcyyXKS3mny7jOEn8sjWbNhL1Ilc",
  authDomain: "masta-ghimau-ir-challenge.firebaseapp.com",
  databaseURL: "https://masta-ghimau-ir-challenge-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "masta-ghimau-ir-challenge",
  storageBucket: "masta-ghimau-ir-challenge.firebasestorage.app",
  messagingSenderId: "1073985887858",
  appId: "1:1073985887858:web:16e21e1419ee66efbeeceb",
  measurementId: "G-K5508CP1CC"
};

// Initialize Firebase
let app = null;
let database = null;
let firebaseInitialized = false;

try {
  app = initializeApp(firebaseConfig);
  database = getDatabase(app);
  firebaseInitialized = true;
  logger.info("Firebase initialized successfully");
} catch (error) {
  logger.warn("Firebase initialization failed, running in local mode", { error: error.message });
}

/**
 * Leaderboard Manager Class
 * Handles real-time leaderboard functionality
 * Supports multiple listeners (presenter + challenge pages)
 */
class LeaderboardManager {
  constructor() {
    this.currentSession = null;
    this.playerId = null;
    this.playerName = null;
    this.unsubscribe = null;
    this.heartbeatInterval = null;
    this.callbacks = new Set(); // Support multiple listeners
    this.lastPlayersData = null; // Cache last data for new listeners
  }

  /**
   * Join a leaderboard session
   * @param {string} sessionCode - Challenge ID (e.g., 'chal_1')
   * @param {string} playerName - Player's nickname
   * @returns {Promise<boolean>} - Success status
   */
  async joinSession(sessionCode, playerName) {
    if (!firebaseInitialized || !database) {
      logger.warn("Firebase not available, cannot join session");
      return false;
    }

    try {
      this.currentSession = sessionCode;
      this.playerName = playerName;
      this.playerId = `player_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      const playerRef = ref(database, `sessions/${sessionCode}/players/${this.playerId}`);
      const timestamp = Date.now();

      await set(playerRef, {
        name: playerName,
        score: 0,
        joinedAt: timestamp,
        lastActive: timestamp
      });

      // Setup disconnect cleanup
      onDisconnect(playerRef).remove();

      // Start heartbeat
      this.startHeartbeat();

      logger.info("Joined leaderboard session", {
        session: sessionCode,
        player: playerName,
        playerId: this.playerId
      });

      return true;
    } catch (error) {
      logger.error("Failed to join session", { error: error.message });
      return false;
    }
  }

  /**
   * Update player score
   * @param {number} score - New score value
   * @returns {Promise<boolean>} - Success status
   */
  async updateScore(score) {
    if (!firebaseInitialized || !database || !this.currentSession || !this.playerId) {
      return false;
    }

    try {
      const playerRef = ref(database, `sessions/${this.currentSession}/players/${this.playerId}`);
      await update(playerRef, {
        score: score,
        lastActive: Date.now()
      });

      logger.info("Score updated", { score });
      return true;
    } catch (error) {
      logger.error("Failed to update score", { error: error.message });
      return false;
    }
  }

  /**
   * Listen for leaderboard updates
   * Supports multiple listeners (presenter + challenge pages)
   * @param {Function} callback - Function to call with updated player list
   * @returns {Function} - Unsubscribe function
   */
  onLeaderboardUpdate(callback) {
    if (!firebaseInitialized || !database) {
      logger.warn('Cannot listen for updates, Firebase not available');
      return () => {};
    }

    // Add callback to set
    this.callbacks.add(callback);
    console.log('Added leaderboard listener, total listeners:', this.callbacks.size);

    // If we have cached data, immediately call the callback
    if (this.lastPlayersData) {
      callback(this.lastPlayersData);
    }

    // Start Firebase listener if not already started
    this.startFirebaseListener();

    // Return unsubscribe function
    return () => {
      this.callbacks.delete(callback);
      console.log('Removed leaderboard listener, remaining:', this.callbacks.size);
      // Only stop Firebase listener if no more callbacks
      if (this.callbacks.size === 0 && this.unsubscribe) {
        this.unsubscribe();
        this.unsubscribe = null;
      }
    };
  }

  /**
   * Start Firebase listener (internal)
   */
  startFirebaseListener() {
    if (this.unsubscribe) {
      // Already listening
      return;
    }

    // Use current session or default to 'default_session'
    const sessionToListen = this.currentSession || 'default_session';
    console.log('Starting Firebase listener for session:', sessionToListen);

    const sessionRef = ref(database, `sessions/${sessionToListen}/players`);

    this.unsubscribe = onValue(sessionRef, (snapshot) => {
      const data = snapshot.val();
      console.log('Firebase data received:', data);

      let players = [];
      if (data) {
        players = Object.entries(data)
          .map(([id, player]) => ({ id, ...player }))
          .sort((a, b) => b.score - a.score)
          .slice(0, 10); // Top 10 only
      }

      // Cache the data
      this.lastPlayersData = players;

      // Notify all callbacks
      this.callbacks.forEach(callback => {
        try {
          callback(players);
        } catch (error) {
          console.error('Error in leaderboard callback:', error);
        }
      });
    }, (error) => {
      console.error('Firebase listener error:', error);
      this.callbacks.forEach(callback => {
        try {
          callback([]);
        } catch (e) {
          console.error('Error in error callback:', e);
        }
      });
    });
  }

  /**
   * Start heartbeat to keep player active
   */
  startHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }

    this.heartbeatInterval = setInterval(() => {
      if (this.currentSession && this.playerId) {
        const playerRef = ref(database, `sessions/${this.currentSession}/players/${this.playerId}`);
        update(playerRef, { lastActive: Date.now() }).catch(() => {
          // Ignore errors on heartbeat
        });
      }
    }, 30000); // Every 30 seconds
  }

  /**
   * Leave the current session
   */
  async leaveSession() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }

    // Clear all callbacks
    this.callbacks.clear();
    this.lastPlayersData = null;

    if (this.unsubscribe) {
      this.unsubscribe();
      this.unsubscribe = null;
    }

    if (firebaseInitialized && database && this.currentSession && this.playerId) {
      try {
        const playerRef = ref(database, `sessions/${this.currentSession}/players/${this.playerId}`);
        await remove(playerRef);
        logger.info("Left leaderboard session");
      } catch (error) {
        logger.error("Failed to leave session", { error: error.message });
      }
    }

    this.currentSession = null;
    this.playerId = null;
    this.playerName = null;
  }
}

// Create singleton instance
const leaderboardManager = new LeaderboardManager();

/**
 * Initialize Firebase and return status
 * @returns {boolean} - Whether Firebase is initialized
 */
function initFirebase() {
  return firebaseInitialized;
}

// Export for use in other modules
export { initFirebase, leaderboardManager, firebaseInitialized };
export default { initFirebase, leaderboardManager, firebaseInitialized };
