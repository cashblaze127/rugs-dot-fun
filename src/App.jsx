import React, { useState, useEffect, useRef, useMemo } from "react";
import "./App.css";
import createBlockies from "ethereum-blockies-base64";
import ruggedSvg from "./assets/RUGGED.svg"; // Import the RUGGED.svg file from assets
import solanaLogo from "./assets/solanaLogoMark.svg"; // Import Solana logo
import rugsLogo from "./assets/rugslogo.svg"; // Import Rugs logo
import { TransitionGroup, CSSTransition } from 'react-transition-group';

// Mock data for chart and players
const initialMockChartData = [];  // Changed to empty array to prevent candles showing on load

// Mock token data for trade markers
const mockTokens = [
  { symbol: "SOL", logo: solanaLogo },
  { symbol: "FREE", logo: rugsLogo },
];

// Mock trade markers data - we'll add to this dynamically during simulation
const initialMockTrades = [];

// Mock ETH addresses for generating blockies
const mockAddresses = [
  "0x1234567890123456789012345678901234567890",
  "0x2345678901234567890123456789012345678901",
  "0x3456789012345678901234567890123456789012",
  "0x4567890123456789012345678901234567890123",
  "0x5678901234567890123456789012345678901234",
  "0x6789012345678901234567890123456789012345",
  "0x7890123456789012345678901234567890123456",
  "0x8901234567890123456789012345678901234567",
  "0x9012345678901234567890123456789012345678",
  "0x0123456789012345678901234567890123456789"
];

const mockPlayers = [
  { name: "anon", address: mockAddresses[0], profit: "+0.827", percent: "+20.66%", tokenType: Math.random() > 0.5 ? 'solana' : 'rugs' },
  { name: "corksuccer", address: mockAddresses[1], profit: "+0.827", percent: "+20.66%", tokenType: Math.random() > 0.5 ? 'solana' : 'rugs' },
  { name: "anon", address: mockAddresses[2], profit: "+0.827", percent: "+20.66%", tokenType: Math.random() > 0.5 ? 'solana' : 'rugs' },
  { name: "kub", address: mockAddresses[3], profit: "+0.827", percent: "+20.66%", tokenType: Math.random() > 0.5 ? 'solana' : 'rugs' },
  { name: "Krisi18", address: mockAddresses[4], profit: "+0.827", percent: "+20.66%", tokenType: Math.random() > 0.5 ? 'solana' : 'rugs' },
  { name: "Gorillarug", address: mockAddresses[5], profit: "+0.827", percent: "+20.66%", tokenType: Math.random() > 0.5 ? 'solana' : 'rugs' },
  { name: "Gob", address: mockAddresses[6], profit: "+0.827", percent: "+20.66%", tokenType: Math.random() > 0.5 ? 'solana' : 'rugs' },
  { name: "Oreoz", address: mockAddresses[7], profit: "+0.827", percent: "+20.66%", tokenType: Math.random() > 0.5 ? 'solana' : 'rugs' },
  { name: "Romms", address: mockAddresses[8], profit: "+0.827", percent: "+20.66%", tokenType: Math.random() > 0.5 ? 'solana' : 'rugs' },
  { name: "Gob", address: mockAddresses[9], profit: "+0.827", percent: "+20.66%", tokenType: Math.random() > 0.5 ? 'solana' : 'rugs' },
];

const CHART_HEIGHT = 400;
const CHART_WIDTH = 800;
const CANDLE_WIDTH = 20;
const CANDLE_GAP = 6; // Back to 6 pixels
const MIN_VALUE = 0.3; // Minimum fixed value
const ABSOLUTE_MAX_VALUE = 50.0; // Theoretical maximum for calculations
const LEADERBOARD_WIDTH = 420;

// Brighter, more contrasted grid line colors (top to bottom)
const gridLineColors = [
  "#FFFFFF", // white (top)
  "#FFFFFF", // white
  "#FFFFFF", // white
  "#FFFFFF", // white (center)
  "#FFFFFF", // white
  "#FFFFFF", // white
  "#FFFFFF"  // white (bottom)
];

// Add a ref to store the last used grid step
let lastGridStep = 1;

// Dynamic grid line generation based on the current visible range
function generateGridLines(maxValue) {
  const min = MIN_VALUE;
  const targetLines = 6;
  const possibleSteps = [0.5, 1, 2, 5, 10, 20, 50];
  let step = lastGridStep;

  // Find the best step, but add hysteresis: only switch if the new step is clearly better
  let bestStep = step;
  let bestCount = 1000;
  for (let i = 0; i < possibleSteps.length; i++) {
    const s = possibleSteps[i];
    const start = Math.ceil(min / s) * s;
    const end = Math.floor(maxValue / s) * s;
    const count = Math.floor((end - start) / s) + 1;
    if (count >= 4 && count <= 8) {
      // Prefer not to switch step unless the current step is way out of range
      if (s === step) {
        bestStep = s;
        bestCount = count;
        break;
      }
      // Only switch if the current step would give too many or too few lines
      if ((step < s && count < 4) || (step > s && count > 8)) {
        bestStep = s;
        bestCount = count;
        break;
      }
      // Otherwise, keep the current step
      if (Math.abs(count - targetLines) < Math.abs(bestCount - targetLines)) {
        bestStep = s;
        bestCount = count;
      }
    }
  }
  step = bestStep;
  lastGridStep = step;

  const start = Math.ceil(min / step) * step;
  const end = Math.floor(maxValue / step) * step;
  const multipliers = [];
  for (let v = start; v <= end + 0.0001; v += step) {
    multipliers.push(Number(v.toFixed(4)));
  }

  // Always include 1.0x if it's in the visible range and not already present
  if (1.0 >= start && 1.0 <= end && !multipliers.includes(1.0)) {
    multipliers.push(1.0);
    multipliers.sort((a, b) => a - b);
  }

  return multipliers;
}

function Logo() {
  return (
    <div className="logo-container">
      <h1 className="logo-text">RUGS.FUN</h1>
      <span className="beta-tag">BETA</span>
    </div>
  );
}

function TestControls({ onStartTest, isRunning, onStopTest, onTestGameStates }) {
  return (
    <div className="test-controls">
      {!isRunning ? (
        <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
          <button 
            className="test-button state-test" 
            onClick={onTestGameStates}
            style={{ background: 'linear-gradient(90deg, #3B6EFF, #FFDC40)' }}
          >
            Start Sim
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
          <button className="test-button stop" onClick={onStopTest}>
            Stop Test
          </button>
        </div>
      )}
      <div className="test-info">
        The "Start Sim" button demonstrates the complete game cycle: presale → active → rugged → new presale
      </div>
      <div style={{
        marginTop: '8px',
        fontSize: '13px',
        color: '#ffb347',
        textAlign: 'center',
        maxWidth: '350px',
        marginLeft: 'auto',
        marginRight: 'auto',
      }}>
        If you stop the test the demo websocket geeks out so instead of hitting start again just refresh to see it again
      </div>
    </div>
  );
}

function PlayerBox({ player, index }) {
  const profit = player.profit.replace("+", "");
  const blockieImage = createBlockies(player.address);
  
  return (
    <div className="player-row leaderboard-gradient-border">
      <div className="avatar-container">
        <img 
          src={blockieImage} 
          alt="Player Avatar" 
          className="player-avatar-blockie"
        />
      </div>
      <span className="player-name">{player.name}</span>
      <div className="player-stats">
        <span className="player-profit green-glow">
          {player.profit.startsWith("+") && (
            <img 
              src={player.tokenType === 'solana' ? solanaLogo : rugsLogo} 
              alt={player.tokenType === 'solana' ? 'Solana' : 'Rugs'} 
              width="14" 
              height="14" 
              style={{ marginRight: '2px', verticalAlign: 'middle' }}
            />
          )}
          {profit}
        </span>
        <span className="player-percent green-glow">{player.percent}</span>
      </div>
    </div>
  );
}

