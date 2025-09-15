import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { AlertTriangle, File } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 text-white px-6">
      <div className="text-center space-y-6">
        {/* Icon */}
        <div className="flex justify-center">
          <AlertTriangle className="h-20 w-20 text-yellow-300 animate-bounce" />
        </div>

        {/* Title */}
        <h1 className="text-7xl font-extrabold drop-shadow-lg">404</h1>
        <p className="text-2xl font-medium">Oops! Page not found</p>
        <p className="text-lg text-gray-200">
          The page <span className="font-semibold">"{location.pathname}"</span> doesn’t exist or has been moved.
        </p>

        {/* Action Button */}
        <a
          href="/admin/dashboard"
          className="inline-block px-6 py-3 rounded-xl bg-white text-purple-600 font-semibold shadow-lg hover:scale-105 transform transition-all duration-300"
        >
          ⬅ Go Back to Admin Dashboard
        </a>
      </div>
    </div>
  );
};

export default NotFound;
