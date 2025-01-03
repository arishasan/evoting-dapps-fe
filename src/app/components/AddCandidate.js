'use client'

// import ethers from 'ethers';
import { BrowserProvider, JsonRpcProvider } from "ethers";
import { useState, useEffect } from 'react';
import { getContractWithSigner, getContract } from '../utils/web3';

const AddCandidate = () => {

  const [name, setName] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [userAddress, setUserAddress] = useState('');
  const [candidates, setCandidates] = useState([]);
  const [jumlahKandidat, setJumlahKandidat] = useState(0);

  // Alamat admin yang diizinkan
  const adminAddress = '0x70997970C51812dc3A010C7d01b50e0d17dc79C8';
//   const adminAddress = '0xA8Ea0a8121B355169FC8aeB02e4D0476E66b9b9e'; // Alamat user metamask
//   const adminAddress = '0x70997970C51812dc3A010C7d01b50e0d17dc79C8'; // Alamat user hardhat

  useEffect(() => {
    const callAll = async () => {
        await fetchCandidates();
    }
    const checkAdmin = async () => {
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
        
        if (accounts.length > 0) {
            
            let userAddress;
            const contract = await getContractWithSigner();

            // Periksa apakah akun berupa objek atau string
            if (typeof accounts[0] === 'string') {
            userAddress = accounts[0]; // MetaMask mengembalikan string
            } else {
            userAddress = accounts[0].address; // Hardhat JsonRpcProvider mengembalikan objek
            }

            setUserAddress(userAddress); // Simpan alamat pengguna
            setIsAdmin(userAddress.toLowerCase() === adminAddress.toLowerCase()); // Perbandingan dengan admin

            const jumlah = await contract.jumlahKandidat(); // Ambil jumlah kandidat
            setJumlahKandidat(Number(jumlah));

        } else {
            console.log('Tidak ada akun yang terdeteksi!');
        }
    };
    checkAdmin();
    callAll();
  }, []);

  const fetchCandidates = async () => {
    const contract = await getContract();
    const jumlahKandidat = await contract.jumlahKandidat();
      let candidateList = [];
      for (let i = 1; i <= jumlahKandidat; i++) {
        const kandidat = await contract.kandidat(i);
        candidateList.push(kandidat);
      }
      setCandidates(candidateList);
  };

  const handleAddCandidate = async () => {
    if (name) {
        // await tambahKandidat(name); // Panggil fungsi tambahKandidat dari web3.js

        // if (jumlahKandidat >= 5) {
        //     alert('Maksimal hanya bisa menambahkan 5 kandidat saja!');
        //     return;
        // }
        try {
            const contract = await getContractWithSigner();
            const tx = await contract.addKandidat(name); // Mengirim transaksi
            await tx.wait(); // Tunggu hingga transaksi selesai
            alert('Berhasil menambahkan kandidat baru!');
            setName(''); // Reset input setelah berhasil menambahkan
            await fetchCandidates();
        } catch (err) {
            console.error(err);
            alert('Gagal menambahkan kandidat baru!');
        }

    } else {
      alert('Masukkan nama kandidat');
    }
  };

  if (!isAdmin)
    return (
      <p className="text-center text-red-500">
        Mohon maaf, hanya akun admin saja yang bisa mengakses halaman ini.
      </p>
    );

  return (
    <div className="shadow-lg rounded-md">

        <h2 className="text-xl font-bold mb-4">Data</h2>
        <ul className="space-y-2">
            {candidates.map((candidate, index) => (
            <li
                key={index}
            >
                <span>- {candidate.nama}</span>
            </li>
            ))}
        </ul>

        <br/>
        <h2 className="text-xl font-bold mb-4">Form</h2>
        <input
            type="text"
            placeholder="Nama Kandidat Baru"
            className="w-full p-2 border rounded-md text-black mb-4"
            value={name}
            onChange={(e) => setName(e.target.value)}
        />
        <button
            onClick={handleAddCandidate}
            className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600"
        >
            Tambah Kandidat
        </button>
    </div>
  );
};

export default AddCandidate;