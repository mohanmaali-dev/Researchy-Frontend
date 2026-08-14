import { BrowserRouter, Route, Routes } from 'react-router-dom'

import AuthLayout from './components/AuthLayout.jsx'
import BusinessLayout from './components/businesses/BusinessLayout.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import CheckEmailPage from './pages/auth/CheckEmailPage.jsx'
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage.jsx'
import LoginPage from './pages/auth/LoginPage.jsx'
import RegisterPage from './pages/auth/RegisterPage.jsx'
import ResetPasswordPage from './pages/auth/ResetPasswordPage.jsx'
import VerifyEmailPage from './pages/auth/VerifyEmailPage.jsx'
import DashboardPage from './pages/DashboardPage.jsx'
import HowItWorksPage from './pages/HowItWorksPage.jsx'
import HomePage from './pages/HomePage.jsx'
import NotesPage from './pages/NotesPage.jsx'
import AddBusinessPage from './pages/businesses/AddBusinessPage.jsx'
import BusinessDetailsPage from './pages/businesses/BusinessDetailsPage.jsx'
import BusinessListPage from './pages/businesses/BusinessListPage.jsx'
import EditBusinessPage from './pages/businesses/EditBusinessPage.jsx'
import AddConversationPage from './pages/conversations/AddConversationPage.jsx'
import ConversationDetailsPage from './pages/conversations/ConversationDetailsPage.jsx'
import EditConversationPage from './pages/conversations/EditConversationPage.jsx'
import AddFollowUpPage from './pages/follow-ups/AddFollowUpPage.jsx'
import EditFollowUpPage from './pages/follow-ups/EditFollowUpPage.jsx'
import FollowUpDetailsPage from './pages/follow-ups/FollowUpDetailsPage.jsx'
import FollowUpListPage from './pages/follow-ups/FollowUpListPage.jsx'
import AddOpportunityPage from './pages/opportunities/AddOpportunityPage.jsx'
import EditOpportunityPage from './pages/opportunities/EditOpportunityPage.jsx'
import OpportunityDetailsPage from './pages/opportunities/OpportunityDetailsPage.jsx'
import OpportunityListPage from './pages/opportunities/OpportunityListPage.jsx'
import AddProblemPage from './pages/problems/AddProblemPage.jsx'
import EditProblemPage from './pages/problems/EditProblemPage.jsx'
import ProblemDetailsPage from './pages/problems/ProblemDetailsPage.jsx'
import ProblemPatternDetailsPage from './pages/problems/ProblemPatternDetailsPage.jsx'
import ProblemPatternsPage from './pages/problems/ProblemPatternsPage.jsx'

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/check-email" element={<CheckEmailPage />} />

          <Route element={<BusinessLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/how-it-works" element={<HowItWorksPage />} />
            <Route path="/businesses" element={<BusinessListPage />} />
            <Route path="/businesses/new" element={<AddBusinessPage />} />
            <Route path="/businesses/:id" element={<BusinessDetailsPage />} />
            <Route path="/businesses/:id/edit" element={<EditBusinessPage />} />
            <Route
              path="/businesses/:businessId/conversations/new"
              element={<AddConversationPage />}
            />
            <Route path="/conversations/:id" element={<ConversationDetailsPage />} />
            <Route path="/conversations/:id/edit" element={<EditConversationPage />} />
            <Route
              path="/conversations/:conversationId/problems/new"
              element={<AddProblemPage />}
            />
            <Route path="/problems/:id" element={<ProblemDetailsPage />} />
            <Route path="/problems/:id/edit" element={<EditProblemPage />} />
            <Route path="/problem-patterns" element={<ProblemPatternsPage />} />
            <Route
              path="/problem-patterns/details/:type"
              element={<ProblemPatternDetailsPage />}
            />
            <Route
              path="/problems/:problemId/opportunity/new"
              element={<AddOpportunityPage />}
            />
            <Route path="/opportunities" element={<OpportunityListPage />} />
            <Route path="/opportunities/:id" element={<OpportunityDetailsPage />} />
            <Route path="/opportunities/:id/edit" element={<EditOpportunityPage />} />
            <Route path="/follow-ups" element={<FollowUpListPage />} />
            <Route path="/follow-ups/new" element={<AddFollowUpPage />} />
            <Route path="/follow-ups/:id" element={<FollowUpDetailsPage />} />
            <Route path="/follow-ups/:id/edit" element={<EditFollowUpPage />} />
          </Route>

          <Route element={<AuthLayout />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/verify-email" element={<VerifyEmailPage />} />
          </Route>

          <Route element={<ProtectedRoute />}>
            <Route path="/notes" element={<NotesPage />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
