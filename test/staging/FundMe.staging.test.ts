import { assert } from "chai"
import { ethers, getNamedAccounts, network } from "hardhat"
import { FundMe } from "../../typechain-types"

network.config.chainId === 31337
    ? describe.skip
    : describe("FundMe", async function() {
          let fundMe: FundMe
          let deployer
          const sendValue = ethers.utils.parseEther("0.01")

          this.beforeEach(async function() {
              deployer = (await getNamedAccounts()).deployer
              fundMe = await ethers.getContract("FundMe", deployer)
          })


          it("allows people to fund and withdraw", async function() {
              const funTxReceipt = await fundMe.fund({ value: sendValue })
              await funTxReceipt.wait(1)
              const withdrawTxReceipt = await fundMe.withdraw()
              await withdrawTxReceipt.wait(1)
              const balance = await fundMe.provider.getBalance(fundMe.address)

              assert.equal(balance.toString(), "0")
          })
      })
