import {Navigate} from "react-router";
import {clearAuth} from "../api.ts";
import {reauthSocket} from "../socket.js";

export default function LogoutComponent() {
    clearAuth();
    reauthSocket();
    return (<Navigate to="/authentication"/>)
}
