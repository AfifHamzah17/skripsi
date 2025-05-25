import React from "react";
import LoginView from "../pages/views/login-view";
import RegisterView from "../pages/views/register-view";
import HomeView from "../pages/views/home-view";
import NotFoundView from "../pages/views/not-found-view"; // perbaiki path-nya

const routeMap = {
  login: <LoginView />,
  register: <RegisterView />,
  home: <HomeView />,
};

export default function Router() {
  const hash = window.location.hash.replace("#/", "") || "login";
  const Page = routeMap[hash] || <NotFoundView />;

  return Page;
}
