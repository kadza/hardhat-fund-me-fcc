// SPDX-License-Identifier: MIT
pragma solidity ^0.8.8;

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "./PriceConverter.sol";

error FundMe__NotOwner();
error FundMe__MinimumUsd();

//Doxygen

/** @title A contract for crowd founding
 *  @author Kadza
 *  @notice Tutorial
 *  @dev Hi devs
 */
contract FundMe {
    using PriceConverter for uint256;

    mapping(address => uint256) private s_addressToAmountFunded;
    address[] private s_funders;
    address private /* immutable */ i_owner;
    uint256 public constant MINIMUM_USD = 1 * 10 ** 18;

    AggregatorV3Interface private s_priceFeed;

    modifier onlyOwner {
        if (msg.sender != i_owner) revert FundMe__NotOwner();
        _;
    }

    modifier minimumUsd {
        if(msg.value.getConversionRate(s_priceFeed) < MINIMUM_USD) revert FundMe__MinimumUsd();
        _;
    }

    constructor(address priceFeedAddress) {
        i_owner = msg.sender;
        s_priceFeed = AggregatorV3Interface(priceFeedAddress);
    }

    fallback() external payable {
        fund();
    }

    receive() external payable {
        fund();
    }

    /**
     *  @notice It funds the contract
     *  @dev Hi devs
     */
    function fund() public payable minimumUsd {
        s_addressToAmountFunded[msg.sender] += msg.value;
        s_funders.push(msg.sender);
    }

    function withdraw() public payable onlyOwner {
        for (uint256 funderIndex=0; funderIndex < s_funders.length; funderIndex++){
            address funder = s_funders[funderIndex];
            s_addressToAmountFunded[funder] = 0;
        }
        s_funders = new address[](0);
        // // transfer
        // payable(msg.sender).transfer(address(this).balance);
        // // send
        // bool sendSuccess = payable(msg.sender).send(address(this).balance);
        // require(sendSuccess, "Send failed");
        // call
        (bool callSuccess, ) = payable(msg.sender).call{value: address(this).balance}("");
        require(callSuccess, "Call failed");
    }

    function cheaperWithdraw() public payable onlyOwner {
      address[] memory funders = s_funders;
      for (uint256 funderIndex=0; funderIndex < funders.length; funderIndex++){
          address funder = funders[funderIndex];
          s_addressToAmountFunded[funder] = 0;
      }

      s_funders = new address[](0);

      (bool callSuccess, ) = payable(msg.sender).call{value: address(this).balance}("");
      require(callSuccess, "Call failed");
    }

    function getOwner() public view returns (address) {
      return i_owner;
    }

    function getFunder(uint256 index) public view returns (address) {
      return s_funders[index];
    }

    function getAddressToAmountFunded(address funder) public view returns (uint256) {
      return s_addressToAmountFunded[funder];
    }

    function getPriceFeed() public view returns (AggregatorV3Interface) {
      return s_priceFeed;
    }
}