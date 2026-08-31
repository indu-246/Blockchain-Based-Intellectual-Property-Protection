// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract CreatorProof {

    struct Work {
        string title;
        address creator;
        uint256 timestamp;
    }

    mapping(bytes32 => Work) private works;
    mapping(bytes32 => bool) public registered;

    event WorkRegistered(
        bytes32 indexed fileHash,
        string title,
        address indexed creator,
        uint256 timestamp
    );

    function registerWork(
        bytes32 fileHash,
        string memory title
    ) public {
        require(
            !registered[fileHash],
            "File hash already registered"
        );

        works[fileHash] = Work({
            title: title,
            creator: msg.sender,
            timestamp: block.timestamp
        });

        registered[fileHash] = true;

        emit WorkRegistered(
            fileHash,
            title,
            msg.sender,
            block.timestamp
        );
    }

    function verifyWork(bytes32 fileHash)
        public
        view
        returns (
            bool exists,
            string memory title,
            address creator,
            uint256 timestamp
        )
    {
        require(
            registered[fileHash],
            "File hash not registered"
        );

        Work memory work = works[fileHash];

        return (
            true,
            work.title,
            work.creator,
            work.timestamp
        );
    }
}

