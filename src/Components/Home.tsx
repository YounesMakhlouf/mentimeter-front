import {Link} from "react-router";
import styled from "styled-components";
import MainHomeBox from "./MainHomeBox.tsx";
import {Avatar, Button, Logo} from "../design";
import {useAuth} from "../hooks/useAuth.ts";

const Layout = styled.div`
    min-height: 100vh;
    background: var(--paper);
    display: grid;
    grid-template-rows: auto 1fr;
`;

const TopBar = styled.header`
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.75rem;
    padding: 0.75rem 1.25rem;
    border-bottom: 2.5px solid var(--ink);
    background: var(--card);

    @media (min-width: 37.5em) {
        padding: 1rem 2rem;
    }
`;

const UserCluster = styled.div`
    display: flex;
    align-items: center;
    gap: 0.75rem;
`;

const UserMeta = styled.div`
    display: none;
    text-align: right;
    line-height: 1.2;

    @media (min-width: 30em) {
        display: block;
    }
`;

const UserName = styled.div`
    font-weight: 700;
    font-size: var(--step--1);
`;

const UserEmail = styled.div`
    font-size: var(--step--2);
    color: var(--ink-mute);
`;

function Home() {
    const {username, email} = useAuth();
    const displayName = username ?? "stranger";

    return (
        <Layout>
            <TopBar>
                <Logo size={26}/>
                <UserCluster>
                    <UserMeta>
                        <UserName>{displayName}</UserName>
                        {email && <UserEmail>{email}</UserEmail>}
                    </UserMeta>
                    <Avatar name={displayName} size={36}/>
                    <Button as={Link} to="/logout">Log out ↗</Button>
                </UserCluster>
            </TopBar>
            <MainHomeBox name={displayName}/>
        </Layout>
    );
}

export default Home;
