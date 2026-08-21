import { lazy, Suspense } from 'react'
import {
  createBrowserRouter,
  createRoutesFromElements,
  Navigate,
  Outlet,
  Route,
  RouterProvider,
} from 'react-router-dom'

import ProtectedRoute from './components/ProtectedRoute.jsx'
import GlobalErrorBoundary from './components/ui/GlobalErrorBoundary.jsx'
import NavigationFeedback from './components/ui/NavigationFeedback.jsx'
import RouteErrorRecovery from './components/ui/RouteErrorRecovery.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import { ToastProvider } from './context/ToastContext.jsx'

const AuthLayout = lazy(() => import('./components/AuthLayout.jsx'))
const BusinessLayout = lazy(() => import('./components/businesses/BusinessLayout.jsx'))
const ContactsLayout = lazy(() => import('./components/contacts/ContactsLayout.jsx'))
const LearningLayout = lazy(() => import('./components/learning/LearningLayout.jsx'))
const CheckEmailPage = lazy(() => import('./pages/auth/CheckEmailPage.jsx'))
const ForgotPasswordPage = lazy(() => import('./pages/auth/ForgotPasswordPage.jsx'))
const LoginPage = lazy(() => import('./pages/auth/LoginPage.jsx'))
const RegisterPage = lazy(() => import('./pages/auth/RegisterPage.jsx'))
const ResetPasswordPage = lazy(() => import('./pages/auth/ResetPasswordPage.jsx'))
const VerifyEmailPage = lazy(() => import('./pages/auth/VerifyEmailPage.jsx'))
const DashboardPage = lazy(() => import('./pages/DashboardPage.jsx'))
const DataSettingsPage = lazy(() => import('./pages/DataSettingsPage.jsx'))
const DemoDataPage = lazy(() => import('./pages/DemoDataPage.jsx'))
const HowItWorksPage = lazy(() => import('./pages/HowItWorksPage.jsx'))
const HomePage = lazy(() => import('./pages/HomePage.jsx'))
const NotesPage = lazy(() => import('./pages/NotesPage.jsx'))
const SessionsPage = lazy(() => import('./pages/SessionsPage.jsx'))
const AddBusinessPage = lazy(() => import('./pages/businesses/AddBusinessPage.jsx'))
const BusinessDetailsPage = lazy(() => import('./pages/businesses/BusinessDetailsPage.jsx'))
const BusinessListPage = lazy(() => import('./pages/businesses/BusinessListPage.jsx'))
const EditBusinessPage = lazy(() => import('./pages/businesses/EditBusinessPage.jsx'))
const AddConversationPage = lazy(() => import('./pages/conversations/AddConversationPage.jsx'))
const ConversationDetailsPage = lazy(() => import('./pages/conversations/ConversationDetailsPage.jsx'))
const EditConversationPage = lazy(() => import('./pages/conversations/EditConversationPage.jsx'))
const AddContactPage = lazy(() => import('./pages/contacts/AddContactPage.jsx'))
const ContactDemoDataPage = lazy(() => import('./pages/contacts/ContactDemoDataPage.jsx'))
const ContactDetailsPage = lazy(() => import('./pages/contacts/ContactDetailsPage.jsx'))
const ContactListPage = lazy(() => import('./pages/contacts/ContactListPage.jsx'))
const EditContactPage = lazy(() => import('./pages/contacts/EditContactPage.jsx'))
const KeyTakeawaysPage = lazy(() => import('./pages/learning/KeyTakeawaysPage.jsx'))
const ArchivedTopicsPage = lazy(() => import('./pages/learning/ArchivedTopicsPage.jsx'))
const LearningCollectionPage = lazy(() => import('./pages/learning/LearningCollectionPage.jsx'))
const LearningDashboardPage = lazy(() => import('./pages/learning/LearningDashboardPage.jsx'))
const LearningDemoDataPage = lazy(() => import('./pages/learning/LearningDemoDataPage.jsx'))
const LearningRecordDetailsPage = lazy(() => import('./pages/learning/LearningRecordDetailsPage.jsx'))
const LearningRecordEditorPage = lazy(() => import('./pages/learning/LearningRecordEditorPage.jsx'))
const TopicDetailsPage = lazy(() => import('./pages/learning/TopicDetailsPage.jsx'))
const TopicEditorPage = lazy(() => import('./pages/learning/TopicEditorPage.jsx'))
const TopicListPage = lazy(() => import('./pages/learning/TopicListPage.jsx'))
const AddFollowUpPage = lazy(() => import('./pages/follow-ups/AddFollowUpPage.jsx'))
const EditFollowUpPage = lazy(() => import('./pages/follow-ups/EditFollowUpPage.jsx'))
const FollowUpDetailsPage = lazy(() => import('./pages/follow-ups/FollowUpDetailsPage.jsx'))
const FollowUpListPage = lazy(() => import('./pages/follow-ups/FollowUpListPage.jsx'))
const AddOpportunityPage = lazy(() => import('./pages/opportunities/AddOpportunityPage.jsx'))
const EditOpportunityPage = lazy(() => import('./pages/opportunities/EditOpportunityPage.jsx'))
const OpportunityDetailsPage = lazy(() => import('./pages/opportunities/OpportunityDetailsPage.jsx'))
const OpportunityListPage = lazy(() => import('./pages/opportunities/OpportunityListPage.jsx'))
const AddProblemPage = lazy(() => import('./pages/problems/AddProblemPage.jsx'))
const EditProblemPage = lazy(() => import('./pages/problems/EditProblemPage.jsx'))
const ProblemDetailsPage = lazy(() => import('./pages/problems/ProblemDetailsPage.jsx'))
const ProblemPatternDetailsPage = lazy(() => import('./pages/problems/ProblemPatternDetailsPage.jsx'))
const ProblemPatternsPage = lazy(() => import('./pages/problems/ProblemPatternsPage.jsx'))
const PortfolioLayout = lazy(() => import('./pages/portfolio/PortfolioLayout.jsx'))
const PortfolioDashboard = lazy(() => import('./pages/portfolio/Dashboard.jsx'))
const PortfolioProjects = lazy(() => import('./pages/portfolio/Projects.jsx'))
const PortfolioProjectEditor = lazy(() => import('./pages/portfolio/AddProject.jsx'))
const PortfolioSkills = lazy(() => import('./pages/portfolio/Skills.jsx'))
const PortfolioExperience = lazy(() => import('./pages/portfolio/Experience.jsx'))
const PortfolioProfile = lazy(() => import('./pages/portfolio/Profile.jsx'))
const PortfolioContact = lazy(() => import('./pages/portfolio/Contact.jsx'))
const PortfolioPreview = lazy(() => import('./pages/portfolio/Preview.jsx'))

