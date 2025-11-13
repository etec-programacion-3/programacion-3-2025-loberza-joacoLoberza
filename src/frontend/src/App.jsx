import { Route, Routes, BrowserRouter } from "react-router-dom"
import { Home } from "./components/Home.jsx"
import { Loggin, Register } from "./components/Users.jsx"
import { Chat } from "./components/Chats.jsx"
import { Products } from "./components/Products.jsx"
import Layout from "./components/Layout.jsx"

const ProtectedRoute = ({ children }) => {
  const isAuthenticated = useSelector(state => state.auth.isAuthenticated);
  return isAuthenticated ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />}/>
          <Route path='store' element={<Products />}/>
          <Route path='chats' element={<ProtectedRoute children={<Chat />}/>}/>
        </Route>
        <Route path='/loggin' element={<Loggin nextRoute={'/'}/>}/>
        <Route path='/register' element={<Register />}/>
      </Routes>
    </BrowserRouter>
  );
}

export default App
