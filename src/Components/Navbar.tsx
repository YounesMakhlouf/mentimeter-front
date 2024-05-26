import LogoName from "./LogoName.tsx";
import {Link} from "react-router-dom";
import {CSSProperties} from "react";

export default function Navbar(props) {
    const navbarStyle: CSSProperties = {
        backgroundColor: "rgba(229,228,226,0.58)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0.5em"
    }
    const linkContainer = {
        display: "flex", justifyContent: "center", gap: "1em"
    }
    const linkStyle = {
        fontSize: "1.3em", backgroundColor: "rgba(232,207,223,0.94)"
    }

    return (<nav style={navbarStyle}>
        <LogoName/>
        <div className="links" style={linkContainer}>
            <button style={linkStyle} className="button" onClick={() => props.setOpen(o => !o)}>
                <Link to="">Join</Link>
            </button>
            <Link to="/authentication" className="button" style={linkStyle}>Login</Link>
        </div>
    </nav>)
}