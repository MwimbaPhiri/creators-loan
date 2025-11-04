import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { ZAI } from 'z-ai-web-dev-sdk'
import { ZoraAPI } from '@/lib/zora-api'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const status = searchParams.get('status')

    let query = db
      .from('loan_applications')
      .select(`
        *,
        applicant:users!applicant_id (
          id,
          email,
          name,
          wallet_address
        ),
        loan:loans!loan_id (
          id,
          principal_amount,
          interest_rate,
          status,
          start_date
        )
      `)
      .order('created_at', { ascending: false })
    
    if (userId) {
      query = query.eq('applicant_id', userId)
    }
    
    if (status) {
      query = query.eq('status', status)
    }

    const { data: applications, error } = await query

    if (error) {
      console.error('Supabase error:', error)
      throw error
    }

    return NextResponse.json({ applications })
  } catch (error) {
    console.error('Error fetching applications:', error)
    return NextResponse.json(
      { error: 'Failed to fetch applications' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      applicantId,
      creatorCoinAddress,
      requestedAmount,
      loanPurpose,
      durationMonths,
      monthlyIncome,
      employmentStatus,
      creditScore
    } = body

    // Validate required fields
    if (!applicantId || !creatorCoinAddress || !requestedAmount || !loanPurpose || !durationMonths) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate creator coin and get market data
    const coinValidation = await ZoraAPI.validateCreatorCoin(creatorCoinAddress)
    
    if (!coinValidation.isValid) {
      return NextResponse.json(
        { error: 'Invalid creator coin address' },
        { status: 400 }
      )
    }

    if (!coinValidation.eligibleForLoan) {
      return NextResponse.json(
        { error: 'Creator coin does not meet eligibility requirements' },
        { status: 400 }
      )
    }

    // Check if requested amount exceeds maximum allowed
    if (requestedAmount > coinValidation.maxLoanAmount) {
      return NextResponse.json(
        { 
          error: 'Requested amount exceeds maximum allowed',
          maxAllowed: coinValidation.maxLoanAmount,
          requested: requestedAmount
        },
        { status: 400 }
      )
    }

    // Calculate required collateral (20% of coin value)
    const requiredCollateral = coinValidation.requiredCollateral

    // Calculate risk score using AI
    const riskScore = await calculateRiskScore({
      requestedAmount: parseFloat(requestedAmount),
      collateralAmount: requiredCollateral,
      monthlyIncome: monthlyIncome ? parseFloat(monthlyIncome) : undefined,
      creditScore: creditScore ? parseInt(creditScore) : undefined,
      employmentStatus,
      durationMonths: parseInt(durationMonths),
      marketCap: coinValidation.marketCap
    })

    // Create application
    const { data: application, error: createError } = await db
      .from('loan_applications')
      .insert({
        applicant_id: applicantId,
        creator_coin_address: creatorCoinAddress,
        requested_amount: parseFloat(requestedAmount),
        loan_purpose: loanPurpose,
        collateral_amount: requiredCollateral,
        collateral_type: 'CREATOR_COIN',
        duration_months: parseInt(durationMonths),
        monthly_income: monthlyIncome ? parseFloat(monthlyIncome) : null,
        employment_status: employmentStatus || null,
        credit_score: creditScore ? parseInt(creditScore) : null,
        risk_score: riskScore,
        status: 'PENDING'
      })
      .select(`
        *,
        applicant:users!applicant_id (
          id,
          email,
          name,
          wallet_address
        )
      `)
      .single()

    if (createError) {
      console.error('Supabase error:', createError)
      throw createError
    }

    return NextResponse.json({ 
      application,
      coinValidation,
      message: 'Application submitted successfully'
    })
  } catch (error) {
    console.error('Error creating application:', error)
    return NextResponse.json(
      { error: 'Failed to create application' },
      { status: 500 }
    )
  }
}

async function calculateRiskScore(applicationData: {
  requestedAmount: number
  collateralAmount: number
  monthlyIncome?: number
  creditScore?: number
  employmentStatus?: string
  durationMonths: number
  marketCap: number
}): Promise<number> {
  try {
    const zai = await ZAI.create()
    
    const prompt = `
    Calculate a risk score (0-100) for this creator coin-backed loan application:
    
    Loan Amount: $${applicationData.requestedAmount}
    Collateral Value: $${applicationData.collateralAmount}
    LTV Ratio: ${(applicationData.requestedAmount / applicationData.collateralAmount * 100).toFixed(1)}%
    Coin Market Cap: $${applicationData.marketCap}
    Monthly Income: ${applicationData.monthlyIncome ? `$${applicationData.monthlyIncome}` : 'Not provided'}
    Credit Score: ${applicationData.creditScore || 'Not provided'}
    Employment Status: ${applicationData.employmentStatus || 'Not provided'}
    Loan Duration: ${applicationData.durationMonths} months
    
    Consider these factors:
    - Lower LTV ratio = lower risk (this is 10% LTV which is very low risk)
    - Higher market cap = lower risk
    - Higher income = lower risk  
    - Higher credit score = lower risk
    - Stable employment = lower risk
    - Shorter duration = lower risk
    
    Return only a number between 0-100 where lower numbers indicate lower risk.
    `
    
    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are a risk assessment AI for creator coin-backed loans. Provide numerical risk scores only.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 10
    })

    const scoreText = completion.choices[0]?.message?.content?.trim()
    const score = parseInt(scoreText || '25') // Lower base score for creator coin loans
    
    return isNaN(score) ? 25 : Math.max(0, Math.min(100, score))
  } catch (error) {
    console.error('Error calculating risk score:', error)
    // Fallback to basic calculation - lower risk for creator coin loans
    let score = 25 // Base score for creator coin loans
    
    // Market cap adjustment
    if (applicationData.marketCap > 100000) score -= 10
    else if (applicationData.marketCap < 25000) score += 10
    
    // Credit score adjustment
    if (applicationData.creditScore) {
      if (applicationData.creditScore >= 750) score -= 10
      else if (applicationData.creditScore >= 700) score -= 5
      else if (applicationData.creditScore < 600) score += 15
    }
    
    return Math.max(0, Math.min(100, score))
  }
}