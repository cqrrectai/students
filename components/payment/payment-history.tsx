"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CreditCard, Download, Eye } from 'lucide-react'

interface PaymentTransaction {
  id: string
  amount: number
  currency: string
  status: 'pending' | 'completed' | 'failed' | 'refunded' | 'cancelled'
  payment_method: string
  created_at: string
  description: string
}

interface PaymentHistoryProps {
  compact?: boolean
}

export function PaymentHistory({ compact = false }: PaymentHistoryProps) {
  const [transactions, setTransactions] = useState<PaymentTransaction[]>([
    {
      id: '1',
      amount: 999,
      currency: 'BDT',
      status: 'completed',
      payment_method: 'bkash',
      created_at: new Date().toISOString(),
      description: 'Pro Plan Subscription'
    },
    {
      id: '2',
      amount: 499,
      currency: 'BDT',
      status: 'completed',
      payment_method: 'nagad',
      created_at: new Date(Date.now() - 2592000000).toISOString(),
      description: 'Basic Plan Subscription'
    }
  ])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-700'
      case 'pending':
        return 'bg-yellow-100 text-yellow-700'
      case 'failed':
        return 'bg-red-100 text-red-700'
      case 'refunded':
        return 'bg-blue-100 text-blue-700'
      case 'cancelled':
        return 'bg-gray-100 text-gray-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  const getPaymentMethodDisplay = (method: string) => {
    switch (method) {
      case 'bkash':
        return 'bKash'
      case 'nagad':
        return 'Nagad'
      case 'rocket':
        return 'Rocket'
      case 'stripe':
        return 'Credit Card'
      case 'paypal':
        return 'PayPal'
      default:
        return method.charAt(0).toUpperCase() + method.slice(1)
    }
  }

  if (compact) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-[#00e4a0]" />
            Recent Payments
          </CardTitle>
          <CardDescription>
            Your latest payment transactions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {transactions.slice(0, 3).map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
                <div>
                  <p className="font-medium text-sm">{transaction.description}</p>
                  <p className="text-xs text-gray-500">
                    {getPaymentMethodDisplay(transaction.payment_method)} • {new Date(transaction.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-sm">৳{transaction.amount}</p>
                  <Badge className={`text-xs ${getStatusColor(transaction.status)}`}>
                    {transaction.status}
                  </Badge>
                </div>
              </div>
            ))}
            {transactions.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <CreditCard className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p>No payment history yet</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-[#00e4a0]" />
              Payment History
            </CardTitle>
            <CardDescription>
              View and manage your payment transactions
            </CardDescription>
          </div>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {transactions.map((transaction) => (
            <div key={transaction.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-white rounded-full">
                  <CreditCard className="h-4 w-4 text-[#00e4a0]" />
                </div>
                <div>
                  <p className="font-medium">{transaction.description}</p>
                  <p className="text-sm text-gray-500">
                    {getPaymentMethodDisplay(transaction.payment_method)} • Transaction ID: {transaction.id}
                  </p>
                  <p className="text-xs text-gray-400">
                    {new Date(transaction.created_at).toLocaleDateString()} at {new Date(transaction.created_at).toLocaleTimeString()}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-lg">৳{transaction.amount}</p>
                <Badge className={`mb-2 ${getStatusColor(transaction.status)}`}>
                  {transaction.status}
                </Badge>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Eye className="h-3 w-3 mr-1" />
                    View
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="h-3 w-3 mr-1" />
                    Receipt
                  </Button>
                </div>
              </div>
            </div>
          ))}
          {transactions.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <CreditCard className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No payment history</h3>
              <p className="text-gray-600">Your payment transactions will appear here</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}