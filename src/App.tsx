import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AuthProvider } from './contexts/AuthContext';
import { SaccoProvider } from './contexts/SaccoContext';
import ProtectedRoute from './routes/ProtectedRoute';
import AppLayout from './components/layout/AppLayout';
import Login from './pages/auth/Login';
import Dashboard from './pages/dashboard/Dashboard';
import MembersList from './pages/members/MembersList';
import MemberDetail from './pages/members/MemberDetail';
import MemberForm from './pages/members/MemberForm';
import MeetingsList from './pages/meetings/MeetingsList';
import CreateMeeting from './pages/meetings/CreateMeeting';
import MeetingDetail from './pages/meetings/MeetingDetail';
import CollectionInterface from './pages/meetings/CollectionInterface';
import PassbookManagement from './pages/passbook/PassbookManagement';
import PassbookView from './pages/passbook/PassbookView';
import Settings from './pages/settings/Settings';
import SectionsManagement from './pages/settings/SectionsManagement';
import DeductionRules from './pages/settings/DeductionRules';
import CashRoundSchedule from './pages/settings/CashRoundSchedule';
import CashRounds from './pages/settings/CashRounds';
import CashRoundForm from './pages/settings/CashRoundForm';
import CashRoundDetail from './pages/settings/CashRoundDetail';
import SaccoAccountManagement from './pages/settings/SaccoAccountManagement';
import BusinessManagement from './pages/settings/BusinessManagement';
import BusinessPanel from './pages/business/BusinessPanel';
import InstallPWA from './components/common/InstallPWA';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SaccoProvider>
          <InstallPWA />
          <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />

          {/* Protected routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <Dashboard />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          {/* Members routes */}
          <Route
            path="/members"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <MembersList />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/members/new"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <MemberForm />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/members/:id"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <MemberDetail />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/members/:id/edit"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <MemberForm />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          {/* Cash Rounds routes */}
          <Route
            path="/cash-rounds"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <MeetingsList />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/cash-rounds/meetings/new"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <CreateMeeting />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/cash-rounds/meetings/:id"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <MeetingDetail />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/cash-rounds/meetings/:id/collect"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <CollectionInterface />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          
          {/* Legacy redirects */}
          <Route path="/meetings" element={<Navigate to="/cash-rounds" replace />} />
          <Route path="/meetings/*" element={<Navigate to="/cash-rounds" replace />} />

          {/* Passbook routes */}
          <Route
            path="/passbook"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <PassbookManagement />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/passbook/:memberId"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <PassbookView />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          {/* Loans routes */}
          <Route
            path="/loans"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <div className="p-8">
                    <h1 className="text-2xl font-bold">Loans</h1>
                    <p className="text-gray-600 mt-2">Coming soon...</p>
                  </div>
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/loans/new"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <div className="p-8">
                    <h1 className="text-2xl font-bold">New Loan Application</h1>
                    <p className="text-gray-600 mt-2">Coming soon...</p>
                  </div>
                </AppLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/transactions"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <div className="p-8">
                    <h1 className="text-2xl font-bold">Transactions</h1>
                    <p className="text-gray-600 mt-2">Coming soon...</p>
                  </div>
                </AppLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/reports"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <div className="p-8">
                    <h1 className="text-2xl font-bold">Reports</h1>
                    <p className="text-gray-600 mt-2">Coming soon...</p>
                  </div>
                </AppLayout>
              </ProtectedRoute>
            }
          />

          {/* Settings routes */}
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <Settings />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings/sections"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <SectionsManagement />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings/deduction-rules"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <DeductionRules />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings/cash-round"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <CashRoundSchedule />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings/cash-rounds"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <CashRounds />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings/cash-rounds/new"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <CashRoundForm />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings/cash-rounds/:id"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <CashRoundDetail />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings/cash-rounds/:id/edit"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <CashRoundForm />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings/account"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <SaccoAccountManagement />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings/businesses"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <BusinessManagement />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/business"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <BusinessPanel />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          {/* Redirect root to dashboard */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          {/* 404 */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
        <Toaster position="top-right" richColors />
        </SaccoProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
