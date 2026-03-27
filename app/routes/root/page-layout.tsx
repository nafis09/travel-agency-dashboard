import { ButtonComponent } from "@syncfusion/ej2-react-buttons";
import { Link, Outlet, useLoaderData, useNavigate } from "react-router";
import { getExistingUser, logoutUser, storeUserData } from "~/appwrite/auth";
import { account } from "~/appwrite/client";
import { footers } from "~/constants";

type LoaderData = {
  user: {
    name?: string;
    email?: string;
    imageUrl?: string;
    status?: "admin" | "user";
  } | null;
};

export async function clientLoader(): Promise<LoaderData> {
  try {
    const authUser = await account.get();
    if (!authUser?.$id) return { user: null };

    const existingUser = await getExistingUser(authUser.$id);
    if (existingUser) return { user: { ...existingUser } as LoaderData["user"] };

    const created = await storeUserData();
    if (created) return { user: { ...created } as LoaderData["user"] };

    return {
      user: {
        name: authUser.name,
        email: authUser.email,
        imageUrl: undefined,
        status: "user",
      },
    };
  } catch {
    return { user: null };
  }
}

const PageLayout = () => {
  const navigate = useNavigate();
  const { user } = useLoaderData() as LoaderData;
  const isAdmin = user?.status === "admin";
  const isSignedIn = Boolean(user);

  const handleLogout = async () => {
    await logoutUser();
    navigate("/sign-in");
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-light-200 text-dark-100">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 -left-24 size-[420px] rounded-full bg-primary-50 blur-3xl opacity-80" />
        <div className="absolute top-[30vh] -right-40 size-[520px] rounded-full bg-navy-50 blur-3xl opacity-80" />
        <div className="absolute -bottom-32 left-[10vw] size-[520px] rounded-full bg-pink-50 blur-3xl opacity-70" />
      </div>

      <header className="sticky top-0 z-40 border-b border-light-100 bg-light-200/75 backdrop-blur">
        <nav className="root-nav wrapper">
          <Link to="/" aria-label="Tourvisto home">
            <img src="/assets/icons/logo.svg" alt="Tourvisto" className="size-[30px]" />
            <h1>Tourvisto</h1>
          </Link>

          <aside className="gap-3">
            <div className="hidden md:flex items-center gap-4 text-sm text-gray-700">

              <a className="hover:text-dark-100 transition-colors" href="#how-it-works">
                How it works
              </a>
              <a className="hover:text-dark-100 transition-colors" href="#reviews">
                Reviews
              </a>
            </div>


            {!user ? (
              <Link to="/sign-in">
                <ButtonComponent type="button" className="button-class !h-10 !w-[140px]">
                  <span className="p-16-semibold text-white">Sign in</span>
                </ButtonComponent>
              </Link>
            ) : (
              <div className="flex items-center gap-2.5">
                {isAdmin ? (
                  <ButtonComponent
                    type="button"
                    className="button-class !h-10 !w-[140px] hidden sm:!flex"
                    onClick={() => navigate("/dashboard")}
                  >
                    <span className="p-16-semibold text-white">Dashboard</span>
                  </ButtonComponent>
                ) : isSignedIn ? (
                  <Link to="/travel" className="hidden sm:block">
                    <ButtonComponent type="button" className="button-class !h-10 !w-[140px]">
                      <span className="p-16-semibold text-white">My Trips</span>
                    </ButtonComponent>
                  </Link>
                ) : null}

                <img
                  src={user?.imageUrl || "/assets/images/david.webp"}
                  alt={user?.name || "User"}
                  className="size-10 rounded-full aspect-square border border-light-100 bg-white"
                  referrerPolicy="no-referrer"
                />

                <button onClick={handleLogout} className="cursor-pointer" aria-label="Log out">
                  <img src="/assets/icons/logout.svg" alt="" className="size-6" />
                </button>
              </div>
            )}
          </aside>
        </nav>
      </header>

      <main className="relative">
        <Outlet />
      </main>

      <footer className="relative border-t border-light-100 mb-10">
        <div className="wrapper">
          <div className="footer-container">
            <Link to="/" aria-label="Tourvisto home">
              <img src="/assets/icons/logo.svg" alt="Tourvisto" className="size-[30px]" />
              <h1>Tourvisto</h1>
            </Link>

          </div>

          <p className="text-xs text-gray-500">
            {new Date().getFullYear()} Tourvisto. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default PageLayout;
