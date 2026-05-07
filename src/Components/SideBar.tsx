import {Link} from "react-router";
import styled from "styled-components";
import LogoName from "./LogoName.tsx";

const Aside = styled.aside`
    display: flex;
    flex-direction: column;
    height: 100vh;
    justify-content: space-between;
    padding: 1em;
    margin-inline-end: 2.5em;
`;

const NavList = styled.nav`
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    align-items: flex-start;
    gap: 0.5em;
`;

export default function SideBar() {
    const logoutFunction = () => {
        localStorage.clear();
    };
    return (
        <Aside className="side-bar">
            <LogoName/>
            <NavList>
                <div><a>About us</a></div>
                <div><a>Help and support</a></div>
                <Link to="/" className="btn" onClick={logoutFunction}>Logout</Link>
            </NavList>
        </Aside>
    );
}