// Trade marker component that will be used to render trade notifications
function TradeMarker({ trade, x, y, opacity = 1, candleX }) {
  // Smaller dimensions for the notification box to match the image
  const boxWidth = 95;
  const boxHeight = 36;

  // Color based on trade type (buy = green, sell = red)
  const color = trade.type === 'buy' ? '#00F63E' : '#FF0B1B'; // Brighter, more neon colors
  const glowColor = trade.type === 'buy' ? 'rgba(0, 246, 62, 0.9)' : 'rgba(255, 11, 27, 0.9)';

  // Layout constants
  const logoSize = 14;
  const cornerLength = 15; // Slightly longer corners
  const cornerThickness = 2.2; // Slightly thicker corners
  
  return (
    <g className="trade-marker" opacity={opacity}>
      {/* Semi-transparent black background box */}
      <rect
        x={x}
        y={y - boxHeight/2}
        width={boxWidth}
        height={boxHeight}
        rx={4}
        ry={4}
        fill="rgba(23, 23, 35, 0.94)"
        stroke="none"
      />
      
      {/* Define filter for stronger cyberpunk glow effect */}
      <defs>
        <filter id={`neon-glow-${trade.id}`}>
          <feFlood floodColor={glowColor} result="flood" />
          <feComposite operator="in" in="flood" in2="SourceAlpha" result="colored-alpha"/>
          <feGaussianBlur in="colored-alpha" stdDeviation="2.5" result="blur"/>
          <feMerge>
            <feMergeNode in="blur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      
      {/* Draw four corners with enhanced neon glow effect */}
      <g style={{ filter: `url(#neon-glow-${trade.id})` }}>
        {/* Top-left corner */}
        <line x1={x} y1={y - boxHeight/2 + cornerLength} x2={x} y2={y - boxHeight/2} stroke={color} strokeWidth={cornerThickness} strokeLinecap="round" />
        <line x1={x} y1={y - boxHeight/2} x2={x + cornerLength} y2={y - boxHeight/2} stroke={color} strokeWidth={cornerThickness} strokeLinecap="round" />
        
        {/* Top-right corner */}
        <line x1={x + boxWidth - cornerLength} y1={y - boxHeight/2} x2={x + boxWidth} y2={y - boxHeight/2} stroke={color} strokeWidth={cornerThickness} strokeLinecap="round" />
        <line x1={x + boxWidth} y1={y - boxHeight/2} x2={x + boxWidth} y2={y - boxHeight/2 + cornerLength} stroke={color} strokeWidth={cornerThickness} strokeLinecap="round" />
        
        {/* Bottom-right corner */}
        <line x1={x + boxWidth} y1={y + boxHeight/2 - cornerLength} x2={x + boxWidth} y2={y + boxHeight/2} stroke={color} strokeWidth={cornerThickness} strokeLinecap="round" />
        <line x1={x + boxWidth} y1={y + boxHeight/2} x2={x + boxWidth - cornerLength} y2={y + boxHeight/2} stroke={color} strokeWidth={cornerThickness} strokeLinecap="round" />
        
        {/* Bottom-left corner */}
        <line x1={x} y1={y + boxHeight/2 - cornerLength} x2={x} y2={y + boxHeight/2} stroke={color} strokeWidth={cornerThickness} strokeLinecap="round" />
        <line x1={x} y1={y + boxHeight/2} x2={x + cornerLength} y2={y + boxHeight/2} stroke={color} strokeWidth={cornerThickness} strokeLinecap="round" />
        
        {/* Enhanced connector line with a dot at the end - now points directly to middle of candle */}
        <line
          x1={x + boxWidth}
          y1={y}
          x2={candleX}
          y2={y}
          stroke={color}
          strokeWidth={1.5}
          strokeDasharray="1 2"
        />
        <circle 
          cx={candleX} 
          cy={y} 
          r={2} 
          fill={color} 
        />
      </g>
      
      {/* Token logo and info in a compact layout */}
      <svg x={x + 8} y={y - logoSize/2} width={logoSize} height={logoSize} viewBox="0 0 20 20">
        <defs>
          <clipPath id={`token-clip-${trade.id}`}>
            <circle cx="10" cy="10" r="10" />
          </clipPath>
        </defs>
        <image
          href={trade.token.logo}
          width="20"
          height="20"
          clipPath={`url(#token-clip-${trade.id})`}
        />
      </svg>
      
      {/* Username in monospace font */}
      <text
        x={x + 8 + logoSize + 6}
        y={y - 5}
        fontSize="10"
        fontFamily="monospace"
        fill="#FFFFFF"
        textAnchor="start"
        dominantBaseline="middle"
      >
        {trade.username.length >= 8 ? trade.username.substring(0, 6) + '..' : trade.username}
      </text>
      
      {/* Buy/Sell text with amount in colored text */}
      <text
        x={x + 8 + logoSize + 6}
        y={y + 10}
        fontSize="10"
        fontFamily="monospace"
        fill={color}
        textAnchor="start"
        dominantBaseline="middle"
        fontWeight="bold"
      >
        {trade.type.toUpperCase()} {trade.amount.toFixed(1)}
      </text>
    </g>
  );
}

