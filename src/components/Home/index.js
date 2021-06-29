import React, { useEffect, useRef, useState } from "react";
import Web3 from "web3";
import {
  Box,
  Button,
  TableContainer,
  Table,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
  Typography,
} from "@material-ui/core";

var web3 = new Web3(
  new Web3.providers.HttpProvider(
    "https://mainnet.infura.io/v3/8cc1643f02874b87b8cd2e9e4d8ecb38"
  )
);

let prevBlockNo = -1;

function Home() {
  const [blockNo, setBlockNo] = useState(-1);
  const [block, setBlock] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [updating, setUpdating] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [fetchingItem, setFetchingItem] = useState(false);
  const timer = useRef();

  useEffect(() => {
    if (updating) {
      getLatestBlock();
      timer.current = setInterval(getLatestBlock, 6000);
    } else {
      clearInterval(timer.current);
    }
    return () => {
      if (timer.current) {
        clearInterval(timer.current);
        timer.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [updating]);

  const handleClick = () => {
    setUpdating(!updating);
  };

  const getBlockInfo = async (blockNumber) => {
    let currentBlock = await web3.eth.getBlock(blockNumber);

    const transactionReqs = [];
    if (
      !currentBlock ||
      !currentBlock.transactions ||
      !currentBlock.transactions.length === 0
    ) {
      return;
    }
    setBlockNo(blockNumber);
    setBlock({
      id: currentBlock.number,
      totalDifficulty: currentBlock.totalDifficulty,
      totalTransactions: currentBlock.transactions.length,
      miner: currentBlock.miner,
    });
    setFetchingItem(true);
    setTransactions([]);
    for (
      let i = 0,
        ni =
          currentBlock.transactions.length > 50
            ? 50
            : currentBlock.transactions.length;
      i < ni;
      i++
    ) {
      if (blockNumber !== prevBlockNo) break;
      await transactionReqs.push(
        web3.eth.getTransactionFromBlock(blockNumber, i).then((value) => {
          if (value && updating) {
            const item = {
              id: value.hash,
              value: value.value,
              from: value.from,
              gas: value.gas,
              to: value.to,
            };
            appendTransaction(item, blockNumber);
          }
        })
      );
    }
    setFetchingItem(false);
  };

  const appendTransaction = (item, blockNumber) => {
    console.log("block Items:" + blockNumber);
    if (blockNumber !== prevBlockNo) return;
    setTransactions((value) => {
      const newTrans = [...value, item].sort((first, second) => {
        const delta = parseInt(first.value) - parseInt(second.value);
        if (delta < 0) return 1;
        if (delta > 0) return -1;
        return 0;
      });
      return newTrans;
    });
  };

  const getLatestBlock = async () => {
    if (fetching) {
      return;
    }
    setFetching(true);
    let latestBlockNo = await web3.eth.getBlockNumber();
    console.log("block fetched: " + latestBlockNo);
    if (
      !isNaN(latestBlockNo) &&
      parseInt(latestBlockNo) > parseInt(prevBlockNo)
    ) {
      prevBlockNo = latestBlockNo;
      getBlockInfo(latestBlockNo);
    }
    setFetching(false);
  };

  return (
    <Box p={2}>
      <Box>
        <Button
          variant="contained"
          color={updating ? "default" : "primary"}
          disableElevation
          onClick={handleClick}
        >
          {updating ? "Pause" : "Start"}
        </Button>
      </Box>
      <Box mt={1}>
        <Typography variant="h5">
          Block Number: {blockNo !== -1 ? blockNo : "__"}
        </Typography>
      </Box>
      <Box mt={1} border={1} borderColor="grey.300">
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Block No</TableCell>
                <TableCell>Total Transactions</TableCell>
                <TableCell>Miner</TableCell>
                <TableCell>Total Difficulty</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {block ? (
                <TableRow>
                  <TableCell>{block.id}</TableCell>
                  <TableCell>{block.totalTransactions}</TableCell>
                  <TableCell>{block.miner}</TableCell>
                  <TableCell>{block.totalDifficulty}</TableCell>
                </TableRow>
              ) : (
                <TableRow>
                  <TableCell colSpan={4}>
                    <center>No data</center>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
      <Box mt={3} border={1} borderColor="grey.300">
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>No</TableCell>
                <TableCell>From</TableCell>
                <TableCell>To</TableCell>
                <TableCell>Gas</TableCell>
                <TableCell>Value</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {transactions && transactions.length > 0 ? (
                transactions.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>{item.from}</TableCell>
                    <TableCell>{item.to}</TableCell>
                    <TableCell>{item.gas}</TableCell>
                    <TableCell>{item.value}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4}>
                    <center>{fetchingItem ? "Loading..." : "No data"}</center>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Box>
  );
}

export default Home;
