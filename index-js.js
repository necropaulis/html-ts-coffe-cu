import {createWalletClient, http, custom, createPublicClient, parseEther, defineChain} from "https://esm.sh/viem"
import {contractAddress, abi} from "./constants-js.js"


const connectButton = document.getElementById("connectButton")
const fundButton = document.getElementById("fundButton")
const ethAmountInput = document.getElementById("ethAmount")
const withdrawButton = document.getElementById("withdrawButton")
const balanceButton = document.getElementById("balanceButton")

let walletClient
let publicClient
async function connect() {
    if (typeof window.ethereum !== "undefined") {
        walletClient = createWalletClient({
            transport: http("http://127.0.0.1:8545"),
        })
       await walletClient.requestAddresses()
       connectButton.innerHTML = "Connected"
              
    } 
    else {
        connectButton.innerHTML = "Install Metamask"
    }
}

async function fund() { 
    const ethAmount = ethAmountInput.value
    
    
    console.log(`Funding with ${ethAmount}...`)

    if (typeof window.ethereum !== "undefined") {
       walletClient = createWalletClient({
            transport: http("http://127.0.0.1:8545"),
        })
        const [connectedAccount]  = await walletClient.requestAddresses()
        const currentChain = await getCurrentChain(walletClient)

        publicClient = createPublicClient({
            transport: http("http://127.0.0.1:8545"),
        })

        const { request } = await publicClient.simulateContract({
            address: contractAddress,
            abi: abi,
            functionName: "fund",
            account: connectedAccount,
            chain: currentChain,
            value: parseEther(ethAmount), 
        })

        const { hash } = await walletClient.writeContract(request)
        console.log(`Transaction hash: ${hash}`)
    } 
    else {
        connectButton.innerHTML = "Install Metamask"
    }
}

async function getBalance() {
  if (typeof window.ethereum !== "undefined") {
    try {
      publicClient = createPublicClient({
        transport: http("http://127.0.0.1:8545"),
      })
      const balance = await publicClient.getBalance({
        address: contractAddress,
      })
      console.log(formatEther(balance))
    } catch (error) {
      console.log(error)
    }
  } else {
    balanceButton.innerHTML = "Please install MetaMask"
  }
}

async function withdraw() {
  console.log(`Withdrawing...`)

  if (typeof window.ethereum !== "undefined") {
    try {
      walletClient = createWalletClient({
        transport: http("http://127.0.0.1:8545"),
      })
      publicClient = createPublicClient({
        transport: http("http://127.0.0.1:8545"),
      })
      const [account] = await walletClient.requestAddresses()
      const currentChain = await getCurrentChain(walletClient)

      const chainId = await walletClient.getChainId()
      console.log("Current chain:", chainId)
      console.log("Processing transaction...")
      const { request } = await publicClient.simulateContract({
        account,
        address: contractAddress,
        abi,
        functionName: "withdraw",
        chain: currentChain,
      })
      const hash = await walletClient.writeContract(request)
      console.log("Transaction processed: ", hash)
    } catch (error) {
      console.log(error)
    }
  } else {
    withdrawButton.innerHTML = "Please install MetaMask"
  }
}

async function getCurrentChain(client) {
  const chainId = await client.getChainId()
  const currentChain = defineChain({
    id: chainId,
    name: "Custom Chain",
    nativeCurrency: {
      name: "Ether",
      symbol: "ETH",
      decimals: 18,
    },
    rpcUrls: {
      default: {
        http: ["http://127.0.0.1:8545"],
      },
    },
  })
  return currentChain
}

// Event listeners
connectButton.onclick = connect
fundButton.onclick = fund
balanceButton.onclick = getBalance
withdrawButton.onclick = withdraw