function GameGraph() {
  const [chartData, setChartData] = useState(initialMockChartData);
  const [currentMultiplier, setCurrentMultiplier] = useState(1.0);
  const [isTestRunning, setIsTestRunning] = useState(false);
  const [visibleMaxValue, setVisibleMaxValue] = useState(2.0);
  const [displayMultiplier, setDisplayMultiplier] = useState(1.0);
  const [currentTick, setCurrentTick] = useState(0);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  
  // Add ref for chart container to avoid DOM queries during render
  const chartContainerRef = useRef(null);
  
  // Simplify animation approach - just track the last price for bounce animation
  const [animatedPrice, setAnimatedPrice] = useState(null);
  const [animatedHigh, setAnimatedHigh] = useState(null);
  const [animatedLow, setAnimatedLow] = useState(null);
  const priceAnimationRef = useRef(null);
  const actualPriceRef = useRef(null);
  
  // Change from single activeTrade to array of active trades
  const [activeTradesMap, setActiveTradesMap] = useState({});
  const [tradeOpacity, setTradeOpacity] = useState(1);
  
  // Add game state management
  const [gameState, setGameState] = useState('inactive'); // 'inactive', 'presale', 'active', 'rugged'
  const [countdownTime, setCountdownTime] = useState(5); // 5 seconds countdown
  
  // Use refs to maintain references between renders
  const testIntervalRef = useRef(null);
  const animationFrameRef = useRef(null);
  const countdownIntervalRef = useRef(null);
  
  // Add a ref to track the absolute candle index from the start of simulation
  const absoluteCandleIndexRef = useRef(0);
  
  const previousMultiplierRef = useRef(currentMultiplier);
  const lastTradeTimeRef = useRef(0);
  const fadeTimeoutRef = useRef(null);
  const rugTimerRef = useRef(null);
  
  // Track if game is rugged to prevent any more updates
  const isRugged = gameState === 'rugged';
  
  // Use memoization for chart data with game state
  const displayedChartData = useMemo(() => {
    // Always use the direct chart data, no special handling needed
    return chartData;
  }, [chartData]);
  
  // Memoize the trades as well to prevent updates
  const displayedTrades = useMemo(() => {
    // Always use the direct trades data, no special handling needed
    return activeTradesMap;
  }, [activeTradesMap]);
  
  // Add window resize listener
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };
    
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  
  // Generate grid lines based on the current visible range
  const gridLineMultipliers = generateGridLines(visibleMaxValue);
  
  // Normalize function for calculating y positions based on visible range
  const norm = v => {
    // For rugged state, ensure we can see values down to zero
    if (gameState === 'rugged') {
      // When rugged, use 0 as the minimum to see the full crash
      const ruggedMin = 0;
      return CHART_HEIGHT - (((v - ruggedMin) / (visibleMaxValue - ruggedMin)) * (CHART_HEIGHT - 40) + 20);
    }
    
    // Normal case
    return CHART_HEIGHT - (((v - MIN_VALUE) / (visibleMaxValue - MIN_VALUE)) * (CHART_HEIGHT - 40) + 20);
  };
  
  // Get the last (most recent) candle's value
  // Always default to 1.0 if no candles are available to match production
  const lastCandleValue = chartData.length > 0 ? chartData[chartData.length - 1].close : 1.0;
  
  // Function to generate a new price point with smoother but still dramatic movements
  const generateNextPrice = (currentPrice) => {
    // Base movement - more dramatic now
    const randomFactor = Math.random() * 0.15 - 0.075; // Between -0.075 and 0.075
    
    // For smoother transitions with more frequent updates, scale the jumps appropriately
    const bigJumpChance = 0.4; // Reduced chance of big jumps from 60% to 40%
    let trendValue = 0;
    
    if (Math.random() < bigJumpChance) {
      // Big movement - more controlled to prevent extreme outliers
      const direction = Math.random() < 0.5 ? 1 : -1; // Equal chance up or down
      const magnitude = Math.random() * 0.2 + 0.1; // 10% to 30% jump (reduced from 15% to 45%)
      trendValue = direction * magnitude;
    } else {
      // Normal movement (still quite large)
      trendValue = Math.random() < 0.5 ? 0.08 : -0.06; // More balanced movements
    }
    
    // Calculate new price with more controlled movement
    let newPrice = currentPrice * (1 + randomFactor + trendValue);
    
    // More aggressive bounds checking
    // Keep values in a more reasonable range for visualization
    const maxAllowedMultiplier = Math.max(visibleMaxValue * 0.8, 20.0); // Cap at current view * 0.8 or 20x
    newPrice = Math.max(MIN_VALUE + 0.1, Math.min(maxAllowedMultiplier, newPrice));
    
    return parseFloat(newPrice.toFixed(4));
  };
  
  // Function to generate a new trade marker
  const generateTrade = (candleIndex, price) => {
    // Randomly select a player and token
    const playerIndex = Math.floor(Math.random() * mockPlayers.length);
    const player = mockPlayers[playerIndex];
    const tokenIndex = Math.floor(Math.random() * mockTokens.length);
    const token = mockTokens[tokenIndex];
    
    // Decide if it's a buy or sell
    const type = Math.random() > 0.5 ? 'buy' : 'sell';
    
    // Generate random amount (between 0.1 and 2.0)
    const amount = 0.1 + Math.random() * 1.9;
    
    // Create a unique ID using timestamp and random number
    const uniqueId = `${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    
    return {
      id: uniqueId,
      candleIndex,             // Store relative candle index in current chart data
      absoluteCandleIndex: absoluteCandleIndexRef.current,  // Store absolute candle index
      price,                   // Store the actual price (for vertical positioning)
      username: player.name,
      address: player.address,
      token,
      type,
      amount,
      timestamp: Date.now(),
      opacity: 1,              // Start fully visible
    };
  };
  
  // Function to add a new trade
  const addNewTrade = (trade) => {
    setActiveTradesMap(prev => ({
      ...prev,
      [trade.id]: trade
    }));
    
    // Start fade out after 2.5 seconds
    setTimeout(() => {
      const fadeOutInterval = setInterval(() => {
        setActiveTradesMap(prev => {
          const currentTrade = prev[trade.id];
          if (!currentTrade) {
            clearInterval(fadeOutInterval);
            return prev;
          }
          
          // Reduce opacity
          const newOpacity = currentTrade.opacity - 0.03;
          
          if (newOpacity <= 0) {
            // Remove the trade when fully faded
            const newMap = {...prev};
            delete newMap[trade.id];
            clearInterval(fadeOutInterval);
            return newMap;
          }
          
          // Update opacity
          return {
            ...prev,
            [trade.id]: {
              ...currentTrade,
              opacity: newOpacity
            }
          };
        });
      }, 50);
    }, 2500);
  };
  
  // Use effect to handle countdown - using requestAnimationFrame for precise timing
  useEffect(() => {
    if (gameState === 'presale' && countdownTime > 0) {
      let startTime = null;
      let initialCountdown = countdownTime;
      let animationFrameId = null;
      
      const updateCountdown = (timestamp) => {
        if (!startTime) startTime = timestamp;
        
        const elapsedMs = timestamp - startTime;
        const remainingTime = Math.max(0, initialCountdown - (elapsedMs / 1000));
        
        setCountdownTime(remainingTime);
        
        if (remainingTime <= 0.05) {
          // When countdown reaches ~0, change to active state
          setGameState('active');
          return; // Stop animation
        }
        
        animationFrameId = requestAnimationFrame(updateCountdown);
      };
      
      // Start the animation frame loop
      animationFrameId = requestAnimationFrame(updateCountdown);
      
      // Store the animation frame ID in the ref for cleanup
      countdownIntervalRef.current = () => {
        if (animationFrameId) {
          cancelAnimationFrame(animationFrameId);
        }
      };
    }
    
    return () => {
      if (typeof countdownIntervalRef.current === 'function') {
        countdownIntervalRef.current();
      }
    };
  }, [gameState, countdownTime === 5]); // Only trigger when countdownTime is 5 (initial value)
  
  // Handle candle generation when in active state
  useEffect(() => {
    if (gameState === 'active') {
      startCandleGeneration();
    } else if (testIntervalRef.current) {
      clearInterval(testIntervalRef.current);
      testIntervalRef.current = null;
    }
  }, [gameState]);
  
  // Function to start test simulation
  const startTestSimulation = () => {
    setIsTestRunning(true);
    
    // Clear previous chart data
    setChartData([]);
    setActiveTradesMap({});
    
    // Reset values
    setCurrentMultiplier(1.0);
    setVisibleMaxValue(2.0);
    setCurrentTick(0);
    absoluteCandleIndexRef.current = 0;
    
    // Start in presale mode
    setGameState('presale');
    setCountdownTime(5);
  };
  
  // Function to start generating candle data
  const startCandleGeneration = () => {
    if (testIntervalRef.current) return;
    
    // Initialize with starting candle
    const initialCandle = { 
      high: 1.0, 
      low: 1.0, 
      open: 1.0, 
      close: 1.0, 
      timestamp: Date.now(),
      absoluteIndex: absoluteCandleIndexRef.current
    };
    
    setChartData([initialCandle]);
    
    testIntervalRef.current = setInterval(() => {
      setCurrentTick(prevTick => {
        const newTick = prevTick + 1;
        
        setChartData(prevData => {
          // Ensure we have data to work with
          if (prevData.length === 0) {
            return [initialCandle];
          }
          
          const lastCandle = prevData[prevData.length - 1];
          const newPrice = generateNextPrice(lastCandle.close);
          
          // Generate trades randomly
          const currentTime = Date.now();
          if (currentTime - lastTradeTimeRef.current >= 2000) {
            if (Math.random() < 0.35) {
              const candleIndex = prevData.length - 1;
              const newTrade = generateTrade(candleIndex, newPrice);
              addNewTrade(newTrade);
              lastTradeTimeRef.current = currentTime;
            }
          }
          
          // Every 5 ticks, create a new candle
          if (newTick % 5 === 0) {
            absoluteCandleIndexRef.current++;
            
            const newCandle = {
              high: Math.max(lastCandle.close, newPrice),
              low: Math.min(lastCandle.close, newPrice),
              open: lastCandle.close,
              close: newPrice,
              timestamp: Date.now(),
              absoluteIndex: absoluteCandleIndexRef.current
            };
            
            const newData = [...prevData, newCandle];
            if (newData.length > 20) {
              return newData.slice(-20);
            }
            return newData;
          } else {
            // Update current candle
            const updatedCandle = {
              ...lastCandle,
              high: Math.max(lastCandle.high, newPrice),
              low: Math.min(lastCandle.low, newPrice),
              close: newPrice
            };
            
            const newData = [...prevData];
            newData[newData.length - 1] = updatedCandle;
            return newData;
          }
        });
        
        // Update multiplier
        setChartData(currentData => {
          if (currentData.length === 0) return currentData;
          const lastCandle = currentData[currentData.length - 1];
          setCurrentMultiplier(lastCandle.close);
          return currentData;
        });
        
        return newTick;
      });
    }, 250);
  };
  
  // Handle rugging the game
  const rugGame = () => {
    // If already rugged, do nothing
    if (gameState === 'rugged') return;
    
    console.log('GAME RUGGED - Creating final crash candle');
    
    // Stop intervals
    if (testIntervalRef.current) {
      clearInterval(testIntervalRef.current);
      testIntervalRef.current = null;
    }
    
    // Create a final crash candle
    setChartData(prevData => {
      if (prevData.length === 0) return prevData;
      
      const lastCandle = prevData[prevData.length - 1];
      const rugCandle = {
        high: lastCandle.close,
        low: 0, // Change from 0.01 to 0
        open: lastCandle.close,
        close: 0, // Change from 0.01 to 0
        timestamp: Date.now(),
        absoluteIndex: absoluteCandleIndexRef.current + 1,
        isRugCandle: true
      };
      
      return [...prevData, rugCandle];
    });
    
    // Update state to rugged - set currentMultiplier to 0 but DON'T set displayMultiplier
    // This allows the animation to run and show the drop to 0
    setGameState('rugged');
    setCurrentMultiplier(0);
  };
  
  // Function to stop test
  const stopTestSimulation = () => {
    // Clean up intervals
    if (testIntervalRef.current) {
      clearInterval(testIntervalRef.current);
      testIntervalRef.current = null;
    }
    
    // Clean up countdown
    if (typeof countdownIntervalRef.current === 'function') {
      countdownIntervalRef.current();
      countdownIntervalRef.current = null;
    }
    
    // Reset state
    setIsTestRunning(false);
    setGameState('inactive');
    setCountdownTime(5);
    setChartData([]);
    setActiveTradesMap({});
  };
  
  // Function to handle websocket messages (simulated)
  const handleWebSocketMessage = (message) => {
    if (!message) return;
    
    console.log('Received WebSocket message:', message);
    
    // Handle different message types
    if (message.type === 'price') {
      // Price update for active game
      if (gameState === 'active') {
        // Update candle with new price
        setChartData(prevData => {
          if (prevData.length === 0) {
            const newCandle = {
              high: message.price, 
              low: message.price, 
              open: message.price, 
              close: message.price,
              timestamp: Date.now(),
              absoluteIndex: absoluteCandleIndexRef.current
            };
            return [newCandle];
          }
          
          const lastCandle = prevData[prevData.length - 1];
          
          // Update existing candle or create new one based on tick logic
          // In a real implementation, this would follow your backend's candle creation rules
          const updatedCandle = {
            ...lastCandle,
            high: Math.max(lastCandle.high, message.price),
            low: Math.min(lastCandle.low, message.price),
            close: message.price
          };
          
          const newData = [...prevData];
          newData[newData.length - 1] = updatedCandle;
          
          // Update multiplier
          setCurrentMultiplier(message.price);
          
          return newData;
        });
      }
    } 
    else if (message.type === 'gameState') {
      // Game state update
      if (message.state === 'presale') {
        console.log('Game entering presale state');
        setGameState('presale');
        setCountdownTime(message.countdown || 5);
        
        // Clear chart data for new game
        setChartData([]);
        setActiveTradesMap({});
        
        // Reset absolute candle index counter for new game
        absoluteCandleIndexRef.current = 0;
      } 
      else if (message.state === 'active') {
        console.log('Game now active');
        setGameState('active');
      } 
      else if (message.state === 'rugged') {
        console.log('Game rugged!');
        rugGame();
      }
    }
  };
  
  // Test function to simulate websocket messages
  const testGameFlow = () => {
    console.log('Starting test game flow');
    
    // Clear any existing state
    stopTestSimulation();
    setIsTestRunning(true);
    
    // Start with presale state - shorter countdown (3 seconds)
    handleWebSocketMessage({
      type: 'gameState',
      state: 'presale',
      countdown: 3
    });
    
    // Simulate countdown (handled by the countdown useEffect)
    
    // After 4 seconds (reduced from 6), change to active state
    setTimeout(() => {
      handleWebSocketMessage({
        type: 'gameState',
        state: 'active'
      });
      
      // Simulate price updates
      let currentPrice = 1.0;
      const priceInterval = setInterval(() => {
        // Generate some random price movement
        const change = (Math.random() - 0.4) * 0.1; // Slight upward bias
        currentPrice = Math.max(0.1, currentPrice + change);
        
        handleWebSocketMessage({
          type: 'price',
          price: currentPrice
        });
      }, 250);
      
      // After 6 seconds (total of 10 seconds), rug the game
      setTimeout(() => {
        clearInterval(priceInterval);
        
        handleWebSocketMessage({
          type: 'gameState',
          state: 'rugged'
        });
        
        // After 8 seconds (faster restart), start a new presale round
        setTimeout(() => {
          handleWebSocketMessage({
            type: 'gameState',
            state: 'presale',
            countdown: 3
          });
        }, 8000);
        
      }, 6000); // Reduced from 8000 to 6000
      
    }, 4000); // Reduced from 6000 to 4000
  };
  
  // Update the visible range when the multiplier changes significantly
  useEffect(() => {
    // Store the previous multiplier for animation reference
    previousMultiplierRef.current = currentMultiplier;

    // If entering presale, reset chart to initial state
    if (gameState === 'presale') {
      setVisibleMaxValue(2.0);
      setDisplayMultiplier(1.0);
      return;
    }

    // If rugged, ensure we use an appropriate scale
    if (gameState === 'rugged') {
      // Find the highest value in the chart data before the rug
      const highestValue = displayedChartData.reduce((max, candle) => 
        Math.max(max, candle.high), 2.0);
      
      // Use a scale that ensures the full drop is visible
      setVisibleMaxValue(Math.max(highestValue * 1.1, 2.0));
      return;
    }
    
    // Get the highest value in current chart data to ensure everything fits
    const highestValueInChartData = chartData.reduce((max, candle) => 
      Math.max(max, candle.high), currentMultiplier);
    
    // Calculate the current candle's range and position
    const currentCandle = chartData[chartData.length - 1];
    const currentCandleRange = currentCandle ? (currentCandle.high - currentCandle.low) : 0;
    const currentCandleHigh = currentCandle ? currentCandle.high : currentMultiplier;
    
    // Calculate the percentage of the current visible range that the candle takes up
    const candleRangePercentage = currentCandleRange / visibleMaxValue;
    
    // Calculate how close the candle's high is to the top of the visible range
    const distanceToTop = visibleMaxValue - currentCandleHigh;
    const topMarginPercentage = distanceToTop / visibleMaxValue;
    
    // Always ensure the current multiplier and highest candle are within the visible range
    // Add more headroom for large candles and ensure minimum top margin
    const MIN_TOP_MARGIN_PERCENTAGE = 0.15; // Always keep 15% margin at the top
    const idealMaxValue = Math.max(
      highestValueInChartData * 1.4, // Increased from 1.3 to 1.4 for more headroom
      currentMultiplier * 1.3,
      currentCandleHigh / (1 - MIN_TOP_MARGIN_PERCENTAGE), // Ensure minimum top margin
      2.0
    );
    
    // Make range adjustments more responsive for large candles
    const shouldScale = 
      highestValueInChartData >= visibleMaxValue || 
      Math.abs(idealMaxValue - visibleMaxValue) / visibleMaxValue > 0.15 ||
      candleRangePercentage > 0.35 || // Reduced from 0.4 to 0.35 to scale earlier
      topMarginPercentage < MIN_TOP_MARGIN_PERCENTAGE; // Scale if we're too close to the top
    
    if (shouldScale) {
      // Use requestAnimationFrame for smooth transitions
      const startValue = visibleMaxValue;
      const endValue = highestValueInChartData >= visibleMaxValue 
        ? idealMaxValue 
        : visibleMaxValue + (idealMaxValue - visibleMaxValue) * 0.3;
      
      const startTime = performance.now();
      // Faster transition for large candles or when close to top
      const duration = (candleRangePercentage > 0.35 || topMarginPercentage < MIN_TOP_MARGIN_PERCENTAGE) 
        ? 250 // Even faster (250ms) for large candles or when close to top
        : 500; // Normal 500ms for regular scaling
      
      const animate = (currentTime) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing function for smooth animation
        const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);
        const easedProgress = easeOutCubic(progress);
        
        const newValue = startValue + (endValue - startValue) * easedProgress;
        setVisibleMaxValue(newValue);
        
        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };
      
      requestAnimationFrame(animate);
    }
  }, [currentMultiplier, visibleMaxValue, chartData, gameState, displayedChartData]);

  // Update the active candle animation to only handle the "bounce" effect
  useEffect(() => {
    // Only run in active state
    if (gameState !== 'active' || chartData.length === 0) {
      if (priceAnimationRef.current) {
        cancelAnimationFrame(priceAnimationRef.current);
        priceAnimationRef.current = null;
      }
      return;
    }
    
    // Get the latest price
    const latestCandle = chartData[chartData.length - 1];
    const actualPrice = latestCandle.close;
    const actualHigh = latestCandle.high;
    const actualLow = latestCandle.low;
    
    // Store actual price in ref for animation access
    actualPriceRef.current = {
      close: actualPrice,
      high: actualHigh,
      low: actualLow
    };
    
    // Initialize animated values if needed
    if (animatedPrice === null || animatedHigh === null || animatedLow === null) {
      setAnimatedPrice(actualPrice);
      setAnimatedHigh(actualHigh);
      setAnimatedLow(actualLow);
      return;
    }
    
    // Skip animation if the difference is negligible
    if (Math.abs(animatedPrice - actualPrice) < 0.0001 &&
        Math.abs(animatedHigh - actualHigh) < 0.0001 &&
        Math.abs(animatedLow - actualLow) < 0.0001) {
      return;
    }
    
    // Clean up existing animation
    if (priceAnimationRef.current) {
      cancelAnimationFrame(priceAnimationRef.current);
      priceAnimationRef.current = null;
    }
    
    // Easing function for smoother animation
    const easeOutExpo = (t) => {
      return t === 1 ? 1 : 1 - Math.pow(2, -15 * t); // Increased from -10 to -15 for steeper curve
    };
    
    // Animation function - smooth transition between values
    const animate = () => {
      // Update close price with easing
      setAnimatedPrice(prev => {
        if (prev === null || !actualPriceRef.current) return prev;
        
        const diff = actualPriceRef.current.close - prev;
        // Increased animation speed (0.15 = snappier but still smooth)
        const step = diff * 0.15;
        const easedStep = step * easeOutExpo(Math.abs(step) / Math.abs(diff));
        
        // If we're close enough, snap to the actual value
        if (Math.abs(diff) < 0.0001) {
          return actualPriceRef.current.close;
        }
        
        return prev + easedStep;
      });
      
      // Update high price with easing
      setAnimatedHigh(prev => {
        if (prev === null || !actualPriceRef.current) return prev;
        
        const diff = actualPriceRef.current.high - prev;
        const step = diff * 0.15;
        const easedStep = step * easeOutExpo(Math.abs(step) / Math.abs(diff));
        
        if (Math.abs(diff) < 0.0001) {
          return actualPriceRef.current.high;
        }
        
        return prev + easedStep;
      });
      
      // Update low price with easing
      setAnimatedLow(prev => {
        if (prev === null || !actualPriceRef.current) return prev;
        
        const diff = actualPriceRef.current.low - prev;
        const step = diff * 0.15;
        const easedStep = step * easeOutExpo(Math.abs(step) / Math.abs(diff));
        
        if (Math.abs(diff) < 0.0001) {
          return actualPriceRef.current.low;
        }
        
        return prev + easedStep;
      });
      
      // Continue animation unless all values are close enough
      if (
        Math.abs(animatedPrice - actualPriceRef.current.close) < 0.0001 &&
        Math.abs(animatedHigh - actualPriceRef.current.high) < 0.0001 &&
        Math.abs(animatedLow - actualPriceRef.current.low) < 0.0001
      ) {
        priceAnimationRef.current = null;
      } else {
        priceAnimationRef.current = requestAnimationFrame(animate);
      }
    };
    
    // Start animation
    priceAnimationRef.current = requestAnimationFrame(animate);
    
    // Cleanup
    return () => {
      if (priceAnimationRef.current) {
        cancelAnimationFrame(priceAnimationRef.current);
        priceAnimationRef.current = null;
      }
    };
  }, [
    chartData.length > 0 ? chartData[chartData.length - 1].close : null,
    chartData.length > 0 ? chartData[chartData.length - 1].high : null, 
    chartData.length > 0 ? chartData[chartData.length - 1].low : null,
    animatedPrice, animatedHigh, animatedLow, gameState
  ]);

  // Animate multiplier value with easing
  useEffect(() => {
    // Don't skip animation for rugged state - we need to animate down to 0
    if (gameState === 'presale') {
      setDisplayMultiplier(1.0); // Ensure display is at 1.0 in presale
      return;
    }
    
    if (displayMultiplier === currentMultiplier) return;
    
    // Clean up any existing animation frame first
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    
    // Easing function for multiplier animation
    const easeOutExpo = (t) => {
      return t === 1 ? 1 : 1 - Math.pow(2, -15 * t); // Increased from -10 to -15 for steeper curve
    };
    
    const animateValue = () => {
      // If game is rugged but display hasn't reached 0 yet, force faster animation to 0
      if (gameState === 'rugged' && displayMultiplier > 0.05) {
        // Use a larger step for faster drop to 0
        const step = displayMultiplier * 0.2; // Reduced from 0.3 to 0.2 for smoother drop
        const easedStep = step * easeOutExpo(step / displayMultiplier);
        const newValue = displayMultiplier - easedStep;
        
        if (newValue <= 0.05) {
          setDisplayMultiplier(0);
          cancelAnimationFrame(animationFrameRef.current);
          animationFrameRef.current = null;
          return;
        }
        
        setDisplayMultiplier(newValue);
        animationFrameRef.current = requestAnimationFrame(animateValue);
        return;
      }
      else if (gameState === 'rugged') {
        // Final snap to exactly 0
        setDisplayMultiplier(0);
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
        return;
      }
      
      // Regular animation for non-rugged state
      // Calculate step size based on difference
      const diff = currentMultiplier - displayMultiplier;
      // Increased animation speed (0.25 = snappier but still smooth)
      const step = diff * 0.25;
      const easedStep = step * easeOutExpo(Math.abs(step) / Math.abs(diff));
      
      if (Math.abs(diff) < 0.0001) {
        setDisplayMultiplier(currentMultiplier);
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
        return;
      }
      
      const newValue = displayMultiplier + easedStep;
      setDisplayMultiplier(newValue);
      
      animationFrameRef.current = requestAnimationFrame(animateValue);
    };
    
    animationFrameRef.current = requestAnimationFrame(animateValue);
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    };
  }, [currentMultiplier, displayMultiplier, gameState]);

  // Add state for grid line fade-in
  const [gridLinesVisible, setGridLinesVisible] = useState(false);

  // Fade in grid lines after mount or when gridLineMultipliers change
  useEffect(() => {
    setGridLinesVisible(false);
    const timeout = setTimeout(() => setGridLinesVisible(true), 30);
    return () => clearTimeout(timeout);
  }, [gridLineMultipliers.length, visibleMaxValue]);

  return (
    <div className="app-container">
      <Logo />
      <TestControls 
        onStartTest={startTestSimulation} 
        isRunning={isTestRunning} 
        onStopTest={stopTestSimulation}
        onTestGameStates={testGameFlow}
      />
      <div className="game-graph-container">
        <div className="game-content">
          {/* Unified container for both chart and leaderboard */}
          <div className="unified-container">
            {/* Background grid lines that span the unified container but stop at leaderboard edge */}
            <div className="grid-background">
              <svg width="100%" height="100%">
                {/* Remove the horizontal grid lines from here since they're now in the main chart SVG */}
              </svg>
            </div>
            
            {/* Chart area with candles */}
            <div className="chart-container" 
                 ref={chartContainerRef}
                 style={{ overflow: 'visible', position: 'relative' }}>
              <div className="chart-area" style={{ overflow: 'visible' }}>
                {/* Move the grid lines and labels inside this SVG to ensure proper layering */}
                <svg width="100%" height="100%" preserveAspectRatio="xMidYMid meet" style={{ overflow: 'visible' }}>
                  <defs>
                    <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                      <feGaussianBlur stdDeviation="2.5" result="coloredBlur"/>
                      <feMerge>
                        <feMergeNode in="coloredBlur"/>
                        <feMergeNode in="SourceGraphic"/>
                      </feMerge>
                    </filter>
                    <linearGradient id="red-gradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#FF0000" />
                      <stop offset="100%" stopColor="#FF0000" />
                    </linearGradient>
                    <linearGradient id="blue-gradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#00FF00" />
                      <stop offset="100%" stopColor="#00FF00" />
                    </linearGradient>
                    
                    {/* Gradients for trade notification borders */}
                    <linearGradient id="buy-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#00A63E" stopOpacity="0" />
                      <stop offset="70%" stopColor="#00A63E" stopOpacity="1" />
                      <stop offset="100%" stopColor="#00A63E" stopOpacity="1" />
                    </linearGradient>
                    <linearGradient id="sell-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#E7000B" stopOpacity="0" />
                      <stop offset="70%" stopColor="#E7000B" stopOpacity="1" />
                      <stop offset="100%" stopColor="#E7000B" stopOpacity="1" />
                    </linearGradient>
                    
                    <linearGradient id="multiplier-line-gradient" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#000000" />
                      <stop offset="50%" stopColor="#263BF0" />
                      <stop offset="100%" stopColor="#F01100" />
                    </linearGradient>
                    <linearGradient id="leaderboard-fade-top" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#000" stopOpacity="1" />
                      <stop offset="15%" stopColor="#000" stopOpacity="0" />
                      <stop offset="100%" stopColor="#000" stopOpacity="0" />
                    </linearGradient>
                    <linearGradient id="leaderboard-fade-bottom" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#000" stopOpacity="0" />
                      <stop offset="85%" stopColor="#000" stopOpacity="0" />
                      <stop offset="100%" stopColor="#000" stopOpacity="1" />
                    </linearGradient>
                    {/* Rainbow gradient for price indicator */}
                    <linearGradient id="rainbow-gradient" x1="0%" y1="0%" x2="100%" y2="0%" gradientUnits="userSpaceOnUse">
                      <stop offset="0%" stopColor="#F01100">
                        <animate attributeName="offset" values="0;0.25;0.5;0.75;1;0" dur="8s" repeatCount="indefinite" />
                      </stop>
                      <stop offset="25%" stopColor="#FF4D9D">
                        <animate attributeName="offset" values="0.25;0.5;0.75;1;0.25;0.25" dur="8s" repeatCount="indefinite" />
                      </stop>
                      <stop offset="50%" stopColor="#FFDC40">
                        <animate attributeName="offset" values="0.5;0.75;1;0.25;0.5;0.5" dur="8s" repeatCount="indefinite" />
                      </stop>
                      <stop offset="75%" stopColor="#263BF0">
                        <animate attributeName="offset" values="0.75;1;0.25;0.5;0.75;0.75" dur="8s" repeatCount="indefinite" />
                      </stop>
                      <stop offset="100%" stopColor="#F01100">
                        <animate attributeName="offset" values="1;0.25;0.5;0.75;1;1" dur="8s" repeatCount="indefinite" />
                      </stop>
                    </linearGradient>

                    {/* Add animated dotted line definition */}
                    <defs>
                      <pattern id="dotted-pattern" x="0" y="0" width="20" height="1" patternUnits="userSpaceOnUse">
                        <line x1="0" y1="0" x2="10" y2="0" stroke="url(#rainbow-gradient)" strokeWidth="2" />
                      </pattern>
                    </defs>
                    
                    {/* Explosion gradients for rug candle */}
                    <radialGradient id="explosion-gradient" cx="0.5" cy="0.5" r="0.5" fx="0.5" fy="0.5">
                      <stop offset="0%" stopColor="#FFFFFF" />
                      <stop offset="20%" stopColor="#FF0000" />
                      <stop offset="80%" stopColor="#FF6600" />
                      <stop offset="100%" stopColor="#550000" stopOpacity="0" />
                      <animate attributeName="r" values="0.4;0.5;0.45;0.5;0.4" dur="1s" repeatCount="indefinite" />
                    </radialGradient>
                    
                    <radialGradient id="fire-gradient" cx="0.5" cy="0.3" r="0.7" fx="0.5" fy="0.3">
                      <stop offset="0%" stopColor="#FFFFFF" />
                      <stop offset="10%" stopColor="#FFFF00" />
                      <stop offset="30%" stopColor="#FF9900" />
                      <stop offset="70%" stopColor="#FF0000" />
                      <stop offset="100%" stopColor="#990000" stopOpacity="0.6" />
                    </radialGradient>
                    
                    <filter id="explosion-filter" x="-100%" y="-100%" width="300%" height="300%">
                      <feGaussianBlur in="SourceGraphic" stdDeviation="10" result="blur" />
                      <feColorMatrix in="blur" mode="matrix" values="
                        1 0 0 0 0
                        0 0.5 0 0 0
                        0 0 0.1 0 0
                        0 0 0 1 0" result="red-blur" />
                      <feTurbulence type="fractalNoise" baseFrequency="0.05" numOctaves="2" seed="5" result="noise" />
                      <feDisplacementMap in="red-blur" in2="noise" scale="5" xChannelSelector="R" yChannelSelector="G" result="displaced" />
                      <feComposite in="displaced" in2="SourceGraphic" operator="out" />
                    </filter>
                  </defs>
                  
                  {/* First draw the grid lines */}
                  <TransitionGroup component={null}>
                    {gridLineMultipliers.map((y, i) => (
                      <CSSTransition
                        key={y}
                        timeout={900}
                        classNames="grid-fade"
                        appear
                      >
                        <g className="grid-fade-line">
                          <line
                            x1={0}
                            x2="120%"
                            y1={norm(y)}
                            y2={norm(y)}
                            stroke={gridLineColors[i % gridLineColors.length]}
                            strokeWidth={0.5}
                            opacity={0.5}
                            className="grid-fade-line"
                            style={{
                              transition: 'opacity 0.9s cubic-bezier(0.22, 1, 0.36, 1)'
                            }}
                          />
                        </g>
                      </CSSTransition>
                    ))}
                  </TransitionGroup>
                  
                  {/* Then draw the candles */}
                  {displayedChartData.length > 0 && (isTestRunning || isRugged) && displayedChartData.map((candle, i) => {
                    const isLatestCandle = i === displayedChartData.length - 1;
                    const prev = i > 0 ? displayedChartData[i - 1] : candle;
                    const up = candle.close >= candle.open;
                    const isRugCandle = candle.isRugCandle || (gameState === 'rugged' && isLatestCandle);
                    
                    // For rug candles, always use red gradient regardless of open/close values
                    const gradientId = isRugCandle ? "red-gradient" : (up ? "blue-gradient" : "red-gradient");
                    
                    // Calculate responsive values based on window width
                    const isMobile = windowWidth <= 640;
                    const isSmall = windowWidth <= 900 && windowWidth > 640;
                    
                    // Get container dimensions
                    const containerWidth = chartContainerRef.current 
                      ? chartContainerRef.current.clientWidth 
                      : CHART_WIDTH;
                    
                    // Reserve space for leaderboard based on container size
                    // Be extremely aggressive with the right margin to ensure candles are never cut off
                    const leaderboardWidth = isMobile ? 160 : (isSmall ? 240 : 320);
                    const rightMargin = containerWidth * 0.25 + leaderboardWidth * 0.1;
                    
                    // Calculate candle dimensions
                    const maxVisibleCandles = 15;
                    const candleWidthRatio = windowWidth <= 640 ? 0.6 : 1;
                    const responsiveCandleWidth = Math.max(
                      4, 
                      Math.min(CANDLE_WIDTH * candleWidthRatio, ((containerWidth - rightMargin) / maxVisibleCandles) * 0.8)
                    );
                    
                    // Calculate gap between candles
                    const gap = Math.max(4, Math.min(CANDLE_GAP, containerWidth / 200)); // Adjusted divisor from 320 to 200 for more consistent gaps
                    
                    // Position the latest candle with a fixed offset from the right edge
                    const distanceFromEnd = displayedChartData.length - 1 - i;
                    
                    const availableWidth = containerWidth - rightMargin;
                    
                    // Calculate candle positions from right to left
                    // Latest candle is positioned with safe margin from the right edge
                    const SAFE_MARGIN = containerWidth * 0.09;  // Further reduced margin to position candle closer to leaderboard
                    const latestCandleX = availableWidth - SAFE_MARGIN;
                    const x = latestCandleX - (distanceFromEnd * (responsiveCandleWidth + gap));
                    
                    // Calculate candle body dimensions - using animated price for the active candle
                    let candleClose = candle.close;
                    let candleHigh = candle.high;
                    let candleLow = candle.low;
                    
                    // For the latest candle, we want to ensure smooth transitions
                    if (isLatestCandle && gameState === 'active') {
                      if (animatedPrice !== null) {
                        candleClose = animatedPrice;
                        // Update high/low only if the new price exceeds current range
                        if (animatedPrice > candleHigh) {
                          candleHigh = animatedPrice;
                        }
                        if (animatedPrice < candleLow) {
                          candleLow = animatedPrice;
                        }
                      }
                    }
                    
                    const bodyTop = norm(Math.max(candle.open, candleClose));
                    const bodyBottom = norm(Math.min(candle.open, candleClose));
                    const bodyHeight = Math.max(bodyBottom - bodyTop, 2); // Ensure minimum height
                    
                    // Calculate wick dimensions - using the updated high/low values
                    const wickTop = norm(candleHigh);
                    const wickBottom = norm(candleLow);
                    
                    // Only render candles that are in the visible area
                    // Allow candles to run off left side but ensure visible on right
                    if (x > containerWidth) return null;
                    
                    // Hide candles in presale mode
                    if (gameState === 'presale') return null;
                    
                    return (
                      <g key={`candle-${i}`} className={isRugCandle ? 'rugged-candle' : ''}>
                        {/* Wick */}
                        <line
                          x1={x + responsiveCandleWidth / 2}
                          y1={wickTop}
                          x2={x + responsiveCandleWidth / 2}
                          y2={wickBottom}
                          stroke={isRugCandle ? "#FF3300" : (up ? "#00FF00" : "#FF0000")}
                          strokeWidth={isRugCandle ? (isMobile ? 3 : 4) : (isMobile ? 1 : 2)} // Thicker for rug candle
                        />
                        
                        {/* Candle body */}
                        <rect
                          x={x}
                          y={bodyTop}
                          width={responsiveCandleWidth}
                          height={bodyHeight}
                          fill={`url(#${isRugCandle ? "red-gradient" : (up ? "blue-gradient" : "red-gradient")})`}
                          style={{
                            filter: isRugCandle 
                              ? "drop-shadow(0 0 8px #FF0000) drop-shadow(0 0 12px #FF3300)" // Keep fire glow for rug candle only
                              : "none" // Remove glow for normal candles
                          }}
                        />
                        
                        {/* Add explosion effect for the rug candle */}
                        {isRugCandle && (
                          <circle
                            cx={x + responsiveCandleWidth / 2}
                            cy={bodyBottom}
                            r={responsiveCandleWidth * 2}
                            fill="url(#red-gradient)"
                            opacity={0.4}
                            style={{
                              filter: "drop-shadow(0 0 10px #FF0000)"
                            }}
                          />
                        )}
                      </g>
                    );
                  })}
                  
                  {/* Draw the indicator lines on top of candles */}
                  {displayedChartData.length > 0 && isTestRunning && gameState !== 'presale' && (
                    <g>
                      <line
                        x1="0"
                        x2="120%" /* Extend beyond container width to flow behind leaderboard */
                        y1={norm(gameState === 'active' && animatedPrice !== null ? animatedPrice : displayMultiplier)}
                        y2={norm(gameState === 'active' && animatedPrice !== null ? animatedPrice : displayMultiplier)}
                        stroke="#FFFFFF"
                        strokeWidth={2}
                        strokeDasharray="4,4"
                        className="current-price-indicator"
                        style={{ 
                          filter: "drop-shadow(0 0 4px rgba(255, 255, 255, 0.8))",
                          animation: "dash 0.5s linear infinite"
                        }}
                      />
                      {/* Add the multiplier text directly in the SVG */}
                      <text
                        x="97%" // Move further right, away from candles
                        y={norm(gameState === 'active' && animatedPrice !== null ? animatedPrice : displayMultiplier) - 15}
                        fill="#FFFFFF"
                        fontSize={windowWidth <= 640 ? 18 : windowWidth <= 900 ? 22 : 28}
                        textAnchor="end"
                        dominantBaseline="middle"
                        style={{
                          filter: "drop-shadow(0 0 10px rgba(0,0,0,0.8)) drop-shadow(0 0 20px rgba(0,0,0,0.8))",
                          fontFamily: "Inter, Arial, sans-serif",
                          fontWeight: 700
                        }}
                      >
                        {(gameState === 'active' && animatedPrice !== null ? animatedPrice : displayMultiplier).toFixed(4)}X
                      </text>
                    </g>
                  )}
                  
                  {/* Multiplier gradient line - always at 1.0x as reference */}
                  {isTestRunning && (
                    <line
                      x1="0"
                      x2="120%" /* Extend beyond container width to flow behind leaderboard */
                      y1={norm(1.0)} /* Always keep the multiplier line at 1.0x */
                      y2={norm(1.0)}
                      stroke="url(#multiplier-line-gradient)"
                      strokeWidth={1.5}
                      strokeDasharray="none"
                    />
                  )}
                  
                  {/* Draw all active trade markers AFTER indicator lines, using a higher z-index group */}
                  <g style={{ isolation: "isolate" }}>
                    {isTestRunning && gameState === 'active' && Object.values(displayedTrades).map(trade => {
                      // First, find the corresponding candle in the current chart data
                      // Look for the candle with the matching absolute index
                      let targetCandle = null;
                      let targetCandlePosition = -1;
                      
                      for (let i = 0; i < displayedChartData.length; i++) {
                        if (displayedChartData[i].absoluteIndex === trade.absoluteCandleIndex) {
                          targetCandle = displayedChartData[i];
                          targetCandlePosition = i;
                          break;
                        }
                      }
                      
                      // If we can't find the candle in current view, don't render the marker
                      if (!targetCandle) return null;
                      
                      // Calculate responsive values based on window width
                      const isMobile = windowWidth <= 640;
                      const isSmall = windowWidth <= 900 && windowWidth > 640;
                      
                      const containerWidth = chartContainerRef.current 
                        ? chartContainerRef.current.clientWidth 
                        : CHART_WIDTH;
                      
                      const leaderboardWidth = isMobile ? 160 : (isSmall ? 240 : 320);
                      const rightMargin = containerWidth * 0.25 + leaderboardWidth * 0.1;
                      
                      const candleWidthRatio = windowWidth <= 640 ? 0.6 : 1;
                      const responsiveCandleWidth = Math.max(
                        4, 
                        Math.min(CANDLE_WIDTH * candleWidthRatio, ((containerWidth - rightMargin) / 15) * 0.8)
                      );
                      
                      const gap = Math.max(4, Math.min(CANDLE_GAP, containerWidth / 200)); // Adjusted divisor from 320 to 200 for more consistent gaps
                      
                      const availableWidth = containerWidth - rightMargin;
                      const SAFE_MARGIN = containerWidth * 0.09;
                      const latestCandleX = availableWidth - SAFE_MARGIN;
                      
                      // Calculate position of the target candle
                      const distanceFromLatest = displayedChartData.length - 1 - targetCandlePosition;
                      const targetCandleX = latestCandleX - (distanceFromLatest * (responsiveCandleWidth + gap));
                      
                      // Position marker to the left of the target candle
                      const x = targetCandleX - 100; // Place marker 100px to the left of the candle
                      
                      // Calculate y position based on the original price
                      const y = norm(trade.price);
                      
                      return (
                        <TradeMarker
                          key={trade.id}
                          trade={trade}
                          x={x}
                          y={y}
                          opacity={trade.opacity}
                          candleX={targetCandleX + responsiveCandleWidth/2} // Middle of candle X position
                        />
                      );
                    })}
                  </g>
                  
                  {/* Finally draw the grid labels on top */}
                  <TransitionGroup component={null}>
                    {gridLineMultipliers.map((y, i) => (
                      <CSSTransition
                        key={y}
                        timeout={900}
                        classNames="grid-fade"
                        appear
                      >
                        <g className="grid-fade-line">
                          <text
                            x={10}
                            y={norm(y) - 8}
                            fill="#FFFFFF"
                            fontSize={14}
                            fontWeight="600"
                            style={{ 
                              textShadow: "0 0 8px #000, 1px 1px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000",
                              filter: "drop-shadow(0 0 2px rgba(0,0,0,0.9))",
                              transition: 'opacity 0.9s cubic-bezier(0.22, 1, 0.36, 1)'
                            }}
                          >
                            {y.toFixed(1)}x
                          </text>
                        </g>
                      </CSSTransition>
                    ))}
                  </TransitionGroup>
                  
                  {/* Add 'RUGGED' text in the chart SVG when rugged */}
                  {gameState === 'rugged' && (
                    <g style={{ pointerEvents: 'none' }}>
                      <defs>
                        <filter id="rugged-glow" x="-20%" y="-20%" width="140%" height="140%">
                          <feGaussianBlur stdDeviation="12" result="blur" />
                          <feFlood floodColor="#FF0000" floodOpacity="0.8" result="red-glow" />
                          <feComposite in="red-glow" in2="blur" operator="in" result="red-glow-blur" />
                          <feMerge>
                            <feMergeNode in="red-glow-blur" />
                            <feMergeNode in="SourceGraphic" />
                          </feMerge>
                        </filter>
                      </defs>
                      
                      {/* Positioned absolutely to cover the chart area */}
                      <foreignObject 
                        x="0" 
                        y="0" 
                        width="100%" 
                        height="100%"
                        style={{
                          display: 'flex',
                          justifyContent: 'center',
                          alignItems: 'center',
                          overflow: 'visible'
                        }}
                      >
                        <div
                          style={{
                            width: '100%',
                            height: '100%',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            position: 'relative',
                            transform: 'translateX(10%)' // Move right by 10% to account for the leaderboard on the right
                          }}
                        >
                          <img
                            src={ruggedSvg}
                            alt="RUGGED"
                            style={{
                              width: windowWidth < 700 ? '80%' : '90%',
                              maxWidth: '800px',
                              filter: "drop-shadow(0 0 20px #FF0000)",
                              animation: "pulse-rugged 1.5s infinite alternate",
                              position: 'absolute',
                              zIndex: 1000
                            }}
                          />
                        </div>
                      </foreignObject>
                      
                      {/* Add a pulsating animation in JSX style */}
                      <style>
                        {`
                          @keyframes pulse-rugged {
                            0% { opacity: 0.8; filter: drop-shadow(0 0 15px #FF0000); }
                            100% { opacity: 1; filter: drop-shadow(0 0 30px #FF0000) drop-shadow(0 0 50px #FF3300); }
                          }
                        `}
                      </style>
                    </g>
                  )}
                </svg>
                
                {/* Game state overlays */}
                {isTestRunning && gameState === 'presale' && (
                  <PresaleOverlay countdownTime={countdownTime} />
                )}
              </div>
            </div>
            
            {/* Player list with fade effects */}
            <div className="player-list-container" style={{ position: 'relative', background: 'none', zIndex: 10 }}>
              <div className="player-list-fade top"></div>
              <div className="player-list">
                {mockPlayers.map((player, idx) => (
                  <PlayerBox key={idx} player={player} index={idx} />
                ))}
              </div>
              <div className="player-list-fade bottom"></div>
            </div>
          </div>
        </div>
      </div>
      {/* Add the animation keyframes */}
      <style>
        {`
          @keyframes dash {
            to {
              stroke-dashoffset: -8;
            }
          }
        `}
      </style>
      {/* Add CSS for grid-fade transitions */}
      <style>{`
        .grid-fade-enter {
          opacity: 0;
        }
        .grid-fade-enter-active {
          opacity: 0.5;
          transition: opacity 0.9s cubic-bezier(0.22, 1, 0.36, 1);
          will-change: opacity;
          transition-delay: 0.05s;
        }
        .grid-fade-exit {
          opacity: 0.5;
        }
        .grid-fade-exit-active {
          opacity: 0;
          transition: opacity 0.9s cubic-bezier(0.22, 1, 0.36, 1);
          will-change: opacity;
        }
      `}</style>
    </div>
  );
}

