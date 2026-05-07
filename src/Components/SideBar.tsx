import {Link} from "react-router";
import LogoName from "./LogoName.tsx";
import {CSSProperties} from "react";

export default function sideBar() {
    const sideBarStyle: CSSProperties = {
        display: 'flex',
        flexDirection: "column",
        height: '100vh',
        justifyContent: "space-between",
        padding: "1em",
        marginInlineEnd: "2.5em"
    }

    const logoutFunction=()=>{
        localStorage.clear()
    }
    return (<aside className="side-bar" style={sideBarStyle}>
        <LogoName/>
        <nav style={{
            display: "flex", flexDirection: "column", justifyContent: "flex-end", alignItems: 'flex-start', gap: '0.5em'
        }}>
            <div><a>About us</a></div>
            <div><a>Help and support</a></div>
            <Link to="/" className="btn" onClick={logoutFunction}>Logout</Link>
        </nav>
    </aside>)
}