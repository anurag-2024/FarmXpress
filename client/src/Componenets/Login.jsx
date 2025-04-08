import React, { useState } from 'react'
import axios from 'axios'
import { useDispatch } from 'react-redux';
import { addUser } from '../utils/userSlice';
import { useNavigate } from "react-router";
import { BASE_URL } from '../utils/constants';

const Login = () => {
  const [emailId, setEmailId] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName]=useState("");
  const [registrationNumber, setRegistrationNumber]=useState("");
  const [isLogin, setIsLogin]=useState(true);
  const [error, setError]=useState("");

  const dispatch = useDispatch()
  const navigate=useNavigate();

  const HandleLogin = async () => {
    try {
        const res = await axios.post(BASE_URL + "/login", { emailId, password }, { withCredentials: true });
        dispatch(addUser(res.data));

        // Check for admin credentials
        if (emailId === "Admin@gmail.com" && password === "Admin@123") {
            navigate('/admin');
        } else {
            navigate('/');
        }
    } 
    catch (err) {
        console.log(err);
        setError(err.response.data || "Something went wrong");
    }
};


  const HandleSignUp=async ()=>{
    try{
      const res= await axios.post(BASE_URL+ "/signup", {name, emailId, password, registrationNumber}, {withCredentials:true});
      console.log(res);
      dispatch(addUser(res.data.data));
      navigate('/')
      
    }
    catch(err){
      console.error(err);
      setError(err.response.data || "Something went wrong");
    }
  }

  return (
    <div className='justify-center flex'>
    <div className="card bg-base-200 w-96 shadow-xl m-4">
  <div className="card-body">
    <h2 className="card-title justify-center">{isLogin? "Login" : "Sign Up"}</h2>
    <div>
    <label className="form-control w-full max-w-xs">

    {!isLogin && (
      <>
    <div className="label">
    <span className="label-text">Company Name</span>
  </div>
  <input type="text" value={name} onChange={(e)=> setName(e.target.value)} placeholder="Type here" className="input input-bordered w-full max-w-xs" />

  <div className="label">
    <span className="label-text">Registration Number</span>
  </div>
  <input type="text" value={registrationNumber} onChange={(e)=> setRegistrationNumber(e.target.value)} placeholder="Type here" className="input input-bordered w-full max-w-xs" />
  </>)}

  <div className="label">
    <span className="label-text">E-mail ID </span>
  </div>
  <input type="text" value={emailId} onChange={(e)=> setEmailId(e.target.value)} placeholder="Type here" className="input input-bordered w-full max-w-xs" />

  <div className="label ">
    <span className="label-text">Password</span>
  </div>
  <input type="text" value={password} onChange={(e)=> setPassword(e.target.value)} placeholder="Type here" className="input input-bordered w-full max-w-xs" />



</label>
    </div>
    {error && (<p className="text-red-500">{error}</p>)}
    <div className="card-actions justify-center mt-4">
      <button className="btn btn-primary" onClick={isLogin? HandleLogin : HandleSignUp}> {isLogin? "Login" : "Sign Up"}</button> 
    </div>
    <p onClick={()=> setIsLogin((value)=>!value)} className="text-center cursor-pointer"> {isLogin? "New User? SignUp here": "Existing User? Login here"}</p>
  </div>
</div></div>
  )
}

export default Login