function RouteLoading() {
  return (
    <div className="min-h-screen bg-[#f2f2f1] p-2.5 sm:p-4" role="status">
      <span className="sr-only">Opening page</span>
      <div className="h-18 animate-pulse rounded-[10px] bg-white motion-reduce:animate-none" />
      <div className="mt-3 grid gap-3 lg:grid-cols-[16rem_minmax(0,1fr)]">
        <div className="hidden h-[calc(100vh-7rem)] animate-pulse rounded-[10px] bg-white motion-reduce:animate-none lg:block" />
        <div className="min-w-0 animate-pulse space-y-3 motion-reduce:animate-none">
          <div className="h-36 rounded-[10px] bg-white" />
          <div className="h-64 rounded-[10px] bg-white" />
        </div>
      </div>
    </div>
  )
}

function AppProviders() {
  return (
    <AuthProvider>
      <ToastProvider>
        <NavigationFeedback />
        <GlobalErrorBoundary>
          <Suspense fallback={<RouteLoading />}>
            <Outlet />
          </Suspense>
        </GlobalErrorBoundary>
      </ToastProvider>
    </AuthProvider>
  )
}

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route element={<AppProviders />} errorElement={<RouteErrorRecovery />}>
      <Route path="/" element={<Navigate to="/home" replace />} />
      <Route path="/check-email" element={<CheckEmailPage />} />

      <Route element={<ProtectedRoute />}>
        <Route path="/home" element={<HomePage />} />
        <Route path="/sessions" element={<SessionsPage />} />
        <Route path="/settings/data" element={<DataSettingsPage />} />

        <Route element={<BusinessLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/how-it-works" element={<HowItWorksPage />} />
          <Route path="/demo-data" element={<DemoDataPage />} />
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

        <Route element={<ContactsLayout />}>
          <Route path="/contacts" element={<ContactListPage />} />
          <Route path="/contacts/demo-data" element={<ContactDemoDataPage />} />
          <Route path="/contacts/new" element={<AddContactPage />} />
          <Route path="/contacts/:id" element={<ContactDetailsPage />} />
          <Route path="/contacts/:id/edit" element={<EditContactPage />} />
        </Route>

        <Route element={<LearningLayout />}>
          <Route path="/learning" element={<LearningDashboardPage />} />
          <Route path="/learning/demo-data" element={<LearningDemoDataPage />} />
          <Route path="/learning/archived" element={<ArchivedTopicsPage />} />
          <Route path="/learning/topics" element={<TopicListPage />} />
          <Route path="/learning/topics/new" element={<TopicEditorPage mode="create" />} />
          <Route path="/learning/topics/:id" element={<TopicDetailsPage />} />
          <Route path="/learning/topics/:id/edit" element={<TopicEditorPage mode="edit" />} />

          <Route path="/learning/entries/new" element={<LearningRecordEditorPage type="entry" mode="create" />} />
          <Route path="/learning/entries/:id" element={<LearningRecordDetailsPage type="entry" />} />
          <Route path="/learning/entries/:id/edit" element={<LearningRecordEditorPage type="entry" mode="edit" />} />

          <Route path="/learning/resources" element={<LearningCollectionPage type="resources" />} />
          <Route path="/learning/resources/new" element={<LearningRecordEditorPage type="resource" mode="create" />} />
          <Route path="/learning/resources/:id" element={<LearningRecordDetailsPage type="resource" />} />
          <Route path="/learning/resources/:id/edit" element={<LearningRecordEditorPage type="resource" mode="edit" />} />

          <Route path="/learning/practice/new" element={<LearningRecordEditorPage type="practice" mode="create" />} />
          <Route path="/learning/practice/:id" element={<LearningRecordDetailsPage type="practice" />} />
          <Route path="/learning/practice/:id/edit" element={<LearningRecordEditorPage type="practice" mode="edit" />} />

          <Route path="/learning/questions" element={<LearningCollectionPage type="questions" />} />
          <Route path="/learning/questions/new" element={<LearningRecordEditorPage type="question" mode="create" />} />
          <Route path="/learning/questions/:id" element={<LearningRecordDetailsPage type="question" />} />
          <Route path="/learning/questions/:id/edit" element={<LearningRecordEditorPage type="question" mode="edit" />} />
          <Route path="/learning/takeaways" element={<KeyTakeawaysPage />} />
        </Route>

        <Route path="/notes" element={<NotesPage />} />
        <Route path="/notes/new" element={<NotesPage />} />
        <Route path="/notes/:id" element={<NotesPage />} />
        <Route path="/portfolio" element={<PortfolioLayout />}>
          <Route index element={<PortfolioDashboard />} />
          <Route path="projects" element={<PortfolioProjects />} />
          <Route path="projects/new" element={<PortfolioProjectEditor />} />
          <Route path="projects/add" element={<Navigate to="/portfolio/projects/new" replace />} />
          <Route path="projects/:id/edit" element={<PortfolioProjectEditor />} />
          <Route path="skills" element={<PortfolioSkills />} />
          <Route path="experience" element={<PortfolioExperience />} />
          <Route path="profile" element={<PortfolioProfile />} />
          <Route path="contact" element={<PortfolioContact />} />
          <Route path="preview" element={<PortfolioPreview />} />
        </Route>
      </Route>

      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/verify-email" element={<VerifyEmailPage />} />
      </Route>

    </Route>,
  ),
)

function App() {
  return (
    <RouterProvider router={router} fallbackElement={<RouteLoading />} />
  )
}

export default App
