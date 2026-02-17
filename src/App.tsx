import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Login from './pages/Login';
import SignUp from './pages/auth/SignUp';
import AppLayout from './components/layout/AppLayout';
import Dashboard from './pages/Dashboard';
import PropertiesList from './pages/properties/PropertiesList';
import PropertyForm from './pages/properties/PropertyForm';
import BookingList from './pages/bookings/BookingList';
import BookingForm from './pages/bookings/BookingForm';
import QuotationList from './pages/quotations/QuotationList';
import QuotationForm from './pages/quotations/QuotationForm';
import UsersList from './pages/admin/UsersList';
import UserEdit from './pages/admin/UserEdit';
import AdminReports from './pages/admin/AdminReports';
import Settings from './pages/admin/Settings';
import { isSupabaseConfigured } from './lib/supabase';
import OptionsList from './pages/settings/OptionsList';
import ViewBooking from './pages/public/ViewBooking';
import { ReloadPrompt } from './components/ui/ReloadPrompt';
import Calendar from './pages/calendar/Calendar';
import InclusionsExclusionsManager from './components/admin/InclusionsExclusionsManager';
import DebugIcons from './pages/admin/DebugIcons';

function App() {
  if (!isSupabaseConfigured) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full text-center border-l-4 border-yellow-500">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Configuration Required</h1>
          <p className="text-gray-600 mb-6">
            The application is connected to a placeholder Supabase instance.
            <br /><br />
            Please update your <code>.env</code> file with your actual <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_ANON_KEY</code>.
          </p>
          <div className="bg-gray-100 p-4 rounded text-left text-sm overflow-x-auto">
            <code>
              VITE_SUPABASE_URL=https://your-project.supabase.co<br />
              VITE_SUPABASE_ANON_KEY=...
            </code>
          </div>
          <p className="mt-6 text-sm text-gray-400">Restart the server after saving changes.</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <AuthProvider>
        <ReloadPrompt />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/public/bookings/:id" element={<ViewBooking />} />

          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              {/* Dashboard - Admin Only */}
              <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
                <Route path="/" element={<Dashboard />} />
              </Route>

              {/* Properties */}
              <Route path="/properties" element={<PropertiesList />} />
              <Route path="/properties/new" element={<PropertyForm />} />
              <Route path="/properties/:id/edit" element={<PropertyForm />} />

              {/* Calendar */}
              <Route path="/calendar" element={<Calendar />} />


              {/* Bookings */}
              <Route path="/bookings" element={<BookingList />} />
              <Route path="/bookings/new" element={<BookingForm />} />
              <Route path="/bookings/:id/edit" element={<BookingForm />} />

              {/* Quotations */}
              <Route path="/quotations" element={<QuotationList />} />
              <Route path="/quotations/new" element={<QuotationForm />} />
              <Route path="/quotations/:id" element={<QuotationForm />} />
              <Route path="/quotations/:id/edit" element={<QuotationForm />} />

              {/* Admin Routes */}
              <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
                <Route path="/requests" element={<div className="p-8">Properties & Requests module coming soon</div>} />
              </Route>

              {/* Admin Routes */}
              <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
                <Route path="/users" element={<UsersList />} />
                <Route path="/users/new" element={<UserEdit />} />
                <Route path="/users/:id" element={<UserEdit />} />
                <Route path="/reports" element={<AdminReports />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/settings/meal-plans" element={<OptionsList title="Meal Plans" tableName="meal_plans" />} />
                <Route path="/settings/room-types" element={<OptionsList title="Room Types" tableName="room_types" />} />
                <Route path="/settings/bed-types" element={<OptionsList title="Bed Types" tableName="bed_types" />} />
                <Route path="/settings/bed-types" element={<OptionsList title="Bed Types" tableName="bed_types" />} />
                <Route path="/settings/inclusions" element={<div className="h-[calc(100vh-6rem)]"><InclusionsExclusionsManager type="inclusions" /></div>} />
                <Route path="/settings/exclusions" element={<div className="h-[calc(100vh-6rem)]"><InclusionsExclusionsManager type="exclusions" /></div>} />
                <Route path="/debug-icons" element={<DebugIcons />} />
              </Route>
            </Route>
          </Route>
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
