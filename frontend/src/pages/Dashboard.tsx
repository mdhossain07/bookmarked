import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Book, LogOut, User } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const Dashboard = () => {
  const { user, logout, isLoading } = useAuth();

  console.log("user", user);

  // Get display name from custom user
  const displayName = user ? `${user.firstName} ${user.lastName}` : "User";

  const firstName = user?.firstName || "User";
  const userEmail = user?.email;

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black dark:border-white mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">
            Loading dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-black dark:bg-white rounded-lg flex items-center justify-center mr-3">
                <Book className="w-5 h-5 text-white dark:text-black" />
              </div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                Bookmarked
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                <User className="h-4 w-4" />
                <div className="flex flex-col">
                  <span className="font-medium">{displayName}</span>
                  {userEmail && (
                    <span className="text-xs text-gray-500 dark:text-gray-500">
                      {userEmail}
                    </span>
                  )}
                </div>
              </div>
              <ThemeToggle />
              <Button
                onClick={handleLogout}
                variant="outline"
                className="flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Welcome back, {firstName}!
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Track your reading and watching progress
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Books</CardTitle>
              <CardDescription>Track your reading progress</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">0</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Books tracked
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Movies</CardTitle>
              <CardDescription>
                Keep track of what you've watched
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">0</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Movies tracked
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Get started with tracking</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button className="w-full" variant="outline">
                Add Book
              </Button>
              <Button className="w-full" variant="outline">
                Add Movie
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Status Cards */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-2">
              Frontend Status
            </h3>
            <p className="text-blue-700 text-sm">
              React application with routing is running successfully!
            </p>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h3 className="font-semibold text-green-900 mb-2">Backend API</h3>
            <p className="text-green-700 text-sm">
              API server should be running on port 3001
            </p>
          </div>
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <h3 className="font-semibold text-purple-900 mb-2">
              Authentication
            </h3>
            <p className="text-purple-700 text-sm">
              Login and Register pages are now accessible
            </p>
          </div>
        </div>

        {/* Navigation Links */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            Test the authentication flow:
          </p>
          <div className="space-x-4">
            <Link to="/login">
              <Button variant="outline">Go to Login</Button>
            </Link>
            <Link to="/register">
              <Button variant="outline">Go to Register</Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
