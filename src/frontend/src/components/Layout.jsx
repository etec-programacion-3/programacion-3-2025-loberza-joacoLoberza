import { Link, Outlet } from "react-router-dom";

function Layout () {
    return (
        <>
            <Navbar/>
            <main className="flex rounded-[10px] bg-[var(--white2)] m-[15px] grow">
                <Outlet/>
            </main>
            <Footer/>
        </>
    );
}

function Footer () {
    return (
        <div className="bg-[var(--gray1)] px-[15px] py-[5px]" id="footer">
            <div className="flex items-center">
                <img src="../../../public/contact-number.png" alt="Telefono: " className="w-[25px] h-[25px]"/>
                <p>+54 9 261 xxx-xxxx</p>
            </div>
            <div className="flex items-center">
                <img src="../../../public/ubication.png" alt="Ubicación: " className="w-[29px] h-[29px]"/>
                <p>Av. Inmaginaria 4521, Ciudad de Mendoza</p>
            </div>
            <p className="text-[12px]">Copyright © 2025-2025 EmpresaSuperPro</p>
        </div>
    );
}

function Navbar () {
    return (
    <div className="flex flex-row justify-between py-[15px] px-[10px] bg-[var(--main1)]">
        <nav>
            <NavLinks url='/' content='Inicio' />
            <NavLinks url='/store' content='Tienda' />
            <NavLinks url='/chats' content='Chats' />
        </nav>
        <nav>
            <NavLinks url='/register' content='Registrarse' />
            <NavLinks url='/loggin' content='Iniciar Sesión' />
        </nav>
    </div>
    );
}

function NavLinks ({ url, content }) {
    return <Link className="text-[var(--white1)] font-[600] [font-family:var(--montserrat)] mx-[10px] no-underline" to={url}>{content}</Link>
}

export default Layout