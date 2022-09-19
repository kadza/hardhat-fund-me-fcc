import { ethers, getNamedAccounts } from "hardhat"

async function main() {
    const { deployer } = await getNamedAccounts()
    const fundMe = await ethers.getContract("FundMe", deployer)
    console.log("Funding contract ...")
    const transactionResponse = await fundMe.fund({
        value: ethers.utils.parseEther("1")
    })
    transactionResponse.wait(1)
    console.log("Contract funded")
}

main()
    .then(() => process.exit)
    .catch(error => {
        console.error(error)
        process.exit(1)
    })
