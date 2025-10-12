// Update this page (the content is just a fallback if you fail to update the page)

import { useAuth } from "@/components/auth/AuthContext";
import { Button } from "@/components/ui/button";

const Index = () => {
  const { logout } = useAuth();

  return (
    <div className="flex flex-col items-center justify-center h-full bg-gray-100 dark:bg-gray-900 rounded-lg p-6">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4 text-gray-800 dark:text-gray-200">Welcome to ClassicPOS</h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 mb-6">
          You are logged in! Start building your amazing project here!
        </p>
        <Button onClick={logout} variant="destructive">
          Logout
        </Button>
      </div>
    </div>
  );
};

export default Index;