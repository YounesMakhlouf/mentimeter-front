import LogoName from "./LogoName.tsx";
import {Link} from "react-router";
import {Dispatch, SetStateAction} from "react";
import styled from "styled-components";

interface NavbarProps {
    open: boolean;
    setOpen: Dispatch<SetStateAction<boolean>>;
}

const Bar = styled.nav`
    background-color: rgba(229, 228, 226, 0.58);
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.5em;
`;

const Links = styled.div`
    display: flex;
    justify-content: center;
    gap: 1em;
`;

const linkStyles = `
    font-size: 1.3em;
    background-color: rgba(232, 207, 223, 0.94);
`;

const NavButton = styled.button`${linkStyles}`;
const NavLink = styled(Link)`${linkStyles}`;

export default function Navbar(props: NavbarProps) {
    return (
        <Bar>
            <LogoName/>
            <Links className="links">
                <NavButton className="button" onClick={() => props.setOpen((o) => !o)}>
                    Join
                </NavButton>
                <NavLink to="/authentication" className="button">Login</NavLink>
            </Links>
        </Bar>
    );
}
