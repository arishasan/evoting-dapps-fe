'use client'

import { useState, useEffect } from 'react';
import { getContractWithSigner, getContract, connectWallet } from '../utils/web3';
import { BrowserProvider, JsonRpcProvider } from "ethers";

const VoteCandidate = () => {
    const [candidates, setCandidates] = useState([]);
    const [selectedCandidateId, setSelectedCandidateId] = useState(null);
    const [hasVoted, setHasVoted] = useState(false);
    const [isConnected, setIsConnected] = useState(false);
    const [acc, setAccount] = useState(null);


    const checkConnectionAndFetchCandidates = async () => {

        let provider;
        let accounts = [];

        if (typeof window !== 'undefined' && typeof window.ethereum !== 'undefined') {
            // Menggunakan MetaMask jika tersedia
            provider = new BrowserProvider(window.ethereum);
            accounts = await provider.send('eth_accounts', []);
        } else {
            // Menggunakan provider bawaan Hardhat jika MetaMask tidak tersedia
            // provider = new ethers.providers.JsonRpcProvider('http://127.0.0.1:8545'); // Default hardhat node
            provider = new JsonRpcProvider("http://127.0.0.1:8545"); // Default hardhat node
            accounts = await provider.listAccounts(); // Mengambil daftar akun dari Hardhat
        }
        
        setAccount(accounts);
        setIsConnected(accounts.length > 0);
        if (accounts.length > 0) {
            const contract = await getContract();
            const voted = await contract.votedornot(accounts[0]);
            setHasVoted(voted);

            const jumlahKandidat = await contract.jumlahKandidat();
            let candidateList = [];
            for (let i = 1; i <= jumlahKandidat; i++) {
                const kandidat = await contract.kandidat(i);
                candidateList.push(kandidat);
            }
            setCandidates(candidateList);
        }
    };

    useEffect(() => {
        connectWallet();
        checkConnectionAndFetchCandidates();
    }, []);
        
    const voteCandidate = async () => {
        if (selectedCandidateId === null) {
        alert('Mohon pilih kandidat!');
        return;
        }
        let userAddress;
        const contract = await getContractWithSigner();

        // Periksa apakah akun berupa objek atau string
        if (typeof acc[0] === 'string') {
        userAddress = acc[0]; // MetaMask mengembalikan string
        } else {
        userAddress = acc[0].address; // Hardhat JsonRpcProvider mengembalikan objek
        }

        try {

            // .call({ from: userAddress })
            const tx = await contract.Vote(selectedCandidateId); // Mengirim transaksi
            await tx.wait(); // Tunggu hingga transaksi selesai
            alert('Berhasil melakukan voting!');
            setHasVoted(true);
            checkConnectionAndFetchCandidates();
        } catch (err) {
            console.error(err);
            alert('Gagal melakukan voting!');
        }
    };

  if (!isConnected)
    return <p className="text-center text-red-500">Cek koneksi anda ke Metamask / Hardhat Server.</p>;

  if (hasVoted)
    return (
      <div className="shadow-lg rounded-md">
        <p className="text-green-500 text-sm">
            Terima kasih atas partisipasi anda!
        </p>
        <h2 className="text-xl font-bold mb-4">Perolehan Suara Saat Ini</h2>
        <div className="grid grid-cols-3 gap-4">
            {candidates.map((candidate) => (
                <div
                key={candidate.id}
                className="flex flex-col items-center p-4 border rounded-lg shadow-md"
                >
                <img
                    src="https://img.icons8.com/ultraviolet/80/user.png"
                    alt="Candidate"
                    className="mb-4 w-20 h-20"
                />
                <label
                    htmlFor={`candidate-${candidate.id}`}
                    className="text-center font-semibold"
                >
                    {candidate.nama}
                </label>
                <small
                    htmlFor={`candidate-${candidate.id}`}
                    className="text-center mb-2 text-sm"
                >
                    Jumlah Suara : {candidate.count}
                </small>
                </div>
            ))}
            </div>
      </div>
    );

  return (
    <div className="shadow-lg rounded-md">
      <h2 className="text-xl font-bold mb-4">Silahkan Pilih Kandidat</h2>
      <form>
        <div className="grid grid-cols-3 gap-4">
            {candidates.map((candidate) => (
                <div
                key={candidate.id}
                className="flex flex-col items-center p-4 border rounded-lg shadow-md"
                >
                <img
                    src="https://img.icons8.com/ultraviolet/80/user.png"
                    alt="Candidate"
                    className="mb-4 w-20 h-20"
                />
                <label
                    htmlFor={`candidate-${candidate.id}`}
                    className="text-center font-semibold mb-2"
                >
                    {candidate.nama}
                </label>
                <input
                    type="radio"
                    id={`candidate-${candidate.id}`}
                    name="candidate"
                    value={candidate.id}
                    className="mt-2"
                    onChange={() => setSelectedCandidateId(candidate.id)}
                />
                </div>
            ))}
            </div>
            <button
            type="button"
            onClick={voteCandidate}
            className="mt-6 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
            >
            Vote
            </button>

      </form>
    </div>
  );
};

export default VoteCandidate;