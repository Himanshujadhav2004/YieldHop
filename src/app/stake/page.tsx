"use client";

import React, { useState, useEffect } from "react";
import { prepareContractCall, sendTransaction, readContract } from "thirdweb";
import { useActiveAccount, useSendTransaction, TransactionButton, ConnectButton } from "thirdweb/react";
import { sepolia, avalancheFuji } from "thirdweb/chains";
import { client } from "../client";
import { ethers } from "ethers";
import { getContract } from "thirdweb";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Wallet, TrendingUp, Lock, Unlock, Coins, Zap, ArrowRight, Globe, AlertCircle } from "lucide-react";
import { LandingNav } from "@/components/LandingNav";

// Contract addresses
const SEPOLIA_CONTRACT_ADDRESS = "0x97c4d9011524cd62026d34762370a6152ffffa22";
const FUJI_CONTRACT_ADDRESS = "0x59a371b82cfa3a3f1d4ffa0fa9b75430df06ad2c";

// Contract ABI (simplified for the functions we need)
const CONTRACT_ABI = [
  "function deposit(uint256 amount) external",
  "function withdraw(uint256 amount) external",
  "function balances(address user) external view returns (uint256)",
  "function totalDeposited() external view returns (uint256)",
  "function apy() external view returns (uint256)",
  "function remoteAPY() external view returns (uint256)",
  "function migrationInProgress() external view returns (bool)",
  "function getMigrationStatus() external view returns (bool, uint256, uint256, uint256)",
  "function getDestinationInfo() external view returns (uint64, address, uint256)",
  "function getDebugInfoBasic() external view returns (uint256, uint256, uint256, uint256, uint256, uint256, bool)",
  "function getUpkeepStatus() external view returns (string)",
  "function triggerMigration() external",
  "function resetMigration() external",
  "function asset() external view returns (address)",
  "function userInvestments(address user) external view returns (uint256, uint256, uint256, uint256, uint256)"
];

// Get contract instances for both chains
const sepoliaContract = getContract({
  client: client,
  chain: sepolia,
  address: SEPOLIA_CONTRACT_ADDRESS,
});

const fujiContract = getContract({
  client: client,
  chain: avalancheFuji,
  address: FUJI_CONTRACT_ADDRESS,
});

