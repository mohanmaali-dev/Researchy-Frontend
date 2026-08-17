import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'

import AuthLayout from './components/AuthLayout.jsx'
import BusinessLayout from './components/businesses/BusinessLayout.jsx'
import ContactsLayout from './components/contacts/ContactsLayout.jsx'
import LearningLayout from './components/learning/LearningLayout.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import CheckEmailPage from './pages/auth/CheckEmailPage.jsx'
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage.jsx'
import LoginPage from './pages/auth/LoginPage.jsx'
import RegisterPage from './pages/auth/RegisterPage.jsx'
import ResetPasswordPage from './pages/auth/ResetPasswordPage.jsx'
import VerifyEmailPage from './pages/auth/VerifyEmailPage.jsx'
import DashboardPage from './pages/DashboardPage.jsx'
import DemoDataPage from './pages/DemoDataPage.jsx'
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
import AddContactPage from './pages/contacts/AddContactPage.jsx'
import ContactDemoDataPage from './pages/contacts/ContactDemoDataPage.jsx'
import ContactDetailsPage from './pages/contacts/ContactDetailsPage.jsx'
import ContactListPage from './pages/contacts/ContactListPage.jsx'
import EditContactPage from './pages/contacts/EditContactPage.jsx'
import KeyTakeawaysPage from './pages/learning/KeyTakeawaysPage.jsx'
import ArchivedTopicsPage from './pages/learning/ArchivedTopicsPage.jsx'
import LearningCollectionPage from './pages/learning/LearningCollectionPage.jsx'
import LearningDashboardPage from './pages/learning/LearningDashboardPage.jsx'
import LearningDemoDataPage from './pages/learning/LearningDemoDataPage.jsx'
import LearningRecordDetailsPage from './pages/learning/LearningRecordDetailsPage.jsx'
import LearningRecordEditorPage from './pages/learning/LearningRecordEditorPage.jsx'
import TopicDetailsPage from './pages/learning/TopicDetailsPage.jsx'
import TopicEditorPage from './pages/learning/TopicEditorPage.jsx'
import TopicListPage from './pages/learning/TopicListPage.jsx'
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
          <Route path="/" element={<Navigate to="/home" replace />} />
          <Route path="/check-email" element={<CheckEmailPage />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/home" element={<HomePage />} />

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
          </Route>

          <Route element={<AuthLayout />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/verify-email" element={<VerifyEmailPage />} />
          </Route>

        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
