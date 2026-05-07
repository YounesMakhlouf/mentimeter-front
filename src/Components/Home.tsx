import styled from "styled-components";
import SideBar from "./SideBar.tsx";
import MainHomeBox from "./MainHomeBox.tsx";
import {useAuth} from "../hooks/useAuth.ts";

const Layout = styled.div`
    display: grid;
    grid-template-columns: fit-content(20ch) minmax(min(50vw, 30ch), 1fr);
`;

function Home() {
    const {username} = useAuth();

    return (
        <Layout className="container">
            <SideBar/>
            <div className="main-content">
                <MainHomeBox name={username ?? "stranger"}/>
            </div>
        </Layout>
    );
}

export default Home;
