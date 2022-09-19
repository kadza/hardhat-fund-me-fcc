import { HardhatUserConfig } from "hardhat/config"
import "@nomicfoundation/hardhat-toolbox"
import "dotenv/config"
import "@nomiclabs/hardhat-etherscan"
import "hardhat-gas-reporter"
import "solidity-coverage"
import "@typechain/hardhat"
import "hardhat-deploy"

const GOERLI_RPC_URL = process.env.GOERLI_RPC_URL || ""
const GOERLI_PRIVATE_KEY = process.env.GOERLI_PRIVATE_KEY! || ""
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY || ""

const config: HardhatUserConfig = {
    defaultNetwork: "hardhat",
    networks: {
        goerli: {
            url: GOERLI_RPC_URL,
            accounts: [GOERLI_PRIVATE_KEY],
            chainId: 5,
            blockConfirmations: 6,
            gas: 6000000,
        },
        localhost: {
            url: "http://127.0.0.1:8545/",
            chainId: 31337
        }
    },
    solidity: {
        compilers: [
            {
                version: "0.8.8"
            },
            {
                version: "0.6.6"
            }
        ]
    },
    etherscan: {
        apiKey: ETHERSCAN_API_KEY
    },
    gasReporter: {
        enabled: true
    },
    namedAccounts: {
        deployer: {
            default: 0,
            5: 0,
        }
    },
    mocha: {
      timeout: 900000,
  },
}

export default config