function PresaleOverlay({ countdownTime }) {
  // Corner style constants
  const cornerLength = 20;
  const cornerThickness = 2.5;
  const cornerColor = "#00F63E"; // Green neon color
  
  // Format the countdown to always show one decimal place
  const formattedCountdown = typeof countdownTime === 'number' 
    ? countdownTime.toFixed(1) 
    : '0.0';
  
  // Responsive adjustments
  const isMobile = typeof window !== 'undefined' && window.innerWidth <= 600;
  const countdownBoxPadding = isMobile ? '6px 16px' : '10px 40px';
  const countdownFontSize = isMobile ? '28px' : '50px';
  const nextRoundFontSize = isMobile ? '12px' : '16px';
  const countdownBoxMarginLeft = isMobile ? '32px' : '0';
  const countdownBoxAlignSelf = isMobile ? 'flex-start' : 'center';
  
  return (
    <div className="game-overlay presale-overlay" style={{
      background: 'none',
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      width: '100%',
      position: 'absolute',
      top: 0,
      left: 0,
      zIndex: 10
    }}>
      {/* PRESALE text and subtitle positioned at the top left */}
      <div style={{
        position: 'absolute',
        top: '15px',
        left: '50px',
        zIndex: 20
      }}>
        <div style={{
          fontFamily: 'monospace',
          fontWeight: 'bold',
          fontSize: '22px',
          color: 'white',
          marginBottom: '2px'
        }}>
          PRESALE
        </div>
        <div style={{
          fontFamily: 'Inter, Arial, sans-serif',
          fontSize: '11px',
          color: 'white'
        }}>
          <div>Buy a guaranteed position at</div>
          <div><span style={{ color: '#2BFF64', fontWeight: 'bold' }}>1.00x</span> before the round starts</div>
        </div>
      </div>

      {/* Centered content with countdown */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1
      }}>
        {/* Countdown with four corner design */}
        <div style={{
          position: 'relative',
          padding: countdownBoxPadding,
          marginLeft: countdownBoxMarginLeft,
          alignSelf: countdownBoxAlignSelf,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          {/* Four corners */}
          <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
            {/* Top-left corner */}
            <line x1="0" y1={cornerLength} x2="0" y2="0" stroke={cornerColor} strokeWidth={cornerThickness} strokeLinecap="round" />
            <line x1="0" y1="0" x2={cornerLength} y2="0" stroke={cornerColor} strokeWidth={cornerThickness} strokeLinecap="round" />
            {/* Top-right corner */}
            <line x1="100%" y1={cornerLength} x2="100%" y2="0" stroke={cornerColor} strokeWidth={cornerThickness} strokeLinecap="round" transform="translate(-1, 0)" />
            <line x1="100%" y1="0" x2={`calc(100% - ${cornerLength}px)`} y2="0" stroke={cornerColor} strokeWidth={cornerThickness} strokeLinecap="round" />
            {/* Bottom-right corner */}
            <line x1="100%" y1={`calc(100% - ${cornerLength}px)`} x2="100%" y2="100%" stroke={cornerColor} strokeWidth={cornerThickness} strokeLinecap="round" transform="translate(-1, 0)" />
            <line x1="100%" y1="100%" x2={`calc(100% - ${cornerLength}px)`} y2="100%" stroke={cornerColor} strokeWidth={cornerThickness} strokeLinecap="round" transform="translate(0, -1)" />
            {/* Bottom-left corner */}
            <line x1="0" y1={`calc(100% - ${cornerLength}px)`} x2="0" y2="100%" stroke={cornerColor} strokeWidth={cornerThickness} strokeLinecap="round" />
            <line x1="0" y1="100%" x2={cornerLength} y2="100%" stroke={cornerColor} strokeWidth={cornerThickness} strokeLinecap="round" transform="translate(0, -1)" />
          </svg>
          {/* Next round text inside the box */}
          <div style={{
            textAlign: 'center',
            marginBottom: '10px',
            color: 'white',
            fontFamily: 'monospace',
            fontSize: nextRoundFontSize,
            zIndex: 1
          }}>
            NEXT ROUND IN...
          </div>
          {/* Countdown number with decimal */}
          <div style={{
            color: 'white',
            fontFamily: 'monospace',
            fontSize: countdownFontSize,
            fontWeight: 'bold',
            zIndex: 1
          }}>
            {formattedCountdown}
          </div>
        </div>
      </div>
    </div>
  );
}

function CandleChart({ data, currentMultiplier, gridLineMultipliers, norm }) {
  return (
    <svg width={CHART_WIDTH} height={CHART_HEIGHT} className="chart-svg">
      <defs>
        <linearGradient id="red-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FF3B3B" />
          <stop offset="100%" stopColor="#FF6EC7" />
        </linearGradient>
        <linearGradient id="blue-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#3B6EFF" />
          <stop offset="100%" stopColor="#1A1AFF" />
        </linearGradient>
      </defs>
      
      {/* Grid lines */}
      {gridLineMultipliers.map((multiplier, i) => (
        <g key={`grid-${i}`}>
          <line
            x1="0"
            y1={norm(multiplier)}
            x2={CHART_WIDTH}
            y2={norm(multiplier)}
            stroke={gridLineColors[i % gridLineColors.length]}
            strokeWidth="1"
            strokeDasharray="5,5"
          />
          <text
            x="5"
            y={norm(multiplier) - 5}
            fill={gridLineColors[i % gridLineColors.length]}
            fontSize="12"
          >
            {multiplier.toFixed(1)}x
          </text>
        </g>
      ))}
      
      {/* Candles */}
      {data.map((candle, i) => {
        const x = i * (CANDLE_WIDTH + CANDLE_GAP);
        const up = candle.close >= candle.open;
        const gradientId = up ? "red-gradient" : "blue-gradient";
        
        // Calculate candle body dimensions
        const bodyTop = norm(Math.max(candle.open, candle.close));
        const bodyBottom = norm(Math.min(candle.open, candle.close));
        const bodyHeight = bodyBottom - bodyTop;
        
        // Calculate wick dimensions
        const wickTop = norm(candle.high);
        const wickBottom = norm(candle.low);
        
        return (
          <g key={`candle-${i}`}>
            {/* Wick */}
            <line
              x1={x + CANDLE_WIDTH / 2}
              y1={wickTop}
              x2={x + CANDLE_WIDTH / 2}
              y2={wickBottom}
              stroke={up ? "#FF3B3B" : "#3B6EFF"}
              strokeWidth="2"
            />
            
            {/* Candle body */}
            <rect
              x={x}
              y={bodyTop}
              width={CANDLE_WIDTH}
              height={bodyHeight}
              fill={`url(#${gradientId})`}
              stroke={up ? "#FF3B3B" : "#3B6EFF"}
              strokeWidth="1"
            />
          </g>
        );
      })}
    </svg>
  );
}

export default function App() {
  return <GameGraph />;
}
