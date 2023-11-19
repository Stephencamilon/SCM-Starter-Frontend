import { useState, useEffect } from "react";
import { ethers } from "ethers";
import atm_abi from "../artifacts/contracts/Assessment.sol/Assessment.json";

export default function HomePage() {
  const [ethWallet, setEthWallet] = useState(undefined);
  const [account, setAccount] = useState(undefined);
  const [atm, setATM] = useState(undefined);
  const [balance, setBalance] = useState(undefined);
  const [amountInput, setAmountInput] = useState(1); // Default amount is 1
  const [errorMessage, setErrorMessage] = useState("");

  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  const atmABI = atm_abi.abi;

  const getWallet = async () => {
    if (window.ethereum) {
      setEthWallet(window.ethereum);
    }

    if (ethWallet) {
      const account = await ethWallet.request({ method: "eth_accounts" });
      handleAccount(account);
    }
  };

  const handleAccount = (account) => {
    if (account) {
      console.log("Account connected: ", account);
      setAccount(account);
    } else {
      console.log("No account found");
    }
  };

  const connectAccount = async () => {
    try {
      if (!ethWallet) {
        throw new Error("MetaMask wallet is required to connect");
      }

      const accounts = await ethWallet.request({ method: "eth_requestAccounts" });
      handleAccount(accounts);

      // once the wallet is set, we can get a reference to our deployed contract
      getATMContract();
    } catch (error) {
      setErrorMessage(error.message);
    }
  };

  const getATMContract = () => {
    const provider = new ethers.providers.Web3Provider(ethWallet);
    const signer = provider.getSigner();
    const atmContract = new ethers.Contract(contractAddress, atmABI, signer);

    setATM(atmContract);
  };

  const getBalance = async () => {
    try {
      if (atm) {
        setBalance((await atm.getBalance()).toNumber());
      }
    } catch (error) {
      setErrorMessage("Error getting balance: " + error.message);
    }
  };

  const deposit = async () => {
    try {
      if (atm) {
        let tx = await atm.deposit(amountInput);
        await tx.wait();
        getBalance();
      }
    } catch (error) {
      setErrorMessage("Error depositing: " + error.message);
    }
  };

  const withdraw = async () => {
    try {
      if (atm) {
        let tx = await atm.withdraw(amountInput);
        await tx.wait();
        getBalance();
      }
    } catch (error) {
      setErrorMessage("Error withdrawing: " + error.message);
    }
  };

  const burn = async () => {
    try {
      if (atm) {
        let tx = await atm.burn(amountInput);
        await tx.wait();
        getBalance();
      }
    } catch (error) {
      setErrorMessage("Error burning: " + error.message);
    }
  };

  const clearError = () => {
    setErrorMessage("");
  };

  const initUser = () => {
    // Check to see if the user has Metamask
    if (!ethWallet) {
      return <p>Please install Metamask to use this ATM.</p>;
    }

    // Check to see if the user is connected. If not, connect to their account
    if (!account) {
      return (
        <div>
          <button onClick={connectAccount}>
            Please connect your Metamask wallet
          </button>
          <p>{errorMessage}</p>
        </div>
      );
    }

    if (balance === undefined) {
      getBalance();
    }

    return (
      <div className="atm-container">
        <div className="account-info">
          <p>Your Account: {account}</p>
          <p>Your Balance: {balance}</p>
        </div>
        <div className="actions">
          <label>
            Amount:
            <input
              type="number"
              value={amountInput}
              onChange={(e) => setAmountInput(e.target.value)}
            />
          </label>
          <button onClick={deposit}>Deposit</button>
          <button onClick={withdraw}>Withdraw</button>
          <button onClick={burn}>Burn</button>
          <p>{errorMessage}</p>
        </div>
      </div>
    );
  };

  useEffect(() => {
    getWallet();
  }, []);

  useEffect(() => {
    // Clear error message on component mount and when account changes
    clearError();
  }, [account]);

  return (
    <main className="container">
      <header>
        <h1>Welcome to the Metacrafters ATM!</h1>
      </header>
      {initUser()}
      <style jsx>{`
        .container {
          text-align: center;
        }

        .atm-container {
          display: flex;
          justify-content: center;
          align-items: center;
          border: 2px solid green;
          padding: 20px;
          margin: 20px;
        }

        .account-info {
          text-align: left;
          margin-right: 20px;
        }

        .actions {
          text-align: right;
        }

        input {
          margin-right: 10px;
        }

        h1 {
          font-size: 24px;
          border-bottom: 2px solid green;
          padding-bottom: 10px;
          margin-bottom: 20px;
          position: relative;
        }

        h1:after {
          content: '';
          height: 2px;
          width: 100%;
          background-color: green;
          position: absolute;
          bottom: 0;
          left: 0;
        }
      `}</style>
    </main>
  );
}
