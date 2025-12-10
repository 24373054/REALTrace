import { GraphData, AddressType } from '../types';

export const INITIAL_ADDRESS = "BaBcXDgbPgn85XtEQK7TZV8kZuFpT4iWVAs4QJoyNSmd";

export const generateMockGraph = (centerAddress: string): GraphData => {
  const nodes = [
    {
      id: centerAddress,
      label: "Suspect Wallet",
      type: AddressType.ROOT,
      balance: 14913.44,
      currency: "SOL",
      riskScore: 90,
      tags: ["Phishing", "Scam"],
      intelSources: ["SlowMist", "User Report"],
      x: 0,
      y: 0
    },
    {
      id: "96ecZB1j...Cg82NpnL",
      label: "Exchange Deposit",
      type: AddressType.CEX,
      balance: 500000,
      currency: "SOL",
      riskScore: 10,
      tags: ["Binance Hot Wallet"],
      intelSources: ["Public Label"],
      x: 200,
      y: -100
    },
    {
      id: "47kkYnYg...1NG6rGpf",
      label: "Mule Account A",
      type: AddressType.NORMAL,
      balance: 12.5,
      currency: "SOL",
      riskScore: 45,
      tags: ["High Velocity"],
      x: 150,
      y: 100
    },
    {
      id: "3vfqcAHF...E346R6f8",
      label: "Victim 1",
      type: AddressType.NORMAL,
      balance: 0.5,
      currency: "SOL",
      riskScore: 0,
      tags: [],
      x: -150,
      y: -50
    },
    {
      id: "FyB2JDJ...xENPTqq",
      label: "Known Phisher",
      type: AddressType.PHISHING,
      balance: 2161.88,
      currency: "SOL",
      riskScore: 100,
      tags: ["SlowMist Blacklist"],
      intelSources: ["SlowMist", "ScamSniffer"],
      x: 50,
      y: 200
    },
    {
      id: "7E4eNkk...S3Q6EZt",
      label: "Mixer Entry",
      type: AddressType.MIXER,
      balance: 400.0,
      currency: "SOL",
      riskScore: 95,
      tags: ["Tornado Cash"],
      intelSources: ["OFAC List"],
      x: -100,
      y: 150
    },
    {
      id: "9PoqwYZ...61Df",
      label: "Victim 2",
      type: AddressType.NORMAL,
      balance: 2.1,
      currency: "SOL",
      riskScore: 0,
      tags: [],
      x: -250,
      y: -100
    },
    {
      id: "Fz3QmKZ...aa28",
      label: "Bridge Out",
      type: AddressType.NORMAL,
      balance: 300.0,
      currency: "USDC",
      riskScore: 55,
      tags: ["Bridge Hopper"],
      intelSources: ["Heuristic"],
      x: 280,
      y: 50
    },
    {
      id: "88LsmmA...991c",
      label: "CEX Withdraw",
      type: AddressType.CEX,
      balance: 1200,
      currency: "USDT",
      riskScore: 15,
      tags: ["OKX"],
      intelSources: ["Public Label"],
      x: 320,
      y: -160
    },
    {
      id: "12ffMxV...81Gs",
      label: "Mule Account B",
      type: AddressType.NORMAL,
      balance: 6.6,
      currency: "USDC",
      riskScore: 40,
      tags: ["Peeling"],
      x: 90,
      y: 260
    }
  ];

  const links = [
    {
      source: centerAddress,
      target: "96ecZB1j...Cg82NpnL",
      value: 127.23,
      txHash: "5rJdVkp...RXHuHyW",
      timestamp: "2023-11-26 01:54 AM",
      token: "SOL"
    },
    {
      source: centerAddress,
      target: "47kkYnYg...1NG6rGpf",
      value: 3.14,
      txHash: "yjUqNSN...MK6QJTG",
      timestamp: "2023-11-26 03:24 PM",
      token: "SOL"
    },
    {
      source: "3vfqcAHF...E346R6f8",
      target: centerAddress,
      value: 100.0,
      txHash: "2etvjZH...cDsyWgV",
      timestamp: "2023-11-26 01:28 PM",
      token: "SOL"
    },
    {
      source: "FyB2JDJ...xENPTqq",
      target: centerAddress,
      value: 2161.88,
      txHash: "DhHAUEk...NPKhbyP",
      timestamp: "2023-11-26 06:01 AM",
      token: "SOL"
    },
    {
      source: centerAddress,
      target: "7E4eNkk...S3Q6EZt",
      value: 50.0,
      txHash: "5223a3z...3dtzxtt",
      timestamp: "2023-11-26 08:45 AM",
      token: "SOL"
    },
    {
      source: "3vfqcAHF...E346R6f8",
      target: "9PoqwYZ...61Df",
      value: 1.1,
      txHash: "2etvjZH...V1m3",
      timestamp: "2023-11-27 09:18 AM",
      token: "SOL"
    },
    {
      source: "96ecZB1j...Cg82NpnL",
      target: "Fz3QmKZ...aa28",
      value: 280.5,
      txHash: "wx88xkP...99aa",
      timestamp: "2023-11-27 10:02 AM",
      token: "USDC"
    },
    {
      source: "Fz3QmKZ...aa28",
      target: "88LsmmA...991c",
      value: 280.5,
      txHash: "wx88xkP...99ab",
      timestamp: "2023-11-27 10:40 AM",
      token: "USDT"
    },
    {
      source: "FyB2JDJ...xENPTqq",
      target: "12ffMxV...81Gs",
      value: 5.0,
      txHash: "zlp91kk...12ff",
      timestamp: "2023-11-27 11:00 AM",
      token: "USDC"
    }
  ];

  return { nodes, links };
};