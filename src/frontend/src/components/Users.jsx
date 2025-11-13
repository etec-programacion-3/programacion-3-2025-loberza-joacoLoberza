import { data, useNavigate } from "react-router-dom";
import { useState } from "react";
import axios from "axios";
import { useDispatch } from "react-redux";
import { logginSuccess } from "../storage/reducers/authSlice.js";

export function Loggin ({ nextRoute, lastRoute }) {
    const loginInputStyle = 'my-[4vh] h-[15px] rounded-[30px] border-[0px] p-[10px]'
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
            if (err.response.status === 401) {setFakePass(true)} else {setFakeValues(true)} 
        }
    }

    return (
        <div className="flex grow rounded-[10px] bg-[var(--white2)] m-[15px]">
            <form onSubmit={loggin} className='flex flex-nowrap flex-col w-[40vw] h-[50vh] absolute top-[50%] left-[50%] translate-[-50%] bg-[var(--white3)] p-[10px] rounded-[15px] justify-between'>
                <button type='button' onClick={() => navigate(lastRoute)}></button>
                <div className='flex flex-col mb-[20px]'>
                    <input type="text" placeholder="Usuario" onChange={e => setUser(e.target.value)} className={loginInputStyle}/>
                    <input type="password" placeholder="Contraseña" onChange={e => setPassword(e.target.value)} className={loginInputStyle}/> 
                    <input type="email" placeholder="Correo" onChange={e => setEmail(e.target.value)} className={loginInputStyle}/>
                    {fakePass ? <p>Contraseña incorrecta</p> : (fakeValues && <p>Usuario o correo incorrecto</p>) }
                    <button type='submit' className='border-[0px]'>Iniciar Sesión</button>
                </div>
            </form>
        </div>
    );
}

export function Register () {
    return <p>Register</p>
}