import {createBrowserRouter, RouterProvider} from 'react-router';
import Home from "./Components/Home.tsx";
import Authentification from './Components/Authentification.tsx';
import LogoutComponent from "./Components/LogoutComponent.tsx"
import './App.css'
import PrivateRoutes from "./Components/PrivateRoutes.tsx";
import BuildQuiz from "./Components/BuildQuiz.tsx";
import StartQuizPage from "./pages/StartQuizPage.tsx";
import QuestionPage from './pages/QuestionPage.tsx';
import WelcomePage from "./pages/WelcomePage.tsx";
import LeaderboardPage from "./pages/LeaderboardPage.tsx";
import RootLayout from "./Components/RootLayout.tsx";
import ErrorBoundary from "./Components/ErrorBoundary.tsx";
import {homeLoader} from "./loaders.ts";

const router = createBrowserRouter([
    {
        element: <RootLayout/>,
        errorElement: <ErrorBoundary/>,
        children: [
            {path: '/', element: <WelcomePage/>},
            {
                element: <PrivateRoutes/>,
                children: [
                    {path: '/home', element: <Home/>, loader: homeLoader},
                    {path: '/build', element: <BuildQuiz/>},
                ],
            },
            {path: '/logout', element: <LogoutComponent/>},
            {path: '/authentication', element: <Authentification/>},
            {path: '/startquiz', element: <StartQuizPage/>},
            {path: '/qspage', element: <QuestionPage/>},
            {path: '/leaderboard', element: <LeaderboardPage/>},
            {path: '*', loader: () => {throw new Response('Not Found', {status: 404})}},
        ],
    },
]);

function App() {
    return <RouterProvider router={router}/>;
}

export default App;