function Staking() {
  const { address } = useActiveAccount() || {};
  const [depositAmount, setDepositAmount] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [currentChain, setCurrentChain] = useState("sepolia");
  const [showSkeleton, setShowSkeleton] = useState(true);
  
  // Contract data
  const [userBalance, setUserBalance] = useState("0");
  const [totalDeposited, setTotalDeposited] = useState("0");
  const [localAPY, setLocalAPY] = useState("0");
  const [remoteAPY, setRemoteAPY] = useState("0");
  const [migrationInProgress, setMigrationInProgress] = useState(false);
  const [migrationStatus, setMigrationStatus] = useState("");
  const [destinationInfo, setDestinationInfo] = useState({
    chain: "",
    address: "",
    apy: "0"
  });
  const [assetAddress, setAssetAddress] = useState("");

  // Get current contract based on chain
  const getCurrentContract = () => {
    return currentChain === "sepolia" ? sepoliaContract : fujiContract;
  };

  // Fetch contract data
  useEffect(() => {
    const fetchContractData = async () => {
      if (!address) return;
      setShowSkeleton(true);

      setTimeout(async () => {
        try {
          const contract = getCurrentContract();

          // Fetch user balance
          const balance = await readContract({
            contract,
            method: "function balances(address user) view returns (uint256)",
            params: [address],
          });
          setUserBalance(ethers.formatEther(balance));

          // Fetch total deposited
          const total = await readContract({
            contract,
            method: "function totalDeposited() view returns (uint256)",
          });
          setTotalDeposited(ethers.formatEther(total));

          // Fetch APY
          const apy = await readContract({
            contract,
            method: "function apy() view returns (uint256)",
          });
          setLocalAPY(ethers.formatEther(apy));

          // Fetch remote APY
          const remote = await readContract({
            contract,
            method: "function remoteAPY() view returns (uint256)",
          });
          setRemoteAPY(ethers.formatEther(remote));

          // Fetch migration status
          const migration = await readContract({
            contract,
            method: "function migrationInProgress() view returns (bool)",
          });
          setMigrationInProgress(migration);

          // Fetch destination info
          const destInfo = await readContract({
            contract,
            method: "function getDestinationInfo() view returns (uint64, address, uint256)",
          });
          setDestinationInfo({
            chain: destInfo[0].toString(),
            address: destInfo[1],
            apy: ethers.formatEther(destInfo[2])
          });

          // Fetch asset address
          const asset = await readContract({
            contract,
            method: "function asset() view returns (address)",
          });
          setAssetAddress(asset);

          // Fetch migration status
          const status = await readContract({
            contract,
            method: "function getUpkeepStatus() view returns (string)",
          });
          setMigrationStatus(status);

        } catch (error) {
          console.error("Error fetching contract data:", error);
          // Use mock data if contract calls fail
          setUserBalance("1000");
          setTotalDeposited("50000");
          setLocalAPY("0.05"); // 5%
          setRemoteAPY("0.08"); // 8%
          setMigrationInProgress(false);
          setDestinationInfo({
            chain: currentChain === "sepolia" ? "43113" : "11155111", // Fuji : Sepolia
            address: currentChain === "sepolia" ? FUJI_CONTRACT_ADDRESS : SEPOLIA_CONTRACT_ADDRESS,
            apy: "0.08"
          });
          setMigrationStatus("Ready for migration");
        } finally {
          setShowSkeleton(false);
        }
      }, 500);
    };

    fetchContractData();
  }, [address, currentChain]);

  const formatNumber = (value: string | number) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 4,
    }).format(Number(value));
  };

  const formatAPY = (value: string | number) => {
    return (Number(value) * 100).toFixed(2);
  };

  const getChainName = (chainId: string) => {
    return chainId === "11155111" ? "Sepolia" : chainId === "43113" ? "Fuji" : chainId;
  };

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      {/* Navigation */}
      <LandingNav />
      
      <div className="p-4 pt-24">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-black dark:text-white mb-2">YieldHop Cross-Chain Staking</h1>
            <p className="text-neutral-600 dark:text-neutral-300 text-lg">Stake your tokens and earn rewards across chains</p>
            
            {/* Chain Selector */}
            <div className="flex justify-center mt-6 space-x-4">
              <Button
                variant={currentChain === "sepolia" ? "default" : "outline"}
                onClick={() => setCurrentChain("sepolia")}
                className={`${currentChain === "sepolia" ? "bg-black dark:bg-white text-white dark:text-black" : "border-black dark:border-white text-black dark:text-white"}`}
              >
                <Globe className="w-4 h-4 mr-2" />
                Sepolia
              </Button>
              <Button
                variant={currentChain === "fuji" ? "default" : "outline"}
                onClick={() => setCurrentChain("fuji")}
                className={`${currentChain === "fuji" ? "bg-black dark:bg-white text-white dark:text-black" : "border-black dark:border-white text-black dark:text-white"}`}
              >
                <Globe className="w-4 h-4 mr-2" />
                Fuji
              </Button>
            </div>
          </div>

          {!address ? (
            <div className="flex items-center justify-center p-8">
              <Card className="w-full max-w-md bg-white dark:bg-black border border-neutral-200 dark:border-neutral-800">
                <CardHeader className="text-center">
                  <div className="mx-auto w-16 h-16 bg-black dark:bg-white rounded-full flex items-center justify-center mb-4">
                    <Wallet className="w-8 h-8 text-white dark:text-black" />
                  </div>
                  <CardTitle className="text-black dark:text-white text-2xl">Connect Wallet</CardTitle>
                  <CardDescription className="text-neutral-600 dark:text-neutral-300">
                    Connect your wallet to start cross-chain staking
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ConnectButton
                    client={client}
                    appMetadata={{
                      name: "YieldHop",
                      url: "https://yieldhop.app",
                    }}
                  />
                </CardContent>
              </Card>
            </div>
          ) : showSkeleton ? (
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-8">
                <div className="bg-neutral-300 dark:bg-neutral-700 h-12 w-64 mx-auto mb-4 rounded animate-pulse"></div>
                <div className="bg-neutral-300 dark:bg-neutral-700 h-6 w-96 mx-auto rounded animate-pulse"></div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                {[...Array(4)].map((_, index) => (
                  <div key={index} className="bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-6 animate-pulse">
                    <div className="bg-neutral-300 dark:bg-neutral-700 h-4 w-24 mb-2 rounded"></div>
                    <div className="bg-neutral-300 dark:bg-neutral-700 h-8 w-32 rounded"></div>
                  </div>
                ))}
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {[...Array(2)].map((_, index) => (
                  <div key={index} className="bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-6 animate-pulse">
                    <div className="bg-neutral-300 dark:bg-neutral-700 h-6 w-32 mb-4 rounded"></div>
                    <div className="bg-neutral-300 dark:bg-neutral-700 h-10 w-full mb-4 rounded"></div>
                    <div className="bg-neutral-300 dark:bg-neutral-700 h-12 w-full rounded"></div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <>
              {/* Migration Status Alert */}
              {migrationInProgress && (
                <Card className="bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800 mb-6">
                  <CardContent className="p-4">
                    <div className="flex items-center">
                      <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mr-2" />
                      <span className="text-yellow-800 dark:text-yellow-200">Migration in progress. Please wait for completion.</span>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <Card className="bg-white dark:bg-black border border-neutral-200 dark:border-neutral-800">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-neutral-600 dark:text-neutral-300 text-sm">Total Staked</p>
                        <p className="text-black dark:text-white text-2xl font-bold">{formatNumber(totalDeposited)}</p>
                      </div>
                      <div className="w-12 h-12 bg-black dark:bg-white rounded-full flex items-center justify-center">
                        <Lock className="w-6 h-6 text-white dark:text-black" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white dark:bg-black border border-neutral-200 dark:border-neutral-800">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-neutral-600 dark:text-neutral-300 text-sm">Your Staked</p>
                        <p className="text-black dark:text-white text-2xl font-bold">{formatNumber(userBalance)}</p>
                      </div>
                      <div className="w-12 h-12 bg-black dark:bg-white rounded-full flex items-center justify-center">
                        <Coins className="w-6 h-6 text-white dark:text-black" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white dark:bg-black border border-neutral-200 dark:border-neutral-800">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-neutral-600 dark:text-neutral-300 text-sm">Local APY</p>
                        <p className="text-black dark:text-white text-2xl font-bold">{formatAPY(localAPY)}%</p>
                      </div>
                      <div className="w-12 h-12 bg-black dark:bg-white rounded-full flex items-center justify-center">
                        <TrendingUp className="w-6 h-6 text-white dark:text-black" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white dark:bg-black border border-neutral-200 dark:border-neutral-800">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-neutral-600 dark:text-neutral-300 text-sm">Remote APY</p>
                        <p className="text-black dark:text-white text-2xl font-bold">{formatAPY(remoteAPY)}%</p>
                        <p className="text-xs text-neutral-500 dark:text-neutral-400">{getChainName(destinationInfo.chain)}</p>
                      </div>
                      <div className="w-12 h-12 bg-black dark:bg-white rounded-full flex items-center justify-center">
                        <ArrowRight className="w-6 h-6 text-white dark:text-black" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Main Staking Interface */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Deposit Card */}
                <Card className="bg-white dark:bg-black border border-neutral-200 dark:border-neutral-800">
                  <CardHeader>
                    <CardTitle className="text-black dark:text-white flex items-center">
                      <Lock className="w-6 h-6 mr-2" />
                      Deposit Tokens
                    </CardTitle>
                    <CardDescription className="text-neutral-600 dark:text-neutral-300">
                      Deposit your tokens to start earning cross-chain yields
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2 block">
                        Amount to Deposit
                      </label>
                      <div className="relative">
                        <Input
                          type="number"
                          placeholder="0.00"
                          value={depositAmount}
                          onChange={(e) => setDepositAmount(e.target.value)}
                          className="bg-white dark:bg-black border-neutral-200 dark:border-neutral-800 text-black dark:text-white placeholder:text-neutral-400"
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          className="absolute right-2 top-1/2 transform -translate-y-1/2 text-black dark:text-white hover:text-neutral-600 dark:hover:text-neutral-300"
                          onClick={() => setDepositAmount("100")}
                        >
                          MAX
                        </Button>
                      </div>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                        Current APY: {formatAPY(localAPY)}%
                      </p>
                    </div>

                    <div className="bg-neutral-50 dark:bg-neutral-900 rounded-lg p-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-neutral-600 dark:text-neutral-300">Chain:</span>
                        <span className="text-black dark:text-white">{currentChain === "sepolia" ? "Sepolia" : "Fuji"}</span>
                      </div>
                      <div className="flex justify-between text-sm mt-1">
                        <span className="text-neutral-600 dark:text-neutral-300">Migration Status:</span>
                        <span className={`text-sm ${migrationInProgress ? "text-yellow-600 dark:text-yellow-400" : "text-green-600 dark:text-green-400"}`}>
                          {migrationInProgress ? "In Progress" : "Ready"}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <TransactionButton
                      transaction={() =>
                        prepareContractCall({
                          contract: getCurrentContract(),
                          method: "function deposit(uint256 amount)",
                          params: [BigInt(ethers.parseEther(depositAmount))],
                        })
                      }
                      onTransactionConfirmed={async () => {
                        alert("Deposit successful!");
                        setDepositAmount("");
                      }}
                      style={{
                        width: "100%",
                        backgroundColor: "#000000",
                        color: "#ffffff",
                        padding: "0.75rem 1rem",
                        borderRadius: "0.375rem",
                        cursor: "pointer",
                        fontSize: "14px",
                        fontWeight: "600",
                        border: "none",
                        opacity: !depositAmount ? "0.5" : "1",
                        pointerEvents: !depositAmount ? "none" : "auto"
                      }}
                    >
                      Deposit Tokens
                    </TransactionButton>
                  </CardFooter>
                </Card>

                {/* Withdraw Card */}
                <Card className="bg-white dark:bg-black border border-neutral-200 dark:border-neutral-800">
                  <CardHeader>
                    <CardTitle className="text-black dark:text-white flex items-center">
                      <Unlock className="w-6 h-6 mr-2" />
                      Withdraw Tokens
                    </CardTitle>
                    <CardDescription className="text-neutral-600 dark:text-neutral-300">
                      Withdraw your staked tokens
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2 block">
                        Amount to Withdraw
                      </label>
                      <div className="relative">
                        <Input
                          type="number"
                          placeholder="0.00"
                          value={withdrawAmount}
                          onChange={(e) => setWithdrawAmount(e.target.value)}
                          className="bg-white dark:bg-black border-neutral-200 dark:border-neutral-800 text-black dark:text-white placeholder:text-neutral-400"
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          className="absolute right-2 top-1/2 transform -translate-y-1/2 text-black dark:text-white hover:text-neutral-600 dark:hover:text-neutral-300"
                          onClick={() => setWithdrawAmount(userBalance)}
                        >
                          MAX
                        </Button>
                      </div>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                        Available: {formatNumber(userBalance)} tokens
                      </p>
                    </div>

                    <div className="bg-neutral-50 dark:bg-neutral-900 rounded-lg p-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-neutral-600 dark:text-neutral-300">Migration Status:</span>
                        <span className="text-green-600 dark:text-green-400 font-semibold">{migrationStatus}</span>
                      </div>
                      <div className="flex justify-between text-sm mt-1">
                        <span className="text-neutral-600 dark:text-neutral-300">Destination:</span>
                        <span className="text-black dark:text-white">{getChainName(destinationInfo.chain)}</span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex flex-col space-y-2">
                    <TransactionButton
                      transaction={() =>
                        prepareContractCall({
                          contract: getCurrentContract(),
                          method: "function withdraw(uint256 amount)",
                          params: [BigInt(ethers.parseEther(withdrawAmount))],
                        })
                      }
                      onTransactionConfirmed={async () => {
                        alert("Withdrawal successful!");
                        setWithdrawAmount("");
                      }}
                      style={{
                        width: "100%",
                        backgroundColor: "#000000",
                        color: "#ffffff",
                        padding: "0.75rem 1rem",
                        borderRadius: "0.375rem",
                        cursor: "pointer",
                        fontSize: "14px",
                        fontWeight: "600",
                        border: "none",
                        opacity: !withdrawAmount ? "0.5" : "1",
                        pointerEvents: !withdrawAmount ? "none" : "auto"
                      }}
                    >
                      Withdraw Tokens
                    </TransactionButton>
                  </CardFooter>
                </Card>
              </div>

              {/* Migration Controls (Admin Only) */}
              <div className="mt-8">
                <Card className="bg-white dark:bg-black border border-neutral-200 dark:border-neutral-800">
                  <CardHeader>
                    <CardTitle className="text-black dark:text-white">Cross-Chain Migration Controls</CardTitle>
                    <CardDescription className="text-neutral-600 dark:text-neutral-300">
                      Manage cross-chain migrations and APY settings
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <h4 className="text-black dark:text-white font-semibold">Migration Status</h4>
                        <div className="bg-neutral-50 dark:bg-neutral-900 rounded-lg p-4 space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-neutral-600 dark:text-neutral-300">Status:</span>
                            <span className={`${migrationInProgress ? "text-yellow-600 dark:text-yellow-400" : "text-green-600 dark:text-green-400"}`}>
                              {migrationInProgress ? "In Progress" : "Ready"}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-neutral-600 dark:text-neutral-300">Local APY:</span>
                            <span className="text-black dark:text-white">{formatAPY(localAPY)}%</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-neutral-600 dark:text-neutral-300">Remote APY:</span>
                            <span className="text-black dark:text-white">{formatAPY(remoteAPY)}%</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-neutral-600 dark:text-neutral-300">Destination:</span>
                            <span className="text-black dark:text-white">{getChainName(destinationInfo.chain)}</span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h4 className="text-black dark:text-white font-semibold">Migration Actions</h4>
                        <div className="space-y-2">
                          <TransactionButton
                            transaction={() =>
                              prepareContractCall({
                                contract: getCurrentContract(),
                                method: "function triggerMigration()",
                                params: [],
                              })
                            }
                            onTransactionConfirmed={async () => {
                              alert("Migration triggered successfully!");
                            }}
                            style={{
                              width: "100%",
                              backgroundColor: "#000000",
                              color: "#ffffff",
                              padding: "0.75rem 1rem",
                              borderRadius: "0.375rem",
                              cursor: "pointer",
                              fontSize: "14px",
                              fontWeight: "600",
                              border: "none",
                              opacity: migrationInProgress ? "0.5" : "1",
                              pointerEvents: migrationInProgress ? "none" : "auto"
                            }}
                          >
                            Trigger Migration
                          </TransactionButton>
                          
                          <TransactionButton
                            transaction={() =>
                              prepareContractCall({
                                contract: getCurrentContract(),
                                method: "function resetMigration()",
                                params: [],
                              })
                            }
                            onTransactionConfirmed={async () => {
                              alert("Migration reset successfully!");
                            }}
                            style={{
                              width: "100%",
                              backgroundColor: "#ffffff",
                              color: "#000000",
                              padding: "0.75rem 1rem",
                              borderRadius: "0.375rem",
                              cursor: "pointer",
                              fontSize: "14px",
                              fontWeight: "600",
                              border: "1px solid #000000",
                              opacity: !migrationInProgress ? "0.5" : "1",
                              pointerEvents: !migrationInProgress ? "none" : "auto"
                            }}
                          >
                            Reset Migration
                          </TransactionButton>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Additional Info */}
              <div className="mt-8">
                <Card className="bg-white dark:bg-black border border-neutral-200 dark:border-neutral-800">
                  <CardHeader>
                    <CardTitle className="text-black dark:text-white">Cross-Chain Staking Information</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <h4 className="text-black dark:text-white font-semibold mb-2">How it works</h4>
                        <ul className="text-neutral-600 dark:text-neutral-300 text-sm space-y-1">
                          <li>• Deposit tokens on any supported chain</li>
                          <li>• Earn APY based on current chain rates</li>
                          <li>• Automatic migration to higher APY chains</li>
                          <li>• Cross-chain yield optimization</li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="text-black dark:text-white font-semibold mb-2">Supported Chains</h4>
                        <ul className="text-neutral-600 dark:text-neutral-300 text-sm space-y-1">
                          <li>• Sepolia Testnet</li>
                          <li>• Avalanche Fuji Testnet</li>
                          <li>• Cross-chain CCIP integration</li>
                          <li>• Automated migration triggers</li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="text-black dark:text-white font-semibold mb-2">Benefits</h4>
                        <ul className="text-neutral-600 dark:text-neutral-300 text-sm space-y-1">
                          <li>• Optimized yield across chains</li>
                          <li>• Automated rebalancing</li>
                          <li>• Transparent migration process</li>
                          <li>• Chainlink CCIP security</li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default Staking; 