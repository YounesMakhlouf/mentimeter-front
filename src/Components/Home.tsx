import styled from "styled-components";
import SideBar from "./SideBar.tsx";
import MainHomeBox from "./MainHomeBox.tsx";
import {useAuth} from "../hooks/useAuth.ts";

const Layout = styled.div`
    display: grid;
    grid-template-columns: 260px 1fr;
    min-height: 100vh;

    @media (max-width: 800px) {
        grid-template-columns: 1fr;
    }
`;

const Main = styled.main`
    background: var(--paper);
    overflow: auto;
`;

function Home() {
    const {username} = useAuth();

    return (
        <Layout>
            <SideBar/>
            <Main>
                <MainHomeBox name={username ?? "stranger"}/>
            </Main>
        </Layout>
    );
}

export default Home;
