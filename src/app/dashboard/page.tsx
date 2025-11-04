"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Wallet, TrendingUp, Calculator, FileText, CheckCircle, AlertCircle, DollarSign, Clock, Users, Coins, Shield, ArrowRight, ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"

interface LoanApplication {
  id: string
  creatorCoinAddress: string
  requestedAmount: number
  loanPurpose: string
  collateralAmount: number
  durationMonths: number
  status: string
  riskScore?: number
  monthlyIncome?: number
  employmentStatus?: string
  creditScore?: number
  createdAt: string
}

interface CreatorCoinValidation {
  isValid: boolean
  marketCap: number
  currentPrice: number
  totalSupply: number
  eligibleForLoan: boolean
  maxLoanAmount: number
  requiredCollateral: number
}

interface Loan {
  id: string
  creatorCoinAddress: string
  principalAmount: number
  interestRate: number
  durationMonths: number
  monthlyPayment: number
  totalAmount: number
  collateralAmount: number
  status: string
  startDate: string
  endDate: string
  nextPaymentDate: string
  remainingBalance: number
  loanToValue: number
  collateralRatio: number
}

export default function Home() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("overview")
  const [walletConnected, setWalletConnected] = useState(false)
  const [walletAddress, setWalletAddress] = useState("")
  const [coinAddress, setCoinAddress] = useState("")
  const [coinValidation, setCoinValidation] = useState<CreatorCoinValidation | null>(null)
  const [validatingCoin, setValidatingCoin] = useState(false)
  const [loanApplications, setLoanApplications] = useState<LoanApplication[]>([])
  const [activeLoans, setActiveLoans] = useState<Loan[]>([])
  const [applicationForm, setApplicationForm] = useState({
    creatorCoinAddress: "",
    requestedAmount: "",
    loanPurpose: "",
    durationMonths: "12",
    monthlyIncome: "",
    employmentStatus: "",
    creditScore: ""
  })
  const [calculatedRiskScore, setCalculatedRiskScore] = useState<number | null>(null)

  // Check for wallet connection on mount
  useEffect(() => {
    // Check if wallet is connected via CDP
    const checkWalletConnection = () => {
      const cdpConnected = localStorage.getItem('cdp-wallet-connected') === 'true'
      
      if (cdpConnected) {
        setWalletConnected(true)
        // Try to get wallet address from localStorage or set a placeholder
        const storedAddress = localStorage.getItem('wallet-address')
        if (storedAddress) {
          setWalletAddress(storedAddress)
        } else {
          // Set a placeholder address if we can't get the real one
          setWalletAddress("0x742d35Cc6634C0532925a3b8D4C9db96C4b4Db45")
        }
      }
    }

    checkWalletConnection()

    // Listen for wallet connection events
    const handleWalletConnect = () => {
      checkWalletConnection()
    }

    window.addEventListener('wallet-connected', handleWalletConnect)
    window.addEventListener('storage', handleWalletConnect)

    return () => {
      window.removeEventListener('wallet-connected', handleWalletConnect)
      window.removeEventListener('storage', handleWalletConnect)
    }
  }, [])

  // Mock data for demonstration
  useEffect(() => {
    setLoanApplications([
      {
        id: "1",
        creatorCoinAddress: "0x1234567890123456789012345678901234567890",
        requestedAmount: 5000,
        loanPurpose: "Content creation equipment",
        collateralAmount: 10000,
        durationMonths: 12,
        status: "PENDING",
        riskScore: 25,
        monthlyIncome: 3000,
        employmentStatus: "full-time",
        creditScore: 720,
        createdAt: "2024-01-15"
      }
    ])

    setActiveLoans([
      {
        id: "1",
        creatorCoinAddress: "0x1234567890123456789012345678901234567890",
        principalAmount: 5000,
        interestRate: 5.5,
        durationMonths: 12,
        monthlyPayment: 429.82,
        totalAmount: 5157.84,
        collateralAmount: 10000,
        status: "ACTIVE",
        startDate: "2024-01-01",
        endDate: "2025-01-01",
        nextPaymentDate: "2024-02-01",
        remainingBalance: 4570.18,
        loanToValue: 0.10,
        collateralRatio: 0.20
      }
    ])
  }, [])

  const connectWallet = async () => {
    // Mock wallet connection
    setWalletConnected(true)
    setWalletAddress("0x742d35Cc6634C0532925a3b8D4C9db96C4b4Db45")
  }

  const disconnectWallet = () => {
    setWalletConnected(false)
    setWalletAddress("")
    setCoinAddress("")
    setCoinValidation(null)
  }

  const calculateRiskScore = (validation: CreatorCoinValidation) => {
    // Calculate risk score based on coin metrics
    let score = 50 // Base score
    
    // Market cap factor (higher market cap = lower risk)
    if (validation.marketCap > 1000000) score -= 15
    else if (validation.marketCap > 500000) score -= 10
    else if (validation.marketCap > 100000) score -= 5
    else score += 10
    
    // Price stability (mock - in real app would check price history)
    if (validation.currentPrice > 1) score -= 5
    
    // Liquidity factor (mock - based on market cap as proxy)
    if (validation.marketCap > 500000) score -= 10
    
    // Ensure score is between 0 and 100
    return Math.max(0, Math.min(100, score))
  }

  const validateCreatorCoin = async () => {
    if (!coinAddress) return

    setValidatingCoin(true)
    try {
      const response = await fetch('/api/zora/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ coinAddress })
      })

      // Check if response is JSON
      const contentType = response.headers.get('content-type')
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Server returned non-JSON response. API may be unavailable.')
      }

      const data = await response.json()
      
      if (data.success) {
        setCoinValidation(data.validation)
        
        // Calculate risk score automatically
        const riskScore = calculateRiskScore(data.validation)
        setCalculatedRiskScore(riskScore)
        
        setApplicationForm(prev => ({
          ...prev,
          creatorCoinAddress: coinAddress,
          requestedAmount: data.validation.maxLoanAmount.toString()
        }))
      } else {
        // Show mock data for demo purposes
        const mockValidation: CreatorCoinValidation = {
          isValid: true,
          marketCap: 500000,
          currentPrice: 1.25,
          totalSupply: 400000,
          eligibleForLoan: true,
          maxLoanAmount: 50000,
          requiredCollateral: 100000
        }
        setCoinValidation(mockValidation)
        
        const riskScore = calculateRiskScore(mockValidation)
        setCalculatedRiskScore(riskScore)
        
        setApplicationForm(prev => ({
          ...prev,
          creatorCoinAddress: coinAddress,
          requestedAmount: mockValidation.maxLoanAmount.toString()
        }))
      }
    } catch (error) {
      console.error('Error validating coin:', error)
      
      // Use mock data for demo when API is unavailable
      const mockValidation: CreatorCoinValidation = {
        isValid: true,
        marketCap: 500000,
        currentPrice: 1.25,
        totalSupply: 400000,
        eligibleForLoan: true,
        maxLoanAmount: 50000,
        requiredCollateral: 100000
      }
      setCoinValidation(mockValidation)
      
      const riskScore = calculateRiskScore(mockValidation)
      setCalculatedRiskScore(riskScore)
      
      setApplicationForm(prev => ({
        ...prev,
        creatorCoinAddress: coinAddress,
        requestedAmount: mockValidation.maxLoanAmount.toString()
      }))
    } finally {
      setValidatingCoin(false)
    }
  }

  const submitApplication = async () => {
    try {
      const response = await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          applicantId: walletAddress,
          creatorCoinAddress: applicationForm.creatorCoinAddress,
          requestedAmount: parseFloat(applicationForm.requestedAmount),
          loanPurpose: applicationForm.loanPurpose,
          durationMonths: parseInt(applicationForm.durationMonths),
          monthlyIncome: parseFloat(applicationForm.monthlyIncome) || undefined,
          employmentStatus: applicationForm.employmentStatus || undefined,
          creditScore: parseInt(applicationForm.creditScore) || undefined
        })
      })

      const data = await response.json()
      if (data.application) {
        setLoanApplications([data.application, ...loanApplications])
        setApplicationForm({
          creatorCoinAddress: "",
          requestedAmount: "",
          loanPurpose: "",
          durationMonths: "12",
          monthlyIncome: "",
          employmentStatus: "",
          creditScore: ""
        })
        setCoinValidation(null)
        setCoinAddress("")
        setActiveTab("applications")
      }
    } catch (error) {
      console.error('Error submitting application:', error)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push('/')}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Home
              </Button>
              <div>
                <h1 className="text-4xl font-bold text-slate-900 mb-2">Creator Coin Loans</h1>
                <p className="text-slate-600">Get USDC loans backed by your Zora creator coins</p>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="check">Check Eligibility</TabsTrigger>
            <TabsTrigger value="apply">Apply</TabsTrigger>
            <TabsTrigger value="applications">Applications</TabsTrigger>
            <TabsTrigger value="loans">My Loans</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Borrowed</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">$5,000</div>
                  <p className="text-xs text-muted-foreground">Active loans</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Collateral Value</CardTitle>
                  <Coins className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">$50,000</div>
                  <p className="text-xs text-muted-foreground">Creator coins</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Next Payment</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">$429.82</div>
                  <p className="text-xs text-muted-foreground">Due Feb 1, 2024</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Loan Terms</CardTitle>
                  <Shield className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">10% LTV</div>
                  <p className="text-xs text-muted-foreground">20% collateral</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>How It Works</CardTitle>
                  <CardDescription>Creator coin-backed lending</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-semibold text-blue-600">1</span>
                    </div>
                    <div>
                      <h4 className="font-semibold">Check Eligibility</h4>
                      <p className="text-sm text-slate-600">Verify your creator coin meets minimum market cap requirements</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-semibold text-blue-600">2</span>
                    </div>
                    <div>
                      <h4 className="font-semibold">Apply for Loan</h4>
                      <p className="text-sm text-slate-600">Get up to 10% of your coin's market cap as USDC</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-semibold text-blue-600">3</span>
                    </div>
                    <div>
                      <h4 className="font-semibold">Deposit Collateral</h4>
                      <p className="text-sm text-slate-600">Transfer 20% of your coin's value to platform wallet</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-semibold text-blue-600">4</span>
                    </div>
                    <div>
                      <h4 className="font-semibold">Receive USDC</h4>
                      <p className="text-sm text-slate-600">Get your loan instantly in USDC</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Loan Terms</CardTitle>
                  <CardDescription>Competitive rates for creators</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-semibold text-blue-900 mb-2">10% Loan-to-Value</h4>
                    <p className="text-sm text-blue-700">Borrow up to 10% of your creator coin's market cap</p>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg">
                    <h4 className="font-semibold text-green-900 mb-2">20% Collateral</h4>
                    <p className="text-sm text-green-700">Only 20% of coin value required as collateral</p>
                  </div>
                  <div className="p-4 bg-purple-50 rounded-lg">
                    <h4 className="font-semibold text-purple-900 mb-2">5% Base Rate</h4>
                    <p className="text-sm text-purple-700">Low interest rates with risk-based adjustments</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Check Eligibility Tab */}
          <TabsContent value="check" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Check Creator Coin</CardTitle>
                    <CardDescription>Verify if your coin is eligible for loans</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="coinAddress">Creator Coin Address</Label>
                      <Input
                        id="coinAddress"
                        placeholder="0x..."
                        value={coinAddress}
                        onChange={(e) => setCoinAddress(e.target.value)}
                      />
                    </div>
                    <Button 
                      onClick={validateCreatorCoin} 
                      disabled={!coinAddress || validatingCoin}
                      className="w-full"
                    >
                      {validatingCoin ? 'Validating...' : 'Check Eligibility'}
                    </Button>

                    {coinValidation && (
                      <div className="space-y-4">
                        <Separator />
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span>Market Cap:</span>
                            <span className="font-semibold">{formatCurrency(coinValidation.marketCap)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Current Price:</span>
                            <span className="font-semibold">${coinValidation.currentPrice}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Max Loan Amount:</span>
                            <span className="font-semibold text-green-600">{formatCurrency(coinValidation.maxLoanAmount)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Required Collateral:</span>
                            <span className="font-semibold">{formatCurrency(coinValidation.requiredCollateral)}</span>
                          </div>
                          {calculatedRiskScore !== null && (
                            <div className="flex justify-between">
                              <span>Risk Score:</span>
                              <span className={`font-semibold ${
                                calculatedRiskScore < 30 ? 'text-green-600' : 
                                calculatedRiskScore < 60 ? 'text-yellow-600' : 
                                'text-red-600'
                              }`}>
                                {calculatedRiskScore}/100 {
                                  calculatedRiskScore < 30 ? '(Low Risk)' : 
                                  calculatedRiskScore < 60 ? '(Medium Risk)' : 
                                  '(High Risk)'
                                }
                              </span>
                            </div>
                          )}
                        </div>
                        
                        <Alert className={coinValidation.eligibleForLoan ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
                          <CheckCircle className="h-4 w-4" />
                          <AlertDescription className={coinValidation.eligibleForLoan ? "text-green-700" : "text-red-700"}>
                            {coinValidation.eligibleForLoan 
                              ? "Your creator coin is eligible for loans!" 
                              : "Coin does not meet minimum requirements ($10,000 market cap)"}
                          </AlertDescription>
                        </Alert>

                        {coinValidation.eligibleForLoan && (
                          <Button 
                            onClick={() => setActiveTab("apply")}
                            className="w-full"
                          >
                            Apply for Loan
                            <ArrowRight className="w-4 h-4 ml-2" />
                          </Button>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Eligibility Requirements</CardTitle>
                    <CardDescription>Minimum criteria for creator coins</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <CheckCircle className="w-5 h-5 text-green-500" />
                        <div>
                          <h4 className="font-semibold">Market Cap</h4>
                          <p className="text-sm text-slate-600">Minimum $10,000 market cap</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <CheckCircle className="w-5 h-5 text-green-500" />
                        <div>
                          <h4 className="font-semibold">Verified on Zora</h4>
                          <p className="text-sm text-slate-600">Must be a valid Zora creator coin</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <CheckCircle className="w-5 h-5 text-green-500" />
                        <div>
                          <h4 className="font-semibold">Liquidity</h4>
                          <p className="text-sm text-slate-600">Sufficient trading volume</p>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    <div className="p-4 bg-slate-50 rounded-lg">
                      <h4 className="font-semibold mb-2">Loan Terms</h4>
                      <ul className="text-sm space-y-1">
                        <li>• 10% of market cap as loan amount</li>
                        <li>• 20% of market cap as collateral</li>
                        <li>• 5% base interest rate</li>
                        <li>• 6-36 month repayment terms</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </div>
          </TabsContent>

          {/* Apply Tab */}
          <TabsContent value="apply" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Apply for Loan</CardTitle>
                    <CardDescription>Get USDC backed by your creator coins</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="creatorCoin">Creator Coin Address</Label>
                      <Input
                        id="creatorCoin"
                        placeholder="0x..."
                        value={applicationForm.creatorCoinAddress}
                        onChange={(e) => setApplicationForm({...applicationForm, creatorCoinAddress: e.target.value})}
                      />
                    </div>

                    <div>
                      <Label htmlFor="requestedAmount">Loan Amount ($)</Label>
                      <Input
                        id="requestedAmount"
                        type="number"
                        placeholder="5000"
                        value={applicationForm.requestedAmount}
                        onChange={(e) => setApplicationForm({...applicationForm, requestedAmount: e.target.value})}
                      />
                    </div>

                    <div>
                      <Label htmlFor="loanPurpose">Loan Purpose</Label>
                      <Textarea
                        id="loanPurpose"
                        placeholder="Describe what you need the loan for..."
                        value={applicationForm.loanPurpose}
                        onChange={(e) => setApplicationForm({...applicationForm, loanPurpose: e.target.value})}
                      />
                    </div>

                    <div>
                      <Label htmlFor="durationMonths">Loan Duration</Label>
                      <Select value={applicationForm.durationMonths} onValueChange={(value) => setApplicationForm({...applicationForm, durationMonths: value})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="6">6 months</SelectItem>
                          <SelectItem value="12">12 months</SelectItem>
                          <SelectItem value="24">24 months</SelectItem>
                          <SelectItem value="36">36 months</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <Separator />

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="monthlyIncome">Monthly Income ($)</Label>
                        <Input
                          id="monthlyIncome"
                          type="number"
                          placeholder="3000"
                          value={applicationForm.monthlyIncome}
                          onChange={(e) => setApplicationForm({...applicationForm, monthlyIncome: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label htmlFor="creditScore">Credit Score</Label>
                        <Input
                          id="creditScore"
                          type="number"
                          placeholder="720"
                          value={applicationForm.creditScore}
                          onChange={(e) => setApplicationForm({...applicationForm, creditScore: e.target.value})}
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="employmentStatus">Employment Status</Label>
                      <Select value={applicationForm.employmentStatus} onValueChange={(value) => setApplicationForm({...applicationForm, employmentStatus: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="full-time">Full-time</SelectItem>
                          <SelectItem value="part-time">Part-time</SelectItem>
                          <SelectItem value="freelance">Freelance</SelectItem>
                          <SelectItem value="unemployed">Unemployed</SelectItem>
                          <SelectItem value="student">Student</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <Button onClick={submitApplication} className="w-full">
                      Submit Application
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Loan Summary</CardTitle>
                    <CardDescription>Your loan terms at a glance</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {applicationForm.requestedAmount && (
                      <div className="p-4 bg-slate-50 rounded-lg">
                        <h4 className="font-semibold mb-2">Loan Details</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span>Loan Amount:</span>
                            <span className="font-semibold">{formatCurrency(parseFloat(applicationForm.requestedAmount))}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Collateral Required:</span>
                            <span className="font-semibold">{formatCurrency(parseFloat(applicationForm.requestedAmount) * 2)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Interest Rate:</span>
                            <span className="font-semibold">5.5% APR</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Duration:</span>
                            <span className="font-semibold">{applicationForm.durationMonths} months</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Est. Monthly Payment:</span>
                            <span className="font-semibold">
                              {formatCurrency(parseFloat(applicationForm.requestedAmount) * 0.09)}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    <Alert>
                      <Shield className="h-4 w-4" />
                      <AlertDescription>
                        Your creator coins will be securely held as collateral. Once you repay the loan, your coins will be returned.
                      </AlertDescription>
                    </Alert>
                  </CardContent>
                </Card>
              </div>
          </TabsContent>

          {/* Applications Tab */}
          <TabsContent value="applications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Loan Applications</CardTitle>
                <CardDescription>Track your application status</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {loanApplications.map((app) => (
                  <div key={app.id} className="p-4 border rounded-lg space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-semibold">{formatCurrency(app.requestedAmount)}</h4>
                        <p className="text-sm text-slate-600">{app.loanPurpose}</p>
                        <p className="text-xs text-slate-500 mt-1">
                          Coin: {app.creatorCoinAddress.slice(0, 8)}...{app.creatorCoinAddress.slice(-6)}
                        </p>
                      </div>
                      <Badge variant={app.status === "PENDING" ? "secondary" : "default"}>
                        {app.status}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-slate-600">Collateral</p>
                        <p className="font-semibold">{formatCurrency(app.collateralAmount)}</p>
                      </div>
                      <div>
                        <p className="text-slate-600">Duration</p>
                        <p className="font-semibold">{app.durationMonths} months</p>
                      </div>
                      <div>
                        <p className="text-slate-600">Risk Score</p>
                        <p className="font-semibold">{app.riskScore || 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* My Loans Tab */}
          <TabsContent value="loans" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Active Loans</CardTitle>
                  <CardDescription>Your current loan portfolio</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {activeLoans.map((loan) => (
                    <div key={loan.id} className="p-4 border rounded-lg space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-semibold">{formatCurrency(loan.principalAmount)}</h4>
                          <p className="text-sm text-slate-600">{loan.interestRate}% APR • {loan.durationMonths} months</p>
                          <p className="text-xs text-slate-500 mt-1">
                            Coin: {loan.creatorCoinAddress.slice(0, 8)}...{loan.creatorCoinAddress.slice(-6)}
                          </p>
                        </div>
                        <Badge variant="default">{loan.status}</Badge>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Monthly Payment:</span>
                          <span className="font-semibold">{formatCurrency(loan.monthlyPayment)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Remaining Balance:</span>
                          <span className="font-semibold">{formatCurrency(loan.remainingBalance)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Next Payment:</span>
                          <span className="font-semibold">{loan.nextPaymentDate}</span>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Progress:</span>
                          <span>{Math.round(((loan.principalAmount - loan.remainingBalance) / loan.principalAmount) * 100)}%</span>
                        </div>
                        <Progress value={((loan.principalAmount - loan.remainingBalance) / loan.principalAmount) * 100} />
                      </div>
                      
                      <Button size="sm" className="w-full">
                        Make Payment
                      </Button>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Collateral Information</CardTitle>
                  <CardDescription>Your deposited creator coins</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {activeLoans.map((loan) => (
                      <div key={loan.id} className="p-4 border rounded-lg">
                        <h4 className="font-semibold mb-2">Creator Coin Collateral</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>Collateral Value:</span>
                            <span className="font-semibold">{formatCurrency(loan.collateralAmount)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Loan-to-Value:</span>
                            <span className="font-semibold">{(loan.loanToValue * 100).toFixed(0)}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Collateral Ratio:</span>
                            <span className="font-semibold">{(loan.collateralRatio * 100).toFixed(0)}%</span>
                          </div>
                        </div>
                        <Alert className="mt-3">
                          <Shield className="h-4 w-4" />
                          <AlertDescription>
                            Your creator coins are safely held and will be returned upon loan repayment.
                          </AlertDescription>
                        </Alert>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}