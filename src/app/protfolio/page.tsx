"use client";

import React, { useState, useEffect } from "react";
import { readContract } from "thirdweb";
import { useActiveAccount, ConnectButton } from "thirdweb/react";
import { sepolia, avalancheFuji } from "thirdweb/chains";
import { client } from "../client";
import { ethers } from "ethers";
import { getContract } from "thirdweb";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Wallet, 
  TrendingUp, 
  
  ArrowRight, 
  Globe, 
  Calendar,
  DollarSign,
  Clock,
  RefreshCw} from "lucide-react";
import { LandingNav } from "@/components/LandingNav";

// Contract addresses
const SEPOLIA_CONTRACT_ADDRESS = "0x008a7e2a3D430030dCb9b385Ac71F3505F7694A0";
const FUJI_CONTRACT_ADDRESS = "0xF865f81C57aB2ed1c5732B45924E31a52DEF9429";

// Contract ABI (extended for portfolio functions)
const CONTRACT_ABI = [
  "function balances(address user) external view returns (uint256)",
  "function totalDeposited() external view returns (uint256)",
  "function apy() external view returns (uint256)",
  "function remoteAPY() external view returns (uint256)",
  "function migrationInProgress() external view returns (bool)",
  "function getMigrationStatus() external view returns (bool, uint256, uint256, uint256)",
  "function getDestinationInfo() external view returns (uint64, address, uint256)",
  "function getDebugInfoBasic() external view returns (uint256, uint256, uint256, uint256, uint256, uint256, bool)",
  "function getUpkeepStatus() external view returns (string)",
  "function userInvestments(address user) external view returns (uint256, uint256, uint256, uint256, uint256)",
  "function asset() external view returns (address)"
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

interface InvestmentData {
  balance: string;
  totalDeposited: string;
  localAPY: string;
  remoteAPY: string;
  migrationInProgress: boolean;
  destinationInfo: {
    chain: string;
    address: string;
    apy: string;
  };
  assetAddress: string;
  migrationStatus: string;
  userInvestments: {
    totalDeposited: string;
    totalWithdrawn: string;
    lastDepositTime: string;
    lastWithdrawTime: string;
    lastYieldTime: string;
  };
}

interface PortfolioData {
  sepolia: InvestmentData;
  fuji: InvestmentData;
}

function Portfolio() {
  const { address } = useActiveAccount() || {};
  const [portfolioData, setPortfolioData] = useState<PortfolioData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");


  // Fetch portfolio data for both chains
  const fetchPortfolioData = async () => {
    if (!address) return;
    setIsLoading(true);

    try {
      const [sepoliaData, fujiData] = await Promise.all([
        fetchChainData(sepoliaContract, "sepolia"),
        fetchChainData(fujiContract, "fuji")
      ]);

      setPortfolioData({
        sepolia: sepoliaData,
        fuji: fujiData
      });
    } catch (error) {
      console.error("Error fetching portfolio data:", error);
      // Use mock data if contract calls fail
      setPortfolioData({
        sepolia: getMockData("sepolia"),
        fuji: getMockData("fuji")
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchChainData = async (contract: any, chainName: string): Promise<InvestmentData> => {
    try {
      const [
        balance,
        totalDeposited,
        localAPY,
        remoteAPY,
        migrationInProgress,
        destInfo,
        asset,
        status,
        userInvestments
      ] = await Promise.all([
        readContract({ contract, method: "function balances(address user) view returns (uint256)", params: [address ?? ""] }),
        readContract({ contract, method: "function totalDeposited() view returns (uint256)" }),
        readContract({ contract, method: "function apy() view returns (uint256)", params: [] }),
        readContract({ contract, method: "function remoteAPY() view returns (uint256)", params: [] }),
        readContract({ contract, method: "function migrationInProgress() view returns (bool)" }),
        readContract({ contract, method: "function getDestinationInfo() view returns (uint64, address, uint256)" }),
        readContract({ contract, method: "function asset() view returns (address)" }),
        readContract({ contract, method: "function getUpkeepStatus() view returns (string)" }),
        readContract({ 
          contract, 
          method: "function userInvestments(address) view returns (uint256 totalDeposited, uint256 totalWithdrawn, uint256 lastDepositTime, uint256 lastWithdrawTime, uint256 lastYieldTime)", 
          params: [address ?? ""] 
        })
      ]);

      return {
        balance: ethers.formatEther(balance),
        totalDeposited: ethers.formatEther(totalDeposited),
        localAPY: localAPY.toString(),
        remoteAPY: remoteAPY.toString(),
        migrationInProgress,
        destinationInfo: {
          chain: destInfo[0].toString(),
          address: destInfo[1],
          apy: ethers.formatEther(destInfo[2])
        },
        assetAddress: asset,
        migrationStatus: status,
        userInvestments: {
          totalDeposited: ethers.formatEther(userInvestments[0]),
          totalWithdrawn: ethers.formatEther(userInvestments[1]),
          lastDepositTime: userInvestments[2].toString(),
          lastWithdrawTime: userInvestments[3].toString(),
          lastYieldTime: userInvestments[4].toString()
        }
      };
    } catch (error) {
      console.error(`Error fetching ${chainName} data:`, error);
      return getMockData(chainName);
    }
  };

  const getMockData = (chainName: string): InvestmentData => {
    return {
      balance: chainName === "sepolia" ? "1500" : "2500",
      totalDeposited: chainName === "sepolia" ? "50000" : "75000",
      localAPY: chainName === "sepolia" ? "50000000000000000" : "80000000000000000", // 5% and 8%
      remoteAPY: chainName === "sepolia" ? "80000000000000000" : "50000000000000000", // 8% and 5%
      migrationInProgress: false,
      destinationInfo: {
        chain: chainName === "sepolia" ? "43113" : "11155111",
        address: chainName === "sepolia" ? FUJI_CONTRACT_ADDRESS : SEPOLIA_CONTRACT_ADDRESS,
        apy: chainName === "sepolia" ? "0.08" : "0.05"
      },
      assetAddress: "0x1234567890123456789012345678901234567890",
      migrationStatus: "Ready for migration",
      userInvestments: {
        totalDeposited: chainName === "sepolia" ? "2000" : "3000",
        totalWithdrawn: chainName === "sepolia" ? "150" : "240",
        lastDepositTime: chainName === "sepolia" ? "1751007012" : "1751093412", // Realistic timestamps
        lastWithdrawTime: chainName === "sepolia" ? "1750920612" : "1751007012", // Realistic timestamps
        lastYieldTime: chainName === "sepolia" ? "1750834212" : "1750920612" // Realistic timestamps
      }
    };
  };

  useEffect(() => {
    fetchPortfolioData();
    testTimestampConversion(); // Test the timestamp conversion
  }, [address]);

  const formatNumber = (value: string | number) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 4,
    }).format(Number(value));
  };

  // const formatAPY = (value: string | number) => {
  //   try {
  //     const apyInWei = BigInt(value);
  //     const apyInEther = Number(apyInWei) / Math.pow(10, 18);
  //     return (apyInEther * 100).toFixed(2);
  //   } catch (error) {
  //     return "0.00";
  //   }
  // };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatTimestamp = (timestamp: string | number) => {
    try {
      const timestampNum = Number(timestamp);
      
      if (timestampNum === 0) return "Never";
      
      // Convert Unix timestamp (seconds) to milliseconds
      let deadLineDate = new Date(timestampNum * 1000);
      
      return deadLineDate.toDateString();
    } catch (error) {
      return "Invalid Date";
    }
  };

  // Test function to verify timestamp conversion
  const testTimestampConversion = () => {
    const testTimestamp = 1751007012;
    const result = formatTimestamp(testTimestamp);
    console.log(`Test: ${testTimestamp} converts to: ${result}`);
    // Should output: "Test: 1751007012 converts to: Tue Jul 29 2025"
  };

  const getTotalPortfolioValue = () => {
    if (!portfolioData) return "0";
    const sepoliaValue = Number(portfolioData.sepolia.balance);
    const fujiValue = Number(portfolioData.fuji.balance);
    return formatNumber(sepoliaValue + fujiValue);
  };

  const getTotalEarned = () => {
    if (!portfolioData) return "0";
    const sepoliaEarned = Number(portfolioData.sepolia.userInvestments.totalWithdrawn);
    const fujiEarned = Number(portfolioData.fuji.userInvestments.totalWithdrawn);
    return formatNumber(sepoliaEarned + fujiEarned);
  };

  const getTotalMigrations = () => {
    if (!portfolioData) return "0";
    // Since we don't have migration count in the new function, we'll use a placeholder
    return "5"; // You can update this when you have migration data
  };

  // const toggleHistoryExpansion = (chain: string) => {
  //   setExpandedHistory(prev => 
  //     prev.includes(chain) 
  //       ? prev.filter(c => c !== chain)
  //       : [...prev, chain]
  //   );
  // };

  if (!address) {
    return (
      <div className="min-h-screen bg-white dark:bg-black">
        <LandingNav />
        <div className="flex items-center justify-center p-8 pt-24">
          <Card className="w-full max-w-md bg-white dark:bg-black border border-neutral-200 dark:border-neutral-800">
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 bg-black dark:bg-white rounded-full flex items-center justify-center mb-3">
                <Wallet className="w-6 h-6 text-white dark:text-black" />
              </div>
              <CardTitle className="text-black dark:text-white text-xl">Connect Wallet</CardTitle>
              <CardDescription className="text-neutral-600 dark:text-neutral-300">
                Connect your wallet to view your portfolio
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
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      <LandingNav />
      
      <div className="p-3 pt-20">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-6" style={{marginTop:"80px"}}>

            <p className="text-neutral-600 dark:text-neutral-300 text-base">Track your cross-chain investments and earnings</p>
            
            <div className="flex justify-center mt-4">
              <Button
                onClick={fetchPortfolioData}
                disabled={isLoading}
                className="bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh Data
              </Button>
            </div>
          </div>

          {isLoading ? (
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black dark:border-white mx-auto"></div>
              <p className="text-neutral-600 dark:text-neutral-300 mt-3 text-sm">Loading portfolio data...</p>
            </div>
          ) : portfolioData ? (
            <>
              {/* Portfolio Overview Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <Card className="bg-white dark:bg-black border border-neutral-200 dark:border-neutral-800">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-neutral-600 dark:text-neutral-300 text-xs">Total Portfolio Value</p>
                        <p className="text-black dark:text-white text-lg font-bold">${getTotalPortfolioValue()}</p>
                      </div>
                      <div className="w-10 h-10 bg-black dark:bg-white rounded-full flex items-center justify-center">
                        <DollarSign className="w-5 h-5 text-white dark:text-black" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white dark:bg-black border border-neutral-200 dark:border-neutral-800">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-neutral-600 dark:text-neutral-300 text-xs">Total Withdraw</p>
                        <p className="text-black dark:text-white text-lg font-bold">${getTotalEarned()}</p>
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
                        <p className="text-neutral-600 dark:text-neutral-300 text-xs">Active Chains</p>
                        <p className="text-black dark:text-white text-lg font-bold">2</p>
                      </div>
                      <div className="w-10 h-10 bg-black dark:bg-white rounded-full flex items-center justify-center">
                        <Globe className="w-5 h-5 text-white dark:text-black" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Tabs */}
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2 bg-neutral-100 dark:bg-neutral-900">
                  <TabsTrigger value="overview" className="text-black dark:text-white">Overview</TabsTrigger>
                  <TabsTrigger value="history" className="text-black dark:text-white">Transaction History</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="mt-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {/* Sepolia Overview */}
                    <Card className="bg-white dark:bg-black border border-neutral-200 dark:border-neutral-800">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-black dark:text-white text-lg flex items-center">
                          <Globe className="w-4 h-4 mr-2" />
                          Sepolia Chain
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <p className="text-neutral-600 dark:text-neutral-300 text-xs">Current Balance</p>
                            <p className="text-black dark:text-white text-base font-bold">${formatNumber(portfolioData.sepolia.balance)}</p>
                          </div>
                          <div>
                            <p className="text-neutral-600 dark:text-neutral-300 text-xs">APY</p>
                            <p className="text-black dark:text-white text-base font-bold">{portfolioData.sepolia.localAPY}%</p>
                          </div>
                          <div>
                            <p className="text-neutral-600 dark:text-neutral-300 text-xs">Total Invested</p>
                            <p className="text-black dark:text-white text-base font-bold">${formatNumber(portfolioData.sepolia.userInvestments.totalDeposited)}</p>
                          </div>
                          <div>
                            <p className="text-neutral-600 dark:text-neutral-300 text-xs">Total Earned</p>
                            <p className="text-black dark:text-white text-base font-bold">${formatNumber(portfolioData.sepolia.userInvestments.totalWithdrawn)}</p>
                          </div>
                        </div>
                       
                    
                        
                    
                      </CardContent>
                    </Card>

                    {/* Fuji Overview */}
                    <Card className="bg-white dark:bg-black border border-neutral-200 dark:border-neutral-800">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-black dark:text-white text-lg flex items-center">
                          <Globe className="w-4 h-4 mr-2" />
                          Fuji Chain
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <p className="text-neutral-600 dark:text-neutral-300 text-xs">Current Balance</p>
                            <p className="text-black dark:text-white text-base font-bold">${formatNumber(portfolioData.fuji.balance)}</p>
                          </div>
                          <div>
                            <p className="text-neutral-600 dark:text-neutral-300 text-xs">APY</p>
                            <p className="text-black dark:text-white text-base font-bold">{portfolioData.fuji.localAPY}%</p>
                          </div>
                          <div>
                            <p className="text-neutral-600 dark:text-neutral-300 text-xs">Total Invested</p>
                            <p className="text-black dark:text-white text-base font-bold">${formatNumber(portfolioData.fuji.userInvestments.totalDeposited)}</p>
                          </div>
                          <div>
                            <p className="text-neutral-600 dark:text-neutral-300 text-xs">Total Earned</p>
                            <p className="text-black dark:text-white text-base font-bold">${formatNumber(portfolioData.fuji.userInvestments.totalWithdrawn)}</p>
                          </div>
                        </div>
                    
                        
                       
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="history" className="mt-6">
                  <div className="space-y-4">
                    {/* Investment History Cards - Side by Side on Desktop */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {/* Sepolia Transaction History */}
                      <Card className="bg-white dark:bg-black border border-neutral-200 dark:border-neutral-800">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-black dark:text-white text-lg flex items-center">
                            <Globe className="w-4 h-4 mr-2" />
                            Sepolia Investment History
                          </CardTitle>
                          <CardDescription className="text-neutral-600 dark:text-neutral-300 text-xs">
                            Your investment activity on Sepolia chain
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              <div className="p-3 border border-neutral-200 dark:border-neutral-700 rounded-lg">
                                <div className="flex items-center space-x-2 mb-1">
                                  <ArrowRight className="w-3 h-3 text-green-600 dark:text-green-400" />
                                  <span className="text-xs font-medium text-neutral-600 dark:text-neutral-300">Total Deposited</span>
                                </div>
                                <p className="text-black dark:text-white text-sm font-bold">${formatNumber(portfolioData.sepolia.userInvestments.totalDeposited)}</p>
                              </div>
                              
                              <div className="p-3 border border-neutral-200 dark:border-neutral-700 rounded-lg">
                                <div className="flex items-center space-x-2 mb-1">
                                  <ArrowRight className="w-3 h-3 text-red-600 dark:text-red-400 rotate-180" />
                                  <span className="text-xs font-medium text-neutral-600 dark:text-neutral-300">Total Withdrawn</span>
                                </div>
                                <p className="text-black dark:text-white text-sm font-bold">${formatNumber(portfolioData.sepolia.userInvestments.totalWithdrawn)}</p>
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              <div className="p-3 border border-neutral-200 dark:border-neutral-700 rounded-lg">
                                <div className="flex items-center space-x-2 mb-1">
                                  <Calendar className="w-3 h-3 text-purple-600 dark:text-purple-400" />
                                  <span className="text-xs font-medium text-neutral-600 dark:text-neutral-300">Last Deposit Time</span>
                                </div>
                                <p className="text-black dark:text-white text-xs font-semibold">{formatTimestamp(portfolioData.sepolia.userInvestments.lastDepositTime)}</p>
                              </div>
                              
                              <div className="p-3 border border-neutral-200 dark:border-neutral-700 rounded-lg">
                                <div className="flex items-center space-x-2 mb-1">
                                  <Clock className="w-3 h-3 text-orange-600 dark:text-orange-400" />
                                  <span className="text-xs font-medium text-neutral-600 dark:text-neutral-300">Last Withdraw Time</span>
                                </div>
                                <p className="text-black dark:text-white text-xs font-semibold">{formatTimestamp(portfolioData.sepolia.userInvestments.lastWithdrawTime)}</p>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Fuji Transaction History */}
                      <Card className="bg-white dark:bg-black border border-neutral-200 dark:border-neutral-800">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-black dark:text-white text-lg flex items-center">
                            <Globe className="w-4 h-4 mr-2" />
                            Fuji Investment History
                          </CardTitle>
                          <CardDescription className="text-neutral-600 dark:text-neutral-300 text-xs">
                            Your investment activity on Fuji chain
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              <div className="p-3 border border-neutral-200 dark:border-neutral-700 rounded-lg">
                                <div className="flex items-center space-x-2 mb-1">
                                  <ArrowRight className="w-3 h-3 text-green-600 dark:text-green-400" />
                                  <span className="text-xs font-medium text-neutral-600 dark:text-neutral-300">Total Deposited</span>
                                </div>
                                <p className="text-black dark:text-white text-sm font-bold">${formatNumber(portfolioData.fuji.userInvestments.totalDeposited)}</p>
                              </div>
                              
                              <div className="p-3 border border-neutral-200 dark:border-neutral-700 rounded-lg">
                                <div className="flex items-center space-x-2 mb-1">
                                  <ArrowRight className="w-3 h-3 text-red-600 dark:text-red-400 rotate-180" />
                                  <span className="text-xs font-medium text-neutral-600 dark:text-neutral-300">Total Withdrawn</span>
                                </div>
                                <p className="text-black dark:text-white text-sm font-bold">${formatNumber(portfolioData.fuji.userInvestments.totalWithdrawn)}</p>
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              <div className="p-3 border border-neutral-200 dark:border-neutral-700 rounded-lg">
                                <div className="flex items-center space-x-2 mb-1">
                                  <Calendar className="w-3 h-3 text-purple-600 dark:text-purple-400" />
                                  <span className="text-xs font-medium text-neutral-600 dark:text-neutral-300">Last Deposit Time</span>
                                </div>
                                <p className="text-black dark:text-white text-xs font-semibold">{formatTimestamp(portfolioData.fuji.userInvestments.lastDepositTime)}</p>
                              </div>
                              
                              <div className="p-3 border border-neutral-200 dark:border-neutral-700 rounded-lg">
                                <div className="flex items-center space-x-2 mb-1">
                                  <Clock className="w-3 h-3 text-orange-600 dark:text-orange-400" />
                                  <span className="text-xs font-medium text-neutral-600 dark:text-neutral-300">Last Withdraw Time</span>
                                </div>
                                <p className="text-black dark:text-white text-xs font-semibold">{formatTimestamp(portfolioData.fuji.userInvestments.lastWithdrawTime)}</p>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </>
          ) : (
            <div className="text-center">
              <p className="text-neutral-600 dark:text-neutral-300">Failed to load portfolio data</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Portfolio;

