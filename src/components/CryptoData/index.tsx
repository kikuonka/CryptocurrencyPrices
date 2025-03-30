import { useQuery } from "@tanstack/react-query";
import axios from "axios";

const api = axios.create({
    baseURL: "https://api.coingecko.com/api/v3",
});

interface Crypto {
    id: string;
    symbol: string;
    name: string;
    image: string;
    current_price: number;
    market_cap_rank: number;
}

function CryptoData(page: number = 1, sortKey: string, sortOrder: string) {
    return useQuery<Crypto[], Error>({
        queryKey: ["cryptoData", page, sortKey, sortOrder],
        queryFn: async () => {
            const { data } = await api.get<Crypto[]>("/coins/markets", {
                params: {
                    vs_currency: "usd",
                    order: `${sortKey}_${sortOrder}`,
                    per_page: 10,
                    page,
                    sparkline: false,
                },
            });
            return data;
        },
        retry: 3,
        retryDelay: 1000,
    });
}

export default CryptoData;
