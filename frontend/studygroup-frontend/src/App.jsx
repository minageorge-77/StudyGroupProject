import { useEffect } from "react";
import AppRoutes from "./routes/AppRoutes";

function App() {
  useEffect(() => {
    const users = JSON.parse(localStorage.getItem("studygroupUsers")) || [];

    const adminExists = users.some((u) => u.email === "admin@study.com");

    if (!adminExists) {
      users.push({
        fullName: "Site Admin",
        email: "admin@study.com",
        password: "123456",
        role: "admin",
      });

      localStorage.setItem("studygroupUsers", JSON.stringify(users));
    }
  }, []);

  return <AppRoutes />;
}

export default App;
