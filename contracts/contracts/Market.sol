//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.4;

import "./interfaces/IERC20.sol";

import "@openzeppelin/contracts/access/Ownable.sol";

error WrongState();
error Expired();
error Unauthorized();
error TooLate();
error TooEarly();

contract Market is Ownable {
    enum State {
        ACTIVE,
        COMMITTED,
        VOID,
        SENT,
        RECEIVED,
        DISPUTED,
        CLOSED
    }

    struct Trade {
        State status;
        address seller;
        string uri;
        address currency;
        uint256 amount;
        uint256 expiry;
        address buyer;
        address voider;
        uint256 unlocks;
    }

    event Wrap(
        uint256 id,
        address indexed seller,
        address indexed currency,
        uint256 indexed amount,
        uint256 expiry
    );

    event Cancel(uint256 id, address indexed seller);

    event Commit(
        uint256 id,
        address indexed buyer,
        address indexed currency,
        uint256 indexed amount
    );

    event RequestVoidance(uint256 id, address indexed voider);
    event Void(uint256 id, address indexed buyer, address indexed seller);

    event Send(uint256 id);
    event Receive(uint256 id);

    event Dispute(uint256 id, address indexed buyer);
    event Accept(uint256 id);
    event Reject(uint256 id);

    event Close(
        uint256 id,
        address indexed buyer,
        address indexed seller,
        address indexed currency,
        uint256 amount
    );

    // Trade counter
    uint256 private _id;

    // Maaping of ID => Trade
    mapping(uint256 => Trade) _trades;

    // Wallet receiving forfeited security deposits
    address private beneficiary;

    constructor(address beneficiary_) {
        beneficiary = beneficiary_;
    }

    // Get the trade for a given id
    function get(uint256 id) public view returns (Trade memory) {
        return _trades[id];
    }

    // Create trade for a physical good
    function wrap(
        string calldata uri,
        address currency,
        uint256 amount,
        uint256 expiry
    ) public returns (uint256) {
        if (block.timestamp >= expiry) {
            revert Expired();
        }

        // Make security deposit equal to the trade amount
        IERC20(currency).transferFrom(msg.sender, address(this), amount);

        _id++;
        _trades[_id] = Trade(
            State.ACTIVE,
            msg.sender,
            uri,
            currency,
            amount,
            expiry,
            address(0),
            address(0),
            0
        );

        emit Wrap(_id, msg.sender, currency, amount, expiry);
    }

    // Buyer commits to a trade by making payment
    function commit(uint256 id) public {
        Trade storage trade = _trades[id];

        if (msg.sender == trade.seller) {
            revert Unauthorized();
        }

        if (trade.status != State.ACTIVE) {
            revert WrongState();
        }

        if (trade.expiry <= block.timestamp) {
            revert Expired();
        }

        IERC20(trade.currency).transferFrom(
            msg.sender,
            address(this),
            trade.amount * 2 // Deposit double the trade amount
        );

        trade.status = State.COMMITTED;
        trade.buyer = msg.sender;

        emit Commit(id, msg.sender, trade.currency, trade.amount);
    }

    // Allow seller to cancel a trade if no-one has committed yet
    function cancel(uint256 id) public {
        Trade storage trade = _trades[id];

        if (msg.sender != trade.seller) {
            revert Unauthorized();
        }

        if (trade.status == State.ACTIVE) {
            trade.status = State.VOID;
            // Return security deposit
            IERC20(trade.currency).transfer(trade.seller, trade.amount);
        }

        emit Cancel(id, trade.seller);
    }

    // Buyer and seller can both agree to have the trade cancelled and their funds returned.
    function void(uint256 id) public {
        Trade storage trade = _trades[id];

        if (trade.status != State.COMMITTED) {
            revert WrongState();
        }

        // Only buyer and seller can request voiding the trade
        if (msg.sender != trade.seller && msg.sender != trade.buyer) {
            revert Unauthorized();
        }

        // One party has already requested cancellation. Second party's approval needed.
        if (trade.voider == msg.sender) {
            revert Unauthorized();
        }

        // Set first party
        if (trade.voider == address(0)) {
            trade.voider = msg.sender;
            emit RequestVoidance(id, msg.sender);
            return;
        }

        // Second party approval received. Void trade and return security deposits.
        trade.status = State.VOID;

        IERC20(trade.currency).transfer(trade.seller, trade.amount);
        IERC20(trade.currency).transfer(trade.buyer, trade.amount * 2);

        emit Void(id, trade.buyer, trade.seller);
    }

    // Once the seller has dispatched the goods
    function sent(uint256 id) public {
        Trade storage trade = _trades[id];

        if (msg.sender != trade.seller) {
            revert Unauthorized();
        }

        if (trade.status != State.COMMITTED) {
            revert WrongState();
        }

        trade.status = State.SENT;

        emit Send(id);
    }

    // Once the buyer has receievd the goods
    function received(uint256 id) public {
        Trade storage trade = _trades[id];

        if (msg.sender != trade.buyer) {
            revert Unauthorized();
        }

        if (trade.status != State.COMMITTED && trade.status != State.SENT) {
            revert WrongState();
        }

        trade.status = State.RECEIVED;

        // Lock payouts for two weeks, and allow buyer to dispute within this period.
        // TODO: Fix unlocke time
        // trade.unlocks = block.timestamp + 14 days;
        trade.unlocks = block.timestamp + 90 seconds;

        emit Receive(id);
    }

    // Buyer can dispute the trade if they aren't satisfied with what they received
    function dispute(uint256 id) public {
        Trade storage trade = _trades[id];

        if (msg.sender != trade.buyer) {
            revert Unauthorized();
        }

        if (trade.status != State.RECEIVED) {
            // Trades can only be disputed once received
            revert WrongState();
        }

        if (block.timestamp >= trade.unlocks) {
            revert TooLate();
        }

        trade.status = State.DISPUTED;

        emit Dispute(id, msg.sender);
    }

    // Seller can accept the dispute and offer a solution
    function accept(uint256 id) public {
        Trade storage trade = _trades[id];

        if (msg.sender != trade.seller) {
            revert Unauthorized();
        }

        if (trade.status != State.DISPUTED) {
            revert WrongState();
        }

        // Remove void approval if exists
        if (trade.voider != address(0)) {
            trade.voider = address(0);
        }

        trade.status = State.COMMITTED;

        emit Accept(id);
    }

    // Seller can reject the dispute and have both deposits be re-distributed
    function reject(uint256 id) public {
        Trade storage trade = _trades[id];

        if (msg.sender != trade.seller) {
            revert Unauthorized();
        }

        if (trade.status != State.DISPUTED) {
            revert WrongState();
        }

        trade.status = State.CLOSED;

        // Re-distribute both escrows payments
        IERC20(trade.currency).transfer(beneficiary, trade.amount * 3);

        emit Reject(id);
    }

    function close(uint256 id) public {
        Trade storage trade = _trades[id];

        if (trade.status != State.RECEIVED) {
            revert WrongState();
        }

        if (msg.sender != trade.buyer && block.timestamp < trade.unlocks) {
            revert TooEarly();
        }

        trade.status = State.CLOSED;

        // Pay seller and return security deposits
        IERC20(trade.currency).transfer(trade.seller, trade.amount * 2);
        IERC20(trade.currency).transfer(trade.buyer, trade.amount);

        emit Close(id, trade.buyer, trade.seller, trade.currency, trade.amount);
    }

    function setBeneficiary(address beneficiary_) public onlyOwner {
        beneficiary = beneficiary_;
    }
}
