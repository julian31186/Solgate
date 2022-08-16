import './App.css';
import Papa from 'papaparse';
import React, { useState, useEffect } from "react";
import idl from './assets/idl.json'
import { Connection, PublicKey, clusterApiUrl, Keypair } from '@solana/web3.js';
import { AnchorProvider, Program, Provider, web3, utils } from '@project-serum/anchor';
import { seed } from '@project-serum/anchor/dist/cjs/idl';
const App = () => {

  const allowedExtensions = ["csv"];

  const [walletAddress, setWalletAddress] = useState(null);
  const [namesUsers, setnamesUsers] = useState([]);
  const [NftTitle, setNftTitle] = useState([]);
  const [NftSymbol, setNftSymbol] = useState([]);
  const [NftLink, setNftLink] = useState([]);

  const [seed,setSeed] = useState("");
  const [account, setAccount] = useState("");

  const [tableRows, setTableRows] = useState([]);
  const [values, setValues] = useState([]);
  const [recipients, setRecipients] = useState([]);
  const network = clusterApiUrl('devnet');
  const TOKEN_METADATA_PROGRAM_ID = new web3.PublicKey(
    "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s",
  );

  const opts = {
    preflightCommitment: "processed"
  }
  const programID = new PublicKey(idl.metadata.address);


  const CREATE_MINT_SEED = seed;

  const createWhitelist = async () => {
    const baseAccount = new PublicKey(walletAddress)
    const provider = getProvider();
    const program = new Program(idl, programID, provider);
      
		const [pda, _] = await PublicKey.findProgramAddress(
			[
				baseAccount.toBuffer(),
				Buffer.from(utils.bytes.utf8.encode(CREATE_MINT_SEED)),
			],
			program.programId,
		);
		const tx = await program.methods
			.createWhitelist(CREATE_MINT_SEED)
			.accounts({
				mainWhitelistingAccount: pda,
				authority: baseAccount.publicKey,
			})
			.rpc();
		console.log("Your transaction signature", tx);
    
  }

  

  const addWallet = async (value) => {

    try {
     const baseAccount = new PublicKey(walletAddress)
     const provider = getProvider();
     const program = new Program(idl, programID, provider);

     const key = new PublicKey(value)

     console.log("Key: ", key);
      console.log("Mint seed, ", CREATE_MINT_SEED);

     const [pda, _] = await PublicKey.findProgramAddress(
			[
				baseAccount.toBuffer(),
				Buffer.from(utils.bytes.utf8.encode(CREATE_MINT_SEED)),
			],
			program.programId,
      console.log(values)
		);
	
    
		const [new_pda, _1] = await PublicKey.findProgramAddress(
			[baseAccount.toBuffer(), key.toBuffer(), Buffer.from(utils.bytes.utf8.encode(CREATE_MINT_SEED))],
			program.programId,
		);
		const tx = await program.methods
			.addWallet(CREATE_MINT_SEED)
			.accounts({
				mainWhitelistingAccount: pda,
				whitelistedWallet: new_pda,
				authority: baseAccount.publicKey,
				user: key,
			})
			.rpc();
		console.log("Your transaction signature", tx);
    
 
  } catch (error)  {
    console.log("Error in whitelist add: ", error)
    
  }
 
  }

  const removeWallet = async (value) => {
    try {
      const baseAccount = new PublicKey(walletAddress)
      const provider = getProvider();
      const program = new Program(idl, programID, provider);

      const key = new PublicKey(value)

      console.log("Key: ", key);
      console.log("Mint seed: ", CREATE_MINT_SEED);

      const [pda, _] = await PublicKey.findProgramAddress(
			[
				baseAccount.toBuffer(),
				Buffer.from(utils.bytes.utf8.encode(CREATE_MINT_SEED)),
			],
			program.programId,
      console.log(values)
		);
	
    
    //generate pda of whitelisted account
		const [new_pda, _1] = await PublicKey.findProgramAddress(
			[baseAccount.toBuffer(), key.toBuffer()],
			program.programId,
		);

    const firstBalance = await provider.connection.getBalance(baseAccount);
    console.log("First Balance: ", firstBalance);

    //Remove wallet
		const tx = await program.methods
			.removeWallet(CREATE_MINT_SEED)
			.accounts({
				mainWhitelistingAccount: pda,
				whitelistedWallet: new_pda,
				authority: baseAccount.publicKey,
				user: key,
			})
			.rpc();
		console.log("Your transaction signature", tx);

    const finalBalance = await provider.connection.getBalance(baseAccount);
    console.log("Final Balance: ", finalBalance);
    

    }
    catch (error){
      console.log("Error in removing whitelist: ", error);
    }
  }

  const sendAddress = async () => {
    var recipients_length = recipients.length;
    for (var i = 0; i < recipients_length; i++) {
      console.log(i);


      console.log(recipients[i]);
      

      await addWallet(recipients[i]);

    }
  };
  function delay(time) {
    return new Promise(resolve => setTimeout(resolve, time));
  }




  const { SystemProgram, Keypair } = web3;
  const getProvider = () => {
    const connection = new Connection(network, opts.preflightCommitment);
    const provider = new AnchorProvider(
      connection, window.solana, opts.preflightCommitment,
    );
    return provider;
  }
  const checkIfWalletIsConnected = async () => {
    try {
      const { solana } = window;

      if (solana) {
        if (solana.isPhantom) {
          console.log('Phantom wallet found!');
          const response = await solana.connect({ onlyIfTrusted: true });
          console.log(
            'Connected with Public Key:',
            response.publicKey.toString()

          );
          setWalletAddress(response.publicKey.toString());
        }
      } else {
        alert('Solana object not found! Get a Phantom Wallet 👻');
      }
    } catch (error) {
      console.error(error);
    }
  };
  const connectWallet = async () => {
    const { solana } = window;

    if (solana) {
      const response = await solana.connect();
      console.log('Connected with Public Key:', response.publicKey.toString());
      setWalletAddress(response.publicKey.toString());
    }
  };
  const renderNotConnectedContainer = () => (
    <button
      className="cta-button connect-wallet-button"
      onClick={connectWallet}
    >
      Connect to Wallet
    </button>
  );
  
  function delay(time) {
    return new Promise(resolve => setTimeout(resolve, time));
  }

  useEffect(() => {
    const onLoad = async () => {
      await checkIfWalletIsConnected();
    };

    window.addEventListener('load', onLoad);
    return () => window.removeEventListener('load', onLoad);
  }, []);
 



  
  const changeHandler =  async (event) => {
    // Passing file data (event.target.files[0]) to parse using Papa.parse
    
    Papa.parse(event.target.files[0], {
      header: true,
      skipEmptyLines: true,
      complete: function (results) {
        const rowsArray = [];
        const valuesArray = [];
        var string = '';
        const names = [];
        const symbols = [];
        const recipients_to_send = [];
        const link = [];
        // Iterating data to get column name and their values
        results.data.map((d) => {
          rowsArray.push(Object.keys(d));

          
          valuesArray.push(Object.values(d));


          recipients_to_send.push(Object.values(d)[1]);
          names.push(Object.values(d)[0]);
          symbols.push(Object.values(d)[3]);
          link.push(Object.values(d)[2]);
          
        });
        
        setNftLink(link);
        setNftTitle(names);
        setNftSymbol(symbols);
        setTableRows(rowsArray[0]);
        setRecipients(recipients_to_send);
        setValues(valuesArray);
        setnamesUsers(names);
      
        //console.log(recipients);
        //console.log(string);
        //console.log(results.data);

        //console.log(rowsArray[0]);

        //console.log(valuesArray);
        
      },
      
    });
    // console.log(results.data);
    
    // console.log(values);
    // console.log(tableRows);
    // console.log("hello");
   
  };
 


  return (
  
    <div className="App">
      <div className={walletAddress ? 'authed-container' : 'container'}>

        <div className="header-container">
          <p className="header">Solana Whitelist</p>
          <p className="sub-text">
           Whitelist tool used to gate programs on the Solana Blockchain! 
          </p>
        </div>
        <div>{!walletAddress && renderNotConnectedContainer()}</div>
        <div>
        </div>
        
        
        <div style={{
          "display": "flex",
          "align-items" : "center",
          "justify-content" : "center"
        }}>
          <button style={{
          "background" : "-webkit-linear-gradient(left, #60c657, #35aee2)",
          "background-size" : "200% 200%",
          "animation" : "gradient-animation 4s ease infinite",
        }} className = "cta-button"  onClick={async () => {
            createWhitelist();
          }}>Create Whitelist</button>
          <input value={seed} onChange={(e) => setSeed(e.target.value)} placeholder="Whitelist Seed" style={{
          "margin" : "20px",
          "padding" : "10px"
        }} className=""></input>
        
          
        </div>

        <div>
          <button className = "cta-button button-to-send" onClick={async () => {
             sendAddress()
             
             //addWallet("4SgKWtwQU6mNBKRrEPKczPRhKXTGnKmfJ2jL2bKJfzbd");
          }}>Whitelist All Addresses in CSV</button>
        </div>

        <div style={{
          "display": "flex",
          "align-items" : "center",
          "justify-content" : "center"
        }}>
          <button style={{
          "background" : "-webkit-linear-gradient(left, #60c657, #35aee2)",
          "background-size" : "200% 200%",
          "animation" : "gradient-animation 4s ease infinite",
        }} className = "cta-button"  onClick={async () => {
            removeWallet(account);
          }}>Remove Whitelisted Account</button>
          <input value={seed} onChange={(e) => setSeed(e.target.value)} placeholder="Whitelist Seed" style={{
          "margin" : "20px",
          "padding" : "10px"
        }} className=""></input>
        <input value={account} onChange={(e) => setAccount(e.target.value)} placeholder="Account Seed" style={{
          "margin" : "20px",
          "padding" : "10px"
        }} className=""></input>

          
        </div>


        <div><p className="sub-text">
            Enter a csv file ✨
          </p>
          <input
        type="file"
        name="file"
        className="select-file"
        onChange={changeHandler}
        accept=".csv"
        style={{margin: "10px auto"}}
      />
          <br />
          <br />
          <table className= "styled-table">
     
        <thead className = "styled-table thead tr">
          <tr>
          {/* <p className="minus-text"> */}
          {/* <p className="sub-text"> */}
            {tableRows.map((rows, index) => {
              
              return <th className ="minus-text" key={index}>{rows}</th>;
            })}
          {/* </p> */}
          </tr>
        </thead>
        <tbody>
          {values.map((value, index) => {
            return (
              <tr key={index}>
                {value.map((val, i) => {
                  return <td className="minus-text" key={i}>{val}</td>;
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
        </div>
      </div>
    <div>
      {/* File Uploader */}
      
      
      {/* Table */}
     
      </div>
    </div>
  //   </Routes>
  // </Router>
 );
};

export default App;
