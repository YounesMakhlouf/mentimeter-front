import {createBrowserRouter, RouterProvider} from 'react-router';
import Home from "./pages/Home.tsx";
import Authentication from './pages/Authentication.tsx';
import Logout from "./pages/Logout.tsx";
import BuildQuiz from "./pages/BuildQuiz.tsx";
import StartQuizPage from "./pages/StartQuizPage.tsx";
import PresenterPage from "./pages/PresenterPage.tsx";
import QuestionPage from './pages/QuestionPage.tsx';
import WelcomePage from "./pages/WelcomePage.tsx";
import LeaderboardPage from "./pages/LeaderboardPage.tsx";
import PrivateRoutes from "./components/PrivateRoutes.tsx";
import RootLayout from "./components/RootLayout.tsx";
import ErrorBoundary from "./components/ErrorBoundary.tsx";
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
            {path: '/logout', element: <Logout/>},
            {path: '/authentication', element: <Authentication/>},
            {path: '/startquiz', element: <StartQuizPage/>},
            {path: '/present', element: <PresenterPage/>},
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
