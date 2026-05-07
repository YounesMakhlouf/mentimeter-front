import SideBar from "./SideBar.tsx";
import MainHomeBox from "./MainHomeBox.tsx";
import {useAuth} from "../hooks/useAuth.ts";

function Home() {
    const containerStyle = {
        display: 'grid', gridTemplateColumns: 'fit-content(20ch) minmax(min(50vw, 30ch), 1fr)',
    };

    const {username} = useAuth();

    return (<div className="container" style={containerStyle}>
        <SideBar/>
        <div className="main-content">
            <MainHomeBox name={username ?? "stranger"}/>
        </div>
    </div>);
}

export default Home;
