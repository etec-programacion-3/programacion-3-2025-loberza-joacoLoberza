import { data, useNavigate } from "react-router-dom";
import { useState } from "react";
import axios from "axios";
import { useDispatch } from "react-redux";
import { logginSuccess } from "../storage/reducers/authSlice.js";

export function Loggin ({ nextRoute, lastRoute }) {
    
    const navigate = useNavigate();
    const dispatch = useDispatch()

    const [ user, setUser ] = useState('');
    const [ password, setPassword ] = useState('');
    const [ email, setEmail ] = useState('');
    const [ fakePass, setFakePass ] = useState(false)
    const [ fakeValues, setFakeValues ] = useState(false)

    const loggin = async e => {
        e.preventDefault()
        try {
            const res = await axios.post('http://localhost:3000/user/loggin', {
                name : user,
                email,
                password
            })
            if (res.data.success && res.data.token) {
                dispatch(logginSuccess({ user : res.data.user, token : res.data.token }))
                localStorage.setItem('token', res.data.token)
                localStorage.setItem('user', res.data.user)
                navigate(nextRoute)
            } else alert('¡Algo salió mal!')

        } catch (err) {
            if (err.response && err.response.status === 401) {setFakePass(true)} else {setFakeValues(true)} 
        }
    }

    return (
        <div className="w-[100vw] min-h-[100vh] bg-[var(--white2)] p-[1rem] flex items-center justify-center">
            <form onSubmit={loggin} className='relative flex flex-col w-[100%] max-w-[28rem] h-[auto] bg-[var(--white1)] p-[2rem] rounded-[0.75rem] shadow-[0_20px_25px_-5px_rgb(0,0,0,0.1),_0_8px_10px_-6px_rgb(0,0,0,0.1)]'>
                <button 
                    type='button' 
                    onClick={() => navigate(lastRoute)} 
                    className='absolute top-[1rem] left-[1.25rem] text-[rgb(75,85,99)] hover:text-[var(--main1)] hover:underline [font-family:var(--montserrat)] text-[0.875rem] font-[500]'
                >
                    &larr; Volver
                </button>
                
                <h2 className="
                    text-[1.5rem] font-[700] text-center text-[rgb(31,41,55)] [font-family:var(--montserrat)] mb-[1.5rem] mt-[2rem]
                ">
                    Iniciar Sesión
                </h2>

                <div className='flex flex-col'>
                    <input 
                        type="text" 
                        placeholder="Usuario" 
                        onChange={e => setUser(e.target.value)} 
                        className="w-[100%] p-[0.75rem] rounded-[0.375rem] border-[1px] border-[rgb(209,213,219)] focus:outline-[none] focus:ring-[2px] focus:ring-[var(--main1)] mb-[1rem]"
                    />
                    <input 
                        type="password" 
                        placeholder="Contraseña" 
                        onChange={e => setPassword(e.target.value)} 
                        className="w-[100%] p-[0.75rem] rounded-[0.375rem] border-[1px] border-[rgb(209,213,219)] focus:outline-[none] focus:ring-[2px] focus:ring-[var(--main1)] mb-[1rem]"
                    /> 
                    <input 
                        type="email" 
                        placeholder="Correo" 
                        onChange={e => setEmail(e.target.value)} 
                        className="w-[100%] p-[0.75rem] rounded-[0.375rem] border-[1px] border-[rgb(209,213,219)] focus:outline-[none] focus:ring-[2px] focus:ring-[var(--main1)]"
                    />
                    
                    <div className="h-[1.25rem] text-[0.875rem] text-center mt-[0.5rem]">
                        {fakePass ? <p className="text-[rgb(220,38,38)]">Contraseña incorrecta</p> : (fakeValues && <p className="text-[rgb(220,38,38)]">Usuario o correo incorrecto</p>) }
                    </div>

                    <button 
                        type='submit' 
                        className='w-[100%] border-[0px] p-[0.75rem] bg-[var(--main1)] text-[var(--white1)] rounded-[0.5rem] font-[700] [font-family:var(--montserrat)] hover:bg-opacity-[0.9] transition-[background-color] mt-[1rem]'
                    >
                        Iniciar Sesión
                    </button>
                </div>
            </form>
        </div>
    );
}

export function Register () {
    return <p>Register</p>
}