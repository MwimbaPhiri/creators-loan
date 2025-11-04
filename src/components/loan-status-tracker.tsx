"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { CheckCircle, Clock, AlertCircle, DollarSign, Calendar, TrendingUp } from 'lucide-react'
import { io, Socket } from 'socket.io-client'

interface LoanStatus {
  id: string
  status: 'PENDING' | 'APPROVED' | 'ACTIVE' | 'PAID' | 'DEFAULTED'
  principalAmount: number
  remainingBalance: number
  nextPaymentDate: string
  monthlyPayment: number
  interestRate: number
  progress: number
  lastUpdated: string
}

interface LoanStatusTrackerProps {
  loanId?: string
  userId?: string
}

export function LoanStatusTracker({ loanId, userId }: LoanStatusTrackerProps) {
  const [loans, setLoans] = useState<LoanStatus[]>([])
  const [socket, setSocket] = useState<Socket | null>(null)
  const [connected, setConnected] = useState(false)

  useEffect(() => {
    // Initialize WebSocket connection
    const newSocket = io(process.env.NODE_ENV === 'production' ? '' : 'http://localhost:3000')
    setSocket(newSocket)

    newSocket.on('connect', () => {
      setConnected(true)
      console.log('Connected to loan status updates')
      
      // Subscribe to loan updates
      if (loanId) {
        newSocket.emit('subscribe_loan', loanId)
      } else if (userId) {
        newSocket.emit('subscribe_user', userId)
      }
    })

    newSocket.on('disconnect', () => {
      setConnected(false)
      console.log('Disconnected from loan status updates')
    })

    newSocket.on('loan_update', (updatedLoan: LoanStatus) => {
      setLoans(prev => 
        prev.map(loan => 
          loan.id === updatedLoan.id ? updatedLoan : loan
        )
      )
    })

    newSocket.on('payment_received', (paymentData: { loanId: string; amount: number; newBalance: number }) => {
      setLoans(prev => 
        prev.map(loan => 
          loan.id === paymentData.loanId 
            ? { 
                ...loan, 
                remainingBalance: paymentData.newBalance,
                lastUpdated: new Date().toISOString(),
                progress: ((loan.principalAmount - paymentData.newBalance) / loan.principalAmount) * 100
              }
            : loan
        )
      )
    })

    return () => {
      newSocket.close()
    }
  }, [loanId, userId])

  useEffect(() => {
    // Fetch initial loan data
    const fetchLoans = async () => {
      try {
        const response = await fetch(`/api/loans${userId ? `?userId=${userId}` : ''}`)
        const data = await response.json()
        
        if (data.loans) {
          const loanStatuses: LoanStatus[] = data.loans.map((loan: any) => ({
            id: loan.id,
            status: loan.status,
            principalAmount: loan.principalAmount,
            remainingBalance: loan.remainingBalance,
            nextPaymentDate: loan.nextPaymentDate,
            monthlyPayment: loan.monthlyPayment,
            interestRate: loan.interestRate,
            progress: ((loan.principalAmount - loan.remainingBalance) / loan.principalAmount) * 100,
            lastUpdated: loan.updatedAt
          }))
          
          setLoans(loanStatuses)
        }
      } catch (error) {
        console.error('Error fetching loans:', error)
      }
    }

    fetchLoans()
  }, [userId])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'secondary'
      case 'APPROVED': return 'default'
      case 'ACTIVE': return 'default'
      case 'PAID': return 'default'
      case 'DEFAULTED': return 'destructive'
      default: return 'secondary'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING': return <Clock className="w-4 h-4" />
      case 'APPROVED': return <CheckCircle className="w-4 h-4" />
      case 'ACTIVE': return <TrendingUp className="w-4 h-4" />
      case 'PAID': return <CheckCircle className="w-4 h-4" />
      case 'DEFAULTED': return <AlertCircle className="w-4 h-4" />
      default: return <Clock className="w-4 h-4" />
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const makePayment = async (loanId: string) => {
    try {
      const response = await fetch('/api/repayments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          loanId,
          borrowerId: userId,
          amount: loans.find(l => l.id === loanId)?.monthlyPayment,
          paymentMethod: 'CRYPTO'
        })
      })

      if (response.ok) {
        // Payment successful, the WebSocket will update the UI
        console.log('Payment submitted successfully')
      }
    } catch (error) {
      console.error('Error making payment:', error)
    }
  }

  if (loans.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loan Status</CardTitle>
          <CardDescription>No active loans found</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-slate-500">
            <DollarSign className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No loans to track</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* Connection Status */}
      <div className="flex items-center gap-2 text-sm">
        <div className={`w-2 h-2 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500'}`}></div>
        <span className="text-slate-600">
          {connected ? 'Live updates' : 'Connecting...'}
        </span>
      </div>

      {loans.map((loan) => (
        <Card key={loan.id}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {getStatusIcon(loan.status)}
                <CardTitle className="text-lg">Loan #{loan.id.slice(-6)}</CardTitle>
              </div>
              <Badge variant={getStatusColor(loan.status)}>
                {loan.status}
              </Badge>
            </div>
            <CardDescription>
              Last updated: {formatDate(loan.lastUpdated)}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progress</span>
                <span>{loan.progress.toFixed(1)}%</span>
              </div>
              <Progress value={loan.progress} />
            </div>

            <Separator />

            {/* Loan Details */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-slate-600">Principal</p>
                <p className="font-semibold">{formatCurrency(loan.principalAmount)}</p>
              </div>
              <div>
                <p className="text-sm text-slate-600">Remaining</p>
                <p className="font-semibold">{formatCurrency(loan.remainingBalance)}</p>
              </div>
              <div>
                <p className="text-sm text-slate-600">Monthly Payment</p>
                <p className="font-semibold">{formatCurrency(loan.monthlyPayment)}</p>
              </div>
              <div>
                <p className="text-sm text-slate-600">Interest Rate</p>
                <p className="font-semibold">{loan.interestRate}% APR</p>
              </div>
            </div>

            {loan.status === 'ACTIVE' && loan.nextPaymentDate && (
              <>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-slate-600" />
                    <div>
                      <p className="text-sm text-slate-600">Next Payment</p>
                      <p className="font-semibold">{formatDate(loan.nextPaymentDate)}</p>
                    </div>
                  </div>
                  <Button 
                    size="sm" 
                    onClick={() => makePayment(loan.id)}
                    disabled={!connected}
                  >
                    Make Payment
                  </Button>
                </div>
              </>
            )}

            {loan.status === 'PAID' && (
              <div className="text-center py-4">
                <CheckCircle className="w-12 h-12 mx-auto mb-2 text-green-500" />
                <p className="font-semibold text-green-600">Loan Paid Off</p>
                <p className="text-sm text-slate-600">Congratulations!</p>
              </div>
            )}

            {loan.status === 'DEFAULTED' && (
              <div className="text-center py-4">
                <AlertCircle className="w-12 h-12 mx-auto mb-2 text-red-500" />
                <p className="font-semibold text-red-600">Loan Defaulted</p>
                <p className="text-sm text-slate-600">Please contact support</p>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}