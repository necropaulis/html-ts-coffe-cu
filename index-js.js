import {createWalletClient} from "https://esm.sh/viem"

const connectButton = document.getElementById("connectButton")

let walletClient
async function connect() {
    if (typeof window.ethereum !== "undefined") {
        createWalletClient({
            transport: custom(window.ethereum)
        })
       await walletClient.requestAddresses()
       console.log("hi!")
    } 
    else {
        connectButton.innerHTML = "Install Metamask"
    }
}

connectButton.onclick = connect