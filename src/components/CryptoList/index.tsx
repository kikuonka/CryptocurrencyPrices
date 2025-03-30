import { useState } from "react";
import CryptoData from "../CryptoData";
import styles from "./index.module.css";

type Crypto = {
    id: string;
    symbol: string;
    name: string;
    image: string;
    current_price: number;
    market_cap_rank: number;
};

function CryptoList() {
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState("");
    const [sortKey, setSortKey] = useState<keyof Crypto>("market_cap_rank");
    const [sortOrder, setSortOrder] = useState("asc");

    const { data, isLoading, error } = CryptoData(page, sortKey, sortOrder);

    if (isLoading) return <p className={styles.logText}>Подгружаем данные...</p>;
    if (error) return <p className={styles.logText}>Ошибка загрузки данных...</p>;

    // Фильтрация по поисковому запросу
    const filteredData = data?.filter((coin) =>
        coin.name.toLowerCase().includes(search.toLowerCase()) ||
        coin.symbol.toLowerCase().includes(search.toLowerCase())
    );

    // Сортировка данных
    const sortedData = filteredData?.sort((a, b) => {
        if (sortOrder === "asc") {
            return a[sortKey] > b[sortKey] ? 1 : -1;
        } else {
            return a[sortKey] < b[sortKey] ? 1 : -1;
        }
    });

    return (
        <div className={styles.cryptoList}>
            <h2 className={styles.title}>Курсы криптовалют</h2>

            <div className={styles.filterSorter}>
                <input
                    className={styles.inputSearch}
                    type="text"
                    placeholder="Поиск..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
                <select
                    className={styles.filterValue}
                    value={sortKey}
                    onChange={(e) => setSortKey(e.target.value as keyof Crypto)}>
                    <option value="market_cap_rank">По популярности</option>
                    <option value="current_price">По цене</option>
                </select>
                <button className={styles.button} onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}>
                    {sortOrder === "asc" ? "↑" : "↓"}
                </button>
            </div>

            <ul className={styles.ulCrypto}>
                {(sortedData || []).map((coin) => (
                    <li className={styles.liCrypto} key={coin.id}>
                        <img className={styles.img} src={coin.image} alt={coin.name} />
                        [{coin.symbol.toUpperCase()}] {coin.name} - ${coin.current_price.toFixed(2)}
                        <span className={styles.span}>Top-{coin.market_cap_rank}</span>
                    </li>
                )) || <p className={styles.logText}>Нет данных...</p>}
            </ul>

            <div className={styles.pagination}>
                <button className={styles.button} onClick={() => setPage(Math.max(page - 1, 1))} disabled={page === 1}>←</button>
                <span className={styles.span}>Страница {page}</span>
                <button
                    className={styles.button}
                    onClick={() => setPage(page + 1)}
                    disabled={sortedData ? page >= sortedData.length : true}>
                    →
                </button>
            </div>
        </div>
    );
}

export default CryptoList;
