import { HashRouter, Route, Routes } from "react-router-dom";
import HomePage from "./pages/homePage";
import AirportsPage from "./pages/airportsPage";
import { routes } from "./routes";
import MainLayout from "./layouts/mainLayout";

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path={routes.home()} element={<HomePage />} />
        <Route element={<MainLayout />}>
          <Route path={routes.airports()} element={<AirportsPage />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}

export default App;
