import "./App.css";
import CryptoList from "./components/CryptoList";
import CryptoChat from "./components/CryptoChat";

function App() {
    return (
        <div className={"container"}>
            <CryptoList />
            <CryptoChat />
        </div>
    )
}

export default App;
