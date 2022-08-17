import React, { useState, useEffect, useRef } from 'react'
import '../../App.css';

import idl from '../../assets/idl.json'
import { Connection, PublicKey, clusterApiUrl, Keypair } from '@solana/web3.js';
import { AnchorProvider, Program, Provider, web3, utils } from '@project-serum/anchor';
import { useNavigate } from 'react-router-dom';
import { CToast, CToastBody, CToaster, CToastHeader } from '@coreui/react';
import '@coreui/coreui/dist/css/coreui.min.css'

function Dashboard() {
    const [seed, setSeed] = useState("")
    const [walletAddress, setWalletAddress] = useState(null);
    const [pda, setPda] = useState("");
    const [isSeed, setIsSeed] = useState(false);
    const [addAddress, setAddAddress] = useState("")
    const [removeAddress, setRemoveAddress] = useState("")
    const [editAddress, setEditAddress] = useState("")
    const [changeAddress, setChangeAddress] = useState("")
    const [account, setAccount] = useState("");
    const [ifWhitelisted, setIfWhitelisted] = useState("");
    const [toast, addToast] = useState(0)
    const toaster = useRef()
    const exampleToast = (message, action) => {
        return (<CToast>
            <CToastHeader closeButton>
                <svg
                    className="rounded me-2"
                    width="20"
                    height="20"
                    xmlns="http://www.w3.org/2000/svg"
                    preserveAspectRatio="xMidYMid slice"
                    focusable="false"
                    role="img"
                >
                    <rect width="100%" height="100%" fill="#007aff"></rect>
                </svg>
                <strong className="me-auto">Message From Solana Whitelisting</strong>
                <small>{action}</small>
            </CToastHeader>
            <CToastBody>{message}</CToastBody>
        </CToast>)
    }

    const navigate = useNavigate();

    const opts = {
        preflightCommitment: "processed"
    }
    const programID = new PublicKey(idl.metadata.address);
    const network = clusterApiUrl('devnet');

    const handleDash = () => {
        navigate("/");
    };

    const searchWithSeed = async () => {
        if (walletAddress === null) return;

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
            const message = "Sorry you have entered wrong seed no whitelist exists"
            const action = "Error"
            addToast(exampleToast(message, action));
            setPda("");
            setSeed("")
            return;
        }
        setPda(pda);
        const message = "Yayy, we found your whitelist you can now see and make changes"
        const action = "information"
        addToast(exampleToast(message, action));
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
            [baseAccount.toBuffer(), key.toBuffer(), Buffer.from(utils.bytes.utf8.encode(seed))],
            program.programId,
        );
        try {
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
            const message = "Yayy, we were able to add that wallet"
            const action = "information"
            addToast(exampleToast(message, action));
            setRemoveAddress("")

        }

        catch (error) {
            console.log("Error in removing whitelist: ", error);
            const message = "Sorry, the account has already been whitelisted"
            const action = "Error"

            addToast(exampleToast(message, action));
            setRemoveAddress("")

        }

    }

    const removeWallet = async (value) => {
        try {
            const baseAccount = new PublicKey(walletAddress)
            const provider = getProvider();
            const program = new Program(idl, programID, provider);

            const key = new PublicKey(value)

            console.log("Key: ", key);
            console.log("Mint seed: ", seed);

            const [pda, _] = await PublicKey.findProgramAddress(
                [
                    baseAccount.toBuffer(),
                    Buffer.from(utils.bytes.utf8.encode(seed)),
                ],
                program.programId,
                console.log(value)
            );


            //generate pda of whitelisted account
            const [new_pda, _1] = await PublicKey.findProgramAddress(
                [baseAccount.toBuffer(), key.toBuffer(), Buffer.from(utils.bytes.utf8.encode(seed))],
                program.programId,
            );

            const firstBalance = await provider.connection.getBalance(baseAccount);
            console.log("First Balance: ", firstBalance);

            //Remove wallet
            const tx = await program.methods
                .removeWallet(seed)
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
            const message = "Yayy, we were able to remove that wallet"
            const action = "information"
            addToast(exampleToast(message, action));
            setRemoveAddress("")

        }
        catch (error) {
            console.log("Error in removing whitelist: ", error);
            const message = "Sorry, the account has not been whitelisted"
            const action = "Error"

            addToast(exampleToast(message, action));
            setRemoveAddress("")

        }
    }



    const editWhiteList = async () => {
        const baseAccount = new PublicKey(walletAddress)
        const provider = getProvider();
        const program = new Program(idl, programID, provider);
        const key = new PublicKey(editAddress);
        const newWalletAddress = new PublicKey(changeAddress);
        const [new_pda1, _2] = await PublicKey.findProgramAddress(
            [baseAccount.toBuffer(), newWalletAddress.toBuffer(), Buffer.from(utils.bytes.utf8.encode(seed))],
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
            [baseAccount.toBuffer(), key.toBuffer(), Buffer.from(utils.bytes.utf8.encode(seed))],
            program.programId,
        );
        try {
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

            console.log(tx);
            const message = "Yaay, the account is changed"
            const action = "Information"

            addToast(exampleToast(message, action));
        } catch (error) {
            console.log(error);
            const message = "Sorry, the account has not been whitelisted"
            const action = "Error"

            addToast(exampleToast(message, action));
        }
    }

    const checkIfWhiteListed = async () => {
        const baseAccount = new PublicKey(walletAddress)
        const provider = getProvider();
        const program = new Program(idl, programID, provider);
        const key = new PublicKey(ifWhitelisted);

        const [pda, _] = await PublicKey.findProgramAddress(
            [
                baseAccount.toBuffer(),
                Buffer.from(utils.bytes.utf8.encode(seed)),
            ],
            program.programId,
        );
        // const mainWhitelistingAccount =
        // 	await program.account.mainWhiteListingAccount.fetch(pda);
        // console.log(mainWhitelistingAccount.counter);
        const [new_pda, _1] = await PublicKey.findProgramAddress(
            [baseAccount.toBuffer(), key.toBuffer(), Buffer.from(utils.bytes.utf8.encode(seed))],
            program.programId,
        );

        try {
            const tx = await program.methods
                .checkWallet(seed)
                .accounts({
                    mainWhitelistingAccount: pda,
                    whitelistedWallet: new_pda,
                    authority: baseAccount,
                    user: key,
                })
                .rpc();
            const message = "Yaay, the account is whitelisted"
            const action = "Information"

            addToast(exampleToast(message, action));
            console.log(tx);
        } catch (error) {
            console.log(error);
            const message = "Sorry, the account has not been whitelisted"
            const action = "Error"

            addToast(exampleToast(message, action));
        }

    }

    const renderDashboard = () => {
        return (

            <div
                style={{

                    "alignItems": "center",
                    "justifyContent": "center"
                }}>

                <div>
                    <button
                        className="cta-button "
                        onClick={async () => { await addWhitelistWallet() }}
                        style={{
                            "background": "-webkit-linear-gradient(left, #60c657, #35aee2)",
                            "margin": "20px",
                            "color": "white",
                            "background-size": "200% 200%",
                            "animation": "gradient-animation 4s ease infinite",

                        }}
                    >
                        Add to the WhiteList
                    </button>
                    <input placeholder="Add" value={addAddress} onChange={(e) => setAddAddress(e.target.value)}>
                    </input>
                </div>
                <div>

                    <button
                        className="cta-button "
                        onClick={async () => { removeWallet(removeAddress) }}
                        style={{
                            "background": "-webkit-linear-gradient(left, #60c657, #35aee2)",
                            "margin": "20px",
                            "color": "white",
                            "background-size": "200% 200%",
                            "animation": "gradient-animation 4s ease infinite",
                        }}
                    >
                        Remove Address
                    </button>
                    <input placeholder="Remove" value={removeAddress} onChange={(e) => setRemoveAddress(e.target.value)}></input>
                </div>
                <div>

                    <button
                        className="cta-button "
                        onClick={async () => { await checkIfWhiteListed() }}
                        style={{
                            "background": "-webkit-linear-gradient(left, #60c657, #35aee2)",
                            "margin": "20px",
                            "color": "white",
                            "background-size": "200% 200%",
                            "animation": "gradient-animation 4s ease infinite",
                        }}
                    >
                        Check if Whietlisted
                    </button>
                    <input placeholder="Check if whitelisted" value={ifWhitelisted} onChange={(e) => setIfWhitelisted(e.target.value)}></input>
                </div>

                <div>
                    <button
                        className="cta-button  "
                        style={{
                            "background": "-webkit-linear-gradient(left, #60c657, #35aee2)",
                            "margin": "20px",
                            "color": "white",
                            "background-size": "200% 200%",
                            "animation": "gradient-animation 4s ease infinite",

                        }}
                        onClick={async () => { await editWhiteList() }}
                    >
                        Edit From the whitelist
                    </button>
                    <input placeholder="Address 1" value={editAddress} onChange={(e) => setEditAddress(e.target.value)}></input>
                    <input placeholder="New Address" value={changeAddress} onChange={(e) => setChangeAddress(e.target.value)}></input>
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
            <div style={{
                "margin-top": "13rem",
            }}>{!walletAddress && renderNotConnectedContainer()}</div>
            <CToaster ref={toaster} push={toast} placement="top-end" />
            <div>
                <button onClick={handleDash} className="cta-button" style={{
                    "background": "-webkit-linear-gradient(left, #60c657, #35aee2)",
                    "margin": "20px",
                    "color": "white",
                    "background-size": "200% 200%",
                    "animation": "gradient-animation 4s ease infinite",

                }}>Home</button>
                <h1 style={{
                    "color": "white",
                }}>Dashboard</h1>
                <input placeholder="Search" value={seed} onChange={(e) => setSeed(e.target.value)}></input>
                <button className="cta-button" style={{
                    "background": "-webkit-linear-gradient(left, #60c657, #35aee2)",
                    "background-size": "200% 200%",
                    "animation": "gradient-animation 4s ease infinite",

                }}
                    onClick={async () => { await searchWithSeed() }}>Search Your Whitelist</button>
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