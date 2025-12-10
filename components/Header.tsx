import React, { useState } from 'react';
import { Search, Globe, ChevronDown, Activity, User, LogOut } from 'lucide-react';
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
  onPremiumClick
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
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shadow-sm z-20 relative">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-brand-600 rounded flex items-center justify-center text-white">
            <Activity size={20} />
        </div>
        <h1 className="text-xl font-bold text-slate-800 tracking-tight">Chain<span className="text-brand-600">Trace</span></h1>
      </div>

      <div className="flex-1 max-w-2xl mx-12">
        <div className="flex shadow-sm rounded-md overflow-hidden border border-slate-300 focus-within:ring-2 focus-within:ring-brand-500 focus-within:border-brand-500 transition-all">
            <div className="bg-slate-50 px-3 flex items-center border-r border-slate-300 text-slate-500">
                <select
                  className="bg-transparent text-sm font-medium outline-none cursor-pointer"
                  value={chain}
                  onChange={(e) => setChain(e.target.value as ChainType)}
                >
                  <option value={ChainType.SOLANA}>Solana</option>
                  <option value={ChainType.ETHEREUM}>Ethereum</option>
                </select>
                <ChevronDown size={14} className="ml-1" />
            </div>
            <input 
                type="text" 
                className="flex-1 px-4 py-2 text-sm text-slate-700 outline-none placeholder:text-slate-400"
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

      <div className="flex items-center gap-4 text-sm text-slate-600">
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
            <div className="absolute top-full right-0 mt-2 bg-white border border-slate-200 rounded-md shadow-lg py-1 min-w-[120px] z-30">
              <button
                onClick={() => {
                  setNetwork(NetworkType.MAINNET);
                  setShowNetworkMenu(false);
                }}
                className={`w-full text-left px-4 py-2 text-sm hover:bg-slate-50 ${
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
                className={`w-full text-left px-4 py-2 text-sm hover:bg-slate-50 ${
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
                className={`w-full text-left px-4 py-2 text-sm hover:bg-slate-50 ${
                  network === NetworkType.DEVNET ? 'text-brand-600 font-medium' : ''
                }`}
              >
                Devnet
              </button>
            </div>
          )}
        </div>
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