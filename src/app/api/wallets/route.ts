import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { ethers } from 'ethers'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const purpose = searchParams.get('purpose')
    const walletType = searchParams.get('type')
    const isActive = searchParams.get('active')

    let query = db
      .from('server_wallets')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (purpose) query = query.eq('purpose', purpose)
    if (walletType) query = query.eq('wallet_type', walletType)
    if (isActive !== null) query = query.eq('is_active', isActive === 'true')

    const { data: wallets, error } = await query

    if (error) {
      console.error('Supabase error:', error)
      throw error
    }

    // Remove private keys from response
    const safeWallets = wallets?.map(wallet => ({
      ...wallet,
      private_key: undefined
    }))

    return NextResponse.json({ wallets: safeWallets })
  } catch (error) {
    console.error('Error fetching wallets:', error)
    return NextResponse.json(
      { error: 'Failed to fetch wallets' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      walletType = 'HOT',
      purpose = 'LENDING',
      chainId = 8453 // Base chain
    } = body

    // Generate new wallet
    const wallet = ethers.Wallet.createRandom()
    
    // Encrypt private key (in production, use proper encryption)
    const encryptedPrivateKey = Buffer.from(wallet.privateKey).toString('base64')

    // Create wallet record
    const { data: serverWallet, error: createError } = await db
      .from('server_wallets')
      .insert({
        address: wallet.address,
        private_key: encryptedPrivateKey,
        wallet_type: walletType,
        purpose,
        chain_id: chainId,
        balance: 0,
        is_active: true
      })
      .select()
      .single()

    if (createError) {
      console.error('Supabase error:', createError)
      throw createError
    }

    // Return wallet without private key
    const safeWallet = {
      ...serverWallet,
      private_key: undefined
    }

    return NextResponse.json({ 
      wallet: safeWallet,
      address: wallet.address,
      publicKey: wallet.publicKey
    })
  } catch (error) {
    console.error('Error creating wallet:', error)
    return NextResponse.json(
      { error: 'Failed to create wallet' },
      { status: 500 }
    )
  }
}