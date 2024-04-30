import {BrowserRouter, Route, Routes} from 'react-router-dom'
import Home from "./Components/Home.tsx";
import Test from "./Components/Test.tsx";
import Authentification from './Components/Authentification.tsx';
import LogoutComponent from "./Components/LogoutComponent.tsx"
import React from "react";

import './App.css'
import PrivateRoutes from "./Components/PrivateRoutes.tsx";
import BuildQuiz from "./Components/BuildQuiz.tsx";
import StartQuiz from "./Components/StartQuiz.tsx";
import QuestionPage from './Components/QuestionPgae.tsx';

function App() {
    const [signIn, toggle] = React.useState(true);
  return (
    <BrowserRouter>
        <Routes>
            <Route element={<PrivateRoutes/>}>
                <Route path="/" element={<Home/>}></Route>
                <Route path='/build' element={<BuildQuiz/>}></Route>
            <Route path="test" element={<Test/>}></Route>
            </Route>
            <Route path="/logout"
                  element={
                    <LogoutComponent/>
                  }
            >
            </Route>
            <Route path="authentication" element={
                <Authentification
                    signIn={signIn}
                    toggle={toggle}
                />
            }>
            </Route>
            <Route path="/startquiz" Component={StartQuiz} />
            <Route path="qspage" element={
                <QuestionPage/>
            }>
            </Route>


        </Routes>


    </BrowserRouter>
    )
}
export default App;
