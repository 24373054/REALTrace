import React from 'react';
import { Search, Globe, ChevronDown, Activity } from 'lucide-react';
import { ChainType } from '../types';

interface HeaderProps {
    addressInput: string;
    setAddressInput: (val: string) => void;
    onSearch: () => void;
    chain: ChainType;
    setChain: (c: ChainType) => void;
}

const Header: React.FC<HeaderProps> = ({ addressInput, setAddressInput, onSearch, chain, setChain }) => {
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
        <button className="flex items-center gap-1 hover:text-brand-600">
            <Globe size={16} />
            <span>Mainnet</span>
        </button>
        <div className="h-4 w-px bg-slate-300"></div>
        <button className="hover:text-brand-600 font-medium">Log In</button>
        <button className="bg-slate-900 text-white px-3 py-1.5 rounded text-xs font-medium hover:bg-slate-800">
            Unlock Premium
        </button>
      </div>
    </header>
  );
};

export default Header;