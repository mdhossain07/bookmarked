import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { MainLayout } from "@/components/layout/MainLayout";
import { useAuth } from "@/contexts/AuthContext";
import { useMedia } from "@/contexts/MediaContext";

const Dashboard = () => {
  const { user, isLoading } = useAuth();
  const { movies, books } = useMedia();

  const firstName = user?.firstName || "User";

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
    <MainLayout>
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
            <p className="text-2xl font-bold">{books.length}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Books tracked
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Movies</CardTitle>
            <CardDescription>Keep track of what you've watched</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{movies.length}</p>
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
            <Link to="/books">
              <Button className="w-full" variant="outline">
                Add Book
              </Button>
            </Link>
            <Link to="/movies">
              <Button className="w-full" variant="outline">
                Add Movie
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Status Cards */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-2">Frontend Status</h3>
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
          <h3 className="font-semibold text-purple-900 mb-2">Authentication</h3>
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
    </MainLayout>
  );
};

export default Dashboard;
