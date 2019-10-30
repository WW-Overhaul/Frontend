import React, { useState, useEffect, useContext } from "react";
import { Route, Redirect } from "react-router-dom";

// import Navigation from "./components/Navigation";
import Home from "./components/Home";
import Dashboard from "./components/Dashboard";
import AuthForms from "./components/AuthForms/AuthForms";
// import Address from "./components/Address";
import Address2 from "./components/Address2";
import LandingPage from "./components/LandingPage";

import { GlobalContext } from "./context/contextProvider";
import { UserDataProvider } from "./context/UserDataContext";
import { FireDataContext } from "./context/FireDataContext";
import AddressContext from "./context/AddressContext";

// import Modal from "./components/Modal/Modal"

import * as Sentry from "@sentry/browser";

import * as v from "./styles/vars";
import styled from "styled-components";
import "./styles/App.scss";

import fire from "./config/fire";

Sentry.init({
  dsn: "https://2281acb5134d4680927ead14de3c5727@sentry.io/1775951"
});

require("dotenv").config();

const token = localStorage.getItem("token");

// AUTH FORM MODAL:
// Will refactor everything in regards to the auth form modal into one single component to clean up APP.js

function App() {
  // The 4 hooks below are used for toggling between the login, register, and forgot password forms.
  // These can most likely be refactored to use context API.
  const [showAuthForms, setShowAuthForms] = useState(false);
  const [loginFormStatus, setLoginFormStatus] = useState(true);
  const [registerFormStatus, setRegisterFormStatus] = useState(false);
  const [passwordFormStatus, setPasswordFormStatus] = useState(false);

  const [firebaseUser, setFirebaseUser] = useState({});

  const global = useContext(GlobalContext);
  const { fireDataState, getAllFires, setUserLocations, saveLocationMarker } = useContext(
    FireDataContext
  );

  // console.log("FIRE DATA STATE", fireDataState);

  useEffect(() => {
    getAllFires();
  }, []);

  useEffect(() => {
    if (token) {
      setUserLocations();
    }
  }, [fireDataState.allFires, fireDataState.selectedMarker]);

  useEffect(() => {
    //getLogin gets login information upon page load here;
    const getLogin = async () => {
      try {
        let user = await global.state.remote.self();
        global.setUser(user.email);
      } catch (err) {
        localStorage.removeItem("token");
        global.setUser("");
        return <Redirect to="/" />;
      }
    };
    if (token) {
      getLogin();
    }
  }, []);

  useEffect(() => {
    if (token) {
      const fetch = async () => {
        try {
          let temp = await global.state.remote.fetchLocations();
        } catch (err) {
          console.error(err);
        }
      };
      fetch();
    }
  }, [token]);

  const authListener = () => {
    fire.auth().onAuthStateChanged(user => {
      if (user) {
        setFirebaseUser(user);
        console.log(firebaseUser);
      } else {
        setFirebaseUser(null);
        console.log("no user returned");
      }
    });
  };

  return (
    <AppWrapper>
      <AddressContext>
        <AuthForms
          showAuthForms={showAuthForms}
          setShowAuthForms={setShowAuthForms}
          loginFormStatus={loginFormStatus}
          registerFormStatus={registerFormStatus}
          setLoginFormStatus={setLoginFormStatus}
          setRegisterFormStatus={setRegisterFormStatus}
          passwordFormStatus={passwordFormStatus}
          setPasswordFormStatus={setPasswordFormStatus}
        />

        {/* <Navigation
          toggleAuthForms={setShowAuthForms}
          toggleLoginStatus={setLoginFormStatus}
          toggleRegisterStatus={setRegisterFormStatus}
        /> */}
        <UserDataProvider>
          <Route path="/dashboard" component={Dashboard} />
        </UserDataProvider>

        <Route
          exact
          path="/"
          render={() => (
            <Home
              setShowAuthForms={setShowAuthForms}
              setLoginFormStatus={setLoginFormStatus}
              setRegisterFormStatus={setRegisterFormStatus}
            />
          )}
        />

        <Route
          path="/landing-page"
          render={() => (
            <LandingPage setShowAuthForms={setShowAuthForms}
              setLoginFormStatus={setLoginFormStatus}
              setRegisterFormStatus={setRegisterFormStatus} />
          )}
        />

        <Route
          path="/home"
          render={() => (
            <Home
              setShowAuthForms={setShowAuthForms}
              setLoginFormStatus={setLoginFormStatus}
              setRegisterFormStatus={setRegisterFormStatus}
            />
          )}
        />

        {/* <Route path="/address" component={Address} /> */}
        <Route path="/address" component={Address2} />
      </AddressContext>
    </AppWrapper>
  );
}

export default App;

const AppWrapper = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  ${v.tablet} {
    flex-direction: column;
  }
  background-image: url("https://www.fireflightapp.com/public/images/wildfire.jpg")
  );
`;
