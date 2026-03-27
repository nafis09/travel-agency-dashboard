import { ButtonComponent } from "@syncfusion/ej2-react-buttons";
import { Link, NavLink, Outlet, redirect, useLoaderData, useNavigate } from "react-router";
import { logoutUser } from "~/appwrite/auth";
import { account } from "~/appwrite/client";
import { cn } from "~/lib/utils";

type LoaderData = {
  authUser: { $id: string; name?: string; email?: string } | null;
};

export async function clientLoader() {
  try {
    const authUser = await account.get();
    if (!authUser?.$id) return redirect("/sign-in");

    return { authUser: { $id: authUser.$id, name: authUser.name, email: authUser.email } };
  } catch {
    return redirect("/sign-in");
  }
}

const UserLayout = () => {
  const navigate = useNavigate();
  const { authUser } = useLoaderData() as LoaderData;

  const handleLogout = async () => {
    await logoutUser();
    navigate("/sign-in");
  };

  return (
    <div className="min-h-screen bg-light-200 text-dark-100">
      <header className="sticky top-0 z-40 border-b border-light-100 bg-light-200/80 backdrop-blur">
        <div className="wrapper flex items-center justify-between gap-4 py-4">
          <Link to="/" className="flex items-center gap-2" aria-label="Tourvisto home">
            <img src="/assets/icons/logo.svg" alt="Tourvisto" className="size-[30px]" />
            <span className="text-base md:text-xl font-bold">Tourvisto</span>
          </Link>

          <nav className="hidden sm:flex items-center gap-2">
            <NavLink to="/travel" end>
              {({ isActive }) => (
                <span
                  className={cn(
                    "px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                    isActive ? "bg-primary-100 text-white" : "text-gray-700 hover:text-dark-100",
                  )}
                >
                  Explore
                </span>
              )}
            </NavLink>
            <NavLink to="/travel/create">
              {({ isActive }) => (
                <span
                  className={cn(
                    "px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                    isActive ? "bg-primary-100 text-white" : "text-gray-700 hover:text-dark-100",
                  )}
                >
                  Create
                </span>
              )}
            </NavLink>
          </nav>

          <div className="flex items-center gap-3">
            <span className="hidden md:block text-sm text-gray-500 truncate max-w-[220px]">
              {authUser?.email}
            </span>
            <ButtonComponent type="button" className="button-class-secondary !h-10" onClick={handleLogout}>
              <img src="/assets/icons/logout.svg" alt="" className="size-5" />
              <span className="p-16-semibold text-dark-100">Logout</span>
            </ButtonComponent>
          </div>
        </div>
      </header>

      <main className="relative mt-10">
        <Outlet />
      </main>
    </div>
  );
};

export default UserLayout;
