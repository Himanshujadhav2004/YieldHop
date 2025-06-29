"use client";

import React, { useState, useEffect } from "react";
import { prepareContractCall, sendTransaction, readContract } from "thirdweb";
import { useActiveAccount, useSendTransaction, TransactionButton, ConnectButton} from "thirdweb/react";
import { sepolia, avalancheFuji } from "thirdweb/chains";
import { client } from "../client";
import { ethers } from "ethers";
import { getContract } from "thirdweb";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

import { Wallet, TrendingUp, Lock, Unlock, Coins, Zap, ArrowRight, Globe, AlertCircle } from "lucide-react";
import { LandingNav } from "@/components/LandingNav";
import { useToast } from "@/hooks/use-toast";

// Contract addresses
const SEPOLIA_CONTRACT_ADDRESS = "0x008a7e2a3D430030dCb9b385Ac71F3505F7694A0";
const FUJI_CONTRACT_ADDRESS = "0xF865f81C57aB2ed1c5732B45924E31a52DEF9429";

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
  const { toast } = useToast();
  
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
          console.log(`Fetching data for chain: ${currentChain}`);
          console.log(`Contract address: ${currentChain === "sepolia" ? SEPOLIA_CONTRACT_ADDRESS : FUJI_CONTRACT_ADDRESS}`);

          // Fetch user balance
          const balance = await readContract({
            contract,
            method: "function balances(address user) view returns (uint256)",
            params: [address],
          });
          setUserBalance(ethers.formatEther(balance));
          console.log(`User balance: ${ethers.formatEther(balance)}`);

          // Fetch total deposited
          const total = await readContract({
            contract,
            method: "function totalDeposited() view returns (uint256)",
          });
          setTotalDeposited(ethers.formatEther(total));
          console.log(`Total deposited: ${ethers.formatEther(total)}`);

          // Fetch APY
          console.log("Fetching local APY...");
          const apy = await readContract({
            contract,
            method: "function apy() view returns (uint256)",
            params:[]
          });
          console.log(`Raw local APY (wei): ${apy.toString()}`);
          console.log(`Local APY (percentage): ${formatAPY(apy.toString())}%`);
          setLocalAPY(apy.toString());

          // Fetch remote APY
          console.log("Fetching remote APY...");
          const remote = await readContract({
            contract,
            method: "function remoteAPY() view returns (uint256)",
            params:[]
          });
          console.log(`Raw remote APY (wei): ${remote.toString()}`);
          console.log(`Remote APY (percentage): ${formatAPY(remote.toString())}%`);
          setRemoteAPY(remote.toString());

          // Fetch migration status
          const migration = await readContract({
            contract,
            method: "function migrationInProgress() view returns (bool)",
          });
          setMigrationInProgress(migration);
          console.log(`Migration in progress: ${migration}`);

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
          console.log(`Destination chain: ${destInfo[0].toString()}`);
          console.log(`Destination address: ${destInfo[1]}`);

          // Fetch asset address
          const asset = await readContract({
            contract,
            method: "function asset() view returns (address)",
          });
          setAssetAddress(asset);
          console.log(`Asset address: ${asset}`);

          // Fetch migration status
          const status = await readContract({
            contract,
            method: "function getUpkeepStatus() view returns (string)",
          });
          setMigrationStatus(status);
          console.log(`Migration status: ${status}`);

        } catch (error) {
          console.error("Error fetching contract data:", error);
          // Use mock data if contract calls fail
          setUserBalance("1000");
          setTotalDeposited("50000");
          setLocalAPY("50000000000000000"); // 5% in wei (0.05 * 10^18)
          setRemoteAPY("80000000000000000"); // 8% in wei (0.08 * 10^18)
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
    try {
      // Convert from wei to percentage
      const apyInWei = BigInt(value);
      const apyInEther = Number(apyInWei) / Math.pow(10, 18);
      const percentage = (apyInEther * 100);
      console.log(`formatAPY - Input: ${value}, Wei: ${apyInWei}, Ether: ${apyInEther}, Percentage: ${percentage}`);
      return percentage.toFixed(2);
    } catch (error) {
      console.error("Error formatting APY:", error, "Value:", value);
      return "0.00";
    }
  };

  const getChainName = (chainId: string) => {
    return chainId === "11155111" ? "Sepolia" : chainId === "43113" ? "Fuji" : chainId;
  };

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      {/* Navigation */}
      <LandingNav />
      
      <div className="p-3 pt-20">
        <div className="max-w-7xl mx-auto" >
          {/* Header */}
          <div className="text-center mb-6" style={{marginTop:"80px"}}>

            
            {/* Chain Selector */}
            <div className="flex justify-center mt-4 space-x-4">
              <Button
                variant={currentChain === "sepolia" ? "default" : "outline"}
                onClick={() => setCurrentChain("sepolia")}
                className={`${
                  currentChain === "sepolia" 
                    ? "bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200" 
                    : "border-black dark:border-white text-black dark:text-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black"
                }`}
              >
                <Globe className="w-4 h-4 mr-2" />
                Sepolia
              </Button>
              <Button
                variant={currentChain === "fuji" ? "default" : "outline"}
                onClick={() => setCurrentChain("fuji")}
                className={`${
                  currentChain === "fuji" 
                    ? "bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200" 
                    : "border-black dark:border-white text-black dark:text-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black"
                }`}
              >
                <Globe className="w-4 h-4 mr-2" />
                Fuji
              </Button>
            </div>
            <p className="text-neutral-600 dark:text-neutral-300 text-base" style={{marginTop:"10px"}}>Stake your tokens and earn rewards across chains</p>

          </div>

          {!address ? (
            <div className="flex items-center justify-center p-8">
              <Card className="w-full max-w-md bg-white dark:bg-black border border-neutral-200 dark:border-neutral-800">
                <CardHeader className="text-center">
                  <div className="mx-auto w-12 h-12 bg-black dark:bg-white rounded-full flex items-center justify-center mb-3">
                    <Wallet className="w-6 h-6 text-white dark:text-black" />
                  </div>
                  <CardTitle className="text-black dark:text-white text-xl">Connect Wallet</CardTitle>
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
            <div className="max-w-7xl mx-auto">
              <div className="text-center mb-6">
                <div className="bg-neutral-300 dark:bg-neutral-700 h-10 w-56 mx-auto mb-3 rounded animate-pulse"></div>
                <div className="bg-neutral-300 dark:bg-neutral-700 h-5 w-80 mx-auto rounded animate-pulse"></div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                {[...Array(4)].map((_, index) => (
                  <div key={index} className="bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-4 animate-pulse">
                    <div className="bg-neutral-300 dark:bg-neutral-700 h-3 w-20 mb-2 rounded"></div>
                    <div className="bg-neutral-300 dark:bg-neutral-700 h-6 w-28 rounded"></div>
                  </div>
                ))}
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {[...Array(2)].map((_, index) => (
                  <div key={index} className="bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-4 animate-pulse">
                    <div className="bg-neutral-300 dark:bg-neutral-700 h-5 w-28 mb-3 rounded"></div>
                    <div className="bg-neutral-300 dark:bg-neutral-700 h-8 w-full mb-3 rounded"></div>
                    <div className="bg-neutral-300 dark:bg-neutral-700 h-10 w-full rounded"></div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <>
              {/* Migration Status Alert */}
              {migrationInProgress && (
                <Card className="bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800 mb-4">
                  <CardContent className="p-3">
                    <div className="flex items-center">
                      <AlertCircle className="w-4 h-4 text-yellow-600 dark:text-yellow-400 mr-2" />
                      <span className="text-yellow-800 dark:text-yellow-200 text-sm">Migration in progress. Please wait for completion.</span>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <Card className="bg-white dark:bg-black border border-neutral-200 dark:border-neutral-800">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-neutral-600 dark:text-neutral-300 text-xs">Total Staked</p>
                        <p className="text-black dark:text-white text-lg font-bold">{formatNumber(totalDeposited)}</p>
                      </div>
                      <div className="w-10 h-10 bg-black dark:bg-white rounded-full flex items-center justify-center">
                        <Lock className="w-5 h-5 text-white dark:text-black" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white dark:bg-black border border-neutral-200 dark:border-neutral-800">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-neutral-600 dark:text-neutral-300 text-xs">Your Staked</p>
                        <p className="text-black dark:text-white text-lg font-bold">{formatNumber(userBalance)}</p>
                      </div>
                      <div className="w-10 h-10 bg-black dark:bg-white rounded-full flex items-center justify-center">
                        <Coins className="w-5 h-5 text-white dark:text-black" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white dark:bg-black border border-neutral-200 dark:border-neutral-800">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-neutral-600 dark:text-neutral-300 text-xs">
                          {currentChain === "sepolia" ? "Sepolia APY" : "Fuji APY"}
                        </p>
                        <p className="text-black dark:text-white text-lg font-bold">{localAPY}%</p>
                      </div>
                      <div className="w-10 h-10 bg-black dark:bg-white rounded-full flex items-center justify-center">
                        <TrendingUp className="w-5 h-5 text-white dark:text-black" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white dark:bg-black border border-neutral-200 dark:border-neutral-800">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-neutral-600 dark:text-neutral-300 text-xs">
                          {currentChain === "sepolia" ? "Fuji APY" : "Sepolia APY"}
                        </p>
                        <p className="text-black dark:text-white text-lg font-bold">{remoteAPY}%</p>
                      </div>
                      <div className="w-10 h-10 bg-black dark:bg-white rounded-full flex items-center justify-center">
                        <ArrowRight className="w-5 h-5 text-white dark:text-black" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Main Staking Interface */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Deposit Card */}
                <Card className="bg-white dark:bg-black border border-neutral-200 dark:border-neutral-800">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-black dark:text-white text-lg flex items-center">
                      <Lock className="w-4 h-4 mr-2" />
                      Deposit Tokens
                    </CardTitle>
                    <CardDescription className="text-neutral-600 dark:text-neutral-300 text-sm">
                      Deposit your tokens to start earning cross-chain yields
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
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
                          className="absolute right-2 top-1/2 transform -translate-y-1/2 text-black dark:text-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors text-xs"
                          onClick={() => setDepositAmount("100")}
                        >
                          MAX
                        </Button>
                      </div>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                        Current APY: {formatAPY(localAPY)}% (USDT)
                      </p>
                    </div>

                    <div className="bg-neutral-50 dark:bg-neutral-900 rounded-lg p-3">
                      <div className="flex justify-between text-xs">
                        <span className="text-neutral-600 dark:text-neutral-300">Chain:</span>
                        <span className="text-black dark:text-white">{currentChain === "sepolia" ? "Sepolia" : "Fuji"}</span>
                      </div>
                      <div className="flex justify-between text-xs mt-1">
                        <span className="text-neutral-600 dark:text-neutral-300">Migration Status:</span>
                        <span className={`text-xs ${migrationInProgress ? "text-yellow-600 dark:text-yellow-400" : "text-green-600 dark:text-green-400"}`}>
                          {migrationInProgress ? "In Progress" : "Ready"}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <div className="w-full flex justify-center">
                      <TransactionButton
                        transaction={() =>
                          prepareContractCall({
                            contract: getCurrentContract(),
                            method: "function deposit(uint256 amount)",
                            params: [BigInt(ethers.parseEther(depositAmount))],
                          })
                        }
                        onTransactionConfirmed={async () => {
                          toast({
                            title: "Deposit Successful! 🎉",
                            description: `Successfully deposited ${depositAmount} USDT on ${currentChain === "sepolia" ? "Sepolia" : "Fuji"}`,
                          });
                          setDepositAmount("");
                        }}
                     
                        className={`px-6 py-2 rounded-md text-sm font-semibold transition-all duration-200 ${
                          !depositAmount 
                            ? "opacity-50 cursor-not-allowed bg-white dark:bg-white text-gray-500 dark:text-gray-500" 
                            : "bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 cursor-pointer"
                        }`}
                      >
                        Deposit Tokens
                      </TransactionButton>
                    </div>
                  </CardFooter>
                </Card>

                {/* Withdraw Card */}
                <Card className="bg-white dark:bg-black border border-neutral-200 dark:border-neutral-800">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-black dark:text-white text-lg flex items-center">
                      <Unlock className="w-4 h-4 mr-2" />
                      Withdraw Tokens
                    </CardTitle>
                    <CardDescription className="text-neutral-600 dark:text-neutral-300 text-sm">
                      Withdraw your staked tokens
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
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
                          className="absolute right-2 top-1/2 transform -translate-y-1/2 text-black dark:text-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors text-xs"
                          onClick={() => setWithdrawAmount(userBalance)}
                        >
                          MAX
                        </Button>
                      </div>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                        Available: {formatNumber(userBalance)} USDT
                      </p>
                    </div>

                    <div className="bg-neutral-50 dark:bg-neutral-900 rounded-lg p-3">
                      <div className="flex justify-between text-xs">
                        <span className="text-neutral-600 dark:text-neutral-300">Token:</span>
                        <span className="text-black dark:text-white">USDT</span>
                      </div>
                      <div className="flex justify-between text-xs mt-1">
                        <span className="text-neutral-600 dark:text-neutral-300">Migration Status:</span>
                        <span className={`text-xs ${migrationInProgress ? "text-yellow-600 dark:text-yellow-400" : "text-green-600 dark:text-green-400"}`}>
                          {migrationInProgress ? "In Progress" : "Ready"}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex flex-col space-y-2">
                    <div className="w-full flex justify-center">
                      <TransactionButton
                        transaction={() =>
                          prepareContractCall({
                            contract: getCurrentContract(),
                            method: "function withdraw(uint256 amount)",
                            params: [BigInt(ethers.parseEther(withdrawAmount))],
                          })
                        }
                        onTransactionConfirmed={async () => {
                          toast({
                            title: "Withdrawal Successful! 🎉",
                            description: `Successfully withdrawn ${withdrawAmount} USDT from ${currentChain === "sepolia" ? "Sepolia" : "Fuji"}`,
                          });
                          setWithdrawAmount("");
                        }}
                  
                        className={`px-6 py-2 rounded-md text-sm font-semibold transition-all duration-200 ${
                          !withdrawAmount 
                            ? "opacity-50 cursor-not-allowed bg-white dark:bg-white text-gray-500 dark:text-gray-500" 
                            : "bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 cursor-pointer"
                        }`}
                      >
                        Withdraw Tokens
                      </TransactionButton>
                    </div>
                  </CardFooter>
                </Card>
              </div>

              {/* Migration Controls (Admin Only) */}
              <div className="mt-6">
                <Card className="bg-white dark:bg-black border border-neutral-200 dark:border-neutral-800">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-black dark:text-white text-lg">Cross-Chain Migration Controls</CardTitle>
                    <CardDescription className="text-neutral-600 dark:text-neutral-300 text-sm">
                      Manage cross-chain migrations and APY settings
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <h4 className="text-black dark:text-white font-semibold text-base">Migration Status</h4>
                        <div className="bg-neutral-50 dark:bg-neutral-900 rounded-lg p-4 space-y-3">
                          <div className="flex justify-between text-sm">
                            <span className="text-neutral-600 dark:text-neutral-300">Status:</span>
                            <span className={`${migrationInProgress ? "text-yellow-600 dark:text-yellow-400" : "text-green-600 dark:text-green-400"}`}>
                              {migrationInProgress ? "In Progress" : "Ready"}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-neutral-600 dark:text-neutral-300">
                              {currentChain === "sepolia" ? "Sepolia APY:" : "Fuji APY:"}
                            </span>
                            <span className="text-black dark:text-white">{formatAPY(localAPY)}%</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-neutral-600 dark:text-neutral-300">
                              {currentChain === "sepolia" ? "Fuji APY:" : "Sepolia APY:"}
                            </span>
                            <span className="text-black dark:text-white">{formatAPY(remoteAPY)}%</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-neutral-600 dark:text-neutral-300">Destination:</span>
                            <span className="text-black dark:text-white">{getChainName(destinationInfo.chain)}</span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4 flex flex-col justify-center">
                        <div>
                          <h4 className="text-black dark:text-white font-semibold text-base mb-3">Migration Actions</h4>
                          <TransactionButton
                            transaction={() =>
                              prepareContractCall({
                                contract: getCurrentContract(),
                                method: "function triggerMigration()",
                                params: [],
                              })
                            }
                            onTransactionConfirmed={async () => {
                              toast({
                                title: "Migration Triggered! 🚀",
                                description: "Cross-chain migration has been initiated successfully.",
                              });
                            }}
                            className={`w-full px-6 py-3 rounded-md text-sm font-semibold transition-all duration-200 ${
                              migrationInProgress 
                                ? "opacity-50 cursor-not-allowed bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400" 
                                : "bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 cursor-pointer"
                            }`}
                          >
                            Trigger Migration
                          </TransactionButton>
                        </div>
                        
                        <div className="text-xs text-neutral-500 dark:text-neutral-400 text-center">
                          {migrationInProgress 
                            ? "Migration is currently in progress. Please wait for completion."
                            : "Click to trigger cross-chain migration when conditions are met."
                          }
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Additional Info */}
              <div className="mt-6">
                <Card className="bg-white dark:bg-black border border-neutral-200 dark:border-neutral-800">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-black dark:text-white text-lg">Cross-Chain Staking Information</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <h4 className="text-black dark:text-white font-semibold mb-2 text-sm">How it works</h4>
                        <ul className="text-neutral-600 dark:text-neutral-300 text-xs space-y-1">
                          <li>• Deposit tokens on any supported chain</li>
                          <li>• Earn APY based on current chain rates</li>
                          <li>• Automatic migration to higher APY chains</li>
                          <li>• Cross-chain yield optimization</li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="text-black dark:text-white font-semibold mb-2 text-sm">Supported Chains</h4>
                        <ul className="text-neutral-600 dark:text-neutral-300 text-xs space-y-1">
                          <li>• Sepolia Testnet</li>
                          <li>• Avalanche Fuji Testnet</li>
                          <li>• Cross-chain CCIP integration</li>
                          <li>• Automated migration triggers</li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="text-black dark:text-white font-semibold mb-2 text-sm">Benefits</h4>
                        <ul className="text-neutral-600 dark:text-neutral-300 text-xs space-y-1">
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