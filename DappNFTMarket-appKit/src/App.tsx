import { useState, useEffect } from 'react'
import { 
  useAccount, 
  useConnect, 
  useDisconnect, 
  useReadContract,
  useWriteContract,
  useWatchContractEvent
} from 'wagmi'
import NFTMarketABI from './contracts/NFTMarket.json'

interface NFT {
  tokenId: string
  price: string
  owner: string
}

function App() {
  const [nfts, setNfts] = useState<NFT[]>([])
  const [price, setPrice] = useState('')
  const [tokenId, setTokenId] = useState('')
  const NFTMarketAddress = '0xDB3EEeF5A3f3853E2F8531A1b2B28DEeB42FB3ea'
  
  const account = useAccount()
  const { connectors, connect, status, error } = useConnect()
  const { disconnect } = useDisconnect()

  // 读取用户NFT余额和列表
  const { data: balance, refetch: refetchBalance } = useReadContract({
    address: NFTMarketAddress,
    abi: NFTMarketABI,
    functionName: 'balanceOf',
    args: [account.address!],
    query: {
      enabled: account.status === 'connected'
    }
  })

  console.log('NFT合约地址:', NFTMarketAddress)
  console.log('当前账户:', account.address)
  console.log('NFT余额:', balance)

  // 监听Transfer事件更新NFT列表
  useWatchContractEvent({
    address: NFTMarketAddress,
    abi: NFTMarketABI,
    eventName: 'Transfer',
    onLogs: () => {
      // TODO: 实现NFT列表更新逻辑
    }
  })

  // 写入合约方法
  const { writeContract, isPending } = useWriteContract()

  // 获取市场NFT列表
  const fetchNFTs = async () => {
    if (!account.address) return
    
    // 模拟数据 - 实际项目中应调用合约方法获取
    const mockNFTs: NFT[] = [
      {
        tokenId: "1",
        price: "0.1",
        owner: "0xe96a455fF889B6DF41dc01DC0B8F7540F7ba1c54"
      },
      {
        tokenId: "2", 
        price: "0.2",
        owner: "0xe96a455fF889B6DF41dc01DC0B8F7540F7ba1c54"
      }
    ]
    setNfts(mockNFTs)
  }

  useEffect(() => {
    fetchNFTs()
  }, [account.address])

  const handleListNFT = async () => {
    if (!price || !account.address) return
    
    try {
      const txHash = await writeContract({
        address: NFTMarketAddress,
        abi: NFTMarketABI,
        functionName: 'mint',
        args: [account.address]
      })
      console.log('上架成功，交易哈希:', txHash)
      // 刷新余额和列表
      refetchBalance()
      fetchNFTs()
    } catch (error) {
      console.error('上架失败:', error)
    }
  }

  const handleBuyNFT = async (nft: NFT) => {
    if (!account.address) return
    
    try {
      await writeContract({
        address: NFTMarketAddress,
        abi: NFTMarketABI,
        functionName: 'transferFrom',
        args: [nft.owner, account.address, BigInt(nft.tokenId)]
      })
      // 刷新NFT列表
      fetchNFTs()
    } catch (error) {
      console.error('购买失败:', error)
    }
  }

  return (
    <div style={{ padding: '20px' }}>
      <div>
        <h2>NFT Market</h2>
        
        {account.status === 'connected' ? (
          <div>
            <button onClick={() => disconnect()}>断开连接</button>
            
            <div style={{ marginTop: '20px' }}>
              <h3>上架NFT</h3>
              <input 
                type="text" 
                placeholder="价格 (ETH)" 
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
              <button onClick={handleListNFT} disabled={isPending}>
                {isPending ? "处理中..." : "上架"}
              </button>
            </div>

            <div style={{ marginTop: '20px' }}>
              <h3>我的NFT</h3>
              <p>持有NFT数量: {balance?.toString() || 0}</p>
            </div>

            <div style={{ marginTop: '20px' }}>
              <h3>市场NFT</h3>
              {nfts.map((nft: NFT) => (
                <div key={nft.tokenId} style={{ border: '1px solid #ccc', padding: '10px', margin: '10px 0' }}>
                  <p>Token ID: {nft.tokenId}</p>
                  <p>价格: {nft.price} ETH</p>
                  <button onClick={() => handleBuyNFT(nft)}>购买</button>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div>
            <h3>连接钱包</h3>
            {connectors.map((connector) => (
              <button
                key={connector.uid}
                onClick={() => connect({ connector })}
                style={{ margin: '5px' }}
              >
                {connector.name}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default App
