import { Link, Outlet } from "react-router-dom";
import { Route, routes } from "../routes";

interface Props {}

const menuItems: Route[] = [
  routes.airports(),
  routes.cityAntennas(),
  routes.campusAntennas(),
];

const MainLayout: React.FC<Props> = () => {
  return (
    <div className="drawer min-h-screen flex flex-col">
      <input id="my-drawer-3" type="checkbox" className="drawer-toggle" />
      <div className="drawer-content flex flex-col grow">
        {/* Navbar */}
        <div className="navbar bg-base-300 w-full">
          <div className="flex-none lg:hidden">
            <label
              htmlFor="my-drawer-3"
              aria-label="open sidebar"
              className="btn btn-square btn-ghost"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                className="inline-block h-6 w-6 stroke-current"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16M4 18h16"
                ></path>
              </svg>
            </label>
          </div>
          <div className="mx-2 flex-1 px-2">Competitiva</div>
          <div className="hidden flex-none lg:block">
            <ul className="menu menu-horizontal">
              {menuItems.map((item) => (
                <li key={item} className="menu-title">
                  <Link to={item}>{item.replace("/", "").toUpperCase()}</Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
        {/* Page content here */}
        <div className="grow flex flex-col">
          <Outlet />
        </div>
      </div>
      <div className="drawer-side z-[99999999]">
        <label
          htmlFor="my-drawer-3"
          aria-label="close sidebar"
          className="drawer-overlay"
        ></label>
        <ul className="menu bg-base-200 min-h-full w-80 p-4">
          {/* Sidebar content here */}
          <li>
            <a>Sidebar Item 1</a>
          </li>
          <li>
            <a>Sidebar Item 2</a>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default MainLayout;
