"use client";
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { ref, onValue, off, onDisconnect } from 'firebase/database';
import { rtdb, auth, signInAnonymously } from './core/firebase';
import { v4 as uuidv4 } from 'uuid';
import { gameRegistry } from './games/registry';
import {
  RoomRecord,
  RoomPlayer,
  HostAccount,
  HostView,
  ControllerView,
  PlayerAction,
  PlayerContext,
  GameContext,
} from './core/types';
import { HostSalonLanding } from './components/HostSalonLanding';
import { HostDashboard } from './components/HostDashboard';
import { ControllerRenderer } from './components/ControllerRenderer';
import { InviteModal } from './components/InviteModal';
import { EntitlementsModal } from './components/EntitlementsModal';
import { PatronAuthModal } from './components/PatronAuthModal';
import { MultiDeviceTester } from './components/MultiDeviceTester';

export function App() {
  // Navigation & Session Identity
  const [currentRoomCode, setCurrentRoomCode] = useState<string>('');
  const [room, setRoom] = useState<RoomRecord | null>(null);
  const [userRole, setUserRole] = useState<'host' | 'guest' | null>(null);
  const [myPlayerId, setMyPlayerId] = useState<string>('');
  const [myPlayerName, setMyPlayerName] = useState<string>('');
  const [selectedGameId, setSelectedGameId] = useState<string>('orion-gate');

  // Simulation Viewport: 'host', 'controller', or 'split'
  const [viewMode, setViewMode] = useState<'host' | 'controller' | 'split'>('host');

  // Host Account State
  const [hostAccount, setHostAccount] = useState<HostAccount | null>(null);

  // Modals
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showEntitlementsModal, setShowEntitlementsModal] = useState(false);
  const [showPatronAuthModal, setShowPatronAuthModal] = useState(false);
  const [joinError, setJoinError] = useState<string>('');
  const [isInitiating, setIsInitiating] = useState(false);

  // Load Host Account
  useEffect(() => {
    
  }, []);

  // Check URL query params for ?code=XXXX
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const code = params.get('code');
      if (code && code.length === 4) {
        // Auto-fill or prepare code
        setCurrentRoomCode(code.toUpperCase());
      }
    }
  }, []);

  // Real-time State Subscription to active room
  useEffect(() => {
    if (!currentRoomCode) {
      setRoom(null);
      return;
    }

    const roomRef = ref(rtdb, `rooms/${currentRoomCode}`);
    const unsubscribe = onValue(roomRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setRoom(data);
      } else {
        setRoom(null);
      }
    });

    return () => off(roomRef, 'value', unsubscribe);
  }, [currentRoomCode]);

  // Catalog of Games
  const catalog = useMemo(() => Object.values(gameRegistry).map(g => g.metadata), []);

  // Active Session Resolution
  const activeSession = useMemo(() => {
    if (!room || !room.currentSessionId) return null;
    return room.sessions[room.currentSessionId] || null;
  }, [room]);

  // Compute Host Declarative View from Active GameModule
  const activeHostView: HostView | undefined = useMemo(() => {
    if (!room || !activeSession) return undefined;
    const game = gameRegistry[activeSession.gameId];
    if (!game) return undefined;

    const playersSummary = (Object.values(room.players || {}) as RoomPlayer[]).map(p => ({
      playerId: p.playerId,
      name: p.name,
      score: p.score,
      roomScore: p.roomScore,
      connected: Object.keys(p.connections || {}).length > 0,
      activeConnectionCount: Object.keys(p.connections || {}).length,
    }));

    const context: GameContext = {
      roomId: room.roomCode,
      sessionId: activeSession.sessionId,
      gameId: activeSession.gameId,
      gameVersion: activeSession.gameVersion,
      players: playersSummary,
      state: activeSession.state,
      currentTime: Date.now(),
      roundNumber: activeSession.round,
      roundEndsAt: activeSession.roundEndsAt,
    };

    return game.getHostView(context);
  }, [room, activeSession]);

  // Compute Controller Declarative View for current player
  const activeControllerView: ControllerView | undefined = useMemo(() => {
    if (!room || !activeSession || !myPlayerId) {
      // Return standby waiting view if in room without active session
      return {
        type: 'text_input',
        title: 'Chamber Standby',
        prompt: 'Awaiting host to initiate session from gallery...',
        disabled: true,
        components: [
          {
            type: 'feedback_message',
            text: `Connected to Chamber ${currentRoomCode}`,
            status: 'info',
            detail: 'Keep this screen awake. Controls will materialize when the game commences.',
          },
        ],
      };
    }

    const game = gameRegistry[activeSession.gameId];
    if (!game) return undefined;

    const player = room.players ? room.players[myPlayerId] : undefined;
    const playerContext: PlayerContext = {
      roomId: room.roomCode,
      sessionId: activeSession.sessionId,
      playerId: myPlayerId,
      playerName: player ? player.name : myPlayerName,
      score: player ? player.score : 0,
      gameState: activeSession.state,
    };

    const ctrlView = game.getControllerView(playerContext);
    // Inject server-authoritative timer if session has roundEndsAt
    if (activeSession.roundEndsAt) {
      ctrlView.timer = { endsAt: activeSession.roundEndsAt };
    }
    return ctrlView;
  }, [room, activeSession, myPlayerId, currentRoomCode, myPlayerName]);

  // Handle Host Initiating New Room
  const handleInitiateSession = (overrideHostUid?: string) => {
    setIsInitiating(true);
    setJoinError('');

    setTimeout(() => {
      fetch('/api/rooms/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hostId: overrideHostUid || hostAccount?.uid || 'host_commander' })
      }).then(res => res.json()).then(result => {
        setIsInitiating(false);
        if (!result.success || !result.roomCode) {
          setJoinError(result.error || 'Failed to dispatch chamber');
          return;
        }
        const code = result.roomCode;
        setCurrentRoomCode(code);
        setUserRole('host');
        setViewMode('host');
      });
    }, 600);
  };

  // Handle Guest Joining Room
  const handleJoinSession = async (moniker: string, roomCode: string) => {
    setIsInitiating(true);
    setJoinError('');
    try {
      const code = roomCode.toUpperCase();
      const userCred = await signInAnonymously(auth);
      const uid = userCred.user.uid;
      const connectionId = 'conn_' + uid;

      const res = await fetch(`/api/rooms/${code}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: moniker, uid, connectionId })
      });
      const result = await res.json();
      
      if (!result.success) {
        setJoinError(result.error || 'Failed to enter chamber');
        setIsInitiating(false);
        return;
      }

      const myConnRef = ref(rtdb, `rooms/${code}/players/${uid}/connections/${connectionId}`);
      onDisconnect(myConnRef).remove();

      setCurrentRoomCode(code);
      setViewMode('controller');
      setMyPlayerId(uid);
      setIsInitiating(false);
    } catch (e: any) {
      setJoinError(e.message || 'Network error');
      setIsInitiating(false);
    }
  };

  // Host Starts a Game
  const handleStartGameSession = async (gameId: string) => {
    if (!currentRoomCode) return;
    await fetch(`/api/rooms/${currentRoomCode}/sessions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ gameId })
    });
  };

  // Host Advances Round
  const handleAdvanceRound = async () => {
    if (!currentRoomCode) return;
    await fetch(`/api/rooms/${currentRoomCode}/advance`, {
      method: 'POST'
    });
  };

  // Controller Action Submission (with client-side idempotency)
  const handleSubmitPlayerAction = useCallback(async (action: PlayerAction) => {
    if (!currentRoomCode) return;
    await fetch(`/api/rooms/${currentRoomCode}/actions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(action)
    });
  }, [currentRoomCode]);

  // Disconnect / Leave
  const handleLeaveRoom = () => {
    if (currentRoomCode && myPlayerId) {
      fetch(`/api/rooms/${currentRoomCode}/disconnect`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerId: myPlayerId, connectionId: 'conn_main' })
      });
    }
    setCurrentRoomCode('');
    setUserRole(null);
    setMyPlayerId('');
    setViewMode('host');
  };

  // Upgrades & Passes
  const handleUpgradePass = async (passType: '24_hour_pass' | 'annual_pass') => {
    if (!hostAccount) return;
    try {
      const res = await fetch('/api/payment/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hostId: hostAccount.uid, passType })
      });
      const data = await res.json();
      if (data.checkoutUrl) {
        if (data.simulated) {
          alert(`Simulated Checkout for ${passType}! In a real app, you would be redirected to Stripe.`);
          // Simulate successful upgrade
          setHostAccount({ ...hostAccount, tier: passType });
        } else {
          window.location.href = data.checkoutUrl;
        }
      }
    } catch (e) {
      console.error("Payment failed", e);
    }
    setShowEntitlementsModal(false);
  };

  // Add Simulated Guest Patron
  const handleAddSimulatedPlayer = () => {
    if (!currentRoomCode) return;
    const names = ['Aethelgard', 'Soren_K', 'Mirage_09', 'Cassian', 'Solene', 'Elara_V', 'Zephyr', 'Orpheus', 'Lyra_N', 'Theron'];
    const existing = room ? (Object.values(room.players || {}) as RoomPlayer[]).map(p => p.name) : [];
    const available = names.filter(n => !existing.includes(n));
    const nextName = available[0] || `Patron_${Math.floor(Math.random() * 900 + 100)}`;
    const uid = 'sim_' + Math.random().toString(36).substring(2, 8);
    fetch(`/api/rooms/${currentRoomCode}/join`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: nextName, uid, connectionId: 'conn_sim_' + uid })
    });
  };

  // If not in a room, render Salon Landing (Screen 1)
  if (!currentRoomCode || !room) {
    return (
      <div className="relative min-h-screen bg-[#0D0D0D]">
        <HostSalonLanding
          onJoinSession={handleJoinSession}
          onInitiateSession={() => {
            if (hostAccount) {
              handleInitiateSession();
            } else {
              setShowPatronAuthModal(true);
            }
          }}
          onOpenSignIn={() => setShowPatronAuthModal(true)}
          joinError={joinError}
          isInitiating={isInitiating}
        />

        {/* Patron Auth Modal */}
        <PatronAuthModal
          isOpen={showPatronAuthModal}
          onClose={() => setShowPatronAuthModal(false)}
          onSuccess={(name, uid) => {
            const newHost = { name, uid, tier: hostAccount?.tier || 'free' };
            setHostAccount(newHost);
            handleInitiateSession(uid);
          }}
        />

        {/* Entitlements Modal */}
        {hostAccount && (
          <EntitlementsModal
            host={hostAccount}
            isOpen={showEntitlementsModal}
            onClose={() => setShowEntitlementsModal(false)}
            onUpgrade={handleUpgradePass}
          />
        )}
      </div>
    );
  }

  // Active in Room: Render Host Dashboard, Controller, or Split View
  return (
    <div className="relative min-h-screen bg-[#0D0D0D] overflow-x-hidden">
      {/* 1. Host Screen View */}
      {viewMode === 'host' && (
        <HostDashboard
          room={room}
          catalog={catalog}
          selectedGameId={selectedGameId}
          onSelectGame={setSelectedGameId}
          onStartSession={handleStartGameSession}
          onAdvanceRound={handleAdvanceRound}
          onOpenInvite={() => setShowInviteModal(true)}
          onOpenEntitlements={() => setShowEntitlementsModal(true)}
          onLeaveRoom={handleLeaveRoom}
          activeHostView={activeHostView}
          hostName={hostAccount?.name || 'COMMANDER'}
          tierLabel={hostAccount?.tier === 'annual_pass' ? 'ELITE TIER' : 'PATRON'}
        />
      )}

      {/* 2. Phone Controller View */}
      {viewMode === 'controller' && activeControllerView && (
        <ControllerRenderer
          view={activeControllerView}
          playerId={myPlayerId || 'player_host_debug'}
          playerName={myPlayerName || 'Commander Guest'}
          roomCode={room.roomCode}
          onSubmitAction={handleSubmitPlayerAction}
          onDisconnect={handleLeaveRoom}
        />
      )}

      {/* 3. Split Dual View (Host on Left, Smartphone Controller on Right) */}
      {viewMode === 'split' && (
        <div className="min-h-screen w-full flex flex-col xl:flex-row bg-[#0D0D0D]">
          {/* Host Side (70%) */}
          <div className="flex-1 border-b xl:border-b-0 xl:border-r border-white/10 overflow-hidden flex flex-col">
            <div className="bg-[#141313] px-4 py-1.5 border-b border-white/5 flex items-center justify-between text-[11px] text-[#8e9192]">
              <span className="font-mono uppercase font-bold tracking-widest text-[#8C734B]">
                SHARED SALON DISPLAY (CHAMBER #{room.roomCode})
              </span>
              <span className="font-mono">HOST RUNTIME</span>
            </div>
            <div className="flex-1 overflow-y-auto">
              <HostDashboard
                room={room}
                catalog={catalog}
                selectedGameId={selectedGameId}
                onSelectGame={setSelectedGameId}
                onStartSession={handleStartGameSession}
                onAdvanceRound={handleAdvanceRound}
                onOpenInvite={() => setShowInviteModal(true)}
                onOpenEntitlements={() => setShowEntitlementsModal(true)}
                onLeaveRoom={handleLeaveRoom}
                activeHostView={activeHostView}
                hostName={hostAccount?.name || 'COMMANDER'}
                tierLabel="ELITE TIER"
              />
            </div>
          </div>

          {/* Smartphone Simulator Side (30%) */}
          <div className="w-full xl:w-[420px] bg-[#090909] p-4 sm:p-6 flex flex-col items-center justify-center shrink-0 border-l border-white/5">
            <div className="text-center mb-3">
              <span className="text-[10px] uppercase font-mono tracking-widest text-[#8C734B] block">
                HANDHELD TELEMETRY
              </span>
              <span className="text-xs text-[#8e9192]">Smartphone Controller Simulation</span>
            </div>

            {/* Mobile Device Frame */}
            <div className="w-full max-w-sm rounded-[36px] bg-[#121111] border-[4px] border-[#2b2a2a] shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col min-h-[580px]">
              {/* Phone Speaker Notch */}
              <div className="w-full py-2 bg-[#121111] flex justify-center items-center">
                <div className="w-16 h-1 rounded-full bg-white/20" />
              </div>

              {activeControllerView ? (
                <div className="flex-1 flex flex-col overflow-y-auto p-4">
                  <ControllerRenderer
                    view={activeControllerView}
                    playerId={myPlayerId || Object.keys(room.players || {})[0] || 'patron_sim'}
                    playerName={myPlayerName || (Object.values(room.players || {}) as RoomPlayer[])[0]?.name || 'Commander (Sim)'}
                    roomCode={room.roomCode}
                    onSubmitAction={handleSubmitPlayerAction}
                  />
                </div>
              ) : (
                <div className="p-8 text-center my-auto text-xs text-[#8e9192]">
                  Connecting controller...
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Floating Multi-Device & Operational Controls */}
      <MultiDeviceTester
        currentViewMode={viewMode}
        onChangeViewMode={setViewMode}
        onAddSimulatedPlayer={handleAddSimulatedPlayer}
        onAdvanceRound={handleAdvanceRound}
        playerCount={Object.keys(room.players || {}).length}
        maxPlayers={20}
        roomCode={room.roomCode}
      />

      {/* Invite Modal */}
      <InviteModal
        roomCode={room.roomCode}
        players={Object.values(room.players || {})}
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
      />

      {/* Entitlements Modal */}
      {hostAccount && (
        <EntitlementsModal
          host={hostAccount}
          isOpen={showEntitlementsModal}
          onClose={() => setShowEntitlementsModal(false)}
          onUpgrade={handleUpgradePass}
        />
      )}

      {/* Patron Auth Modal */}
      <PatronAuthModal
        isOpen={showPatronAuthModal}
        onClose={() => setShowPatronAuthModal(false)}
        onSuccess={(name, uid) => {
          setHostAccount(prev => ({ ...(prev || { tier: 'free' }), name, uid }));
        }}
      />
    </div>
  );
}
export default App;
