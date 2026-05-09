import {Link} from "react-router";
import styled from "styled-components";
import MainHomeBox from "./MainHomeBox.tsx";
import {Avatar, Logo} from "../design/primitives.tsx";
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
    padding: 12px 20px;
    border-bottom: 2.5px solid var(--ink);
    background: var(--card);

    @media (min-width: 600px) {
        padding: 16px 32px;
    }
`;

const UserCluster = styled.div`
    display: flex;
    align-items: center;
    gap: 12px;
`;

const UserMeta = styled.div`
    display: none;
    text-align: right;
    line-height: 1.15;
    max-width: 200px;

    @media (min-width: 480px) {
        display: block;
    }
`;

const UserName = styled.div`
    font-weight: 700;
    font-size: 14px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
`;

const UserEmail = styled.div`
    font-size: 11px;
    color: var(--ink-mute);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
`;

const LogoutButton = styled(Link)`
    appearance: none;
    border: 2.5px solid var(--line);
    background: var(--card);
    color: var(--ink);
    border-radius: var(--r-md);
    padding: 10px 16px;
    font-weight: 700;
    font-size: 14px;
    cursor: pointer;
    box-shadow: var(--shadow-md);
    transition: transform .12s ease, box-shadow .12s ease;
    text-decoration: none;
    display: inline-flex;
    align-items: center;
    gap: 6px;

    &:hover { transform: translateY(-1px); box-shadow: var(--shadow-lg); }
    &:active { transform: translateY(2px); box-shadow: 0 2px 0 var(--ink); }
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
                    <LogoutButton to="/logout">Log out ↗</LogoutButton>
                </UserCluster>
            </TopBar>
            <MainHomeBox name={displayName}/>
        </Layout>
    );
}

export default Home;
