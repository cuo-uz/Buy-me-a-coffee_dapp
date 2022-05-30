import { useEffect, useState, useRef } from "react";
import { ethers } from "ethers";
import Image from "next/image";
import { Input, Button, Tooltip, Textarea, Loading } from "@nextui-org/react";
import HeartIcon from "../assets/Heart.svg";
import abi from "../utils/BuyMeACoffee.json";

const Heart = (
  <span className="ml-1 flex items-center">
    <Image src={HeartIcon} width={20} height={20} alt="heart icon" />
  </span>
);

const cu_ouz = (
  <span className="text-indigo-400">
    <a href="https://twitter.com/cu_ouz" target="_blank" rel="noreferrer">
      @cu_ouz
    </a>
  </span>
);

export default function Home() {
  const contractAddress = "0xcbB94ca95bfc294DFEE4eDB422194A86238f7416";
  const contractABI = abi.abi;

  const [metamaskIsNotAvailable, setMetamaskIsNotAvailable] = useState(false);
  const [isLogged, setIsLogged] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentAccount, setCurrentAccount] = useState("");
  const [name, setName] = useState("");
  const [message, setMessage] = useState([]);
  const [memos, setMemos] = useState([]);

  const nameRef = useRef();
  const messageRef = useRef();

  useEffect(() => {
    let buyMeACoffee;
    isWalletConnected();
    getMemos();

    const onNewMemo = (from, timestamp, name, message) => {
      setMemos((prevState) => [
        ...prevState,
        {
          address: from,
          timestamp: new Date(timestamp * 1000),
          message: message,
          name: name,
        },
      ]);
    };

    const { ethereum } = window;

    // Listen for new memo events.
    if (ethereum) {
      const provider = new ethers.providers.Web3Provider(ethereum, "any");
      const signer = provider.getSigner();
      buyMeACoffee = new ethers.Contract(contractAddress, contractABI, signer);

      buyMeACoffee.on("NewMemo", onNewMemo);
    }

    return () => {
      if (buyMeACoffee) {
        buyMeACoffee.off("NewMemo", onNewMemo);
      }
    };
  }, []);

  const onNameChange = (event) => {
    setName(event.target.value);
  };

  const onMessageChange = (event) => {
    setMessage(event.target.value);
  };

  const connectWallet = async () => {
    try {
      if (isLogged) {
        setIsLogged(false);
        setCurrentAccount("");
      } else {
        const { ethereum } = window;

        const accounts = await ethereum.request({
          method: "eth_requestAccounts",
        });

        setCurrentAccount(accounts[0]);
        setIsLogged(true);

        refreshPage();
      }
    } catch (error) {
      console.log(error);
    }
  };

  const refreshPage = () => {
    window.location.reload();
  };

  const isWalletConnected = async () => {
    try {
      const { ethereum } = window;

      const accounts = await ethereum.request({ method: "eth_accounts" });

      //Check if metamask is installed in the browser
      if (!ethereum) {
        setMetamaskIsNotAvailable(true);
      } else if (accounts.length > 0) {
        setIsLogged(true);
      } else {
        setIsLogged(false);
      }
    } catch (error) {
      console.log("error: ", error);
    }
  };

  const handleCoffee = (ether) => {
    setLoading(true);
    buyCoffee(ether);
  };

  const buyCoffee = async (ether) => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum, "any");
        const signer = provider.getSigner();
        const buyMeACoffee = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        );

        const coffeeTxn = await buyMeACoffee.buyCoffee(
          name ? name : "Anonymous",
          message ? message : "Enjoy your coffee!",
          { value: ethers.utils.parseEther(ether) }
        );

        await coffeeTxn.wait();

        setName("");
        setMessage("");
        nameRef.current.value = "";
        messageRef.current.value = "";
        setLoading(false);
      }
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  };

  // Function to fetch all memos stored on-chain.
  const getMemos = async () => {
    try {
      const { ethereum } = window;

      const provider = new ethers.providers.Web3Provider(ethereum);
      const signer = provider.getSigner();
      const buyMeACoffee = new ethers.Contract(
        contractAddress,
        contractABI,
        signer
      );

      const memos = await buyMeACoffee.getMemos();
      setMemos(memos);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <main className="flex flex-col w-full h-100 text-white font-mono bg-gradient-to-b from-black to-purple-900	">
      <div className="flex h-20 mx-10 py-10 mb-3 border-b border-gray-400 justify-between items-center">
        <h1 className="text-3xl ">Buy me a coffee!</h1>
        <Tooltip
          content="Only Metamask wallet is available"
          color="black"
          contentColor="secondary"
          placement="left"
        >
          <Button
            disabled={metamaskIsNotAvailable}
            onClick={connectWallet}
            color="secondary"
            auto
            ghost
          >
            {isLogged ? "Log out" : "Connect Wallet"}
          </Button>
        </Tooltip>
      </div>
      <p className="text-sm  mx-10">
        This web is under development, make sure to connect the Goerli Ethereum
        testnet
      </p>
      <div className="flex h-[28.125rem] mx-16 gap-28 justify-between p-5 items-center">
        <div className="flex flex-col gap-6 justify-start items-center h-full w-1/2">
          <Input
            underlined
            aria-labelledby="Name"
            width="320px"
            status="secondary"
            placeholder="Your name"
            onChange={onNameChange}
            ref={nameRef}
          />
          <Textarea
            bordered
            aria-labelledby="Message"
            width="320px"
            color="secondary"
            status="secondary"
            placeholder="Leave a message :)"
            borderWeight="light"
            minRows={7}
            maxRows={7}
            onChange={onMessageChange}
            ref={messageRef}
          />
          {isLogged && !loading ? (
            <div className="flex flex-col gap-3">
              <Button onClick={() => handleCoffee("0.001")} color="warning">
                Send a coffee for 0.001 ETH {Heart}
              </Button>
              <Button onClick={() => handleCoffee("0.005")} color="secondary">
                Send a big coffee for 0.005 ETH {Heart}
              </Button>
              <Button
                onClick={() => handleCoffee("0.01")}
                color="gradient"
                shadow
              >
                Send a mega coffee for 0.01 ETH {Heart}
              </Button>
            </div>
          ) : isLogged && loading ? (
            <Button color="gradient" shadow>
              <Loading color="currentColor" size="xs" />{" "}
              <span className="text-xs pl-2">Loading transaction</span>
            </Button>
          ) : (
            <Button color="secondary" shadow>
              Sign in
            </Button>
          )}
        </div>
        <div className="flex flex-col gap-4 h-full px-4 pb-4 w-1/2">
          <h2 className="text-xl border-b border-gray-400">Coffess received</h2>
          <div className="flex flex-col overflow-y-scroll h-full scrollbar scrollbar-thumb-gray-400 scrollbar-track-transparent scrollbar-medium">
            {memos &&
              memos.map((memo, index) => {
                return (
                  <div key={index}>
                    <h3 className="text-base mb-4">
                      {memo.name} send a coffee ☕💞
                    </h3>
                    <p className="text-sm">
                      {memo.message === ""
                        ? memo.message
                        : `>> ${memo.message}`}
                    </p>
                    <p className="my-6 mx-12 border-b border-gray-400" />
                  </div>
                );
              })}
          </div>
        </div>
      </div>
      <div className="flex flex-col h-16 mx-10 text-xs border-t border-gray-400 justify-center items-center">
        <p className="mt-2">This web was made by {cu_ouz}</p>
        <a
          href="https://github.com/cuo-uz/Buy-me-a-coffee_dapp"
          target="_blank"
          rel="noreferrer"
        >
          <svg
            className="w-6 my-2 cursor-pointer"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 496 512"
          >
            <path d="M165.9 397.4c0 2-2.3 3.6-5.2 3.6-3.3.3-5.6-1.3-5.6-3.6 0-2 2.3-3.6 5.2-3.6 3-.3 5.6 1.3 5.6 3.6zm-31.1-4.5c-.7 2 1.3 4.3 4.3 4.9 2.6 1 5.6 0 6.2-2s-1.3-4.3-4.3-5.2c-2.6-.7-5.5.3-6.2 2.3zm44.2-1.7c-2.9.7-4.9 2.6-4.6 4.9.3 2 2.9 3.3 5.9 2.6 2.9-.7 4.9-2.6 4.6-4.6-.3-1.9-3-3.2-5.9-2.9zM244.8 8C106.1 8 0 113.3 0 252c0 110.9 69.8 205.8 169.5 239.2 12.8 2.3 17.3-5.6 17.3-12.1 0-6.2-.3-40.4-.3-61.4 0 0-70 15-84.7-29.8 0 0-11.4-29.1-27.8-36.6 0 0-22.9-15.7 1.6-15.4 0 0 24.9 2 38.6 25.8 21.9 38.6 58.6 27.5 72.9 20.9 2.3-16 8.8-27.1 16-33.7-55.9-6.2-112.3-14.3-112.3-110.5 0-27.5 7.6-41.3 23.6-58.9-2.6-6.5-11.1-33.3 2.6-67.9 20.9-6.5 69 27 69 27 20-5.6 41.5-8.5 62.8-8.5s42.8 2.9 62.8 8.5c0 0 48.1-33.6 69-27 13.7 34.7 5.2 61.4 2.6 67.9 16 17.7 25.8 31.5 25.8 58.9 0 96.5-58.9 104.2-114.8 110.5 9.2 7.9 17 22.9 17 46.4 0 33.7-.3 75.4-.3 83.6 0 6.5 4.6 14.4 17.3 12.1C428.2 457.8 496 362.9 496 252 496 113.3 383.5 8 244.8 8zM97.2 352.9c-1.3 1-1 3.3.7 5.2 1.6 1.6 3.9 2.3 5.2 1 1.3-1 1-3.3-.7-5.2-1.6-1.6-3.9-2.3-5.2-1zm-10.8-8.1c-.7 1.3.3 2.9 2.3 3.9 1.6 1 3.6.7 4.3-.7.7-1.3-.3-2.9-2.3-3.9-2-.6-3.6-.3-4.3.7zm32.4 35.6c-1.6 1.3-1 4.3 1.3 6.2 2.3 2.3 5.2 2.6 6.5 1 1.3-1.3.7-4.3-1.3-6.2-2.2-2.3-5.2-2.6-6.5-1zm-11.4-14.7c-1.6 1-1.6 3.6 0 5.9 1.6 2.3 4.3 3.3 5.6 2.3 1.6-1.3 1.6-3.9 0-6.2-1.4-2.3-4-3.3-5.6-2z" />
          </svg>
        </a>
      </div>
    </main>
  );
}
