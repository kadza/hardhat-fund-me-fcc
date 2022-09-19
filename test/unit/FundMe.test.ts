import { assert, expect } from "chai"
import { deployments, ethers, getNamedAccounts } from "hardhat"
import { AggregatorV3Interface } from "../../typechain-types"
import { FundMe } from "../../typechain-types/contracts/FundMe"

describe("FundMe", async function() {
    let fundMe: FundMe
    let deployer: string
    let mockV3Aggregator: AggregatorV3Interface
    const sendValue = ethers.utils.parseEther("1")

    this.beforeEach(async function() {
        deployer = (await getNamedAccounts()).deployer
        await deployments.fixture(["all"])
        fundMe = await ethers.getContract("FundMe", deployer)
        mockV3Aggregator = await ethers.getContract(
            "MockV3Aggregator",
            deployer
        )
    })

    describe("constructor", async function() {
        it("sets the aggregator address correctly", async function() {
            const response = await fundMe.priceFeed()

            assert.equal(response, mockV3Aggregator.address)
        })
    })

    describe("fund", async function() {
        it("fails if you don't sent enough ETH", async function() {
            await expect(fundMe.fund()).to.be.revertedWith(
                "You need to spend more ETH!"
            )
        })

        it("stores ETH amount by address", async function() {
            await fundMe.fund({ value: sendValue })

            const result = await fundMe.addressToAmountFunded(deployer)
            assert.equal(result.toString(), sendValue.toString())
        })

        it("stores funder address", async function() {
            await fundMe.fund({ value: sendValue })

            const result = await fundMe.funders(0)

            assert.equal(deployer, result)
        })
    })

    describe("withdraw", async function() {
        this.beforeEach(async function() {
            await fundMe.fund({ value: sendValue })
        })

        it("withdraws ETH from a single funder", async function() {
            const startingFundMeBalance = await fundMe.provider.getBalance(
                fundMe.address
            )
            const startingDeployerBalance = await fundMe.provider.getBalance(
                deployer
            )

            const transactionResponse = await fundMe.withdraw()
            const transactionReceipt = await transactionResponse.wait(1)
            const { gasUsed, effectiveGasPrice } = transactionReceipt
            const gasCost = gasUsed.mul(effectiveGasPrice)

            const endingFundMeBalance = await fundMe.provider.getBalance(
                fundMe.address
            )

            const endingDeployerBalance = await fundMe.provider.getBalance(
                deployer
            )

            assert.equal(endingFundMeBalance.toString(), "0")
            assert.equal(
                startingFundMeBalance.add(startingDeployerBalance).toString(),
                endingDeployerBalance.add(gasCost).toString()
            )
        })

        it("allows us to withdraw ETH with multiple funders", async function() {
            const accounts = await ethers.getSigners()
            for (let index = 1; index < 6; index++) {
                const fundMeConnectedContract = fundMe.connect(accounts[index])
                await fundMeConnectedContract.fund({ value: sendValue })
            }

            const startingFundMeBalance = await fundMe.provider.getBalance(
                fundMe.address
            )
            const startingDeployerBalance = await fundMe.provider.getBalance(
                deployer
            )

            const transactionResponse = await fundMe.withdraw()
            const transactionReceipt = await transactionResponse.wait(1)
            const { gasUsed, effectiveGasPrice } = transactionReceipt
            const gasCost = gasUsed.mul(effectiveGasPrice)

            const endingFundMeBalance = await fundMe.provider.getBalance(
                fundMe.address
            )

            const endingDeployerBalance = await fundMe.provider.getBalance(
                deployer
            )

            assert.equal(endingFundMeBalance.toString(), "0")
            assert.equal(
                endingDeployerBalance.add(gasCost).toString(),
                startingFundMeBalance.add(startingDeployerBalance).toString()
            )

            for (let index = 1; index < 6; index++) {
                assert.equal(
                    (
                        await fundMe.addressToAmountFunded(
                            accounts[index].address
                        )
                    ).toString(),
                    "0"
                )
            }

            assert.equal((await fundMe.funders).length, 0)
        })

        it("only allows owner to withdraw", async function() {
            const accounts = await ethers.getSigners()
            const fundMeConnectedContract = fundMe.connect(accounts[1])

            await expect(
                fundMeConnectedContract.withdraw()
            ).to.be.revertedWithCustomError(fundMe, "FundMe__NotOwner")
        })
    })
})
