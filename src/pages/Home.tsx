import {Link} from "react-router";
import styled from "styled-components";
import MainHomeBox from "../components/MainHomeBox.tsx";
import {Avatar, Button, Logo} from "../design";
import {useAuth} from "../hooks/useAuth.ts";

const Layout = styled.div`
    min-height: 100vh;
    background: var(--paper);
    display: grid;
    grid-template-rows: auto 1fr;
`;

const TopBar = styled.header`
    border-bottom: 2.5px solid var(--ink);
    background: var(--card);
`;

const TopBarInner = styled.div.attrs({className: 'wrapper'})`
    --wrapper-max: 80rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--gap-3);
    padding-block: 0.75rem;

    @media (min-width: 37.5em) {
        padding-block: 1rem;
    }
`;

const UserCluster = styled.div`
    display: flex;
    align-items: center;
    gap: var(--gap-3);
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
                <TopBarInner>
                    <Logo size={26}/>
                    <UserCluster>
                        <UserMeta>
                            <UserName>{displayName}</UserName>
                            {email && <UserEmail>{email}</UserEmail>}
                        </UserMeta>
                        <Avatar name={displayName} size={36}/>
                        <Button as={Link} to="/logout">Log out ↗</Button>
                    </UserCluster>
                </TopBarInner>
            </TopBar>
            <MainHomeBox name={displayName}/>
        </Layout>
    );
}

export default Home;
