import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import axios from "axios";

interface errorResconse {
  response: { data: string };
}

const SigninPage = (): React.ReactElement => {
  return (
    <main className="bg-loginBackground w-screen h-screen flex justify-center items-center">
      <CenterLogin />
    </main>
  );
};

const SignIn = (): React.ReactElement => {
  const [emailInput, inputEmail] = useState("");
  const [passwordInput, inputPassword] = useState("");
  const nav = useNavigate();

  const onchangePassword = (e: React.ChangeEvent<HTMLInputElement>): void => {
    inputPassword(e.target.value);
  };

  const onchangeEmail = (e: React.ChangeEvent<HTMLInputElement>): void => {
    inputEmail(e.target.value);
  };

  const logInRequest = async (e: React.FormEvent<HTMLButtonElement>) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        "http://localhost:3000/login/loginUser",
        {
          email: emailInput,
          password: passwordInput,
        }
      );
      if (response.status == 200) {
        nav("/main");
      }
    } catch (error) {
      console.log((error as errorResconse).response.data);
    }
  };

  return (
    <div className="flex flex-col justify-center">
      <p className="my-4 font-semibold pl-1">Log In</p>
      <input
        className="LoginInput mb-4"
        placeholder="Email"
        onChange={onchangeEmail}
        value={emailInput}
      />
      <input
        className="LoginInput"
        placeholder="Password"
        onChange={onchangePassword}
        value={passwordInput}
      />
      <button className="self-center loginButton" onClick={logInRequest}>
        Log In
      </button>
      <NavLink to="/register" className="text-lg text-third mt-2 text-center">
        Register
      </NavLink>
      <NavLink to="/" className="self-center">
        Back
      </NavLink>
    </div>
  );
};

const CenterLogin = (): React.ReactElement => {
  return (
    <div className="bg-white bg-opacity-90 w-96 h-96 rounded-3xl flex justify-center relative overflow-hidden">
      <div className="absolute h-12 w-96 bg-main rotate-45 -right-1/3 top-[33]" />
      <div className="absolute h-12 w-96 bg-main -rotate-45 -left-1/3 top-[33]" />
      <div className="absolute h-12 w-96 bg-main rotate-45 right-1/3 bottom-0" />
      <div className="absolute h-12 w-96 bg-main -rotate-45 left-1/3 bottom-0" />
      <SignIn />
    </div>
  );
};

export default SigninPage;
