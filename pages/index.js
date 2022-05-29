import { useEffect, useState } from "react";
import { ethers } from "ethers";
import { Button, Tooltip } from "@nextui-org/react";
import abi from "../artifacts/contracts/BuyMeACoffee.sol/BuyMeACoffee.json";

export default function Home() {
  const contractAddress = "0x5fbdb2315678afecb367f032d93f642f64180aa3";
  const contractABI = abi.abi;

  const [currentAccount, setCurrentAccount] = useState("");
  const [name, setName] = useState("");
  const [message, setMessage] = useState([]);
  const [memos, setMemos] = useState([]);

  const connectWallet = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        console.log("no metamask found");
      }

      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });

      setCurrentAccount(accounts[0]);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <main className="w-screen h-screen font-mono bg-gradient-to-r from-indigo-800 to-black	">
      <div className="flex w-full h-20 px-10 border-2 border-black justify-between items-center">
        <h1 className="text-3xl">Buy me a coffee!</h1>
        <Tooltip content="Only Metamask wallet is available" color="black" contentColor="secondary" placement="left">
          <Button onClick={connectWallet} color="secondary" auto ghost>
            Connect Wallet
          </Button>
        </Tooltip>
      </div>
    </main>
  );
}
