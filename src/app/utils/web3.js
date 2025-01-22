import { JsonRpcProvider, BrowserProvider, Contract } from 'ethers';
import PemilihanContract from '../contracts/Pemilihan.json';

let provider;
let contract;
let walletAddress;

const connectWallet = async () => {
    if (typeof window.ethereum !== "undefined") {
        try {
        // Request wallet connection
        const accounts = await window.ethereum.request({
            method: "eth_requestAccounts",
        });

        // Set wallet address
        walletAddress = accounts[0];

        // Optional: Set up Ethers provider
        // const provider = new ethers.providers.Web3Provider(window.ethereum);
        // const signer = provider.getSigner();
        // console.log("Signer:", signer);
        } catch (error) {
        console.error("Connection failed:", error);
        }
    } else {
        alert("MetaMask is not installed. Please install it to use this feature.");
    }
};

// Deteksi apakah MetaMask tersedia
if (typeof window !== 'undefined' && typeof window.ethereum !== 'undefined') {
    provider = new BrowserProvider(window.ethereum); // Provider untuk MetaMask
} else {
    provider = new JsonRpcProvider('http://127.0.0.1:8545'); // Default Hardhat node
}

// Fungsi untuk mengambil instance kontrak dengan signer
const getContractWithSigner = async () => {
    const signer = await provider.getSigner(); // Mendapatkan signer dari provider
    const network = await provider.getNetwork(); // Mendapatkan chainId
    const chainId = network.chainId.toString();

    // Pastikan jaringan yang sesuai dengan deploy
    if (!PemilihanContract.networks[chainId]) {
        throw new Error(`Kontrak tidak ditemukan di jaringan dengan chainId ${chainId}`);
    }

    const contractAddress = PemilihanContract.networks[chainId].address;
    contract = new Contract(contractAddress, PemilihanContract.abi, signer); // Menggunakan signer
    return contract;
};

// Fungsi untuk mengambil instance kontrak untuk read-only
const getContract = async () => {
    const network = await provider.getNetwork();
    const chainId = network.chainId.toString();

    if (!PemilihanContract.networks[chainId]) {
        throw new Error(`Kontrak tidak ditemukan di jaringan dengan chainId ${chainId}`);
    }

    const contractAddress = PemilihanContract.networks[chainId].address;
    contract = new Contract(contractAddress, PemilihanContract.abi, provider); // Menggunakan provider saja
    return contract;
};



export { provider, getContract, getContractWithSigner, connectWallet };
