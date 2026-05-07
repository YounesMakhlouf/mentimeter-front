import {Navigate, Outlet} from 'react-router-dom'
import {isTokenValid, clearAuth} from '../api.ts'

export default function PrivateRoutes() {
    if (!isTokenValid()) {
        clearAuth();
        return <Navigate to='/authentication'/>;
    }
    return <Outlet/>;
}
