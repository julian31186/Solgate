import React, { useState, useEffect } from 'react'
import '../../App.css';

import idl from '../../assets/idl.json'
import { Connection, PublicKey, clusterApiUrl, Keypair } from '@solana/web3.js';
import { AnchorProvider, Program, Provider, web3, utils } from '@project-serum/anchor';

function Dashboard() {
    const [seed, setSeed] = useState("")
    const [walletAddress, setWalletAddress] = useState(null);
    const [pda, setPda] = useState("");
    const [isSeed, setIsSeed] = useState(false);
    const [addAddress, setAddAddress] = useState("")
    const [removeAddress, setRemoveAddress] = useState("")
    const [editAddress, setEditAddress] = useState("")
    const [changeAddress, setChangeAddress] = useState("")


    const opts = {
        preflightCommitment: "processed"
    }
    const programID = new PublicKey(idl.metadata.address);
    const network = clusterApiUrl('devnet');

    const searchWithSeed = async () => {
        const baseAccount = new PublicKey(walletAddress)
        const provider = getProvider();
        const program = new Program(idl, programID, provider);

        const [pda, _] = await PublicKey.findProgramAddress(
            [
                baseAccount.toBuffer(),
                Buffer.from(utils.bytes.utf8.encode(seed)),
            ],
            program.programId,
        );

        try {
            const txn = await program.account.mainWhiteListingAccount.fetch(pda);

        } catch (error) {
            console.log(error);
            return;
        }
        setPda(pda);
        // setSeed("")
        setIsSeed(true)
    }
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

    const addWhitelistWallet = async () => {
        const baseAccount = new PublicKey(walletAddress)
        const provider = getProvider();
        const program = new Program(idl, programID, provider);
        console.log(addAddress)
        const key = new PublicKey(addAddress);
        const [pda, _] = await PublicKey.findProgramAddress(
            [
                baseAccount.toBuffer(),
                Buffer.from(utils.bytes.utf8.encode(seed)),
            ],
            program.programId,
        );
        const [new_pda, _1] = await PublicKey.findProgramAddress(
            [baseAccount.toBuffer(), key.toBuffer()],
            program.programId,
        );
        const tx = await program.methods
            .addWallet(seed)
            .accounts({
                mainWhitelistingAccount: pda,
                whitelistedWallet: new_pda,
                authority: baseAccount,
                user: key,
            })
            .rpc();
        console.log("Your transaction signature", tx);
        setAddAddress("")
    }


    const editWhiteList = async () => {
        const baseAccount = new PublicKey(walletAddress)
        const provider = getProvider();
        const program = new Program(idl, programID, provider);
        const key = new PublicKey(editAddress);
        const newWalletAddress = new PublicKey(changeAddress);
        const [new_pda1, _2] = await PublicKey.findProgramAddress(
            [baseAccount.toBuffer(), newWalletAddress.toBuffer()],
            program.programId,
        );
        const [pda, _] = await PublicKey.findProgramAddress(
            [
                baseAccount.toBuffer(),
                Buffer.from(utils.bytes.utf8.encode(seed)),
            ],
            program.programId,
        );
        const [new_pda, _1] = await PublicKey.findProgramAddress(
            [baseAccount.toBuffer(), key.toBuffer()],
            program.programId,
        );
        const tx = await program.methods
            .editWallet(seed)
            .accounts({
                mainWhitelistingAccount: pda,
                whitelistedWallet: new_pda,
                authority: baseAccount,
                user: key,
                newWlAccount: new_pda1,
                newUser: newWalletAddress,
            })
            .rpc();

    }


    const renderDashboard = () => {
        return (<div
            style={{
                "display": "flex",
                "alignItems": "center",
                "justifyContent": "center"
            }}>
            <div>
                <button
                    className="cta-button "
                    onClick={async () => { await addWhitelistWallet() }}
                    style={{
                        "margin": "20px",
                        "color": "black"
                    }}
                >
                    Add to the WhiteList
                </button>
                <input value={addAddress} onChange={(e) => setAddAddress(e.target.value)}>
                </input>
            </div>
            <div>

            </div>
            <button
                className="cta-button "
                onClick={connectWallet}
                style={{
                    "margin": "20px",
                    "color": "black"
                }}
            >
                Remove From the whitelist
            </button>
            <input value={removeAddress} onChange={(e) => setRemoveAddress(e.target.value)}></input>
            <div>
                <button
                    className="cta-button  "
                    style={{
                        "margin": "20px",
                        "color": "black"
                    }}

                >
                    Edit From the whitelist
                </button>
                <input value={editAddress} onChange={(e) => setEditAddress(e.target.value)}></input>
                <input value={changeAddress} onChange={(e) => changeAddress(e.target.value)}></input>
            </div>

        </div>

        )

        // <>

        //     <button
        //         className="cta-button connect-wallet-button"
        //         onClick={connectWallet}
        //     >
        //         Connect to Wallet
        //     </button> <button
        //         className="cta-button connect-wallet-button"
        //         onClick={connectWallet}
        //     >
        //         Connect to Wallet
        //     </button>
        // </>
    }

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

    return (
        <div className='App'>
            <div>{!walletAddress && renderNotConnectedContainer()}</div>

            <div>
                <input value={seed} onChange={(e) => setSeed(e.target.value)}></input>
                <button onClick={async () => { await searchWithSeed() }}>Search Your Whitelist</button>
            </div>
            <div style={{
                "display": "flex",
                "alignItems": "center",
                "justifyContent": "center"
            }}>
                {pda && renderDashboard()}
            </div>
        </div>
    )
}

export default Dashboard