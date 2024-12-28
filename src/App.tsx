import { HashRouter, Route, Routes } from "react-router-dom";
import HomePage from "./pages/homePage";
import AirportsPage from "./pages/airportsPage";
import { routes } from "./routes";
import MainLayout from "./layouts/mainLayout";
import CityAntennasPage from "./pages/cityAntennasPage";
import CampusAntennasPage from "./pages/campusAntennasPage";

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path={routes.home()} element={<HomePage />} />
        <Route element={<MainLayout />}>
          <Route path={routes.airports()} element={<AirportsPage />} />
          <Route path={routes.cityAntennas()} element={<CityAntennasPage />} />
          <Route path={routes.campusAntennas()} element={<CampusAntennasPage />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}

export default App;
