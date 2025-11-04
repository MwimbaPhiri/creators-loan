export interface LoanTerms {
  principalAmount: number
  interestRate: number
  durationMonths: number
  monthlyPayment: number
  totalAmount: number
  totalInterest: number
}

export interface RiskAssessment {
  riskScore: number
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH'
  recommendedInterestRate: number
  maxLoanAmount: number
  factors: {
    ltvRatio: number
    creditScore: number
    incomeRatio: number
    employmentStability: number
  }
}

export function calculateLoanTerms(
  principalAmount: number,
  annualRate: number,
  durationMonths: number
): LoanTerms {
  const monthlyRate = annualRate / 100 / 12
  
  // Calculate monthly payment using loan amortization formula
  const monthlyPayment = principalAmount * 
    (monthlyRate * Math.pow(1 + monthlyRate, durationMonths)) / 
    (Math.pow(1 + monthlyRate, durationMonths) - 1)
  
  const totalAmount = monthlyPayment * durationMonths
  const totalInterest = totalAmount - principalAmount
  
  return {
    principalAmount,
    interestRate: annualRate,
    durationMonths,
    monthlyPayment: parseFloat(monthlyPayment.toFixed(2)),
    totalAmount: parseFloat(totalAmount.toFixed(2)),
    totalInterest: parseFloat(totalInterest.toFixed(2))
  }
}

export function calculateLTV(loanAmount: number, collateralValue: number): number {
  if (collateralValue === 0) return 100
  return (loanAmount / collateralValue) * 100
}

export function calculateDTI(
  monthlyDebtPayments: number,
  monthlyGrossIncome: number
): number {
  if (monthlyGrossIncome === 0) return 100
  return (monthlyDebtPayments / monthlyGrossIncome) * 100
}

export function assessLoanRisk(
  loanAmount: number,
  collateralAmount: number,
  monthlyIncome?: number,
  creditScore?: number,
  employmentStatus?: string,
  existingDebts?: number
): RiskAssessment {
  // Calculate LTV ratio
  const ltvRatio = calculateLTV(loanAmount, collateralAmount)
  
  // Calculate DTI if income provided
  const monthlyPayment = calculateLoanTerms(loanAmount, 8, 12).monthlyPayment
  const totalMonthlyDebts = (existingDebts || 0) + monthlyPayment
  const dtiRatio = monthlyIncome ? calculateDTI(totalMonthlyDebts, monthlyIncome) : 50
  
  // Risk factors (0-100 scale, lower is better)
  const ltvRisk = Math.min(100, ltvRatio * 1.25) // LTV up to 80% is acceptable
  const creditRisk = creditScore ? Math.max(0, (850 - creditScore) / 8.5) : 50 // Credit score 300-850
  const incomeRisk = monthlyIncome ? Math.min(100, dtiRatio * 2) : 50 // DTI up to 50% is acceptable
  const employmentRisk = getEmploymentRisk(employmentStatus)
  
  // Calculate overall risk score
  const riskScore = (ltvRisk + creditRisk + incomeRisk + employmentRisk) / 4
  
  // Determine risk level
  let riskLevel: 'LOW' | 'MEDIUM' | 'HIGH'
  if (riskScore <= 30) riskLevel = 'LOW'
  else if (riskScore <= 60) riskLevel = 'MEDIUM'
  else riskLevel = 'HIGH'
  
  // Calculate recommended interest rate
  const baseRate = 6.0
  const riskAdjustment = riskScore * 0.15 // 0-15% adjustment based on risk
  const recommendedRate = baseRate + riskAdjustment
  
  // Calculate maximum loan amount based on collateral
  const maxLTV = riskLevel === 'LOW' ? 0.8 : riskLevel === 'MEDIUM' ? 0.6 : 0.4
  const maxLoanAmount = collateralAmount * maxLTV
  
  return {
    riskScore: parseFloat(riskScore.toFixed(1)),
    riskLevel,
    recommendedInterestRate: parseFloat(recommendedRate.toFixed(2)),
    maxLoanAmount: parseFloat(maxLoanAmount.toFixed(2)),
    factors: {
      ltvRatio: parseFloat(ltvRatio.toFixed(1)),
      creditScore: creditScore || 0,
      incomeRatio: parseFloat(dtiRatio.toFixed(1)),
      employmentStability: employmentRisk
    }
  }
}

function getEmploymentRisk(employmentStatus?: string): number {
  switch (employmentStatus?.toLowerCase()) {
    case 'full-time':
      return 10
    case 'part-time':
      return 30
    case 'freelance':
      return 40
    case 'self-employed':
      return 35
    case 'unemployed':
      return 80
    case 'student':
      return 60
    case 'retired':
      return 25
    default:
      return 50
  }
}

export function calculateAmortizationSchedule(
  principalAmount: number,
  annualRate: number,
  durationMonths: number,
  startDate: Date = new Date()
) {
  const monthlyRate = annualRate / 100 / 12
  const monthlyPayment = principalAmount * 
    (monthlyRate * Math.pow(1 + monthlyRate, durationMonths)) / 
    (Math.pow(1 + monthlyRate, durationMonths) - 1)
  
  const schedule = []
  let remainingBalance = principalAmount
  
  for (let month = 1; month <= durationMonths; month++) {
    const interestPayment = remainingBalance * monthlyRate
    const principalPayment = monthlyPayment - interestPayment
    
    remainingBalance -= principalPayment
    
    const paymentDate = new Date(startDate)
    paymentDate.setMonth(paymentDate.getMonth() + month)
    
    schedule.push({
      month,
      paymentDate: paymentDate.toISOString().split('T')[0],
      payment: parseFloat(monthlyPayment.toFixed(2)),
      principal: parseFloat(principalPayment.toFixed(2)),
      interest: parseFloat(interestPayment.toFixed(2)),
      balance: parseFloat(Math.max(0, remainingBalance).toFixed(2))
    })
    
    if (remainingBalance <= 0) break
  }
  
  return schedule
}

export function calculateEarlyPayoff(
  currentBalance: number,
  annualRate: number,
  remainingMonths: number,
  payoffDate: Date
) {
  const monthlyRate = annualRate / 100 / 12
  const currentDate = new Date()
  
  // Calculate months until payoff
  const monthsUntilPayoff = Math.max(0, 
    Math.ceil((payoffDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24 * 30))
  )
  
  if (monthsUntilPayoff >= remainingMonths) {
    return {
      payoffAmount: currentBalance,
      interestSaved: 0,
      monthsSaved: 0
    }
  }
  
  // Calculate remaining payments without early payoff
  const monthlyPayment = currentBalance * 
    (monthlyRate * Math.pow(1 + monthlyRate, remainingMonths)) / 
    (Math.pow(1 + monthlyRate, remainingMonths) - 1)
  
  const totalRemainingPayments = monthlyPayment * remainingMonths
  
  // Calculate interest saved
  const interestSaved = totalRemainingPayments - currentBalance
  const monthsSaved = remainingMonths - monthsUntilPayoff
  
  return {
    payoffAmount: parseFloat(currentBalance.toFixed(2)),
    interestSaved: parseFloat(interestSaved.toFixed(2)),
    monthsSaved
  }
}