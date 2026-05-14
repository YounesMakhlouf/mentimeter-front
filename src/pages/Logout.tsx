import {Navigate} from "react-router";
import {clearAuth} from "../api.ts";
import {reauthSocket} from "../socket.ts";

export default function LogoutComponent() {
    clearAuth();
    reauthSocket();
    return (<Navigate to="/authentication"/>)
}
