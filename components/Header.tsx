import React, { useState } from 'react';
import { Search, Globe, ChevronDown, Activity, User, LogOut, Moon, Sun } from 'lucide-react';
import { ChainType, NetworkType } from '../types';

interface HeaderProps {
    addressInput: string;
    setAddressInput: (val: string) => void;
    onSearch: () => void;
    chain: ChainType;
    setChain: (c: ChainType) => void;
    network: NetworkType;
    setNetwork: (n: NetworkType) => void;
    isLoggedIn: boolean;
    userEmail: string | null;
    onLoginClick: () => void;
    onLogout: () => void;
    isPremium: boolean;
    onPremiumClick: () => void;
    isDarkMode: boolean;
    onToggleDarkMode: () => void;
}

const Header: React.FC<HeaderProps> = ({ 
  addressInput, 
  setAddressInput, 
  onSearch, 
  chain, 
  setChain,
  network,
  setNetwork,
  isLoggedIn,
  userEmail,
  onLoginClick,
  onLogout,
  isPremium,
  onPremiumClick,
  isDarkMode,
  onToggleDarkMode
}) => {
  const [showNetworkMenu, setShowNetworkMenu] = useState(false);

  const getNetworkLabel = () => {
    switch (network) {
      case NetworkType.MAINNET:
        return 'Mainnet';
      case NetworkType.TESTNET:
        return 'Testnet';
      case NetworkType.DEVNET:
        return 'Devnet';
      default:
        return 'Mainnet';
    }
  };

  return (
    <header className={`h-16 ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'} border-b flex items-center justify-between px-6 shadow-sm z-20 relative transition-colors`}>
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-brand-600 rounded flex items-center justify-center text-white">
            <Activity size={20} />
        </div>
        <h1 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'} tracking-tight transition-colors`}>Chain<span className="text-brand-600">Trace</span></h1>
      </div>

      <div className="flex-1 max-w-2xl mx-12">
        <div className={`flex shadow-sm rounded-md overflow-hidden border ${isDarkMode ? 'border-slate-600' : 'border-slate-300'} focus-within:ring-2 focus-within:ring-brand-500 focus-within:border-brand-500 transition-all`}>
            <div className={`${isDarkMode ? 'bg-slate-700 border-slate-600 text-slate-300' : 'bg-slate-50 border-slate-300 text-slate-500'} px-3 flex items-center border-r transition-colors`}>
                <select
                  className={`bg-transparent text-sm font-medium outline-none cursor-pointer privacy-chain-select ${isDarkMode ? 'text-slate-200' : ''}`}
                  value={chain}
                  onChange={(e) => setChain(e.target.value as ChainType)}
                >
                  <option value={ChainType.SOLANA}>Solana</option>
                  <option value={ChainType.ETHEREUM}>Ethereum</option>
                  <option value={ChainType.BITCOIN}>Bitcoin</option>
                  <option value={ChainType.BNB_CHAIN}>BNB Chain</option>
                  <option value={ChainType.POLYGON}>Polygon</option>
                  <option value={ChainType.ARBITRUM}>Arbitrum</option>
                  <option value={ChainType.OPTIMISM}>Optimism</option>
                  <option value={ChainType.BASE}>Base</option>
                  <option value={ChainType.AVALANCHE}>Avalanche</option>
                  <option value={ChainType.TRON}>Tron</option>
                  <option value={ChainType.MONERO} className="privacy-coin">🔒 Monero (XMR)</option>
                  <option value={ChainType.ZCASH} className="privacy-coin">🔒 Zcash (ZEC)</option>
                </select>
                <ChevronDown size={14} className="ml-1" />
            </div>
            <input 
                type="text" 
                className={`flex-1 px-4 py-2 text-sm outline-none ${isDarkMode ? 'bg-slate-700 text-slate-200 placeholder:text-slate-400' : 'bg-white text-slate-700 placeholder:text-slate-400'} transition-colors`}
                placeholder="Search by Address, Tx Hash, or Label..."
                value={addressInput}
                onChange={(e) => setAddressInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && onSearch()}
            />
            <button 
                onClick={onSearch}
                className="bg-brand-600 px-6 py-2 text-white hover:bg-brand-700 transition-colors flex items-center"
            >
                <Search size={16} />
                <span className="ml-2 text-sm font-medium">Check</span>
            </button>
        </div>
      </div>

      <div className={`flex items-center gap-4 text-sm ${isDarkMode ? 'text-slate-300' : 'text-slate-600'} transition-colors`}>
        {/* Network Selector */}
        <div className="relative">
          <button 
            onClick={() => setShowNetworkMenu(!showNetworkMenu)}
            className="flex items-center gap-1 hover:text-brand-600 transition-colors"
          >
            <Globe size={16} />
            <span>{getNetworkLabel()}</span>
            <ChevronDown size={14} />
          </button>
          {showNetworkMenu && (
            <div className={`absolute top-full right-0 mt-2 ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'} border rounded-md shadow-lg py-1 min-w-[120px] z-30`}>
              <button
                onClick={() => {
                  setNetwork(NetworkType.MAINNET);
                  setShowNetworkMenu(false);
                }}
                className={`w-full text-left px-4 py-2 text-sm ${isDarkMode ? 'hover:bg-slate-700' : 'hover:bg-slate-50'} ${
                  network === NetworkType.MAINNET ? 'text-brand-600 font-medium' : ''
                }`}
              >
                Mainnet
              </button>
              <button
                onClick={() => {
                  setNetwork(NetworkType.TESTNET);
                  setShowNetworkMenu(false);
                }}
                className={`w-full text-left px-4 py-2 text-sm ${isDarkMode ? 'hover:bg-slate-700' : 'hover:bg-slate-50'} ${
                  network === NetworkType.TESTNET ? 'text-brand-600 font-medium' : ''
                }`}
              >
                Testnet
              </button>
              <button
                onClick={() => {
                  setNetwork(NetworkType.DEVNET);
                  setShowNetworkMenu(false);
                }}
                className={`w-full text-left px-4 py-2 text-sm ${isDarkMode ? 'hover:bg-slate-700' : 'hover:bg-slate-50'} ${
                  network === NetworkType.DEVNET ? 'text-brand-600 font-medium' : ''
                }`}
              >
                Devnet
              </button>
            </div>
          )}
        </div>
        <div className="h-4 w-px bg-slate-300"></div>
        
        {/* Dark Mode Toggle */}
        <button
          onClick={onToggleDarkMode}
          className={`p-2 ${isDarkMode ? 'hover:bg-slate-700' : 'hover:bg-slate-100'} rounded-lg transition-colors`}
          title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {isDarkMode ? (
            <Sun size={18} className="text-amber-400" />
          ) : (
            <Moon size={18} className="text-slate-600" />
          )}
        </button>
        <div className="h-4 w-px bg-slate-300"></div>
        
        {/* Login/User Menu */}
        {isLoggedIn ? (
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded">
              <User size={14} />
              <span className="text-xs">{userEmail?.split('@')[0] || 'User'}</span>
            </div>
            <button 
              onClick={onLogout}
              className="hover:text-brand-600 transition-colors"
              title="Logout"
            >
              <LogOut size={16} />
            </button>
          </div>
        ) : (
          <button 
            onClick={onLoginClick}
            className="hover:text-brand-600 font-medium transition-colors"
          >
            Log In
          </button>
        )}
        
        {/* Premium Button */}
        {!isPremium && (
          <button 
            onClick={onPremiumClick}
            className="bg-slate-900 text-white px-3 py-1.5 rounded text-xs font-medium hover:bg-slate-800 transition-colors"
          >
            Unlock Premium
          </button>
        )}
        {isPremium && (
          <div className="px-3 py-1.5 bg-gradient-to-r from-brand-500 to-brand-600 text-white rounded text-xs font-medium">
            Premium
          </div>
        )}
      </div>
      
      {/* Click outside to close network menu */}
      {showNetworkMenu && (
        <div 
          className="fixed inset-0 z-20" 
          onClick={() => setShowNetworkMenu(false)}
        />
      )}
    </header>
  );
};

export default Header;