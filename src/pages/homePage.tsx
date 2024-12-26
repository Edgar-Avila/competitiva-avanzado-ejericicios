import { Link } from "react-router-dom";
import { routes } from "../routes";

interface Props {}

const HomePage: React.FC<Props> = () => {
  return (
    <div className="hero min-h-screen bg-[url(https://img.daisyui.com/images/stock/photo-1507358522600-9f71e620c44e.webp)]">
      <div className="hero-overlay bg-opacity-80"></div>
      <div className="hero-content text-neutral-content text-center">
        <div className="max-w-md">
          <h1 className="mb-5 text-5xl font-bold">
            Tarea de Programación Competitiva
          </h1>
          <p className="mb-5">
            Este es un proyecto para la materia de Programación Competitiva,
            donde se implementan el algoritmo de la colonia de hormigas y el
            algoritmo de la colonia de abejas.
          </p>
          <Link className="btn btn-primary" to={routes.airports()}>
            Empecemos
          </Link>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
